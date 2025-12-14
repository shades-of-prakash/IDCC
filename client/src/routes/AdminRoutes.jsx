import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import { AuthProvider } from "../contexts/adminAuthContext";
import AdminGuard from "../guards/AdminGuard";
import GuestGuard from "../guards/GuestGuard";
import AdminLayout from "../layouts/AdminLayout";
import Loader from "../components/Loader";
import { ContestProvider } from "../contexts/ContestContext";
import { EditorImagesProvider } from "../contexts/EditorImagesContext";

const ContestUserDetailedResults = lazy(
    () => import("../components/Admin/ContestUserDetailedResults"),
);

const Results = lazy(() => import("../components/Admin/Results"));
const ContestResults = lazy(() => import("../components/Admin/ContestResults"));
const ProblemEditor = lazy(() => import("../components/Admin/ProblemEditor"));
const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const DashboardRouter = lazy(() => import("../layouts/Dashboard"));
const RichTextEditor = lazy(() => import("../components/Admin/RichTextEditor"));
const AddProblem = lazy(() => import("../components/Admin/AddProblem"));
const Credentials = lazy(() => import("../components/Admin/Credentials"));
const Logiq404 = lazy(() => import("../pages/Logiq404"));
const TestCaseManager = lazy(
    () => import("../components/Admin/TestCaseManager"),
);
import AdminRouteGuard from "../guards/AdminProtectedRoute";
const Feedback = lazy(() => import("../components/Admin/Feedback"));

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
                            <Route
                                path="results"
                                element={
                                    <AdminRouteGuard>
                                        <Results />
                                    </AdminRouteGuard>
                                }
                            />
                            <Route
                                path="results/:id"
                                element={
                                    <AdminRouteGuard>
                                        <ContestResults />
                                    </AdminRouteGuard>
                                }
                            />
                            <Route
                                path="results/:contestId/:userId"
                                element={
                                    <AdminRouteGuard>
                                        <ContestUserDetailedResults />
                                    </AdminRouteGuard>
                                }
                            />

                            <Route
                                path="testcase/:problemId"
                                element={<TestCaseManager />}
                            />

                            <Route
                                path="credentials"
                                element={
                                    <Suspense
                                        fallback={
                                            <Loader text="Loading Users" />
                                        }
                                    >
                                        <Credentials />
                                    </Suspense>
                                }
                            />

                            <Route
                                path="statement/:problemId"
                                element={
                                    <EditorImagesProvider>
                                        <ProblemEditor />
                                    </EditorImagesProvider>
                                }
                            />
                            <Route path="feedback" element={<Feedback />} />

                            <Route
                                path="editor"
                                element={
                                    <Suspense
                                        fallback={
                                            <Loader text="Loading Editor..." />
                                        }
                                    >
                                        <RichTextEditor />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="add/:contestId"
                                element={
                                    <Suspense
                                        fallback={
                                            <Loader text="Loading Problem..." />
                                        }
                                    >
                                        <AdminRouteGuard>
                                            <AddProblem />
                                        </AdminRouteGuard>
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
