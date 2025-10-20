import { Hono } from "hono";
import { loginAdmin } from "../controllers/admin/login.controller";
import { adminMe } from "../controllers/admin/me.controller";
import { createVolunteer } from "../controllers/admin/createVolunteer.controller";
import { checkAdminOrCoordinator, getAuthUser } from "../utils/auth";
import { getVolunteers } from "../controllers/admin/getVolunteers.controller";
import { updateVolunteer } from "../controllers/admin/updateVolunteer.controller";
import { deleteVolunteer } from "../controllers/admin/deleteVolunteer.controller";
import { logoutAdmin } from "../controllers/admin/logout.controller";

export const adminRoute = new Hono();

adminRoute.post("/auth/login", loginAdmin);
adminRoute.post("/auth/logout",logoutAdmin);
adminRoute.get("/auth/me", adminMe);
adminRoute.post("/auth/create/volunteer",getAuthUser,checkAdminOrCoordinator,createVolunteer);
adminRoute.get("/auth/get/volunteers",getAuthUser,checkAdminOrCoordinator,getVolunteers)
adminRoute.put("/auth/update/volunteer",getAuthUser,checkAdminOrCoordinator,updateVolunteer)
adminRoute.delete("/auth/delete/volunteer",getAuthUser,checkAdminOrCoordinator,deleteVolunteer)


