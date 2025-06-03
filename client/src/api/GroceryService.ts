import { environment } from "../environment/environment";
import { GroceryStore, GroceryCategory } from "../types/grocery/GroceryStore";
import { GroceryProduct } from "../types/grocery/GroceryProduct";
import { GroceryOrder } from "../types/grocery/GroceryOrder";
import axios from "axios";
import { useSessionStore } from "../store/useSessionStore";

const API_BASE_URL = environment.apiUrl + "/grocery";
const ORDER_API_URL = environment.apiUrl + "/grocery-order";

const api = axios.create({
  baseURL: API_BASE_URL,
});

const orderApi = axios.create({
  baseURL: ORDER_API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

orderApi.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const groceryService = {
  // Get all grocery stores
  getAllStores: async (category?: string): Promise<GroceryStore[]> => {
    const response = await api.get<{ stores: GroceryStore[] }>("/", {
      params: category && category !== 'All' ? { category } : {}
    });
    return response.data.stores;
  },

  // Get grocery store by ID with products
  getStoreWithProducts: async (id: number): Promise<GroceryStore> => {
    const response = await api.get<{ store: GroceryStore }>(`/${id}/products`);
    return response.data.store;
  },
  
  // Admin functionality
  
  // Create a new grocery store
  createStore: async (store: Partial<GroceryStore>): Promise<GroceryStore> => {
    const response = await api.post<{ store: GroceryStore }>("/", store);
    return response.data.store;
  },
  
  // Update an existing grocery store
  updateStore: async (id: number, storeData: Partial<GroceryStore>): Promise<GroceryStore> => {
    const response = await api.put<{ store: GroceryStore }>(`/${id}`, storeData);
    return response.data.store;
  },
  
  // Delete a grocery store
  deleteStore: async (id: number): Promise<void> => {
    await api.delete(`/${id}`);
  },
  
  // Create a product category for a store
  createCategory: async (storeId: number, category: Partial<GroceryCategory>): Promise<GroceryCategory> => {
    const response = await api.post<{ category: GroceryCategory }>(`/${storeId}/categories`, category);
    return response.data.category;
  },
  
  // Update a product category
  updateCategory: async (storeId: number, categoryId: number, categoryData: Partial<GroceryCategory>): Promise<GroceryCategory> => {
    const response = await api.put<{ category: GroceryCategory }>(`/${storeId}/categories/${categoryId}`, categoryData);
    return response.data.category;
  },
  
  // Delete a product category
  deleteCategory: async (storeId: number, categoryId: number): Promise<void> => {
    await api.delete(`/${storeId}/categories/${categoryId}`);
  },
  
  // Create a product for a category
  createProduct: async (categoryId: number, product: Partial<GroceryProduct>): Promise<GroceryProduct> => {
    const response = await api.post<{ product: GroceryProduct }>(`/categories/${categoryId}/products`, product);
    return response.data.product;
  },
  
  // Update a product
  updateProduct: async (categoryId: number, productId: number, productData: Partial<GroceryProduct>): Promise<GroceryProduct> => {
    const response = await api.put<{ product: GroceryProduct }>(`/categories/${categoryId}/products/${productId}`, productData);
    return response.data.product;
  },
  
  // Delete a product
  deleteProduct: async (categoryId: number, productId: number): Promise<void> => {
    await api.delete(`/categories/${categoryId}/products/${productId}`);
  },
  
  // Get available grocery store images
  getStoreImages: async (): Promise<string[]> => {
    const response = await api.get<{ images: string[] }>("/images/stores");
    return response.data.images;
  },
  
  // Get available product images
  getProductImages: async (): Promise<string[]> => {
    const response = await api.get<{ images: string[] }>("/images/products");
    return response.data.images;
  },
  
  // Order-related functions
  
  // Create a new grocery order
  createOrder: async (orderData: Partial<GroceryOrder>): Promise<GroceryOrder> => {
    const response = await orderApi.post<{ order: GroceryOrder }>("/", orderData);
    return response.data.order;
  },
  
  // Get user's order history
  getUserOrderHistory: async (): Promise<GroceryOrder[]> => {
    const response = await orderApi.get<{ orders: GroceryOrder[] }>("/history");
    return response.data.orders;
  }
};