import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return null; // یا یک اسپینر
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};