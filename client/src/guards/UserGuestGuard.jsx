import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { useSession } from "../contexts/SessionContext";
import Loader from "../components/Loader";

export const GuestGuard = ({ children }) => {
    const { user, isLoading: userLoading } = useUser();
    const { session, loading: sessionLoading } = useSession();
    const navigate = useNavigate();

    const loading = userLoading || sessionLoading;

    useEffect(() => {
        if (loading) return;

        if (user) {
            const target = session ? `/user/playground` : `/user/instructions`;

            if (window.location.pathname !== target) {
                navigate(target, { replace: true });
            }
        }
    }, [loading, user, session, navigate]);

    if (loading) return <Loader />;
    if (user) return null;

    return <>{children}</>;
};
