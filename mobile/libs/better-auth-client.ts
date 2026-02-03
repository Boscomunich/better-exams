import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { baseUrl } from "@/constants/env";

export const authClient = createAuthClient({
  baseURL: baseUrl,
  plugins: [
    expoClient({
      scheme: "myapp",
      storagePrefix: "myapp",
      storage: SecureStore,
    }),
  ],
});

export type AuthError = {
  code?: string;
  message?: string;
  status: number;
  statusText: string;
};
