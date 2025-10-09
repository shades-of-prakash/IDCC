import { BrowserRouter, Routes, Route } from "react-router";
import UserLogin from "./pages/UserLogin";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import { AuthProvider } from "./contexts/adminAuthContext";
import AdminGuard from "./guards/AdminGuard";
import GuestGuard from "./guards/GuestGuard";
import AdminLayout from "./layouts/AdminLayout";
import Contest from "./components/Admin/ContestLayout";
import RichTextEditor from "./components/Admin/RichTextEditor";
import AddProblem from "./components/Admin/AddProblem";
import BasicSlider from "./components/Test";
import { Toaster } from "sonner";
import Playground from "./components/user/Playground";

function App() {
	return (
		<BrowserRouter>
			<Toaster richColors position="top-center" />
			<Routes>
				{/* Public routes */}
				<Route path="/" element={<Home />} />
				<Route element={<GuestGuard />}>
					<Route path="/admin-login" element={<AdminLogin />} />
				</Route>
				<Route path="/user-login" element={<UserLogin />} />
				<Route path="/code" element={<BasicSlider />} />

				{/* ✅ Wrap only admin routes with AuthProvider */}
				<Route
					element={
						<AuthProvider>
							<AdminGuard />
						</AuthProvider>
					}
				>
					<Route path="/admin" element={<AdminLayout />}>
						<Route index element={<Contest />} />
						<Route path="results" element={<div>settings</div>} />
						<Route path="editor" element={<RichTextEditor />} />
						<Route path="edit/:id" element={<AddProblem />} />
					</Route>
				</Route>

				{/* User routes */}
				<Route path="/user/:id/instructions" element={<div>nothing</div>} />
				<Route path="/user/:id/playground" element={<Playground />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
