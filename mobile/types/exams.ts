import { z } from "zod";

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT_ANSWER = "SHORT_ANSWER",
  ESSAY = "ESSAY",
  MULTI_SELECT = "MULTI_SELECT",
}

export enum AnswerFormat {
  SINGLE = "SINGLE",
  MULTIPLE = "MULTIPLE",
  TEXT = "TEXT",
}

// TypeScript Interfaces
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  topic?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
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

export enum ExamType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  SHORT_ANSWER = "SHORT_ANSWER",
  ESSAY = "ESSAY",
  MULTI_SELECT = "MULTI_SELECT",
  MIXED = "MIXED",
}

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export const createExamSchema = z.object({
  title: z.string().min(1, "Exam title is required"),

  type: z.array(z.nativeEnum(ExamType)).min(1, "Select at least one exam type"),

  difficulty: z.nativeEnum(Difficulty).optional(),

  courseId: z.string().optional(),

  topics: z.array(z.string()).optional(),

  passScore: z.number().min(0).optional(),

  numberOfQuestions: z.number().optional(),

  duration: z.number().min(1, "Duration is required"),

  documentIds: z.array(z.string()).optional(),
});

export type CreateExamFormData = z.infer<typeof createExamSchema>;

export interface ExamStructurePreview {
  title: string;
  duration: number;
  difficulty?: Difficulty;
  totalQuestions?: number;
  passScore?: number;
  types: ExamType[];
}
