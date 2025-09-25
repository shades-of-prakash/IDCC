import { Hono } from "hono";
import { userRoute } from "./user.routes";
import { adminRoute } from "./admin.routes";
export const apiRoute = new Hono();

apiRoute.route("/users", userRoute);
apiRoute.route("/admin", adminRoute);
