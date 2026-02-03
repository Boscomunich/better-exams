import { DocumentPickerAsset } from "expo-document-picker";
import { Difficulty, ExamStructure, ExamType } from "./exams";
import { User } from "better-auth/client";

export enum VectorStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
export interface Document {
  id: string;
  title: string;
  fileUrl: string;
  fileKey: string;
  fileType: string;
  fileSize: string;
  isVectorized: VectorStatus;
  vectorId?: string | null;
  hash?: string | null;
  pageCount?: number | null;
  vectorizedAt?: string | null;
  courseId?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionDocument {
  chatSessionId: string;
  documentId: string;
}

export interface ChatSession {
  id: string;
  title?: string | null;
  userId: string;
  courseId?: string | null;
  course?: Course | null;
  createdAt: string;
  updatedAt: string;
  documents: ChatSessionDocument[];
  messages?: Message[];
  loading?: boolean;
}

export enum Role {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
  SYSTEM = "SYSTEM",
}
export interface Message {
  id: string;
  chatSessionId: string;
  role: Role;
  content: string;
  citations?: {
    source: string;
    confidence?: number;
    timestamp?: string;
  } | null;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  userId: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  id: string;
  title: string;
  instruction?: string | null;
  type: ExamType[];
  difficulty: Difficulty;
  courseId?: string | null;
  course?: Course | null;
  examStructure?: ExamStructure;
  hasStarted: boolean;
  questionsStatus: VectorStatus;
  duration: number;
  numberOfQuestions?: number | null;
  topics: string[];
  passScore?: number | null;
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
  documents?: Document[];
}

export type PickedFile = DocumentPickerAsset.DocumentPickerAsset;
