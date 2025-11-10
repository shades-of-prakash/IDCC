import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { useSession } from "../contexts/SessionContext";
import Loader from "../components/Loader";

export const UserGuard = ({ children }) => {
  const { user, isLoading: userLoading } = useUser();
  const { session, loading: sessionLoading } = useSession();
  const navigate = useNavigate();

  const loading = userLoading || sessionLoading;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/user/login", { replace: true });
      return;
    }

    if (session) {
      navigate(`/user/playground`, {
        replace: true,
      });
    }
  }, [loading, user, session, navigate]);

  if (loading) return <Loader />;

  if (user && !session) return <>{children}</>;

  return null;
};
