import { create } from "zustand";
import { Message } from "../types/Message";
import { ChatUser } from "../types/ChatUser";

interface ChatState {
  messages: Message[];
  page: number;
  openUser: ChatUser | null;
  typing: number[];
  currentTyping: boolean;
  newMessages: number;
  setMessages: (messages: Message[]) => void;
  setPage: (page: number) => void;
  resetMessages: () => void;
  addMessage: (message: Message) => void;
  reactMessage: (id: number, reaction?: string) => void;
  setMessagesSeen: (user: number) => void;
  deleteMessage: (id: number) => void;
  setOpenUser: (user: ChatUser | null) => void;
  setCurrentTyping: (typing: boolean) => void;
  addTyping: (user: number) => void;
  removeTyping: (user: number) => void;
  setNewMessages: (newMessages: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  page: 1,
  openUser: null,
  typing: [],
  currentTyping: false,
  newMessages: 0,

  setMessages: (messages) => set({ messages }),

  setPage: (page) => set({ page }),

  resetMessages: () => set({ messages: [] }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, created: true }],
    })),

  reactMessage: (id, reaction) =>
    set((state) => ({
      messages: [...state.messages].map((msg) => {
        if (id === msg.id) return { ...msg, reaction: reaction };
        return msg;
      }),
    })),

  setMessagesSeen: (user) =>
    set((state) => ({
      messages: [
        ...state.messages.map((msg) => {
          if (msg.sender === user && new Date(msg.seen).getFullYear() <= 2000)
            return { ...msg, seen: new Date() };
          return msg;
        }),
      ],
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

  setOpenUser: (user) => set({ openUser: user }),

  addTyping: (user) => set((state) => ({ typing: [...state.typing, user] })),

  removeTyping: (user) =>
    set((state) => ({ typing: [...state.typing].filter((u) => u !== user) })),

  setCurrentTyping: (typing) => set({ currentTyping: typing }),

  setNewMessages: (newMessages) => set({ newMessages }),
}));
