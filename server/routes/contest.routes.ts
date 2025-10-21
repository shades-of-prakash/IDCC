import { Hono } from "hono";
import { createContest } from "../controllers/contest/create.controller";
import {
  getContests,
  getContestsWithoutQuestions,
} from "../controllers/contest/get.controller";
import { getContestById } from "../controllers/contest/id.controller";
import { upsertQuestion } from "../controllers/contest/questionUpsert.controller";
import { uploadImage } from "../controllers/contest/upload.controller";
import { cleanupUnusedImages } from "../controllers/contest/cleanup.controller";
import { createUsers } from "../controllers/contest/user.controller";
import { requireRole } from "../middleware/admin.middleware";
import { getProblemsByAdminAndContest } from "../controllers/contest/getProblemsByAdminAndContest.controller";
import { getProblemsByUser } from "../controllers/contest/getProblemsById";
import { upsertProblem } from "../controllers/admin/createProblem.controller";
import { deleteProblem } from "../controllers/contest/deleteProblem.controller";
import { getContestWithProblems } from "../controllers/contest/getProblemsOfContest.controller";
export const ContestRoutes = new Hono();

ContestRoutes.post("create", createContest);
ContestRoutes.post("add", requireRole(["volunteer"]), createContest);
ContestRoutes.get("list", getContests);
ContestRoutes.get("list/without-questions", getContestsWithoutQuestions);
ContestRoutes.get(":id", getContestById);
ContestRoutes.post(":id/upsert", upsertQuestion);
ContestRoutes.post("images/upload", uploadImage);
ContestRoutes.post("images/cleanup", cleanupUnusedImages);
ContestRoutes.post("users/create", createUsers);
ContestRoutes.get("admin/problems", getProblemsByAdminAndContest);
ContestRoutes.get("admin/all/problems", getProblemsByUser);
ContestRoutes.post("admin/problem/new", upsertProblem);
ContestRoutes.put("admin/problem/update/:problemId", upsertProblem);
ContestRoutes.delete("admin/problem/delete/:problemId", deleteProblem);
ContestRoutes.get("admin/getAllProblemsOfContest", getContestWithProblems);
