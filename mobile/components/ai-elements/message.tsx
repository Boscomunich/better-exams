import React from "react";
import { Image, Pressable } from "react-native";
import { YStack, XStack, Text, Button } from "tamagui";
import Markdown from "react-native-markdown-display";
import { Copy, RefreshCcw, X } from "@tamagui/lucide-icons";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useTheme } from "tamagui";

enum Role {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
  SYSTEM = "SYSTEM",
}

export type Attachment = {
  id: string;
  uri: string;
};

export function Message({
  from,
  children,
}: {
  from: Role;
  children: React.ReactNode;
}) {
  return (
    <YStack
      width="100%"
      items={from === Role.USER ? "flex-end" : "flex-start"}
      paddingInline="$3"
      marginBlock="$2"
    >
      {children}
    </YStack>
  );
}

export function MessageContent({
  from,
  children,
  animate = false,
}: {
  from: Role;
  children: string;
  animate?: boolean;
}) {
  const text = useTypewriter(children, from === Role.ASSISTANT && animate);
  const theme = useTheme();

  return (
    <YStack
      maxW="85%"
      paddingInline="$3"
      paddingBlock="$3"
      rounded="$4"
      bg={theme.color4.val as any}
    >
      <Markdown
        style={{
          body: {
            color: theme.accent1.val,
          },
        }}
      >
        {text}
      </Markdown>
    </YStack>
  );
}

export function MessageAttachments({
  attachments,
  onRemove,
}: {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
}) {
  if (!attachments.length) return null;

  return (
    <XStack gap="$2" marginBlockEnd="$2">
      {attachments.map((a) => (
        <YStack key={a.id} position="relative">
          <Image
            source={{ uri: a.uri }}
            style={{ width: 80, height: 80, borderRadius: 8 }}
          />
          {onRemove && (
            <Pressable
              onPress={() => onRemove(a.id)}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                backgroundColor: "#000",
                borderRadius: 10,
                padding: 2,
              }}
            >
              <X size={12} color="white" />
            </Pressable>
          )}
        </YStack>
      ))}
    </XStack>
  );
}

export function MessageActions({
  onCopy,
  onRetry,
}: {
  onCopy?: () => void;
  onRetry?: () => void;
}) {
  if (!onCopy && !onRetry) return null;

  return (
    <XStack gap="$2" marginBlock="$2">
      {onCopy && (
        <Button size="$2" chromeless onPress={onCopy}>
          <Copy size={14} />
        </Button>
      )}
      {onRetry && (
        <Button size="$2" chromeless onPress={onRetry}>
          <RefreshCcw size={14} />
        </Button>
      )}
    </XStack>
  );
}

export function MessageLoader() {
  return (
    <XStack paddingBlock="$3" paddingInline="$3">
      <Text opacity={0.5}>Thinking…</Text>
    </XStack>
  );
}
