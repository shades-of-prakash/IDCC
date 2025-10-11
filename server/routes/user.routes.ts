import { Hono } from "hono";
import { loginUser } from "../controllers/user/login.controller";
import { getSessionById, updateSessionElapsed } from "../controllers/user/session.controller";
export const userRoute = new Hono();

userRoute.post("login",loginUser);

userRoute.get("session/:sessionId", getSessionById);

userRoute.patch("session/:id/elapsed",updateSessionElapsed)