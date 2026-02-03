import { ChatSession, ChatSessionDocument, Message } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  title: "",
  userId: "",
  courseId: null,
  createdAt: "",
  updatedAt: "",
  documents: [],
  messages: [],
  loading: false,
} as ChatSession;

export const chatSessionSlice = createSlice({
  name: "ChatSession",
  initialState,
  reducers: {
    createNewChat: (state, action: PayloadAction<ChatSession>) => {
      state.id = action.payload.id;
      state.title = action.payload.title;
    },

    addNewDocuments: (state, action: PayloadAction<ChatSessionDocument[]>) => {
      action.payload.forEach((newDoc) => {
        if (
          !state.documents.some(
            (existingDoc) => existingDoc.documentId === newDoc.documentId
          )
        ) {
          state.documents.push(newDoc);
        }
      });
    },

    updateCourse: (state, action: PayloadAction<{ courseId: string }>) => {
      if (!state.courseId) {
        state.courseId = action.payload.courseId;
      }
    },

    clearChat: (state, action: PayloadAction<{ userId: string }>) => {
      return {
        id: "",
        title: "New chat",
        userId: action.payload.userId,
        courseId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: [],
        messages: [],
        loading: false,
      };
    },

    addChatMessage: (state, action: PayloadAction<Message[]>) => {
      if (!state.messages) {
        state.messages = [];
      }

      action.payload.forEach((newMsg) => {
        if (
          !state.messages?.some((existingMsg) => existingMsg.id === newMsg.id)
        ) {
          state.messages?.push(newMsg);
        }
      });
    },

    clearChatMessage: (state) => {
      state.messages = [];
    },

    toggleLoading: (state, action: PayloadAction<{ loading: boolean }>) => {
      state.loading = action.payload.loading;
    },

    popLastMessage: (state) => {
      if (state.messages && state.messages.length > 0) {
        state.messages.pop();
      }
    },

    removeMessageById: (state, action: PayloadAction<string>) => {
      if (state.messages && state.messages.length > 0) {
        state.messages = state.messages.filter(
          (msg) => msg.id !== action.payload
        );
      }
    },
  },
});

export const {
  createNewChat,
  addNewDocuments,
  updateCourse,
  clearChat,
  addChatMessage,
  popLastMessage,
  clearChatMessage,
  toggleLoading,
} = chatSessionSlice.actions;

export default chatSessionSlice.reducer;
