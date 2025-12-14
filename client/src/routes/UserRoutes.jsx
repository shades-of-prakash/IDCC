import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";

import { ContestProvider } from "../contexts/ContestContext";
import { UserProvider } from "../contexts/UserContext";
import { SessionProvider } from "../contexts/SessionContext";
import { UserSubmissionsProvider } from "../contexts/userSubmissionContext";
import { FinishProvider } from "../contexts/finishContext";

import { AuthGuard } from "../guards/UserAuthGuard";
import { UserGuard } from "../guards/UserGuard";
import { GuestGuard } from "../guards/UserGuestGuard";
import { SessionGuard } from "../guards/SessionGuard";

import Loader from "../components/Loader";

const UserLogin = lazy(() => import("../pages/UserLogin"));
const Playground = lazy(() => import("../components/user/Playground"));
const BasicSlider = lazy(() => import("../components/Test"));
const Logiq404 = lazy(() => import("../pages/Logiq404"));
const Instructions = lazy(() => import("../components/user/Instructions"));

const UserRoutes = () => {
    return (
        <ContestProvider>
            <SessionProvider>
                <UserProvider>
                    <Suspense fallback={<Loader />}>
                        <Routes>
                            <Route
                                path="login"
                                element={
                                    <GuestGuard>
                                        <UserLogin />
                                    </GuestGuard>
                                }
                            />

                            <Route path="code" element={<BasicSlider />} />

                            <Route
                                path="instructions"
                                element={
                                    <UserGuard>
                                        <Instructions />
                                    </UserGuard>
                                }
                            />

                            <Route
                                path="playground"
                                element={
                                    <AuthGuard>
                                        <SessionGuard>
                                            <UserSubmissionsProvider>
                                                <FinishProvider>
                                                    <Playground />
                                                </FinishProvider>
                                            </UserSubmissionsProvider>
                                        </SessionGuard>
                                    </AuthGuard>
                                }
                            />

                            <Route path="*" element={<Logiq404 />} />
                        </Routes>
                    </Suspense>
                </UserProvider>
            </SessionProvider>
        </ContestProvider>
    );
};

export default UserRoutes;
