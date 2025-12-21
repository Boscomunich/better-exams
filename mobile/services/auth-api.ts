import { betterExamsApi } from "./api";

export const authApi = betterExamsApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (user: RegisterUserPayload) => ({
        url: "auth/register",
        method: "POST",
        body: user,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    login: builder.mutation({
      query: (user: any) => ({
        url: "auth/login",
        method: "POST",
        body: user,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;
