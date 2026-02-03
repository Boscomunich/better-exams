// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { store } from "./store";
// import { AuthState, setAuthState } from "@/features/user-slice";

// export const loadAuth = async () => {
//   try {
//     const stored = await AsyncStorage.getItem("@auth");
//     if (stored) {
//       const auth: AuthState = JSON.parse(stored);
//       store.dispatch(setAuthState(auth));
//     }
//   } catch (e) {
//     console.error("Failed to load auth", e);
//   }
// };
