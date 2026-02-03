import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { authClient } from "@/libs/better-auth-client";
import { baseUrl } from "@/constants/env";

export const betterExamsApi = createApi({
  reducerPath: "betterExamsApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: async (headers) => {
      const session = await authClient.getSession();

      const token = session?.data?.session.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: ["Course", "Document", "Documents", "Chat"],
});
