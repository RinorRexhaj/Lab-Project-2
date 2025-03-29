import { create } from "zustand";
import { Message } from "../types/Message";
import { ChatUser } from "../types/ChatUser";

interface ChatState {
  messages: Message[];
  users: ChatUser[];
  query: string;
  filteredUsers: ChatUser[];
  openUser: ChatUser | null;
  typing: number[];
  currentTyping: boolean;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  deleteMessage: (id: number) => void;
  setUsers: (users: ChatUser[]) => void;
  setQuery: (query: string) => void;
  setFilteredUsers: (users: ChatUser[]) => void;
  setOpenUser: (user: ChatUser | null) => void;
  setCurrentTyping: (typing: boolean) => void;
  addTyping: (user: number) => void;
  removeTyping: (user: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  users: [],
  query: "",
  filteredUsers: [],
  openUser: null,
  typing: [],
  currentTyping: false,

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, created: true }],
    })),

  deleteMessage: (id) => {
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id === id) msg.deleted = true;
        return msg;
      }),
    }));
    setTimeout(() => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== id),
      }));
    }, 300);
  },

  setQuery: (query) => set({ query }),

  setUsers: (users) => set({ users }),

  setFilteredUsers: (users) => set({ filteredUsers: users }),

  setOpenUser: (user) => set({ openUser: user }),

  addTyping: (user) => set((state) => ({ typing: [...state.typing, user] })),

  removeTyping: (user) =>
    set((state) => ({ typing: [...state.typing].filter((u) => u !== user) })),

  setCurrentTyping: (typing) => set({ currentTyping: typing }),
}));
