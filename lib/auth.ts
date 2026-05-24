"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ApiUser } from "./api";

interface AuthState {
  token: string | null;
  user: ApiUser | null;
  login: (token: string, user: ApiUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "intalim-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
