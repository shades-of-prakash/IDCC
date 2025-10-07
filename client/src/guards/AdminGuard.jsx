import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../contexts/adminAuthContext";

const AdminGuard = () => {
	const { admin, isLoading } = useContext(AuthContext);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
			</div>
		);
	}

	if (!admin) {
		return <Navigate to="/admin-login" replace />;
	}

	return <Outlet />;
};

export default AdminGuard;
