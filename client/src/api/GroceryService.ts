import { environment } from "../environment/environment";
import { GroceryStore, GroceryCategory } from "../types/grocery/GroceryStore";
import { GroceryProduct } from "../types/grocery/GroceryProduct";
import { GroceryOrder } from "../types/grocery/GroceryOrder";
import axios from "axios";

const API_BASE_URL = environment.apiUrl + "/grocery";
const ORDER_API_URL = environment.apiUrl + "/grocery-order";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const orderApi = axios.create({
  baseURL: ORDER_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage instead of Zustand store for interceptor
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Grocery API Request:', config.method?.toUpperCase(), config.url, config.headers);
    return config;
  },
  (error) => {
    console.error('Grocery request interceptor error:', error);
    return Promise.reject(error);
  }
);

orderApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Grocery Order API Request:', config.method?.toUpperCase(), config.url, config.headers);
    return config;
  },
  (error) => {
    console.error('Grocery order request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('Grocery API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Grocery API Error:', error.response?.status, error.response?.data || error.message);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

orderApi.interceptors.response.use(
  (response) => {
    console.log('Grocery Order API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Grocery Order API Error:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const groceryService = {
  // Get all grocery stores
  getAllStores: async (category?: string): Promise<GroceryStore[]> => {
    try {
      const response = await api.get<{ stores: GroceryStore[] }>("/", {
        params: category && category !== 'All' ? { category } : {}
      });
      return response.data.stores;
    } catch (error) {
      console.error('Error fetching grocery stores:', error);
      throw error;
    }
  },

  // Get grocery store by ID with products
  getStoreWithProducts: async (id: number): Promise<GroceryStore> => {
    try {
      const response = await api.get<{ store: GroceryStore }>(`/${id}/products`);
      return response.data.store;
    } catch (error) {
      console.error('Error fetching grocery store with products:', error);
      throw error;
    }
  },
  
  // Admin functionality
  
  // Create a new grocery store
  createStore: async (store: Partial<GroceryStore>): Promise<GroceryStore> => {
    try {
      const response = await api.post<{ store: GroceryStore }>("/", store);
      return response.data.store;
    } catch (error) {
      console.error('Error creating grocery store:', error);
      throw error;
    }
  },
  
  // Update an existing grocery store
  updateStore: async (id: number, storeData: Partial<GroceryStore>): Promise<GroceryStore> => {
    try {
      const response = await api.put<{ store: GroceryStore }>(`/${id}`, storeData);
      return response.data.store;
    } catch (error) {
      console.error('Error updating grocery store:', error);
      throw error;
    }
  },
  
  // Delete a grocery store
  deleteStore: async (id: number): Promise<void> => {
    try {
      await api.delete(`/${id}`);
    } catch (error) {
      console.error('Error deleting grocery store:', error);
      throw error;
    }
  },
  
  // Create a product category for a store
  createCategory: async (storeId: number, category: Partial<GroceryCategory>): Promise<GroceryCategory> => {
    try {
      const response = await api.post<{ category: GroceryCategory }>(`/${storeId}/category`, category);
      return response.data.category;
    } catch (error) {
      console.error('Error creating grocery category:', error);
      throw error;
    }
  },
  
  // Update a product category
  updateCategory: async (storeId: number, categoryId: number, categoryData: Partial<GroceryCategory>): Promise<GroceryCategory> => {
    try {
      const response = await api.put<{ category: GroceryCategory }>(`/${storeId}/category/${categoryId}`, categoryData);
      return response.data.category;
    } catch (error) {
      console.error('Error updating grocery category:', error);
      throw error;
    }
  },
  
  // Delete a product category
  deleteCategory: async (storeId: number, categoryId: number): Promise<void> => {
    try {
      await api.delete(`/${storeId}/category/${categoryId}`);
    } catch (error) {
      console.error('Error deleting grocery category:', error);
      throw error;
    }
  },
  
  // Create a product for a category
  createProduct: async (storeId: number, categoryId: number, product: Partial<GroceryProduct>): Promise<GroceryProduct> => {
    try {
      const response = await api.post<{ product: GroceryProduct }>(`/${storeId}/category/${categoryId}/product`, product);
      return response.data.product;
    } catch (error) {
      console.error('Error creating grocery product:', error);
      throw error;
    }
  },
  
  // Update a product
  updateProduct: async (storeId: number, categoryId: number, productId: number, productData: Partial<GroceryProduct>): Promise<GroceryProduct> => {
    try {
      const response = await api.put<{ product: GroceryProduct }>(`/${storeId}/category/${categoryId}/product/${productId}`, productData);
      return response.data.product;
    } catch (error) {
      console.error('Error updating grocery product:', error);
      throw error;
    }
  },
  
  // Delete a product
  deleteProduct: async (storeId: number, categoryId: number, productId: number): Promise<void> => {
    try {
      await api.delete(`/${storeId}/category/${categoryId}/product/${productId}`);
    } catch (error) {
      console.error('Error deleting grocery product:', error);
      throw error;
    }
  },
  
  // Get available grocery store images
  getStoreImages: async (): Promise<string[]> => {
    try {
      const response = await api.get<{ images: string[] }>("/images/stores");
      return response.data.images;
    } catch (error) {
      console.error('Error fetching grocery store images:', error);
      throw error;
    }
  },
  
  // Get available product images
  getProductImages: async (): Promise<string[]> => {
    try {
      const response = await api.get<{ images: string[] }>("/images/products");
      return response.data.images;
    } catch (error) {
      console.error('Error fetching grocery product images:', error);
      throw error;
    }
  },
  
  // Order-related functions
  
  // Create a new grocery order
  createOrder: async (orderData: Partial<GroceryOrder>): Promise<GroceryOrder> => {
    try {
      const response = await orderApi.post<{ order: GroceryOrder }>("/", orderData);
      return response.data.order;
    } catch (error) {
      console.error('Error creating grocery order:', error);
      throw error;
    }
  },
  
  // Get user's order history
  getUserOrderHistory: async (): Promise<GroceryOrder[]> => {
    try {
      const response = await orderApi.get<{ orders: GroceryOrder[] }>("/history");
      return response.data.orders;
    } catch (error) {
      console.error('Error fetching grocery order history:', error);
      throw error;
    }
  }
};
