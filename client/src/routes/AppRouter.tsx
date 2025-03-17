import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import { useSessionStore } from "../store/useSessionStore";

const AppRouter: React.FC = () => {
  const { accessToken } = useSessionStore();
  return (
    <>
      {!accessToken && <Navigate to={"/login"} />}
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

export default AppRouter;
