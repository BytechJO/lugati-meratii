import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";

type UserType = "teacher" | "student";

// interface AuthUser {
//   id: string;
//   name?: string; // ⬅️ optional
//   username: string;
//   email: string;
//   roleId: number; // ⬅️ رقم الدور (2 / 3)
//   type: UserType; // ⬅️ للاستخدام بالـ UI
// }

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
}
export type AuthUser = User;

const initialState: AuthState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null,
  token: localStorage.getItem("token"),
  isLoggedIn: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        token: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;

      // ⬅️ التخزين
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
