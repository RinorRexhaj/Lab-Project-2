import { environment } from "../environment/environment";
import { GroceryStore } from "../types/grocery/GroceryStore";
import axios from "axios";
import { useSessionStore } from "../store/useSessionStore";

const API_BASE_URL = environment.apiUrl + "/grocery";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const groceryService = {
  // Get all grocery stores
  getAllGroceryStores: async (category?: string): Promise<GroceryStore[]> => {
    const response = await api.get<{ stores: GroceryStore[] }>("/", {
      params: category && category !== 'All' ? { category } : {}
    });
    return response.data.stores;
  },

  // Get grocery store by ID with products
  getGroceryStoreWithProducts: async (id: number): Promise<GroceryStore> => {
    const response = await api.get<{ store: GroceryStore }>(`/${id}/products`);
    return response.data.store;
  },
};
