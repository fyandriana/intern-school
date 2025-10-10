// server/app.js
import express from "express";
import cors from "cors";
import usersRouter from "./src/users/users.routes.js";
import coursesRouter from "./src/courses/courses.routes.js";
import quizzesRouter from "./src/quizzes/quizzes.routes.js";
import authRouter from "./src/auth/auth.routes.js";
import { errorMiddleware } from "./src/errors.js"; // or inline one below
import "dotenv/config";
const app = express();

app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3001"] }));

app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/auth", authRouter);

// 404
app.use((req, res) => res.status(404).json({ code: "NOT_FOUND", message: "Route not found" }));

// Centralized error handler
app.use(errorMiddleware);
// If you don't have it yet, you can inline:
// app.use((err, _req, res, _next) => {
//   const status = err?.status ?? 500;
//   res.status(status).json({ code: err?.code ?? "INTERNAL_ERROR", message: err?.message ?? "Internal Server Error", meta: err?.meta });
// });
export default app;
