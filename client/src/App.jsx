import { BrowserRouter, Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Loader from "./components/Loader"
const UserRoutes = lazy(() => import("./routes/UserRoutes"));
const AdminRoutes = lazy(() => import("./routes/AdminRoutes"));

function App() {
  return (
      <BrowserRouter>
        <Toaster richColors position="top-center" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="user/*"
            element={
              <Suspense fallback={<Loader/>}>
                <UserRoutes />
              </Suspense>
            }
          />
          <Route
            path="admin/*"
            element={
              <Suspense fallback={<Loader  />}>
                <AdminRoutes />
              </Suspense>
            }
          />
        
          <Route
            path="coordinator"
            element={
              <Suspense fallback={<Loader/>}>
                <div>
                  <h1>coordinator</h1>
                </div>
              </Suspense>
            }
          />
          
        </Routes>
      </BrowserRouter>
  );
}

export default App;
