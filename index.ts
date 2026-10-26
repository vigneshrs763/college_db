import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import authRouter from "./routes/auth.js";
import requestsRouter from "./routes/requests.js";
import commentsRouter from "./routes/comments.js";
import notificationsRouter from "./routes/notifications.js";
import adminRouter from "./routes/admin.js";
import uploadsRouter from "./routes/uploads.js";
const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ── Static: serve uploaded files ──────────────────────────────────────────────
app.use("/uploads", express.static(path.resolve("uploads")));
// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/requests/:id/comments", commentsRouter);
app.use("/api/requests/:id/photos", uploadsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/admin", adminRouter);
// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});
// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Error]", err.message);
  const status = (err as { status?: number }).status ?? 500;
  res.status(status).json({ error: err.message ?? "Internal server error" });
});
// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎓 CampusCare API running on http://localhost:${PORT}`);
  console.log(`   CORS allowed origin: ${CLIENT_URL}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
export default app;
