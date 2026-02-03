import {
  CreateCoursePayload,
  DeleteCoursePayload,
  FetchCoursesPayload,
  PaginatedCoursesResponse,
  UpdateAPIResponse,
} from "@/types/reqres";
import { betterExamsApi } from "./api";
import { Course } from "@/types/types";

export const courseApi = betterExamsApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.infiniteQuery<
      PaginatedCoursesResponse,
      FetchCoursesPayload,
      number
    >({
      providesTags: (result) =>
        result
          ? [
              ...result.pages.flatMap((page) =>
                page.data.map(({ id }) => ({ type: "Course" as const, id }))
              ),
              { type: "Course", id: "LIST" },
            ]
          : [{ type: "Course", id: "LIST" }],

      infiniteQueryOptions: {
        initialPageParam: 1,

        getNextPageParam: (
          lastPage: PaginatedCoursesResponse
        ): number | undefined => {
          const { currentPage, totalPages } = lastPage.meta;
          return currentPage < totalPages ? currentPage + 1 : undefined;
        },
      },

      query({ queryArg, pageParam }) {
        const { limit, order = "desc" } = queryArg;

        return {
          url: `courses?page=${pageParam}&limit=${limit}&order=${order}`,
          method: "GET",
        };
      },
    }),

    createCourse: builder.mutation<UpdateAPIResponse, CreateCoursePayload>({
      query: (body) => ({
        url: "courses",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Course" as const, id: "LIST" }],
    }),

    deleteCourse: builder.mutation<UpdateAPIResponse, DeleteCoursePayload>({
      query: (body) => ({
        url: "courses",
        method: "DELETE",
        body,
      }),
      invalidatesTags: [{ type: "Course" as const, id: "LIST" }],
    }),

    getCourseById: builder.query<Course, string>({
      query: (id) => `courses/${id}`,
      providesTags: (result, _, id) => [{ type: "Course", id }],
    }),
  }),
});

export const {
  useGetCoursesInfiniteQuery,
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCourseByIdQuery,
} = courseApi;
