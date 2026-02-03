import { Toast, useToastController, useToastState } from "@tamagui/toast";
import { Button, H4 } from "tamagui";
import { CheckCircle, AlertCircle, Info } from "@tamagui/lucide-icons";
import { XStack, YStack, isWeb, SizableText } from "tamagui";

export function CurrentToast() {
  const currentToast = useToastState();
  if (!currentToast) return null;

  // Handle different presets for colors/icons
  const preset = currentToast.customData?.preset || "info";
  const config = {
    success: { bg: "$green10", icon: <CheckCircle size={18} color="white" /> },
    error: { bg: "$red10", icon: <AlertCircle size={18} color="white" /> },
    info: { bg: "$blue10", icon: <Info size={18} color="white" /> },
  } as const;

  const active = config[preset];

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, scale: 0.5, y: -50 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      y={isWeb ? "$12" : "$8"} // Adjust for status bar on mobile
      animation="quick"
      rounded="$6"
      bg={active.bg}
      p="$3"
      px="$5"
      elevate
    >
      <XStack gap="$3" items="center">
        {active.icon}
        <YStack>
          <Toast.Title fontWeight="700" color="white" fontSize="$3">
            {currentToast.title}
          </Toast.Title>
          {!!currentToast.message && (
            <Toast.Description color="white" fontSize="$2" opacity={0.9}>
              {currentToast.message}
            </Toast.Description>
          )}
        </YStack>
      </XStack>
    </Toast>
  );
}

export default function ToastControl() {
  const toast = useToastController();

  return (
    <YStack gap="$2" items="center">
      <H4>Toast demo</H4>
      <XStack gap="$2" justify="center">
        <Button
          onPress={() => {
            toast.show("Successfully saved!", {
              message: "Don't worry, we've got your data.",
              customData: {
                preset: "success",
              },
            });
          }}
        >
          Show
        </Button>
        <Button
          onPress={() => {
            toast.hide();
          }}
        >
          Hide
        </Button>
      </XStack>
    </YStack>
  );
}

export type ToastPreset = "success" | "error" | "info";

export type ToastOptions = {
  title: string;
  message?: string;
  preset: ToastPreset;
  duration?: number;
};

export function useAppToast() {
  const toast = useToastController();

  const showToast = ({ title, message, preset, duration }: ToastOptions) => {
    return toast.show(title, {
      message,
      duration,
      customData: {
        preset,
      },
    });
  };

  return { show: showToast, hide: toast.hide };
}
