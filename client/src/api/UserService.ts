import { environment } from "../environment/environment";
import axios from "axios";
import { User } from "../types/User";
import { useSessionStore } from "../store/useSessionStore";

const API_BASE_URL = environment.apiUrl + "/user";

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userService = {
  // Get user profile by ID
  getUserProfile: async (id: number): Promise<User> => {
    const response = await api.get(`/${id}`);
    return response.data.user;
  },

  // Update user profile (name, address)
  updateProfile: async (
    id: number,
    fullName: string,
    address: string,
    avatar?: string
  ): Promise<User> => {
    const role = useSessionStore.getState().role;
    const response = await api.patch(`/${id}`, {
      fullname: fullName,
      role: role,
      address,
      avatar,
    });

    return response.data.user;
  },

  // Update just the avatar
  updateAvatar: async (id: number, avatar: string): Promise<User> => {
    const response = await api.patch(`/${id}/avatar`, { avatar });
    return response.data.user;
  },

  // Update password
  updatePassword: async (
    id: number,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(`/${id}/password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Delete user account
  deleteAccount: async (
    id: number
  ): Promise<{ deleted: boolean; message: string }> => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error deleting account");
      throw error;
    }
  },
};
