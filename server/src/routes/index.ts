import { Hono } from "hono";
import { adminRoute } from "./admin.routes";
export const apiRoute = new Hono();

apiRoute.route("/admin", adminRoute);
