import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import { AuthProvider } from "../contexts/adminAuthContext";
import AdminGuard from "../guards/AdminGuard";
import GuestGuard from "../guards/GuestGuard";
import AdminLayout from "../layouts/AdminLayout";
import Loader from "../components/Loader"; // normal Loader import

// Lazy load pages/components
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const DashboardRouter = lazy(() => import("../layouts/Dashboard"));
const RichTextEditor = lazy(() => import("../components/Admin/RichTextEditor"));
const AddProblem = lazy(() => import("../components/Admin/AddProblem"));
const Credentials = lazy(() => import("../components/Admin/Credentials"));

const AdminRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Guest Routes */}
        <Route element={<GuestGuard />}>
          <Route
            path="login"
            element={
              <Suspense fallback={<Loader text="Authenticating"/>}>
                  <AdminLogin />
              </Suspense>
            }
          />
        </Route>

        <Route element={<AdminGuard />}>
          <Route path="" element={<AdminLayout />}>
            <Route
              index
              element={
                <Suspense fallback={<Loader/>}>
                  <DashboardRouter />
                </Suspense>
              }
            />
            <Route path="results" element={<div>Settings Page</div>} />
            <Route
              path="credentials"
              element={
                <Suspense fallback={<Loader text="Loading Users"  />}>
                  <Credentials />
                </Suspense>
              }
            />
            <Route path="add-problem" element={<div>Add a Problem</div>} />
            <Route
              path="editor"
              element={
                <Suspense fallback={<Loader text="Loading Editor..." />}>
                  <RichTextEditor />
                </Suspense>
              }
            />
            <Route
              path="edit/:id"
              element={
                <Suspense fallback={<Loader text="Loading Problem..." />}>
                  <AddProblem />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default AdminRoutes;
