import { environment } from "../environment/environment";
import { Restaurant } from "../types/restaurant/Restaurant";
import { FoodCategory } from "../types/restaurant/Restaurant";
import { FoodItem } from "../types/restaurant/FoodItem";
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
  
  // Admin functionality
  
  // Create a new restaurant
  createRestaurant: async (restaurant: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.post<{ restaurant: Restaurant }>("/", restaurant);
    return response.data.restaurant;
  },
  
  // Update an existing restaurant
  updateRestaurant: async (id: number, restaurantData: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.put<{ restaurant: Restaurant }>(`/${id}`, restaurantData);
    return response.data.restaurant;
  },
  
  // Delete a restaurant
  deleteRestaurant: async (id: number): Promise<void> => {
    await api.delete(`/${id}`);
  },
  
  // Add a food category to a restaurant
  addFoodCategory: async (restaurantId: number, category: Partial<FoodCategory>): Promise<FoodCategory> => {
    const response = await api.post<{ category: FoodCategory }>(`/${restaurantId}/category`, category);
    return response.data.category;
  },
  
  // Update a food category
  updateFoodCategory: async (restaurantId: number, categoryId: number, categoryData: Partial<FoodCategory>): Promise<FoodCategory> => {
    const response = await api.put<{ category: FoodCategory }>(`/${restaurantId}/category/${categoryId}`, categoryData);
    return response.data.category;
  },
  
  // Delete a food category
  deleteFoodCategory: async (restaurantId: number, categoryId: number): Promise<void> => {
    await api.delete(`/${restaurantId}/category/${categoryId}`);
  },
  
  // Add a food item to a category
  addFoodItem: async (restaurantId: number, categoryId: number, foodItem: Partial<FoodItem>): Promise<FoodItem> => {
    const response = await api.post<{ foodItem: FoodItem }>(`/${restaurantId}/category/${categoryId}/item`, foodItem);
    return response.data.foodItem;
  },
  
  // Update a food item
  updateFoodItem: async (restaurantId: number, categoryId: number, itemId: number, itemData: Partial<FoodItem>): Promise<FoodItem> => {
    const response = await api.put<{ foodItem: FoodItem }>(`/${restaurantId}/category/${categoryId}/item/${itemId}`, itemData);
    return response.data.foodItem;
  },
  
  // Delete a food item
  deleteFoodItem: async (restaurantId: number, categoryId: number, itemId: number): Promise<void> => {
    await api.delete(`/${restaurantId}/category/${categoryId}/item/${itemId}`);
  },
  
  // Get available restaurant images
  getRestaurantImages: async (): Promise<string[]> => {
    const response = await api.get<{ images: string[] }>("/images/restaurants");
    return response.data.images;
  },
  
  // Get available food item images
  getFoodItemImages: async (): Promise<string[]> => {
    const response = await api.get<{ images: string[] }>("/images/food-items");
    return response.data.images;
  }
};
