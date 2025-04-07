import { create } from "zustand";
import { ChatUser } from "../types/ChatUser";

interface ChatUsersState {
  users: ChatUser[];
  openUserActive: boolean;
  query: string;
  filteredUsers: ChatUser[];
  setUsers: (users: ChatUser[]) => void;
  setOpenUserActive: (active: boolean) => void;
  setQuery: (query: string) => void;
  setFilteredUsers: (users: ChatUser[]) => void;
}

export const useChatUsersStore = create<ChatUsersState>((set) => ({
  users: [],
  openUserActive: false,
  query: "",
  filteredUsers: [],
  setQuery: (query) => set({ query }),

  setUsers: (users) => set({ users }),

  setOpenUserActive: (active) => set({ openUserActive: active }),

  setFilteredUsers: (users) => set({ filteredUsers: users }),
}));
