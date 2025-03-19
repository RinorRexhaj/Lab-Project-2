import { create } from "zustand";
import { User } from "../types/User";

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user: user }),
  resetUser: () => set({ user: null }),
}));
