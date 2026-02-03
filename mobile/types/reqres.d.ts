import { ChatSession, Course, Document } from "./types";

export interface PaginationMeta {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface PaginatedDocumentsResponse {
  message: string;
  data: Document[];
  meta: PaginationMeta;
}

export interface AddDocumentsToChatSessionPayload {
  chatSessionId: string;
  documentIds: string[];
}

export interface AddDocumentsToCoursePayload {
  courseId: string;
  documentIds: string[];
}

interface UpdateAPIResponse {
  message: string;
}

export interface PaginatedChatSessionResponse {
  message: string;
  data: ChatSession[];
  meta: PaginationMeta;
}

export interface PaginatedCoursesResponse {
  message: string;
  data: Course[];
  meta: PaginationMeta;
}

export interface FetchCoursesPayload {
  limit: number;
  order?: "asc" | "desc";
}

export interface CreateCoursePayload {
  title: string;
  description?: string;
}

export interface DeleteCoursePayload {
  id: string;
  willDeleteDocuments: boolean;
}

export interface DeleteDocumentPayload {
  ids: string[];
}
