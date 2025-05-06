import { create } from "zustand";
import { Item } from "../types/Item";

interface PaymentState {
  items: Item[];
  deliveryFee: number;
  setItems: (items: Item[]) => void;
  setDeliveryFee: (fee: number) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  items: [],
  deliveryFee: 0,
  setItems: (items) => set({ items }),
  setDeliveryFee: (fee) => set({ deliveryFee: fee }),
}));
