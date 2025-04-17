import { environment } from "../environment/environment";
import { Order } from "../types/restaurant/Order";
import axios from "axios";
import { useSessionStore } from "../store/useSessionStore";

const API_BASE_URL = environment.apiUrl + "/order";

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

export const orderService = {
  // Create a new order
  createOrder: async (order: Order): Promise<Order> => {
    const response = await api.post<{ order: Order }>("/", order);
    return response.data.order;
  },

  // Get order history for user
  getUserOrders: async (): Promise<Order[]> => {
    const response = await api.get<{ orders: Order[] }>("/history");
    return response.data.orders;
  },
};
