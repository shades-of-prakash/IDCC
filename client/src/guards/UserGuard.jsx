import React from "react";
import { Navigate } from "react-router";
import { useUser } from "../contexts/UserContext";

export const AuthGuard = ({ children }) => {
  const { session, remainingTime } = useUser();

  if (!session || remainingTime <= 0) {
    return <Navigate to="/user/login" replace />;
  }

  return <>{children}</>;
};
