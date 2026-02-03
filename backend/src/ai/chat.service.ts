import { Inject, Injectable } from '@nestjs/common';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  AIMessageChunk,
} from 'langchain';
import { AI_MODEL, HEAVY_AI_MODEL } from './ai.model.provider';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatMemory } from './memory.service';
import { QueryResolverAgent } from './resolver.service';
import { LLMRouterService } from './router.service';
import { ChatWithDocumentDto } from 'src/chat/dto/create';
import { MemoryState, PineconeRecord } from 'types/global';
import {
  ChunkForRouting,
  ModelTier,
  RoutingResult,
  UserIntent,
} from 'types/ai';
import { VectorizeService } from 'src/vectorize/vectorize.service';
import { basicChatPrompt, summaryChatPrompt } from './templates/template';
import { Role } from '@prisma/client';
import { ChatOpenAI } from '@langchain/openai';
import { MessageStructure } from '@langchain/core/messages';

@Injectable()
export class AIChatService {
  constructor(
    @Inject(AI_MODEL) public readonly model: ChatOpenAI,
    @Inject(HEAVY_AI_MODEL) public readonly heavyModel: ChatOpenAI,
    private readonly prisma: PrismaService,
    private readonly chatMemory: ChatMemory,
    private readonly resolver: QueryResolverAgent,
    private readonly router: LLMRouterService,
    private readonly vectorizeService: VectorizeService,
  ) {}

  async chatWithLLM(chat: ChatWithDocumentDto) {
    let routerDecision: RoutingResult | undefined;
    const chatSession = await this.prisma.chatSession.findUnique({
      where: { id: chat.chatSessionId },
    });

    const memory: MemoryState =
      chatSession?.memoryState as unknown as MemoryState;

    const history = this.buildFullContextFromMemory(memory);

    const resolvedData = await this.resolver.resolveQuery(chat.message, memory);
    if (
      resolvedData.intent === UserIntent.EXPLAIN_CONCEPT ||
      resolvedData.intent === UserIntent.COMPARE_CONCEPTS
    ) {
      const { vectorRetrivals, response } =
        await this.simpleLLMCallWithHistoryData(
          history,
          chatSession?.userId ?? '',
          resolvedData.rewrittenQuery,
        );
      const vectorToDocument = vectorRetrivals.result.hits[0];

      const parsedResponse =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      const [, assistantMsg] = await this.prisma.$transaction([
        this.prisma.message.create({
          data: {
            role: Role.USER,
            content: chat.message,
            chatSessionId: chat.chatSessionId as string,
          },
        }),
        this.prisma.message.create({
          data: {
            role: Role.ASSISTANT,
            content: parsedResponse,
            chatSessionId: chat.chatSessionId as string,
          },
        }),
      ]);

      await this.chatMemory.updateMemoryState(
        chatSession?.id ?? '',
        resolvedData.rewrittenQuery,
        vectorToDocument as PineconeRecord,
      );

      return [assistantMsg];
    }
    if (resolvedData.requiresRouting) {
      routerDecision = await this.router.route({
        query: resolvedData.rewrittenQuery,
        intent: resolvedData.intent,
        chatSessionId: chat.chatSessionId!,
      });
    }

    if (routerDecision) {
      let response: AIMessageChunk<MessageStructure>;

      if (routerDecision.decision.tier === ModelTier.HEAVY) {
        const { response: llmResponse } =
          await this.summaryLLMCallWithHistoryData(
            history,
            routerDecision.chunks,
            resolvedData.rewrittenQuery,
            routerDecision.decision.intent,
            this.heavyModel,
          );
        response = llmResponse;
      } else {
        const { response: llmResponse } =
          await this.summaryLLMCallWithHistoryData(
            history,
            routerDecision.chunks,
            resolvedData.rewrittenQuery,
            routerDecision.decision.intent,
            this.model,
          );
        response = llmResponse;
      }

      const parsedResponse =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      const [, assistantMsg] = await this.prisma.$transaction([
        this.prisma.message.create({
          data: {
            role: Role.USER,
            content: chat.message,
            chatSessionId: chat.chatSessionId as string,
          },
        }),
        this.prisma.message.create({
          data: {
            role: Role.ASSISTANT,
            content: parsedResponse,
            chatSessionId: chat.chatSessionId as string,
          },
        }),
      ]);

      await this.chatMemory.updateMemoryState(
        chatSession?.id ?? '',
        resolvedData.rewrittenQuery,
      );

      return [assistantMsg];
    }
  }

  private async simpleLLMCallWithHistoryData(
    history: Array<AIMessage | HumanMessage | SystemMessage>,
    userId: string,
    query: string,
  ) {
    const vectorRetrivals = await this.vectorizeService.simpleVectorSearch(
      query,
      userId,
    );
    const messages = await basicChatPrompt.formatMessages({
      question: query,
      context: vectorRetrivals,
      history,
    });
    const response = await this.model.invoke(messages);
    return { vectorRetrivals, response };
  }

  private async summaryLLMCallWithHistoryData(
    history: Array<AIMessage | HumanMessage | SystemMessage>,
    chunks: ChunkForRouting[],
    query: string,
    intent: string,
    model: ChatOpenAI,
  ) {
    const messages = await summaryChatPrompt.formatMessages({
      question: query,
      context: chunks,
      history: history,
      user_intent: intent,
    });

    const response = await model.invoke(messages);

    return { response };
  }

  private buildFullContextFromMemory(
    memory: MemoryState | null | undefined,
  ): Array<AIMessage | HumanMessage | SystemMessage> {
    if (!memory) {
      return [];
    }

    //Get chat history
    const history = (memory.working ?? [])
      .map((block) => {
        switch (block.role) {
          case 'assistant':
            return new AIMessage(block.content);
          case 'user':
            return new HumanMessage(block.content);
          default:
            return null;
        }
      })
      .filter(Boolean) as Array<AIMessage | HumanMessage>;

    //Prepare context from documentContext
    const documentContext = memory.documentContext ?? [];
    const documentContextMessages = documentContext.flatMap((doc) =>
      doc.relevantChunks.map(
        (chunk) =>
          new HumanMessage(`[Document: ${doc.documentId}] ${chunk.content}`),
      ),
    );

    //Prepare context from entities
    const entities = memory.entities ?? {};
    const entityMessages = Object.entries(entities).map(
      ([entity, info]) =>
        new HumanMessage(
          `[Entity: ${entity}] Type: ${info.type}, Context: ${info.contextMessages.join('; ')}`,
        ),
    );

    //Prepare context from summary
    const summary = memory.summary;
    const summaryMessage = summary
      ? new SystemMessage(`[Memory Summary] ${summary.current}`)
      : null;

    //Combine everything
    const fullContext: Array<AIMessage | HumanMessage | SystemMessage> = [
      ...(summaryMessage ? [summaryMessage] : []),
      ...documentContextMessages,
      ...entityMessages,
      ...history,
    ];

    return fullContext;
  }
}
