import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import { ContestProvider } from "../contexts/ContestContext";
import { UserProvider } from "../contexts/UserContext";
import { AuthGuard } from "../guards/UserGuard";
import { GuestGuard } from "../guards/UserGuestGuard";
import Loader from "../components/Loader";
const UserLogin = lazy(() => import("../pages/UserLogin"));
const Playground = lazy(() => import("../components/user/Playground"));
const BasicSlider = lazy(() => import("../components/Test"));
const Logiq404 = lazy(() => import("../pages/Logiq404"));

const UserRoutes = () => {
  return (
    <ContestProvider>
      <UserProvider>
        <Routes>
          <Route
            path="login"
            element={
              <GuestGuard redirectTo={"/user/123/playground"}>
                <Suspense fallback={<Loader />}>
                  <UserLogin />
                </Suspense>
              </GuestGuard>
            }
          />

          {/* Public test route */}
          <Route
            path="code"
            element={
              <Suspense fallback={<Loader />}>
                <BasicSlider />
              </Suspense>
            }
          />

          {/* Example placeholder route */}
          <Route path=":id/instructions" element={<div>Nothing</div>} />

          {/* Auth protected routes */}
          <Route
            path=":id/playground"
            element={
              // <AuthGuard>
                <Suspense fallback={<Loader />}>
                  <Playground />
                </Suspense>
              // </AuthGuard>
            }
          />
          <Route path="*" element={<Logiq404 />} />
        </Routes>
      </UserProvider>
    </ContestProvider>
  );
};

export default UserRoutes;
