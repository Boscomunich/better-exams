import { Inject, Injectable } from '@nestjs/common';
import {
  MemoryState,
  WorkingMemoryEntry,
  MemoryStateSchema,
  EntityInfo,
  MemorySummarySchema,
  EntityInfoSchema,
  PineconeRecord,
} from 'types/global';
import { AI_MODEL } from './ai.model.provider';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { generateMemoryCompressionPrompt } from 'libs/generate-summary';
import { createAgent, ReactAgent } from 'langchain';
import { logger } from 'libs/logger';
import z from 'zod';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class ChatMemory {
  private readonly agent: ReactAgent;

  private readonly MIN_WORKING_MESSAGES = 8;
  private readonly MAX_WORKING_MESSAGES = 16;
  private readonly ENTITY_RECALL_LIMIT = 5;

  constructor(
    @Inject(AI_MODEL) public readonly model: ChatOpenAI,
    private readonly prisma: PrismaService,
  ) {
    this.agent = createAgent({
      model: this.model,
      responseFormat: ChatMemory.AgentMemoryResponseSchema,
    });
  }

  async updateMemoryState(
    chatSessionId: string,
    query: string,
    chunk?: PineconeRecord,
  ): Promise<MemoryState> {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: chatSessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session) throw new Error('Chat session not found');

    const memoryState: MemoryState = session.memoryState
      ? MemoryStateSchema.parse(session.memoryState)
      : this.initializeMemoryState();

    const lastProcessedTime = memoryState.lastUpdatedAt;
    const newMessages = lastProcessedTime
      ? session.messages.filter(
          (m) => m.createdAt.getTime() > lastProcessedTime,
        )
      : session.messages;

    if (newMessages.length === 0) return memoryState;

    const newEntries: WorkingMemoryEntry[] = newMessages.map((m) => ({
      id: m.id,
      role: m.role === Role.USER ? 'user' : 'assistant',
      content: m.content,
      timestamp: m.createdAt.getTime(),
    }));

    const combined = [...(memoryState.working || []), ...newEntries];

    if (combined.length > this.MAX_WORKING_MESSAGES) {
      await this.compressMemoryWithAgent(memoryState, combined);
    } else {
      memoryState.working = combined;
      memoryState.lastUpdatedAt = Date.now();
      memoryState.version += 1;

      if (!memoryState.summary.current && combined.length > 0) {
        memoryState.summary.current = `Initial conversation with ${combined.length} messages.`;
        memoryState.summary.updatedAt = Date.now();
        memoryState.summary.tokenCount = Math.floor(
          combined.map((m) => m.content).join(' ').length * 0.75,
        );
        memoryState.summary.confidence = 0.8;
      }
    }

    memoryState.lastProcessedMessageId = newMessages[newMessages.length - 1].id;

    memoryState.documentContext ??= [];

    if (chunk) {
      let documentContext = memoryState.documentContext.find(
        (doc) => doc.documentId === chunk.fields.documentId,
      );

      if (!documentContext) {
        documentContext = {
          documentId: chunk.fields.documentId,
          relevantChunks: [],
        };
        memoryState.documentContext.push(documentContext);
      }

      // Skip if chunk already exists
      const chunkExists = documentContext.relevantChunks.some(
        (c) => c.chunkId === chunk._id,
      );

      if (!chunkExists) {
        documentContext.relevantChunks.push({
          chunkId: chunk._id,
          relevanceScore: chunk._score,
          content: chunk.fields.text,
          query,
        });
      }
    }

    await this.prisma.chatSession.update({
      where: { id: chatSessionId },
      data: { memoryState } as any,
    });

    return memoryState;
  }

  private async compressMemoryWithAgent(
    memoryState: MemoryState,
    combined: WorkingMemoryEntry[],
  ): Promise<void> {
    const lastMessages = combined.slice(-this.MIN_WORKING_MESSAGES);
    const messagesToSummarize = combined.slice(0, -this.MIN_WORKING_MESSAGES);

    const textToSummarize = messagesToSummarize
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const systemPrompt = generateMemoryCompressionPrompt(
      memoryState.summary.version,
      Date.now(),
    );

    try {
      const result = await this.agent.invoke({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: textToSummarize },
        ],
      });

      // Use existing types directly
      const structured = ChatMemory.AgentMemoryResponseSchema.parse(
        result.structuredResponse,
      );

      if (structured.summary.confidence < 0.5) return;

      memoryState.summary.history = memoryState.summary.history || [];

      if (memoryState.summary.current) {
        memoryState.summary.history.push({
          version: memoryState.summary.version,
          content: memoryState.summary.current,
          confidence: memoryState.summary.confidence ?? 0.8,
          updatedAt: memoryState.summary.updatedAt,
        });
        memoryState.summary.history = memoryState.summary.history.slice(-2);
      }

      memoryState.summary = {
        ...memoryState.summary,
        ...structured.summary,
        keyTopics: structured.summary.keyTopics.slice(0, 10),
      };

      memoryState.entities = {};
      for (const [entityName, info] of Object.entries(structured.entities)) {
        const normalized = entityName
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        memoryState.entities[normalized] = {
          type: info.type,
          frequency: Math.max(1, info.frequency ?? 1),
          firstMentioned: info.firstMentioned ?? Date.now(),
          lastMentioned: info.lastMentioned ?? Date.now(),
          contextMessages: info.contextMessages?.slice(0, 3) ?? [],
          confidence: Math.min(1, Math.max(0, info.confidence ?? 0.8)),
        };
      }

      memoryState.working = lastMessages;
      memoryState.totalTokensCompressed += structured.summary.tokenCount;
      memoryState.lastCompressedAt = Date.now();
      memoryState.lastUpdatedAt = Date.now();
      memoryState.version += 1;
    } catch (err) {
      logger.error('Memory compression agent failed', err);
    }
  }

  getTopEntities(memoryState: MemoryState, limit = this.ENTITY_RECALL_LIMIT) {
    return Object.entries(memoryState.entities || {})
      .map(([name, entity]) => ({
        name,
        ...entity,
        score: this.scoreEntity(entity),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private scoreEntity(entity: EntityInfo): number {
    const recencyWeight = Math.exp(
      -(Date.now() - entity.lastMentioned) / (1000 * 60 * 60),
    );
    return (
      entity.frequency * 0.4 +
      recencyWeight * 0.4 +
      (entity.confidence ?? 0.8) * 0.2
    );
  }

  private initializeMemoryState(): MemoryState {
    return {
      working: [],
      summary: {
        current: '',
        version: 1,
        updatedAt: Date.now(),
        tokenCount: 0,
        keyTopics: [],
        confidence: 0.8,
        history: [],
      },
      entities: {},
      documentContext: [],
      version: 0,
      totalTokensCompressed: 0,
      lastCompressedAt: Date.now(),
      lastUpdatedAt: Date.now(),
      lastProcessedMessageId: undefined,
    };
  }

  private static readonly AgentMemoryResponseSchema = z.object({
    summary: MemorySummarySchema,
    entities: z.record(z.string(), EntityInfoSchema),
  });
}
