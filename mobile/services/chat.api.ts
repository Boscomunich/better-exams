import { PaginatedChatSessionResponse } from "@/types/reqres";
import { betterExamsApi } from "./api";
import { Message } from "@/types/types";
import { addChatMessage } from "@/features/chat.slice";

export const chatApi = betterExamsApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatHistory: builder.infiniteQuery<
      PaginatedChatSessionResponse,
      { limit: number },
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 1,

        getNextPageParam: (
          lastPage: PaginatedChatSessionResponse
        ): number | undefined => {
          const { currentPage, totalPages } = lastPage.meta;

          return currentPage < totalPages ? currentPage + 1 : undefined;
        },
      },

      query({ queryArg, pageParam }) {
        return {
          url: `chat?page=${pageParam}&limit=${queryArg.limit}`,
          method: "GET",
        };
      },
    }),

    getChatMessage: builder.query<Message[], { id: string }>({
      query: ({ id }) => ({
        url: "chat/message",
        method: "GET",
        params: { id },
      }),

      providesTags: (result, error, arg) => [{ type: "Chat", id: arg.id }],

      transformResponse: (response: { data: Message[]; message: string }) =>
        response.data,

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(addChatMessage(data));
        } catch (error) {
          console.log(error);
        }
      },
    }),
  }),
});

export const { useGetChatHistoryInfiniteQuery, useGetChatMessageQuery } =
  chatApi;
