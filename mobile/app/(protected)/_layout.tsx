import { authClient } from "@/libs/better-auth-client";
import { Redirect, Stack } from "expo-router";
import Loader from "../loaders";
import { useDispatch } from "react-redux";
import { updateUserData } from "@/features/user.slice";
import { useEffect } from "react";

export default function ProtectedLayout() {
  const dispatch = useDispatch();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      const serializableUser = {
        ...session.user,
        createdAt: session.user.createdAt.toISOString(),
        updatedAt: session.user.updatedAt.toISOString(),
      };

      dispatch(updateUserData(serializableUser));
    }
  }, [session, dispatch]);

  if (isPending) return <Loader />;
  if (!session) return <Redirect href="/sign-in" />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="upload" options={{ headerShown: false }} />
      <Stack.Screen name="exams" options={{ headerShown: false }} />
    </Stack>
  );
}
