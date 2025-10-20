import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../contexts/adminAuthContext";
import Loader from "../components/Loader"
const GuestGuard = () => {
	const { admin, isLoading } = useContext(AuthContext);

	if (isLoading) {
		return <Loader />
	}


	if (admin) {
		return <Navigate to="/admin" replace />;
	}

	return <Outlet />;
};

export default GuestGuard;
