import { Hono } from "hono";
import { User } from "../models/user.model";

export const userRoute = new Hono();

// GET /api/users
userRoute.get("/", async (c) => {
	const users = await User.find();
	return c.json(users);
});

// POST /api/users
userRoute.post("/", async (c) => {
	const body = await c.req.json();
	const user = await User.create(body);
	return c.json(user, 201);
});
