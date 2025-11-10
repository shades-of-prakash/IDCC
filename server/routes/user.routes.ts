import { Hono } from "hono";
import { loginUser } from "../controllers/user/login.controller";
import { startSession } from "../controllers/user/startSession.controller";
import { getMe } from "../controllers/user/me.controller";
import { getSession } from "../controllers/user/getSession.controller";
import { getContestProblems } from "../controllers/user/problems.controller";
import { updateElapsedTime } from "../controllers/user/updateElapsedTime.controller";

export const userRoute = new Hono();

userRoute.post("login", loginUser);

userRoute.get("me", getMe);


userRoute.get("session/get", getSession);

userRoute.put("session/update-elapsed", updateElapsedTime);

userRoute.post("session/start", startSession);

userRoute.get("session/problems", getContestProblems);
