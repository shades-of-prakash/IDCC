import { Hono } from "hono";
import { connectDB } from "./db/connection";
import { apiRoute } from "./routes";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
	"/api/*",
	cors({
		origin: "http://localhost:4200",
		credentials: true,
		allowHeaders: ["Content-Type", "Authorization"],
	})
);

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
