import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/features/user-slice";
import { betterExamsApi } from "@/services/api";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    user: userReducer,
    [betterExamsApi.reducerPath]: betterExamsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(betterExamsApi.middleware),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
