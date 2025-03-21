import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Loading from "../pages/Loading";
import { useSessionStore } from "../store/useSessionStore";
import { useUserStore } from "../store/useUserStore";
import useApi from "../hooks/useApi";
import Forbidden from "../pages/Forbidden";
import Navbar from "../components/Navbar";
import Users from "../pages/Users";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { accessToken } = useSessionStore();
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, accessToken } = useSessionStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  return role === "Admin" ? <>{children}</> : <Forbidden />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken } = useSessionStore();
  return accessToken ? <Navigate to="/" replace /> : <>{children}</>;
};

const AppRouter: React.FC = () => {
  const { post } = useApi();
  const { setUser } = useUserStore();
  const { accessToken, setAccessToken, setRole } = useSessionStore();
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    const refresh = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        setIsRefreshing(false);
        return;
      }
      const response = await post("/auth/refresh", { refresh: refreshToken });
      if (response) {
        const { user, token, refreshToken: newRefreshToken } = response;
        setUser(user);
        setAccessToken(token);
        setRole(user.role);
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      setIsRefreshing(false);
    };
    refresh();
    const interval = setInterval(refresh, 3600000);
    return () => clearInterval(interval);
  }, [post, setUser, setAccessToken]);

  if (isRefreshing) return <Loading />;

  return (
    <div
      className={`w-full flex flex-col items-center relative ${
        accessToken && "mt-20 "
      }`}
    >
      {accessToken && <Navbar />}
      <Routes>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default AppRouter;
