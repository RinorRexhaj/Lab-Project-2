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
        const config: any = {
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
      } catch (err: any) {
        setError(err.response?.data.error);
        return null;
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
    } catch (err: any) {
      setError(err.response?.data?.error || "Download failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

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
    (url: string, params?: any) => request("DELETE", url, undefined, params),
    [request]
  );

  return {
    get,
    post,
    patch,
    del,
    download,
    loading,
    setLoading,
    error,
    setError,
  };
};

export default useApi;
