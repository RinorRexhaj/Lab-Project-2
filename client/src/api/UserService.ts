import { environment } from "../environment/environment";
import axios from "axios";
import { User } from "../types/User";

const API_BASE_URL = environment.apiUrl + "/user";

// Create a function to get the token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
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
    const response = await api.patch(`/${id}`, {
      fullname: fullName,
      role: "User", // fixed role for all normal users
      address,
      avatar
    });
    
    // Update userData in localStorage to ensure persistence
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        user.fullName = fullName;
        user.address = address;
        if (avatar) user.avatar = avatar;
        localStorage.setItem('userData', JSON.stringify(user));
      } catch (e) {
        console.error('Failed to update userData in localStorage', e);
      }
    }
    return response.data.user;
  },

  // Update just the avatar
  updateAvatar: async (id: number, avatar: string): Promise<User> => {
    const response = await api.patch(`/${id}/avatar`, { avatar });
    
    // Update avatar in localStorage to ensure persistence
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        user.avatar = avatar;
        localStorage.setItem('userData', JSON.stringify(user));
      } catch (e) {
        console.error('Failed to update avatar in localStorage', e);
      }
    }
    
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
  deleteAccount: async (id: number): Promise<{ deleted: boolean; message: string }> => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting account:', error.response?.data || error);
      throw error; 
    }
  },
};
