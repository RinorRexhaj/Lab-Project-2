import axios from "axios";
import { AxiosRequestConfig, AxiosError } from "axios";
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
      method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
      url: string,
      data?: unknown,
      params?: unknown
    ) => {
      setLoading(true);
      setError(null);
      try {
        const config: AxiosRequestConfig = {
          method,
          url,
          params,
        };

        if (data !== undefined) {
          config.data = data;
        }

        if (data instanceof FormData) {
          delete api.defaults.headers["Content-Type"];
          config.headers = { "Content-Type": undefined };
        }

        const response = await api(config);
        return response.data;
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          console.error(`API Error: ${method} ${url}`, err);
          console.error("Error details:", err.response?.data || err.message);

          // Set error for all cases, including suspension
          setError(err.response?.data?.error || err.message);
        } else if (err instanceof Error) {
          // For non-Axios errors
          console.error(`General error: ${err.message}`);
          setError(err.message);
        } else {
          // Handle unexpected unknown types
          console.error("Unexpected error:", err);
          setError("An unexpected error occurred.");
        }

        // Re-throw the error with the response data
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const download = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = useSessionStore.getState().accessToken;

      const response = await api.get(url, {
        responseType: "blob",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const contentDisposition = response.headers["content-disposition"];
      const filenameStart = contentDisposition.indexOf('filename="') + 10;
      const filenameEnd = contentDisposition.indexOf('"', filenameStart);
      const filename = contentDisposition.slice(filenameStart, filenameEnd);

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // Create an object URL for the file
      const fileUrl = URL.createObjectURL(blob);

      // Open file in a new tab
      const newTab = window.open(fileUrl, "_blank");

      // If the file is downloadable, trigger the download as well
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Cleanup after opening in the new tab
      URL.revokeObjectURL(fileUrl);
      newTab?.focus(); // Optionally focus the new tab
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        // Handle Axios-specific error
        setError(err.response?.data?.error || "Download failed");
        console.error("Axios error:", err);
      } else if (err instanceof Error) {
        // Handle other errors (non-Axios)
        setError(err.message || "Download failed");
        console.error("General error:", err);
      } else {
        // Handle unexpected types of errors
        setError("An unexpected error occurred.");
        console.error("Unexpected error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(
    (url: string, params?: unknown) => request("GET", url, null, params),
    [request]
  );
  const post = useCallback(
    (url: string, data?: unknown) => request("POST", url, data),
    [request]
  );
  const patch = useCallback(
    (url: string, data?: unknown, params?: unknown) =>
      request("PATCH", url, data, params),
    [request]
  );
  const put = useCallback(
    (url: string, data?: unknown, params?: unknown) =>
      request("PUT", url, data, params),
    [request]
  );
  const del = useCallback(
    (url: string, params?: unknown) =>
      request("DELETE", url, undefined, params),
    [request]
  );

  return {
    get,
    post,
    patch,
    put,
    del,
    download,
    loading,
    setLoading,
    error,
    setError,
  };
};

export default useApi;
