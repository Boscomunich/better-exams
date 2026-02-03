import { io } from "socket.io-client";
import { authClient } from "@/libs/better-auth-client";
import { baseUrl } from "@/constants/env";

export const socket = io(`${baseUrl}/chat`, {
  transports: ["websocket"],
  autoConnect: false,
  auth: async (cb) => {
    const session = await authClient.getSession();
    const token = session?.data?.session?.token;

    cb({
      token,
    });
  },
});
