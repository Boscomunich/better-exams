// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthState {
  name: string;
  email: string;
  subscriptionStarts: Date | null;
  subscriptionEnds: Date | null;
  token: string;
}

export type PartialAuthState = Partial<AuthState>;

const initialState: AuthState = {
  name: "",
  email: "",
  subscriptionStarts: null,
  subscriptionEnds: null,
  token: "",
};

const persistAuth = async (auth: AuthState) => {
  await AsyncStorage.setItem("@auth", JSON.stringify(auth));
};

const clearAuth = async () => {
  await AsyncStorage.removeItem("@auth");
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signin: (state, action: PayloadAction<PartialAuthState>) => {
      Object.assign(state, action.payload);
      persistAuth(state);
    },
    signOut: () => {
      clearAuth();
      return initialState;
    },
    setAuthState: (state, action: PayloadAction<AuthState>) => {
      return action.payload;
    },
  },
});

export const { signin, signOut, setAuthState } = userSlice.actions;

export default userSlice.reducer;
