import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../contexts/adminAuthContext";
import Loader  from "../components/Loader"
const AdminGuard = () => {
	const { admin, isLoading } = useContext(AuthContext);

	if (isLoading) {
		return <Loader  text="Navigating"  />
	}

	if (!admin) {
		return <Navigate to="/admin/login" replace />;
	}

	return <Outlet />;
};

export default AdminGuard;
