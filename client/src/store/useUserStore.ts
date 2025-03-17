import { create } from "zustand";

interface UserState {
  id: number;
  fullname: string;
  email: string;
  role: string;
  address?: string;
  setFullname: (fullname: string) => void;
  setAddress: (address: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: 0,
  fullname: "",
  email: "",
  role: "User",
  address: "",
  setFullname: (fullname) => set({ fullname: fullname }),
  setAddress: (address) => set({ address: address }),
}));
