import { ContestRoutes } from "./contest.routes";
import { Hono } from "hono";
import { adminRoute } from "./admin.routes";
import { userRoute } from "./user.routes";
export const apiRoute = new Hono();

apiRoute.route("/admin", adminRoute);
apiRoute.route("/contest", ContestRoutes);
apiRoute.route("/user", userRoute);
