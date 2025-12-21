import { ChatOpenAI } from '@langchain/openai';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { VectorizeService } from 'src/vectorize/vectorize.service';
import { createAgent, ReactAgent } from 'langchain';
import { QuestionSchema } from 'types/exams';
import z from 'zod';
import { TokenUtils } from './utils/token.counter';
import { AI_MODEL, HEAVY_AI_MODEL } from './ai.model.provider';
import { generateExamPrompt } from 'libs/generate-exam';

@Injectable()
export class AIExamService {
  private readonly examAgent: ReactAgent;
  private readonly summaryAgent: ReactAgent;

  private static readonly SUMMARIZATION_TRIGGER = 50_000;
  private static readonly BATCH_TARGET_TOKENS = 30_000;

  constructor(
    @Inject(HEAVY_AI_MODEL) private readonly heavyModel: ChatOpenAI,
    @Inject(AI_MODEL) private readonly model: ChatOpenAI,
    private readonly prisma: PrismaService,
    private readonly vectorizeService: VectorizeService,
  ) {
    this.examAgent = createAgent({
      model: this.heavyModel,
      responseFormat: AIExamService.ExamStructureResponseSchema,
    });

    this.summaryAgent = createAgent({
      model: this.model,
      responseFormat: AIExamService.DocumentBatchSummarySchema,
    });
  }

  async generateExamsQuestion(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        documents: { include: { chunks: true } },
        course: { include: { documents: { include: { chunks: true } } } },
      },
    });

    if (!exam) return;

    const allDocuments = [...exam.documents, ...(exam.course?.documents ?? [])];
    const compressedDocuments: Record<string, string> = {};

    for (const doc of allDocuments) {
      if (!doc.chunks.length) continue;
      compressedDocuments[doc.id] = doc.chunks
        .sort((a, b) => a.index - b.index)
        .map((c) => c.content.trim())
        .join('\n\n');
    }

    const totalTokens = Object.values(compressedDocuments).reduce(
      (sum, t) => sum + TokenUtils.estimate(t),
      0,
    );

    let finalDocuments: Record<string, string> = compressedDocuments;

    if (totalTokens > AIExamService.SUMMARIZATION_TRIGGER) {
      const numBatches = Math.ceil(
        totalTokens / AIExamService.BATCH_TARGET_TOKENS,
      );
      const documentEntries = Object.entries(compressedDocuments);
      const batchSize = Math.ceil(documentEntries.length / numBatches);
      finalDocuments = {};

      for (let i = 0; i < numBatches; i++) {
        const batchDocs = documentEntries.slice(
          i * batchSize,
          (i + 1) * batchSize,
        );
        if (!batchDocs.length) continue;

        const batchInput = batchDocs
          .map(([docId, text]) => `### Document ${docId}\n${text}`)
          .join('\n\n');

        const systemPrompt = `You are summarizing multiple independent documents.
        Rules:
        - Summarize each document independently
        - Preserve formatting and structure
        - Preserve definitions, formulas, enumerations
        - Do NOT merge documents
        - Do NOT reference documents across summaries
        -Summarize into a dense factual list of definitions/concepts`;

        const result = await this.summaryAgent.invoke({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: batchInput },
          ],
        });

        const parsed = AIExamService.DocumentBatchSummarySchema.parse(
          result.structuredResponse,
        );

        Object.assign(finalDocuments, parsed.summaries);
      }
    }
    const systemPrompt = generateExamPrompt(exam);
    const userPrompt = JSON.stringify(finalDocuments, null, 2);
    const result = await this.examAgent.invoke({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });
    const questions = AIExamService.ExamStructureResponseSchema.parse(
      result.structuredResponse,
    );

    await this.prisma.exam.update({
      where: { id },
      data: {
        examStructure: questions,
        questionsStatus: 'COMPLETED',
      },
    });
  }

  private static readonly DocumentBatchSummarySchema = z.object({
    summaries: z.record(z.string(), z.string()),
  });

  private static readonly ExamStructureResponseSchema = z.object({
    questions: z.array(QuestionSchema),
    metadata: z.object({
      totalPoints: z.number().min(0),
      estimatedDuration: z.number().min(0),
      timeLimit: z.number().min(0),
    }),
  });
}
