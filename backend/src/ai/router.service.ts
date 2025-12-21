import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ChunkForRouting,
  ModelTier,
  PrismaChatSessionWithChunks,
  RoutingDecision,
  RoutingResult,
  UserIntent,
} from 'types/ai';

@Injectable()
export class LLMRouterService {
  private readonly WORKHORSE_MAX_TOKENS = 30_000;
  private readonly HEAVY_MIN_TOKENS = 28_000;

  constructor(private readonly prisma: PrismaService) {}

  async route(params: {
    query: string;
    intent: UserIntent;
    chatSessionId: string;
  }): Promise<RoutingResult> {
    const { intent, chatSessionId } = params;

    const { estimatedTokens, allChunks } = await this.estimateTokens(
      chatSessionId,
      intent,
    );

    const exceedsTokenThreshold = estimatedTokens > this.WORKHORSE_MAX_TOKENS;

    const decision = exceedsTokenThreshold
      ? this.heavy(
          intent,
          estimatedTokens,
          'Intent, scope, and token count justify heavy model',
        )
      : this.workhorse(
          intent,
          estimatedTokens,
          'Standard RAG / query within workhorse capacity',
        );

    return { decision, chunks: allChunks };
  }

  private workhorse(
    intent: UserIntent,
    tokens: number,
    reason: string,
  ): RoutingDecision {
    return {
      tier: ModelTier.WORKHORSE,
      intent,
      estimatedTokens: tokens,
      reason,
    };
  }

  private heavy(
    intent: UserIntent,
    tokens: number,
    reason: string,
  ): RoutingDecision {
    return {
      tier: ModelTier.HEAVY,
      intent,
      estimatedTokens: tokens,
      reason,
    };
  }

  private async estimateTokens(
    chatSessionId: string,
    intent: UserIntent,
  ): Promise<{ estimatedTokens: number; allChunks: ChunkForRouting[] }> {
    const prismaSession = await this.prisma.chatSession.findUnique({
      where: { id: chatSessionId },
      include: {
        documents: {
          include: {
            document: {
              include: { chunks: true },
            },
          },
        },
      },
    });

    const session: PrismaChatSessionWithChunks = prismaSession
      ? {
          documents: prismaSession.documents.map((d) => ({
            document: {
              id: d.document.id,
              chunks: d.document.chunks.map((c) => ({
                id: c.id,
                content: c.content,
              })),
            },
          })),
        }
      : null;

    const { relevant, all } = this.collectRelevantChunks(session, intent);
    return {
      estimatedTokens: this.estimateTokensFromChunks(relevant),
      allChunks: all,
    };
  }

  private collectRelevantChunks(
    session: PrismaChatSessionWithChunks | null,
    intent: UserIntent,
  ): { relevant: ChunkForRouting[]; all: ChunkForRouting[] } {
    if (!session) return { relevant: [], all: [] };

    // Flatten all chunks from all documents
    const allChunks = session.documents
      .flatMap((doc) => doc.document.chunks)
      .map((c) => ({ content: c.content }));

    // Collect relevant chunks based on intent
    let relevantChunks: ChunkForRouting[] = [];
    if (intent === UserIntent.SUMMARIZE_CHAPTER) {
      relevantChunks = allChunks.slice(0, 12);
    } else if (
      intent === UserIntent.EXPLAIN_CONCEPT ||
      intent === UserIntent.COMPARE_CONCEPTS
    ) {
      relevantChunks = allChunks.slice(0, 8);
    } else if (intent === UserIntent.SUMMARIZE_DOCUMENT) {
      relevantChunks = allChunks;
    }

    return { relevant: relevantChunks, all: allChunks };
  }

  private estimateTokensFromChunks(chunks: ChunkForRouting[]): number {
    const AVG_TOKENS_PER_CHAR = 0.25;
    return Math.ceil(
      chunks.reduce((sum, c) => sum + c.content.length, 0) *
        AVG_TOKENS_PER_CHAR,
    );
  }
}
