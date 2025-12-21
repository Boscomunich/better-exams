import { authClient } from "@/libs/better-auth-client";
import { Redirect, Stack } from "expo-router";
import Loader from "../loaders";

export default function ProtectedLayout() {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return <Loader />;
  if (!isPending && !session) return <Redirect href="/sign-in" />;
  return (
    <>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
