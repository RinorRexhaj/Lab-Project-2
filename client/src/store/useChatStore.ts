import { create } from "zustand";
import { Message } from "../types/Message";
import { ChatUser } from "../types/ChatUser";

interface ChatState {
  messages: Message[];
  users: ChatUser[];
  currentUser: ChatUser | null;
  typing: number[];
  currentTyping: boolean;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  deleteMessage: (id: number) => void;
  setUsers: (users: ChatUser[]) => void;
  setCurrentUser: (user: ChatUser | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  users: [],
  currentUser: null,
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

  setUsers: (users) => set({ users }),

  setCurrentUser: (user) => set({ currentUser: user }),
}));
