import { Spinner, Text, useTheme, XStack, YStack } from "tamagui";
import { PromptInput } from "@/components/ai-elements/prompt";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import SideBarContents from "./sidebar-content";
import { useEffect, useState } from "react";
import { socket } from "@/services/socket";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/libs/store";
import {
  createNewChat,
  clearChat,
  addChatMessage,
  toggleLoading,
} from "@/features/chat.slice";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationLoader,
} from "@/components/ai-elements/conversation";
import { useGetChatMessageQuery } from "@/services/chat.api";
import {
  Message,
  MessageActions,
  MessageContent,
} from "@/components/ai-elements/message";
import type { Message as ChatMessage, ChatSession } from "@/types/types";
import { useLocalSearchParams } from "expo-router";
import { AlignLeft } from "@tamagui/lucide-icons";

enum Role {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
  SYSTEM = "SYSTEM",
}

const Drawer = createDrawerNavigator();

interface MessageState {
  message: string;
  documentIds: string[];
  chatSessionId: string;
  courseId?: string | null;
}

function ChatScreen({ courseId }: { courseId: string }) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const chat = useSelector((state: RootState) => state.chat);
  const user = useSelector((state: RootState) => state.user);

  const { isLoading, isFetching, isUninitialized, isSuccess } =
    useGetChatMessageQuery({ id: chat.id }, { skip: !chat.id });

  useEffect(() => {
    if (courseId) {
      dispatch(clearChat({ userId: user.id }));
    }
  }, [courseId]);

  const [message, setMessage] = useState<MessageState>({
    documentIds: [],
    message: "",
    chatSessionId: "",
    courseId: courseId ? courseId : null,
  });

  useEffect(() => {
    // Listen for events
    socket.on("chatStreamChunk", (data: ChatMessage[]) => {
      console.log(data);
      dispatch(addChatMessage(data));
    });

    socket.on("chatStreamComplete", (data) => {
      dispatch(toggleLoading({ loading: false }));
      console.log("Update complete:", data);
    });

    socket.on("chatStreamError", (data) => {
      dispatch(toggleLoading({ loading: false }));
      console.log("Update error:", data);
    });

    // Clean up listener on unmount
    return () => {
      socket.off("examUpdate");
    };
  }, []);

  const sendMessage = async (currentMessage: MessageState) => {
    dispatch(toggleLoading({ loading: true }));
    setMessage(currentMessage);
    dispatch(
      addChatMessage([
        {
          id: (chat.messages?.length ?? 0 + 1).toString(),
          role: Role.USER,
          chatSessionId: currentMessage.chatSessionId,
          content: currentMessage.message,
          createdAt: new Date().toISOString(),
        },
      ])
    );

    socket.emit(
      "sendMessage",
      currentMessage,
      (response: { status: string; chatSession: ChatSession }) => {
        console.log(response);
        if (response.chatSession) {
          dispatch(createNewChat(response.chatSession));
        }
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack mt="$4" height={30}>
          <XStack
            pointerEvents="box-none"
            justify="space-between"
            px="$4"
            position="absolute"
            t={0}
            l={0}
            r={0}
            z={1000}
          >
            <AlignLeft
              size={24}
              color={theme.accent1.val as any}
              onPress={() => navigation.openDrawer()}
            />
            <Text
              fontSize={16}
              overflow="hidden"
              numberOfLines={1}
              width="75%"
              text="center"
            >
              {chat.title}
            </Text>
            <AntDesign
              name="plus-circle"
              color={theme.accent1.val}
              size={24}
              onPress={() => dispatch(clearChat({ userId: user.id }))}
            />
          </XStack>
        </YStack>
        <YStack flex={1}>
          <Conversation>
            {isLoading || isFetching ? (
              <YStack items="center" justify="center" flex={1}>
                <Spinner size="large" />
              </YStack>
            ) : isUninitialized ||
              (isSuccess && chat?.messages?.length === 0) ? (
              <ConversationEmptyState />
            ) : (
              <ConversationContent>
                {chat?.messages?.map((msg) => (
                  <Message key={msg.id} from={msg.role}>
                    <MessageContent from={msg.role}>
                      {msg.content}
                    </MessageContent>
                    <MessageActions onCopy={() => {}} onRetry={() => {}} />
                  </Message>
                ))}
                {chat && chat.loading ? <ConversationLoader /> : <></>}
              </ConversationContent>
            )}
          </Conversation>
        </YStack>

        <PromptInput
          onSubmit={(text, files) => {
            const newMessage = {
              ...message,
              message: text,
              chatSessionId: chat.id,
              courseId: chat.courseId,
            };
            sendMessage(newMessage);
          }}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

export default function Chat() {
  const dispatch = useAppDispatch();
  const chat = useSelector((state: RootState) => state.chat);
  const user = useSelector((state: RootState) => state.user);
  const { courseId } = useLocalSearchParams();

  useEffect(() => {
    if (!chat.title) {
      dispatch(clearChat({ userId: user.id }));
      console.log(chat);
    }
  }, []);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        swipeEnabled: false,
        drawerType: "slide",
        drawerContentContainerStyle: {
          flex: 1,
          backgroundColor: "white",
          borderRadius: 0,
        },
      }}
      drawerContent={() => (
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <SideBarContents />
        </SafeAreaView>
      )}
    >
      <Drawer.Screen
        name="ChatScreen"
        children={() => <ChatScreen courseId={courseId as string} />}
      />
    </Drawer.Navigator>
  );
}
