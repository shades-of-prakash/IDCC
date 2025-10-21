import { useEffect, useState, useContext, lazy } from "react";
import { AuthContext } from "../contexts/adminAuthContext";
import CVDashBoard from "./CVDashboard";

const ContestLayout = lazy(() => import("../layouts/ContestLayout"));

const DashboardRouter = () => {
  const { admin } = useContext(AuthContext);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (admin) {
      setRole(admin.role);
    }
  }, [admin]);

  if (role === "volunteer") return <CVDashBoard />;
  if (role === "coordinator") return <CVDashBoard />;
  if (role === "admin") return <ContestLayout />;

  return <div>Unauthorized</div>;
};

export default DashboardRouter;
