// import { Hono } from "hono";
// import { Admin } from "../models/admin.model";

// export const userRoute = new Hono();

// // GET /api/users
// userRoute.get("/", async (c) => {
// 	const users = await Admin.find();
// 	return c.json(users);
// });

// // POST /api/users
// userRoute.post("/", async (c) => {
// 	const body = await c.req.json();
// 	const user = await Admin.create(body);
// 	return c.json(user, 201);
// });
