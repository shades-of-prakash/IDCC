import { ContestRoutes } from "./contest.routes";
import { Hono } from "hono";
import { adminRoute } from "./admin.routes";
export const apiRoute = new Hono();

apiRoute.route("/admin", adminRoute);
apiRoute.route("/contest", ContestRoutes);
