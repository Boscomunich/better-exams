export enum Scope {
  SINGLE_CHAPTER = 'SINGLE_CHAPTER',
  SINGLE_DOCUMENT = 'SINGLE_DOCUMENT',
  MULTI_DOCUMENT = 'MULTI_DOCUMENT',
  COURSE = 'COURSE',
}

export interface RoutingDecision {
  tier: ModelTier;
  intent: UserIntent;
  estimatedTokens: number;
  reason: string;
}

export interface ChunkForRouting {
  content: string;
}

export type PrismaChatSessionWithChunks = {
  documents: Array<{
    document: {
      id: string;
      chunks: Array<{
        id: string;
        content: string;
      }>;
    };
  }>;
} | null;

export interface RoutingResult {
  decision: RoutingDecision;
  chunks: ChunkForRouting[];
}

export enum ModelTier {
  LIGHT = 'LIGHT',
  WORKHORSE = 'WORKHORSE',
  HEAVY = 'HEAVY',
}

export enum UserIntent {
  SUMMARIZE_DOCUMENT = 'SUMMARIZE_DOCUMENT',
  SUMMARIZE_CHAPTER = 'SUMMARIZE_CHAPTER',
  SUMMARIZE_COURSE = 'SUMMARIZE_COURSE',
  EXPLAIN_CONCEPT = 'EXPLAIN_CONCEPT',
  COMPARE_CONCEPTS = 'COMPARE_CONCEPTS',
}

export interface IntentResult {
  intent: UserIntent;
  confidence: number;
}

export interface QueryResolutionResult {
  rewrittenQuery: string;
  intent: UserIntent;
  metadata: {
    documentTitle?: string;
    chapterNo?: number;
    chapterName?: string;
    courseName?: string;
  };
  requiresRouting: boolean;
}
