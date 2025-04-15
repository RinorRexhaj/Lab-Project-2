import { environment } from "../environment/environment";
import { Restaurant } from "../types/restaurant/Restaurant";
import axios from "axios";
import { useSessionStore } from "../store/useSessionStore";

const API_BASE_URL = environment.apiUrl + "/restaurant";

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

export const restaurantService = {
  // Get all restaurants
  getAllRestaurants: async (category?: string): Promise<Restaurant[]> => {
    const response = await api.get<{ restaurants: Restaurant[] }>("/", {
      params: category && category !== 'All' ? { category } : {}
    });
    return response.data.restaurants;
  },

  // Get restaurant by ID with menu
  getRestaurantWithMenu: async (id: number): Promise<Restaurant> => {
    const response = await api.get<{ restaurant: Restaurant }>(`/${id}/menu`);
    return response.data.restaurant;
  },
};
