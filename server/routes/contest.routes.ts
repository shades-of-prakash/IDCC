import { Hono } from "hono";
import { createContest } from "../controllers/contest/create.controller";
import { getContests } from "../controllers/contest/get.controller";
import { getContestById } from "../controllers/contest/id.controller";
import { upsertQuestion } from "../controllers/contest/questionUpsert.controller";
import { uploadImage } from "../controllers/contest/upload.controller";
import { cleanupUnusedImages } from "../controllers/contest/cleanup.controller";
export const ContestRoutes = new Hono();

ContestRoutes.post("create", createContest);
ContestRoutes.get("list", getContests);
ContestRoutes.get(":id", getContestById);
ContestRoutes.post(":id/upsert", upsertQuestion);
ContestRoutes.post("images/upload", uploadImage);
ContestRoutes.post("images/cleanup", cleanupUnusedImages);
