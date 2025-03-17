import { environment } from "../environment/environment";
import { LoginResponse } from "../types/response/LoginResponse";
import axios from "axios";

const API_BASE_URL = environment.apiUrl + "/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/login", {
      email,
      password,
    });
    return response.data;
  },

  register: async (
    fullname: string,
    email: string,
    password: string,
    address?: string
  ): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/register", {
      fullname,
      email,
      password,
      address,
    });
    return response.data;
  },
};
