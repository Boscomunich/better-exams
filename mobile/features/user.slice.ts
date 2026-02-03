import { SerializableUser } from "@/types/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {} as SerializableUser;

export const userSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    updateUserData: (state, action: PayloadAction<SerializableUser>) => {
      return action.payload;
    },

    clearUserData: () => {
      return {} as SerializableUser;
    },
  },
});

export const { updateUserData, clearUserData } = userSlice.actions;
export default userSlice.reducer;
