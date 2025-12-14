import { Hono } from "hono";
import { connectDB } from "./db/connection";
import { apiRoute } from "./routes";
import { serveStatic } from "hono/bun";
import * as path from "path";

const app = new Hono();

app.use(
    "/api/*",
    serveStatic({
        root: "./public",
        rewriteRequestPath: (path) => path.replace("/api", ""),

        onNotFound: (path, c) => {
            console.log(`DEBUG: File not found by serveStatic: ${path}`);
        },
    }),
);

// app.get("/api/uploads/:contestId/:problemId/:filename", async (c: Context) => {
//     const { contestId, problemId, filename } = c.req.param();

//     const currentDir = import.meta.dir;
//     const uploadsBasePath = path.join(currentDir, "..", "uploads");

//     const relativePath = path.join(contestId, problemId, filename);
//     const normalizedRelativePath = path.normalize(relativePath);

//     if (
//         normalizedRelativePath.startsWith("..") ||
//         path.isAbsolute(normalizedRelativePath)
//     ) {
//         return c.notFound();
//     }

//     const filePath = path.join(uploadsBasePath, normalizedRelativePath);
//     const file = Bun.file(filePath);

//     if (!(await file.exists())) {
//         console.log("File not found:", filePath);
//         return c.notFound();
//     }

//     return new Response(file, {
//         headers: {
//             "Content-Type": file.type || "application/octet-stream",
//             "Cache-Control": "public, max-age=31536000",
//         },
//     });
// });

// app.get("/api/uploads/:contestId/:filename", async (c: Context) => {
//     const { contestId, filename } = c.req.param();

//     // Basic safety
//     if (
//         contestId.includes("..") ||
//         filename.includes("..") ||
//         filename.includes("/") ||
//         filename.includes("\\")
//     ) {
//         return c.notFound();
//     }

//     const filePath = path.join(process.cwd(), "uploads", contestId, filename);

//     console.log("Serving contest image:", filePath);

//     const file = Bun.file(filePath);
//     if (!(await file.exists())) {
//         return c.notFound();
//     }

//     return new Response(file, {
//         headers: {
//             "Content-Type": file.type || "application/octet-stream",
//             "Cache-Control": "public, max-age=31536000",
//         },
//     });
// });

// app.get("/api/contests/:filename", async (c) => {
//     const filename = c.req.param("filename");

//     const filePath = path.join("uploads", "contests", filename);

//     try {
//         const file = Bun.file(filePath);
//         console.log(file.type);
//         if (await file.exists()) {
//             return new Response(file, {
//                 headers: {
//                     "Content-Type": file.type,
//                 },
//             });
//         }
//         return c.notFound();
//     } catch (err) {
//         console.error(err);
//         return c.notFound();
//     }
// });

// app.use(
//     "/*",
//     serveStatic({
//         root: "./client/dist",
//     }),
// );

app.route("/api", apiRoute);

app.get("/api/nothing", (c) => {
    return c.json({ user: "something" });
});

const port = Number(process.env.PORT) || 4000;

connectDB().then(() => {
    Bun.serve({
        port,
        fetch: app.fetch,
    });
    console.log(`🔥 Server running at http://localhost:${port}`);
});
