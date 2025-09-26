import { Hono } from "hono";
import { loginAdmin } from "../controllers/admin/login.controller";
import { adminValidation } from "../validators/admin.validator";
import { gloabalZValidator } from "../middleware/globalZValidator";
import { adminMe } from "../controllers/admin/me.controller";

export const adminRoute = new Hono();

adminRoute.post(
	"/auth/login",
	gloabalZValidator(adminValidation, "json"),
	loginAdmin
);

// adminRoute.post(
// 	"/auth/logout",
// 	gloabalZValidator(adminValidation, "json"),
// 	loginAdmin
// );

adminRoute.get("/auth/me", adminMe);
