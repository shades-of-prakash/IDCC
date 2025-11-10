import React from "react";
import { Navigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import Loader from "../components/Loader";

export const AuthGuard = ({ children }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Loader text="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};
