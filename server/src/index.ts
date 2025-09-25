import { Hono } from "hono";
import { connectDB } from "./db/connection";
import { apiRoute } from "./routes";

const app = new Hono();

app.get("/", (c) => c.text("Hono + Bun + Mongoose + API 🚀"));

app.route("/api", apiRoute);

const port = Number(process.env.PORT) || 4000;

connectDB().then(() => {
	Bun.serve({
		port,
		fetch: app.fetch,
	});
	console.log(`🔥 Server running at http://localhost:${port}`);
});
