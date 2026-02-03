import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { YStack, XStack, Text, Button } from "tamagui";
import { ArrowDown } from "@tamagui/lucide-icons";
import { Spinner } from "tamagui";

export function Conversation({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<ScrollView>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;

    const distanceFromBottom =
      contentSize.height - (layoutMeasurement.height + contentOffset.y);

    setIsAtBottom(distanceFromBottom < 40);
  };

  const scrollToBottom = (animated = true) => {
    scrollRef.current?.scrollToEnd({ animated });
  };

  /* Auto-scroll when new messages come in */
  useEffect(() => {
    if (isAtBottom) {
      requestAnimationFrame(() => scrollToBottom(true));
    }
  }, [children]);

  return (
    <YStack flex={1} position="relative">
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingVertical: 16,
          paddingHorizontal: 12,
          flexGrow: 1,
        }}
      >
        {children}
      </ScrollView>

      {!isAtBottom && (
        <ConversationScrollButton onPress={() => scrollToBottom()} />
      )}
    </YStack>
  );
}

export function ConversationContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <YStack gap="$4">{children}</YStack>;
}

export function ConversationEmptyState({
  title = "No messages yet",
  description = "Start a conversation to see messages here",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <YStack flex={1} items="center" justify="center" p="$6" gap="$2">
      <Text fontSize="$5" fontWeight="600">
        {title}
      </Text>
      <Text opacity={0.6} text="center">
        {description}
      </Text>
    </YStack>
  );
}

export function ConversationLoader() {
  return (
    <YStack
      animation="quickest"
      enterStyle={{ opacity: 0, y: -10 }}
      exitStyle={{ opacity: 0, y: -10 }}
      py="$4"
      px="$3"
      gap="$3"
    >
      <XStack gap="$2" items="center">
        <YStack
          bg="$color8"
          width={36}
          height={36}
          rounded="$12"
          items="center"
          justify="center"
        >
          <Text color="white" fontSize="$3" fontWeight="bold">
            AI
          </Text>
        </YStack>

        <YStack flex={1}>
          {/* Loading message bubble */}
          <YStack
            bg="$background"
            borderWidth={1}
            borderColor="$borderColor"
            rounded="$4"
            p="$3"
            maxW="80%"
            items="flex-start"
          >
            <XStack gap="$1" items="center">
              <Spinner size="small" color="$color8" />
              <Text fontSize="$3" color="$color11" ml="$2">
                Thinking...
              </Text>
            </XStack>
          </YStack>

          {/* Typing dots animation */}
          <XStack gap="$1" mt="$2" ml="$3">
            <YStack
              animation="lazy"
              bg="$color8"
              width={8}
              height={8}
              rounded="$12"
              opacity={0.4}
            />
            <YStack
              animation="lazy"
              bg="$color8"
              width={8}
              height={8}
              rounded="$12"
              opacity={0.6}
            />
            <YStack
              animation="lazy"
              bg="$color8"
              width={8}
              height={8}
              rounded="$12"
              opacity={0.8}
            />
          </XStack>
        </YStack>
      </XStack>
    </YStack>
  );
}

function ConversationScrollButton({ onPress }: { onPress: () => void }) {
  return (
    <XStack position="absolute" b={16} l={0} r={0} items="center">
      <Button size="$4" circular elevation="$2" onPress={onPress}>
        <ArrowDown size={18} />
      </Button>
    </XStack>
  );
}
