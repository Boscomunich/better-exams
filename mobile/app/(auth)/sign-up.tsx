import { Button, Form, Input, Text, H4, YStack, Spinner } from "tamagui";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToastController } from "@tamagui/toast";
import Loader from "../loaders";
import { authClient, AuthError } from "@/libs/better-auth-client";
import { useState } from "react";

export default function SignUp() {
  const router = useRouter();
  const toast = useToastController();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | AuthError>(null);

  const schema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password too short"),
    name: z.string().min(2, "Name too short"),
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
    const { data, error } = await authClient.signUp.email(formData);
    if (error) {
      setError(error);
    }
    setIsLoading(false);
    if (data) {
      router.replace("/sign-in");

      toast.show("Registration Successful!", {
        duration: 4000,
        size: "large",
        native: true,
        icon: "@/assets/icons/3success.png",
      });
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, rowGap: 12 }}>
      <H4 text="center" my="$3" fontSize={24} fontWeight={900}>
        Create Account
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
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <Input
                  size="$5"
                  autoCapitalize="none"
                  placeholder="Full Name"
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
          icon={<Ionicons name="logo-google" size={20} />}
          justify="flex-start"
          m="$3"
          pl="$8"
          bg="#fff"
          color="#000"
        >
          Sign up with Google
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
          Sign up with Apple
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
          Sign up with Facebook
        </Button>
      </YStack>
    </SafeAreaView>
  );
}
