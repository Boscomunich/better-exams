import { Document } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Document[] = [];

export const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    populateDocuments: (state, action: PayloadAction<Document[]>) => {
      return action.payload;
    },

    addDocuments: (state, action: PayloadAction<Document[]>) => {
      state.push(...action.payload);
    },

    removeDocument: (state, action: PayloadAction<string>) => {
      return state.filter((doc) => doc.id !== action.payload);
    },

    clearDocuments: () => {
      return initialState;
    },
  },
});

export const {
  populateDocuments,
  addDocuments,
  removeDocument,
  clearDocuments,
} = documentSlice.actions;

export default documentSlice.reducer;
