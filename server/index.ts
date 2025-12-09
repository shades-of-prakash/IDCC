import { Hono } from "hono";
import { connectDB } from "./db/connection";
import { apiRoute } from "./routes";
import { serveStatic } from "hono/bun";
import * as path from "path";

const app = new Hono();

app.get("/api/images/:contestId/:filename", async (c) => {
    const contestId = c.req.param("contestId");
    const filename = c.req.param("filename");

    const filePath = path.join("uploads", contestId, filename);

    try {
        const file = Bun.file(filePath);
        if (await file.exists()) {
            return new Response(file, {
                headers: {
                    "Content-Type": file.type,
                },
            });
        }
        return c.notFound();
    } catch (err) {
        console.error(err);
        return c.notFound();
    }
});

app.get("/api/contests/:filename", async (c) => {
    const filename = c.req.param("filename");

    const filePath = path.join("uploads", "contests", filename);

    try {
        const file = Bun.file(filePath);
        if (await file.exists()) {
            return new Response(file, {
                headers: {
                    "Content-Type": file.type,
                },
            });
        }
        return c.notFound();
    } catch (err) {
        console.error(err);
        return c.notFound();
    }
});

app.use(
    "/*",
    serveStatic({
        root: "./client/dist",
    }),
);

app.route("/api", apiRoute);

const port = Number(process.env.PORT) || 4000;

connectDB().then(() => {
    Bun.serve({
        port,
        fetch: app.fetch,
    });
    console.log(`🔥 Server running at http://localhost:${port}`);
});
