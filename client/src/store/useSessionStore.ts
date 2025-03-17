import { create } from "zustand";

interface SessionState {
  accessToken: string;
  role: string;
  setAccessToken: (token: string) => void;
  setRole: (role: string) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: "",
  role: "User",
  setAccessToken: (token) => set({ accessToken: token }),
  setRole: (role) => set({ role: role }),
}));
