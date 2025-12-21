import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

let baseUrl: string;

if (__DEV__) {
  baseUrl = "http://10.166.229.140:8080";
} else {
  baseUrl = "";
}

// Define a service using a base URL and expected endpoints
export const betterExamsApi = createApi({
  reducerPath: "betterExamsApi",
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),
  endpoints: () => ({}),
});
