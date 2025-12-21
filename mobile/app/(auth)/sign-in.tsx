import { Button, Form, Input, Text, H4, YStack } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useToastController } from "@tamagui/toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Loader from "../loaders";
import { authClient, AuthError } from "@/libs/better-auth-client";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | AuthError>(null);

  const router = useRouter();
  const toast = useToastController();

  const schema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password too short"),
  });

  type FormData = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    const { data, error } = await authClient.signIn.email(formData);
    if (error) {
      setError(error);
    }
    setIsLoading(false);
    if (data) {
      router.replace("/");
      toast.show("Login Successful!", {
        native: true,
      });
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, rowGap: 6 }}>
      <H4 text="center" my="$3" fontSize={24} fontWeight={900}>
        Login
      </H4>

      <Form
        gap="$3"
        mb="$8"
        borderWidth={1}
        paddingBlock={12}
        paddingInline={8}
        borderColor={"$borderColor"}
      >
        <YStack gap="$2">
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Input
                  size="$5"
                  autoCapitalize="none"
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.email && (
                  <Text color="red">{errors.email.message}</Text>
                )}
              </>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Input
                  size="$5"
                  secureTextEntry
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.password && (
                  <Text color="red">{errors.password.message}</Text>
                )}
              </>
            )}
          />
        </YStack>

        {error && (
          <Text color="$red10" fontSize={14} mb="$2" px="$2" text="center">
            {error.message || "An unexpected error occurred."}
          </Text>
        )}

        <Form.Trigger asChild>
          <Button
            bg="#E71066"
            hoverStyle={{ bg: "$red8" }}
            pressStyle={{ bg: "$red11" }}
            color={"$white1"}
            size={"$5"}
            onPress={handleSubmit(onSubmit)}
          >
            {isLoading ? <Loader /> : "Continue"}
          </Button>
        </Form.Trigger>
      </Form>

      <YStack>
        <Button
          size={"$5"}
          icon={<Ionicons name="mail-outline" size={20} />}
          justify="flex-start"
          m="$3"
          pl="$8"
          onPress={() => router.push("/sign-up")}
        >
          Continue with Email
        </Button>
        <Button
          size={"$5"}
          icon={<Ionicons name="logo-google" size={20} />}
          justify="flex-start"
          m="$3"
          pl="$8"
          bg="#fff"
          color="#000"
        >
          Sign in with Google
        </Button>
        <Button
          size={"$5"}
          icon={<Ionicons name="logo-apple" size={20} />}
          justify="flex-start"
          m="$3"
          pl="$8"
          bg="#fff"
          color="#000"
        >
          Sign in with Apple
        </Button>
        <Button
          size={"$5"}
          icon={<Ionicons name="logo-facebook" size={20} />}
          justify="flex-start"
          m="$3"
          pl="$8"
          bg="#1877F2"
          color="#fff"
        >
          Sign in with Facebook
        </Button>
      </YStack>
    </SafeAreaView>
  );
}
