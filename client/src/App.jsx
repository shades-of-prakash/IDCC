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
import CodeEditor from "./components/Test";
import { Toaster } from "sonner";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Toaster richColors position="top-center" />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route element={<GuestGuard />}>
						<Route path="/admin-login" element={<AdminLogin />} />
					</Route>
					<Route path="/user-login" element={<UserLogin />} />
					<Route path="/code" element={<CodeEditor />} />
					<Route element={<AdminGuard />}>
						<Route path="/admin" element={<AdminLayout />}>
							<Route index element={<Contest />} />
							<Route path="results" element={<div>settings</div>} />
							<Route path="editor" element={<RichTextEditor />} />
							<Route path="edit/:id" element={<AddProblem />} />
						</Route>
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
