import { Routes, Route } from "react-router";
import { AuthProvider } from "../contexts/adminAuthContext";
import AdminGuard from "../guards/AdminGuard";
import GuestGuard from "../guards/GuestGuard";
import AdminLayout from "../layouts/AdminLayout";
import AdminLogin from "../pages/AdminLogin";
import Contest from "../components/Admin/ContestLayout";
import RichTextEditor from "../components/Admin/RichTextEditor";
import AddProblem from "../components/Admin/AddProblem";

const AdminRoutes = () => {
	return (
		<AuthProvider>
			<Routes>
				<Route element={<GuestGuard />}>
					<Route path="login" element={<AdminLogin />} />
				</Route>

				<Route element={<AdminGuard />}>
					<Route path="" element={<AdminLayout />}>
						<Route index element={<Contest />} />
						<Route path="results" element={<div>Settings Page</div>} />
						<Route path="editor" element={<RichTextEditor />} />
						<Route path="edit/:id" element={<AddProblem />} />
					</Route>
				</Route>
			</Routes>
		</AuthProvider>
	);
};

export default AdminRoutes;
