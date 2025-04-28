import { environment } from "../environment/environment";
import { GroceryOrder } from "../types/grocery/GroceryOrder";
import axios from "axios";
import { useSessionStore } from "../store/useSessionStore";

const API_BASE_URL = environment.apiUrl + "/grocery-order";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Auth token -> requests
api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const groceryOrderService = {
  // Create a new order
  createOrder: async (order: GroceryOrder): Promise<GroceryOrder> => {
    const response = await api.post<{ order: GroceryOrder }>("/", order);
    return response.data.order;
  },

  // Get order history for user
  getUserOrders: async (): Promise<GroceryOrder[]> => {
    const response = await api.get<{ orders: GroceryOrder[] }>("/history");
    return response.data.orders;
  },
};
