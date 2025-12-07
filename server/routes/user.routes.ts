import { Hono } from "hono";
import { loginUser } from "../controllers/user/login.controller";
import { startSession } from "../controllers/user/startSession.controller";
import { getMe } from "../controllers/user/me.controller";
import { getSession } from "../controllers/user/getSession.controller";
import { getContestProblems } from "../controllers/user/problems.controller";
import { updateElapsedTime } from "../controllers/user/updateElapsedTime.controller";
import { getUserSubmissions } from "../controllers/user/getUserSubmission.controller";
import { finishSession } from "../controllers/user/finish.controller";
import { getContestUserSubmissionSummary } from "../controllers/user/getContestSubmissions.controller";
import { getContestUserProblemSummary } from "../controllers/user/getUserDetailedSubmission.controller";
import { submitContestFeedback } from "../controllers/user/feedback.controller";

export const userRoute = new Hono();

userRoute.post("login", loginUser);

userRoute.get("me", getMe);

userRoute.get("session/get", getSession);

userRoute.post("feedback", submitContestFeedback);

userRoute.put("session/update-elapsed", updateElapsedTime);

userRoute.post("session/start", startSession);

userRoute.get("session/problems", getContestProblems);

userRoute.get("submissions", getUserSubmissions);

userRoute.get(":contestId/submissions", getContestUserSubmissionSummary);
userRoute.get(":contestId/:userId/problems", getContestUserProblemSummary);

userRoute.post("contest/finish", finishSession);
