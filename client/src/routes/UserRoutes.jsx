import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import { ContestProvider } from "../contexts/ContestContext";
import { UserProvider } from "../contexts/UserContext";
import { AuthGuard } from "../guards/UserAuthGuard";
import { UserGuard } from "../guards/UserGuard";
import { GuestGuard } from "../guards/UserGuestGuard";
import Instructions from "../components/user/Instructions";
import { SessionProvider } from "../contexts/SessionContext";
import Loader from "../components/Loader";
const UserLogin = lazy(() => import("../pages/UserLogin"));
const Playground = lazy(() => import("../components/user/Playground"));
const BasicSlider = lazy(() => import("../components/Test"));
const Logiq404 = lazy(() => import("../pages/Logiq404"));

import { ThemeProvider } from "../contexts/ThemeContext";
import { SessionGuard } from "../guards/SessionGuard";

const UserRoutes = () => {
  return (
    <ContestProvider>
      <SessionProvider>
        <UserProvider>
          <Routes>
            <Route
              path="login"
              element={
                <GuestGuard>
                  <UserLogin />
                </GuestGuard>
              }
            />

            <Route
              path="code"
              element={
                <Suspense fallback={<Loader />}>
                  <BasicSlider />
                </Suspense>
              }
            />

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
                    <Suspense fallback={<Loader />}>
                      <Playground />
                    </Suspense>
                  </SessionGuard>
                </AuthGuard>
              }
            />

            <Route path="*" element={<Logiq404 />} />
          </Routes>
        </UserProvider>
      </SessionProvider>
    </ContestProvider>
  );
};

export default UserRoutes;
