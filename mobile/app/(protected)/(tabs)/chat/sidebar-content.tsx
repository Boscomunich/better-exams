import { chatApi, useGetChatHistoryInfiniteQuery } from "@/services/chat.api";
import { ChatSession, Document } from "@/types/types";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { Theme, useTheme, XStack } from "tamagui";
import { Button, Spinner, Text, View, YStack, Avatar, Popover } from "tamagui";
import type { PopoverProps } from "tamagui";
import Feather from "@expo/vector-icons/Feather";
import {
  useAddDocumentsToChatSessionMutation,
  useGetDocumentsInfiniteQuery,
} from "@/services/document.api";
import { useSelector } from "react-redux";
import { clearChatMessage, createNewChat } from "@/features/chat.slice";
import { RootState, useAppDispatch, useAppSelector } from "@/libs/store";
import { useToastController } from "@tamagui/toast";
import { LoadingButton } from "@/components/ui/loading-button";

export default function SideBarContents() {
  const theme = useTheme();
  return (
    <YStack flex={1}>
      <YStack
        justify="flex-start"
        items="center"
        gap={8}
        position="absolute"
        p="$2"
        t={0}
        l={0}
        r={0}
        z={1000}
        height={40}
        bg="$background"
      >
        <XStack justify="space-between" width="100%" px="$6">
          <YStack items="center">
            <PopoverContainer
              placement="bottom"
              Icon={
                <Feather name="file-plus" size={24} color={theme.accent1.val} />
              }
              Name="bottom-popover"
            >
              <MultiSelectDocumentsDemo />
            </PopoverContainer>
          </YStack>
        </XStack>
      </YStack>
      <View mt={50} mb={40}>
        <ChatHistory />
      </View>
      <XStack
        justify="flex-start"
        items="center"
        gap={8}
        position="absolute"
        p="$2"
        b={0}
        l={0}
        r={0}
        z={1000}
        height={40}
        bg="$background"
      >
        <Avatar circular size="$2" ml="$2">
          <Avatar.Image src="http://picsum.photos/200/300" />
          <Avatar.Fallback />
        </Avatar>
        <Text fontSize={16} text="center">
          Obuegbe chidera solomon
        </Text>
      </XStack>
    </YStack>
  );
}

function ChatHistory() {
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetching,
  } = useGetChatHistoryInfiniteQuery({ limit: 50 });

  const dispatch = useAppDispatch();
  const chat = useAppSelector((state) => state.chat);

  // Memoize derived data
  const chats = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <YStack p="$4" items="center">
        <Spinner size="small" />
      </YStack>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <YStack flex={1} items="center" justify="center" p="$8">
          <Spinner size="large" />
          <Text mt="$4">Loading chats...</Text>
        </YStack>
      );
    }
    return (
      <YStack flex={1} items="center" justify="center" p="$8">
        <Text color="#E71066">No Chat History</Text>
        <Button mt="$4" onPress={() => refetch}>
          Refresh
        </Button>
      </YStack>
    );
  }, [isLoading, refetch]);

  // Memoized renderItem (main fix for the warning)
  const renderItem = useCallback(
    ({ item }: { item: ChatSession }) => {
      const isActive = chat.id === item.id;
      return (
        <YStack p="$4" px="$2" pb={0} key={`chat-${item.id}-${isActive}`}>
          <Pressable
            style={{
              backgroundColor: isActive ? "rgba(231, 16, 102, 0.1)" : "",
              padding: 8,
              borderRadius: 24,
            }}
            onPress={() => {
              dispatch(clearChatMessage());
              dispatch(
                chatApi.util.invalidateTags([{ type: "Chat", id: item.id }])
              );
              dispatch(createNewChat(item));
            }}
          >
            <Text
              fontSize={16}
              fontWeight={600}
              numberOfLines={1}
              ellipsizeMode="tail"
              color={isActive ? "#E71066" : "$accent8"}
            >
              {item.title}
            </Text>
          </Pressable>
        </YStack>
      );
    },
    [chat.id]
  );

  if (error) {
    return (
      <View style={{ flex: 1 }}>
        <YStack flex={1} p="$4" items="center" justify="center">
          <Text color="$red10">Error loading chat history</Text>
          <Button mt="$4" onPress={() => refetch}>
            Try Again
          </Button>
        </YStack>
      </View>
    );
  }

  return (
    <FlatList
      extraData={chat.id}
      data={chats}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshing={isFetching}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 20,
        backgroundColor: "transparent",
      }}
    />
  );
}

function PopoverContainer({
  Icon,
  Name,
  children,
  ...props
}: PopoverProps & { Icon?: any; Name?: string; children: ReactNode }) {
  return (
    <Popover size="$5" allowFlip stayInFrame offset={15} resize {...props}>
      <Popover.Trigger asChild>
        <View>{Icon}</View>
      </Popover.Trigger>

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        width={300}
        height={500}
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "quickest",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
        {children}
      </Popover.Content>
    </Popover>
  );
}

function MultiSelectDocumentsDemo() {
  const toast = useToastController();
  const chat = useSelector((state: RootState) => state.chat);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { data } = useGetDocumentsInfiniteQuery({
    limit: 50,
  });

  const [addDocuments, { isLoading, isError }] =
    useAddDocumentsToChatSessionMutation();

  useEffect(() => {
    if (chat.documents && chat.documents.length > 0) {
      const existingIds = chat.documents.map((doc) => doc.documentId);
      setSelectedIds(new Set(existingIds));
    } else {
      setSelectedIds(new Set());
    }
  }, [chat.documents]);

  const documents = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectedDocuments = useMemo(
    () => documents.filter((doc) => selectedIds.has(doc.id)),
    [documents, selectedIds]
  );

  const handleConfirm = useCallback(async () => {
    // Convert Set<string> to string[]
    const idsOnly = Array.from(selectedIds);

    if (!chat.id) {
      console.error("No active chat session found");
      return;
    }

    try {
      const response = await addDocuments({
        chatSessionId: chat.id,
        documentIds: idsOnly,
      }).unwrap();
      if (response.message) {
        toast.show(response.message, {
          customData: {
            preset: "success",
          },
        });
      }
    } catch (error) {
      console.error("Failed to add documents:", error);
    }

    console.log("Confirmed IDs:", idsOnly);
  }, [selectedIds]);

  const renderItem = useCallback(
    ({ item }: { item: Document }) => {
      const isSelected = selectedIds.has(item.id);

      return (
        <XStack
          pressStyle={{ opacity: 0.7 }}
          onPress={() => toggleSelection(item.id)}
          items="center"
          justify="space-between"
          p="$3"
          rounded="$3"
          bg={isSelected ? "$green2" : "transparent"}
        >
          <Text
            flex={1}
            numberOfLines={1}
            fontSize="$2"
            fontWeight={isSelected ? "600" : "400"}
          >
            {item.title}
          </Text>

          <Feather
            name={isSelected ? "check-circle" : "circle"}
            size={12}
            color={isSelected ? "#2e7d32" : "#9e9e9e"}
          />
        </XStack>
      );
    },
    [selectedIds, toggleSelection]
  );

  return (
    <YStack flex={1} gap="$4" width="100%">
      <Text fontSize="$3" fontWeight="600">
        add Documents documents to chat context
      </Text>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <YStack height={1} bg="$borderColor" />}
      />

      <LoadingButton
        loading={isLoading}
        spinnerColor="$color"
        theme="green"
        onPress={() => handleConfirm()}
      >
        Submit
      </LoadingButton>
    </YStack>
  );
}
