import React from "react";
import { Navigate } from "react-router";
import { useUser } from "../contexts/UserContext";

export const GuestGuard = ({ children, redirectTo = "/user/code" }) => {
  const { session, remainingTime } = useUser();

  if (session && remainingTime > 0) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
