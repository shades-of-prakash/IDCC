import { Hono } from "hono";
import * as bcrypt from "bcrypt";

const ADMIN = {
	username: "prakash",
	passwordHash: bcrypt.hashSync("snehal@344", 10),
};

type ENV = {
	Variables: {
		session: {
			isAdmin: boolean;
			username: string;
		};
	};
};

export const adminRoute = new Hono<ENV>();

adminRoute.post("/login", async (c) => {
	const { username, password } = await c.req.json();

	if (username !== ADMIN.username) {
		return c.json({ message: "Invalid username" }, 401);
	}

	const isValid = await bcrypt.compare(password, ADMIN.passwordHash);

	if (!isValid) {
		return c.json({ message: "Invalid username or password" }, 401);
	}

	c.set("session", { isAdmin: true, username });

	return c.json({ message: "Login successful" });
});

adminRoute.get("/me", (c) => {
	const session = c.get("session");
	if (!session) {
		return c.json({ message: "Not logged in" }, 401);
	}
	return c.json(session);
});
