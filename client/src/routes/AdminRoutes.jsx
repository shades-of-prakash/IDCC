import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import { AuthProvider } from "../contexts/adminAuthContext";
import AdminGuard from "../guards/AdminGuard";
import GuestGuard from "../guards/GuestGuard";
import AdminLayout from "../layouts/AdminLayout";
import Loader from "../components/Loader";
import ProblemEditor from "../components/Admin/ProblemEditor";
import { ContestProvider } from "../contexts/ContestContext";
// Lazy load pages/components
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const DashboardRouter = lazy(() => import("../layouts/Dashboard"));
const RichTextEditor = lazy(() => import("../components/Admin/RichTextEditor"));
const AddProblem = lazy(() => import("../components/Admin/AddProblem"));
const Credentials = lazy(() => import("../components/Admin/Credentials"));
const Logiq404 = lazy(() => import("../pages/Logiq404"));
const AdminRoutes = () => {
  return (
    <AuthProvider>
      <ContestProvider>
        <Routes>
          <Route element={<GuestGuard />}>
            <Route
              path="login"
              element={
                <Suspense fallback={<Loader />}>
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
                  <Suspense fallback={<Loader />}>
                    <DashboardRouter />
                  </Suspense>
                }
              />
              <Route path="results" element={<div>Settings Page</div>} />
              <Route
                path="credentials"
                element={
                  <Suspense fallback={<Loader text="Loading Users" />}>
                    <Credentials />
                  </Suspense>
                }
              />
              <Route path="add-problem" element={<ProblemEditor />} />
              {/* <Route path="add-problem" element={<Problem/>} /> */}
              <Route
                path="editor"
                element={
                  <Suspense fallback={<Loader text="Loading Editor..." />}>
                    <RichTextEditor />
                  </Suspense>
                }
              />
              <Route
                path="add/:contestId"
                element={
                  <Suspense fallback={<Loader text="Loading Problem..." />}>
                    <AddProblem />
                  </Suspense>
                }
              />
            </Route>
          </Route>
          <Route path="*" element={<Logiq404 />} />
        </Routes>
      </ContestProvider>
    </AuthProvider>
  );
};

export default AdminRoutes;
