import { z } from 'zod';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface WorkingMemoryEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  messageId?: string;
}

export interface MemorySummaryHistoryEntry {
  version: number;
  content: string;
  confidence: number;
  updatedAt: number;
}

export interface MemorySummary {
  current: string;
  version: number;
  updatedAt: number;
  tokenCount: number;
  keyTopics: string[];
  confidence: number;
  history: MemorySummaryHistoryEntry[];
}

export interface EntityInfo {
  type: 'concept' | 'formula' | 'topic' | 'term' | 'question';
  frequency: number;
  firstMentioned: number;
  lastMentioned: number;
  contextMessages: string[];
  confidence?: number;
}

export interface DocumentContext {
  documentId: string;
  relevantChunks: Array<{
    chunkId: string;
    relevanceScore: number;
    content: string;
    query?: string;
  }>;
}

export interface MemoryState {
  working?: WorkingMemoryEntry[];
  summary: MemorySummary;
  entities: Record<string, EntityInfo>;
  documentContext: DocumentContext[];
  version: number;
  totalTokensCompressed: number;
  lastCompressedAt: number;
  lastUpdatedAt: number;
  lastProcessedMessageId?: string;
}

export const WorkingMemoryEntrySchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.number(),
  messageId: z.string().optional(),
});

export const MemorySummaryHistoryEntrySchema = z.object({
  version: z.number(),
  content: z.string(),
  confidence: z.number(),
  updatedAt: z.number(),
});

export const MemorySummarySchema = z.object({
  current: z.string(),
  version: z.number(),
  updatedAt: z.number(),
  tokenCount: z.number(),
  keyTopics: z.array(z.string()),
  confidence: z.number(),
  history: z.array(MemorySummaryHistoryEntrySchema),
});

export const EntityInfoSchema = z.object({
  type: z.enum(['concept', 'formula', 'topic', 'term', 'question']),
  frequency: z.number(),
  firstMentioned: z.number(),
  lastMentioned: z.number(),
  contextMessages: z.array(z.string()),
  confidence: z.number().optional(),
});

export const DocumentContextSchema = z.object({
  documentId: z.string(),
  relevantChunks: z.array(
    z.object({
      chunkId: z.string(),
      relevanceScore: z.number(),
      content: z.string(),
      query: z.string().optional(),
    }),
  ),
});

export const MemoryStateSchema: z.ZodType<MemoryState> = z.object({
  working: z.array(WorkingMemoryEntrySchema).optional(),
  summary: MemorySummarySchema,
  entities: z.record(z.string(), EntityInfoSchema),
  documentContext: z.array(DocumentContextSchema),
  version: z.number(),
  totalTokensCompressed: z.number(),
  lastCompressedAt: z.number(),
  lastUpdatedAt: z.number(),
  lastProcessedMessageId: z.string().optional(),
});

export interface PineconeRecord {
  _id: string;
  _score: number;
  fields: {
    chapter: string;
    chapterNumber: number;
    chunkIndex: number;
    documentId: string;
    page: number;
    text: string;
  };
}
