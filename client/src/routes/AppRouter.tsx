import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Loading from "../pages/Loading";
import { useSessionStore } from "../store/useSessionStore";
import useApi from "../hooks/useApi";
import Forbidden from "../pages/Forbidden";
import Navbar from "../components/Navbar";
import Users from "../pages/Users";
import EatPage from "../pages/EatPage";
import useSession from "../hooks/useSession";
import ProfileSettingsPage from "../pages/ProfileSettingsPage";

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
  const { accessToken } = useSessionStore();
  const { setSession } = useSession();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [activeLink, setActiveLink] = useState(0);

  useEffect(() => {
    const refresh = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        setIsRefreshing(false);
        return;
      }
      const response = await post("/auth/refresh", { refresh: refreshToken });
      setSession(response);
      setIsRefreshing(false);
    };
    refresh();
    const interval = setInterval(refresh, 3600000);
    return () => clearInterval(interval);
  }, [accessToken]);

  useEffect(() => {
    const pathToIndex: Record<string, number> = {
      "/": 0,
      "/rides": 1,
      "/eat": 2,
      "/groceries": 3,
      "/payment": 3,
    };

    setActiveLink(pathToIndex[location.pathname] ?? -1);
  }, [location.pathname]);

  if (isRefreshing) return <Loading />;

  return (
    <div
      className={`w-full flex flex-col items-center relative ${
        accessToken && "mt-20 "
      }`}
    >
      {accessToken && (
        <Navbar activeLink={activeLink} setActiveLink={setActiveLink} />
      )}
      <Routes>
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
          path="/eat"
          element={
            <ProtectedRoute>
              <EatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettingsPage />
            </ProtectedRoute>
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
        <Route path="*" element={<Forbidden />} />
      </Routes>
    </div>
  );
};

export default AppRouter;
