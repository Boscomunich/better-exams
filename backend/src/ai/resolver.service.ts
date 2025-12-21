import { Inject, Injectable } from '@nestjs/common';
import { LIGHT_AI_MODEL } from './ai.model.provider';
import { ChatOllama } from '@langchain/ollama';
import { MemoryState } from 'types/global';
import { QueryResolutionResult, UserIntent } from 'types/ai';
import { logger } from 'libs/logger';
import z from 'zod';
import { createAgent, ReactAgent } from 'langchain';

@Injectable()
export class QueryResolverAgent {
  private readonly agent: ReactAgent;

  constructor(@Inject(LIGHT_AI_MODEL) private readonly model: ChatOllama) {
    this.agent = createAgent({
      model: this.model,
      responseFormat: QueryResolverAgent.QueryResolutionSchema,
    });
  }

  private static readonly QueryResolutionSchema = z.object({
    intent: z.enum(UserIntent),
    metadata: z.object({
      documentTitle: z.string().nullable().optional(),
      chapterNo: z.number().nullable().optional(),
      chapterName: z.string().nullable().optional(),
      courseName: z.string().nullable().optional(),
    }),
    rewrittenQuery: z.string(),
    requiresRouting: z.boolean(),
  });

  async resolveQuery(
    userQuery: string,
    memoryState?: MemoryState | null,
  ): Promise<QueryResolutionResult> {
    memoryState = memoryState ?? null;

    const entities = Object.keys(memoryState?.entities || {}).join(', ');
    const summary = memoryState?.summary?.current || '';
    const recentMessages = (memoryState?.working || [])
      .slice(-4)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const prompt = `
    You are an AI assistant tasked with analyzing a user's question in context.

    Context:
    Conversation summary: ${summary || 'None'}
    Known entities: ${entities || 'None'}
    Recent conversation:
    ${recentMessages || 'None'}

    User question: "${userQuery}"

    Tasks:
    1. Determine ONE intent:
      - SUMMARIZE_DOCUMENT
      - SUMMARIZE_CHAPTER
      - SUMMARIZE_COURSE
      - EXPLAIN_CONCEPT
      - COMPARE_CONCEPTS

    2. Extract metadata ONLY if explicitly mentioned:
      - documentTitle
      - chapterNo
      - chapterName
      - courseName
      Use null when not mentioned.

    3. Rewrite the query for vector search:
      - Replace pronouns
      - Make it self-contained
      - Do not hallucinate

    4. Decide requiresRouting:
      - true for large multi-document summaries
      - false otherwise
  `;

    try {
      const result = await this.agent.invoke({
        messages: [{ role: 'user', content: prompt }],
      });

      const structured = result.structuredResponse ?? {};

      return {
        intent: structured.intent ?? UserIntent.EXPLAIN_CONCEPT,
        rewrittenQuery: structured.rewrittenQuery ?? userQuery,
        requiresRouting: structured.requiresRouting ?? false,
        metadata: {
          documentTitle: structured.metadata?.documentTitle ?? undefined,
          chapterNo: structured.metadata?.chapterNo ?? undefined,
          chapterName: structured.metadata?.chapterName ?? undefined,
          courseName: structured.metadata?.courseName ?? undefined,
        },
      };
    } catch (error) {
      logger.error('QueryResolverAgent execution error:', error);

      return {
        rewrittenQuery: userQuery,
        intent: UserIntent.EXPLAIN_CONCEPT,
        metadata: {
          documentTitle: undefined,
          chapterNo: undefined,
          chapterName: undefined,
          courseName: undefined,
        },
        requiresRouting: false,
      };
    }
  }
}
