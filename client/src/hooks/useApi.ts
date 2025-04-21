import axios from "axios";
import { useState, useCallback } from "react";
import { environment } from "../environment/environment";
import { useSessionStore } from "../store/useSessionStore";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url =
    import.meta.env.VITE_PROD === "true"
      ? environment.prodUrl
      : environment.apiUrl;
  const api = axios.create({
    baseURL: url,
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use((config) => {
    const token = useSessionStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const request = useCallback(
    async (
      method: "GET" | "POST" | "PATCH" | "DELETE",
      url: string,
      data?: any,
      params?: any
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api({
          method,
          url,
          data,
          params,
        });
        return response.data;
      } catch (err: any) {
        setError(err.response?.data.error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const get = useCallback(
    (url: string, params?: any) => request("GET", url, null, params),
    [request]
  );
  const post = useCallback(
    (url: string, data?: any) => request("POST", url, data),
    [request]
  );
  const patch = useCallback(
    (url: string, data?: any, params?: any) =>
      request("PATCH", url, data, params),
    [request]
  );
  const del = useCallback(
    (url: string, params?: any) => request("DELETE", url, null, params),
    [request]
  );

  return { get, post, patch, del, loading, setLoading, error, setError };
};

export default useApi;
