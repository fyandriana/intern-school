// server/index.js
import "dotenv/config";                 // optional: load .env
import app from "./app.js";
import { getDb } from "./src/db/connection.js"; // better-sqlite3 singleton

const PORT = process.env.PORT || 3001;

// Optional: warm up DB so PRAGMAs run at boot
getDb();

const server = app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    try {
        // If you added a closeDb() helper, call it here.
        // closeDb();
        server.close(() => process.exit(0));
    } catch {
        process.exit(1);
    }
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Safety nets
process.on("unhandledRejection", (e) => console.error("unhandledRejection", e));
process.on("uncaughtException",  (e) => console.error("uncaughtException", e));
