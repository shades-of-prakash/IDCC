import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../contexts/adminAuthContext";
import Loader from "../components/Loader";

const AdminRouteGuard = ({ children }) => {
    const { admin, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <Loader className="Role Checking..." />;
    }

    if (!admin) {
        return (
            <Navigate to="/admin/login" replace state={{ from: location }} />
        );
    }

    if (!["admin"].includes(admin.role)) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default AdminRouteGuard;
