import {
  AddDocumentsToChatSessionPayload,
  AddDocumentsToCoursePayload,
  DeleteDocumentPayload,
  PaginatedDocumentsResponse,
  UpdateAPIResponse,
} from "@/types/reqres";
import { betterExamsApi } from "./api";
import { PickedFile } from "@/types/types";

export const documentApi = betterExamsApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.infiniteQuery<
      PaginatedDocumentsResponse,
      { limit: number },
      number
    >({
      providesTags: (result) =>
        result
          ? [
              ...result.pages.flatMap((page) =>
                page.data.map(({ id }) => ({ type: "Document" as const, id }))
              ),
              { type: "Documents" as const, id: "LIST" },
            ]
          : [{ type: "Documents" as const, id: "LIST" }],

      infiniteQueryOptions: {
        initialPageParam: 1,

        getNextPageParam: (
          lastPage: PaginatedDocumentsResponse
        ): number | undefined => {
          const { currentPage, totalPages } = lastPage.meta;

          return currentPage < totalPages ? currentPage + 1 : undefined;
        },
      },

      query({ queryArg, pageParam }) {
        return {
          url: `documents?page=${pageParam}&limit=${queryArg.limit}`,
          method: "GET",
        };
      },
    }),

    addDocumentsToChatSession: builder.mutation<
      UpdateAPIResponse,
      AddDocumentsToChatSessionPayload
    >({
      query: ({ chatSessionId, documentIds }) => ({
        url: "documents/addDocumentsToChat",
        method: "PATCH",
        body: {
          chatSessionId,
          documentIds,
        },
      }),
    }),

    removeDocumentsToChatSession: builder.mutation<
      UpdateAPIResponse,
      AddDocumentsToChatSessionPayload
    >({
      query: ({ chatSessionId, documentIds }) => ({
        url: "documents/removeDocumentsFromChat",
        method: "PATCH",
        body: {
          chatSessionId,
          documentIds,
        },
      }),
    }),

    addDocumentsTocourse: builder.mutation<
      UpdateAPIResponse,
      AddDocumentsToCoursePayload
    >({
      query: ({ courseId, documentIds }) => ({
        url: "documents/addCourse",
        method: "PATCH",
        body: {
          courseId,
          documentIds,
        },
      }),
    }),

    removeDocumentsFromcourse: builder.mutation<
      UpdateAPIResponse,
      AddDocumentsToCoursePayload
    >({
      query: ({ courseId, documentIds }) => ({
        url: "documents/removeCourse",
        method: "PATCH",
        body: {
          courseId,
          documentIds,
        },
      }),
    }),

    uploadDocuments: builder.mutation<
      { files: any[] },
      {
        files: PickedFile[];
        courseId?: string;
      }
    >({
      query: ({ files, courseId }) => {
        const formData = new FormData();

        files.forEach((file) => {
          formData.append("files", {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || "application/octet-stream",
          } as any);
        });

        if (courseId) {
          formData.append("courseId", courseId);
        }

        return {
          url: "documents/upload",
          method: "POST",
          body: formData,
        };
      },

      invalidatesTags: [{ type: "Documents" as const, id: "LIST" }],
    }),

    deleDocument: builder.mutation<UpdateAPIResponse, DeleteDocumentPayload>({
      query: ({ ids }) => ({
        url: "documents",
        method: "DELETE",
        body: {
          ids,
        },
      }),
      invalidatesTags: [{ type: "Documents" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useGetDocumentsInfiniteQuery,
  useAddDocumentsToChatSessionMutation,
  useAddDocumentsTocourseMutation,
  useRemoveDocumentsToChatSessionMutation,
  useRemoveDocumentsFromcourseMutation,
  useUploadDocumentsMutation,
  useDeleDocumentMutation,
} = documentApi;
