import { z } from 'zod';

// TypeScript Enums
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  MULTI_SELECT = 'MULTI_SELECT',
}

export enum AnswerFormat {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
  TEXT = 'TEXT',
}

// TypeScript Interfaces
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  topic?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimit?: number;
  learningObjective?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.MULTIPLE_CHOICE;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback?: string;
  }[];
  answerFormat: AnswerFormat.SINGLE;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: QuestionType.TRUE_FALSE;
  correctAnswer: boolean;
  explanation?: string;
  answerFormat: AnswerFormat.SINGLE;
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: QuestionType.SHORT_ANSWER;
  correctAnswer: string | string[];
  answerFormat: AnswerFormat.TEXT;
  maxLength?: number;
  keywords?: string[];
}

export interface EssayQuestion extends BaseQuestion {
  type: QuestionType.ESSAY;
  prompt: string;
  wordLimit?: { min: number; max: number };
  rubric?: {
    criteria: Array<{
      name: string;
      description: string;
      maxPoints: number;
    }>;
  };
  sampleAnswer?: string;
  answerFormat: AnswerFormat.TEXT;
}

export interface MultiSelectQuestion extends BaseQuestion {
  type: QuestionType.MULTI_SELECT;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    points?: number;
  }>;
  scoring: {
    allOrNothing: boolean;
    partialCredit: boolean;
    deductIncorrect: boolean;
  };
  answerFormat: AnswerFormat.MULTIPLE;
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion
  | EssayQuestion
  | MultiSelectQuestion;

export interface StudentAnswer {
  questionId: string;
  type: QuestionType;
  value: any;
  timeSpent?: number;
  isSkipped?: boolean;
}

export interface ExamStructure {
  questions: Question[];
  metadata: {
    totalPoints: number;
    estimatedDuration: number;
    timeLimit?: number;
  };
  startedAt?: string;
  completedAt?: string;
  answers: Record<string, StudentAnswer>;
}

export interface AreasToImprove {
  weakTopics: Array<{
    topic: string;
    subtopic?: string;
    mastery: number;
    questionsMissed: string[];
    recommendations: string[];
    resources: Array<{
      type: 'document' | 'video' | 'practice';
      id: string;
      title: string;
      reason: string;
    }>;
  }>;

  commonMistakes: Array<{
    pattern: string;
    examples: string[];
    explanation: string;
    howToAvoid: string;
  }>;

  timeManagement?: {
    avgTimePerQuestion: number;
    slowQuestions: string[];
    recommendedPacing: string;
  };

  nextSteps: string[];
}

export interface AIExamFeedback {
  overall: {
    score: number;
    strengths: string[];
    areasForImprovement: string[];
    estimatedGrade?: string;
  };

  detailedFeedback: Array<{
    questionId: string;
    correct: boolean;
    studentAnswer: any;
    correctAnswer: any;
    explanation: string;
    suggestedStudy: string[];
    pointsEarned: number;
    pointsPossible: number;
  }>;

  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

// Zod Schemas (with different names to avoid conflicts)
export const QuestionTypeSchema = z.enum([
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'SHORT_ANSWER',
  'ESSAY',
  'MULTI_SELECT',
]);

export const AnswerFormatSchema = z.enum(['SINGLE', 'MULTIPLE', 'TEXT']);

const BaseQuestionSchema = z.object({
  id: z.string(),
  type: QuestionTypeSchema,
  text: z.string(),
  points: z.number().min(0),
  topic: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  timeLimit: z.number().min(0).optional(),
  learningObjective: z.string().optional(),
});

const OptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
  feedback: z.string().optional(),
});

const MultipleChoiceQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionTypeSchema.enum.MULTIPLE_CHOICE),
  options: z.array(OptionSchema).min(2),
  answerFormat: z.enum([
    AnswerFormatSchema.enum.SINGLE,
    AnswerFormatSchema.enum.MULTIPLE,
  ]),
});

const TrueFalseQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionTypeSchema.enum.TRUE_FALSE),
  correctAnswer: z.boolean(),
  explanation: z.string().optional(),
  answerFormat: z.literal(AnswerFormatSchema.enum.SINGLE),
});

const ShortAnswerQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionTypeSchema.enum.SHORT_ANSWER),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  answerFormat: z.literal(AnswerFormatSchema.enum.TEXT),
  maxLength: z.number().min(1).optional(),
  keywords: z.array(z.string()).optional(),
});

const EssayQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionTypeSchema.enum.ESSAY),
  prompt: z.string(),
  wordLimit: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .optional()
    .refine((data) => !data || data.max >= data.min, {
      message: 'max must be greater than or equal to min',
    }),
  rubric: z
    .object({
      criteria: z
        .array(
          z.object({
            name: z.string(),
            description: z.string(),
            maxPoints: z.number().min(0),
          }),
        )
        .optional(),
    })
    .optional(),
  sampleAnswer: z.string().optional(),
  answerFormat: z.literal(AnswerFormatSchema.enum.TEXT),
});

const MultiSelectQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionTypeSchema.enum.MULTI_SELECT),
  options: z
    .array(
      OptionSchema.extend({
        points: z.number().optional(),
      }),
    )
    .min(2),
  scoring: z.object({
    allOrNothing: z.boolean(),
    partialCredit: z.boolean(),
    deductIncorrect: z.boolean(),
  }),
  answerFormat: z.literal(AnswerFormatSchema.enum.MULTIPLE),
});

export const QuestionSchema = z.discriminatedUnion('type', [
  MultipleChoiceQuestionSchema,
  TrueFalseQuestionSchema,
  ShortAnswerQuestionSchema,
  EssayQuestionSchema,
  MultiSelectQuestionSchema,
]);

export const StudentAnswerSchema = z.object({
  questionId: z.string(),
  type: QuestionTypeSchema,
  value: z.any(),
  timeSpent: z.number().min(0).optional(),
  isSkipped: z.boolean().optional(),
});

export const ExamStructureSchema = z.object({
  questions: z.array(QuestionSchema).optional(),
  metadata: z
    .object({
      totalPoints: z.number().min(0),
      estimatedDuration: z.number().min(0),
      timeLimit: z.number().min(0).optional(),
    })
    .optional(),
  startedAt: z.iso.datetime().optional(),
  completedAt: z.iso.datetime().optional(),
  answers: z.record(z.string(), StudentAnswerSchema).optional(),
});

export const AreasToImproveSchema = z.object({
  weakTopics: z.array(
    z.object({
      topic: z.string(),
      subtopic: z.string().optional(),
      mastery: z.number().min(0).max(100),
      questionsMissed: z.array(z.string()),
      recommendations: z.array(z.string()),
      resources: z.array(
        z.object({
          type: z.enum(['document', 'video', 'practice']),
          id: z.string(),
          title: z.string(),
          reason: z.string(),
        }),
      ),
    }),
  ),
  commonMistakes: z.array(
    z.object({
      pattern: z.string(),
      examples: z.array(z.string()),
      explanation: z.string(),
      howToAvoid: z.string(),
    }),
  ),
  timeManagement: z
    .object({
      avgTimePerQuestion: z.number().min(0),
      slowQuestions: z.array(z.string()),
      recommendedPacing: z.string(),
    })
    .optional(),
  nextSteps: z.array(z.string()),
});

export const AIExamFeedbackSchema = z.object({
  overall: z.object({
    score: z.number(),
    strengths: z.array(z.string()),
    areasForImprovement: z.array(z.string()),
    estimatedGrade: z.string().optional(),
  }),
  detailedFeedback: z.array(
    z.object({
      questionId: z.string(),
      correct: z.boolean(),
      studentAnswer: z.any(),
      correctAnswer: z.any(),
      explanation: z.string(),
      suggestedStudy: z.array(z.string()),
      pointsEarned: z.number().min(0),
      pointsPossible: z.number().min(0),
    }),
  ),
  recommendations: z.object({
    immediate: z.array(z.string()),
    shortTerm: z.array(z.string()),
    longTerm: z.array(z.string()),
  }),
});
