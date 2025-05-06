import { create } from "zustand";
import { User } from "../types/User";

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  updateAvatar: (avatar: string) => void;
  resetUser: () => void;
}

// Helper to get user data from localStorage
const getUserFromStorage = () => {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem("userData");
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error("Failed to parse user data from localStorage", e);
      return null;
    }
  }
  return null;
};

export const useUserStore = create<UserState>((set) => ({
  user: getUserFromStorage(),
  setUser: (user) => {
    return set({ user: user });
  },
  updateUser: (userData) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...userData } : null;
      return { user: updatedUser };
    }),
  updateAvatar: (avatar) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, avatar } : null;
      return { user: updatedUser };
    }),
  resetUser: () => {
    return set({ user: null });
  },
}));
