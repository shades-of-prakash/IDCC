import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes"; // Admin-specific routes
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="user/*" element={<UserRoutes />} />
        <Route path="admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
