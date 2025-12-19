import { Hono } from "hono";
import { loginAdmin } from "../controllers/admin/login.controller";
import { adminMe } from "../controllers/admin/me.controller";
import { createVolunteer } from "../controllers/admin/createVolunteer.controller";
import {
    checkAdminOrCoordinator,
    checkAdmin,
    getAuthUser,
} from "../utils/auth";
import { getVolunteers } from "../controllers/admin/getVolunteers.controller";
import { updateVolunteer } from "../controllers/admin/updateVolunteer.controller";
import { deleteVolunteer } from "../controllers/admin/deleteVolunteer.controller";
import { logoutAdmin } from "../controllers/admin/logout.controller";
import { createUser } from "../controllers/admin/createVorC.controller";
import { getVorc } from "../controllers/admin/getVorC.controller";
import { deleteVorc } from "../controllers/admin/deleteVorC.controller";
import { updateVorc } from "../controllers/admin/updateVorC.controller";
import { getFeedbackDashboard } from "../controllers/admin/feedback.controller";

export const adminRoute = new Hono();

adminRoute.post("/auth/login", loginAdmin);
adminRoute.post("/auth/logout", logoutAdmin);

adminRoute.get("/auth/me", adminMe);
adminRoute.post(
    "/auth/create/volunteer",
    getAuthUser,
    checkAdminOrCoordinator,
    createVolunteer,
);
adminRoute.post("/auth/create/vorc", getAuthUser, checkAdmin, createUser);

adminRoute.get(
    "/auth/get/volunteers",
    getAuthUser,
    checkAdminOrCoordinator,
    getVolunteers,
);

adminRoute.get("/auth/get/vorc", getAuthUser, checkAdmin, getVorc);

adminRoute.put(
    "/auth/update/volunteer",
    getAuthUser,
    checkAdminOrCoordinator,
    updateVolunteer,
);

adminRoute.put("/auth/update/uvorc", getAuthUser, checkAdmin, updateVorc);

adminRoute.delete(
    "/auth/delete/volunteer",
    getAuthUser,
    checkAdminOrCoordinator,
    deleteVolunteer,
);

adminRoute.delete("/auth/delete/vorc", getAuthUser, checkAdmin, deleteVorc);
adminRoute.get("/feedback/contest/:contestId", getFeedbackDashboard);
