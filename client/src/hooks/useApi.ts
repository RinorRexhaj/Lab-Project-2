import axios from "axios";
import { useState, useCallback } from "react";
import { environment } from "../environment/environment";
import { useSessionStore } from "../store/useSessionStore";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useSessionStore();
  const api = axios.create({
    baseURL: environment.apiUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const request = useCallback(
    async (
      method: "GET" | "POST" | "PUT" | "DELETE",
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
        setError(err.response.data.error);
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
  const put = useCallback(
    (url: string, data?: any, params?: any) =>
      request("PUT", url, data, params),
    [request]
  );
  const del = useCallback(
    (url: string, params?: any) => request("DELETE", url, null, params),
    [request]
  );

  return { get, post, put, del, loading, setLoading, error, setError };
};

export default useApi;
