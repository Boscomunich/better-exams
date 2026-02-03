import { UpdateAPIResponse } from "@/types/reqres";
import { betterExamsApi } from "./api";
import { CreateExamFormData } from "@/types/exams";
import { Exam } from "@/types/types";

export const examApi = betterExamsApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    createExam: builder.mutation<UpdateAPIResponse, CreateExamFormData>({
      query: (data) => ({
        url: "exam",
        method: "POST",
        body: {
          ...data,
        },
      }),
    }),

    getExamWithQuestions: builder.query<Exam, { id: string }>({
      query: ({ id }) => ({
        url: `exam/with-questions/${id}`,
        method: "Get",
      }),
    }),
  }),
});

export const { useCreateExamMutation } = examApi;
