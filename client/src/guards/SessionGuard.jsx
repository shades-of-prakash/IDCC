import React from "react";
import { Navigate } from "react-router";
import { useSession } from "../contexts/SessionContext";
import Loader from "../components/Loader";

export const SessionGuard = ({ children }) => {
  const { session, loading } = useSession();

  if (loading) {
    return <Loader text="Checking session..." />;
  }

  if (!session) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};
