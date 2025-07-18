import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import { swaggerSpec, swaggerUi } from "./utils/swagger.js";

import corsMiddleware from "./middleware/cors.js";
import errorHandler from "./middleware/errorHandler.js";
import { authenticateToken } from "./middleware/auth.js";
// Import your route handlers
import authRoutes from "./routes/auth.js";
import analyticsRoutes from "./routes/analytics.js";
import dashboardRoutes from "./routes/dashboard.js";
import tasksRoutes from "./routes/tasks.js";
import modelTestRoutes from "./routes/modelTest.js";
import notesRoutes from "./routes/notes.js";
import contestRoutes from "./routes/contest.js";
import contestAdminRoutes from "./routes/admin/contestAdmin.js";
import qnaRoutes from "./routes/qa.js";
import { connectDatabase } from "./lib/database.js";
// Load environment variables

if (process.env.NODE_ENV == "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config({ path: ".env" });
}

const app = express();
const PORT = process.env.PORT;

// Log all incoming requests
app.use((req, res, next) => {
  console.log('Request received:');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // log request body if it's a POST/PUT request
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Request body:", req.body);
  }
  next();
});

// Security and optimization middleware
app.use(helmet());
app.use(compression());
app.use(corsMiddleware);
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", authenticateToken, dashboardRoutes);
app.use("/api/analytics", authenticateToken, analyticsRoutes);
app.use("/api/tasks", authenticateToken, tasksRoutes);
app.use("/api/model-test", authenticateToken, modelTestRoutes);
app.use("/api/notes", authenticateToken, notesRoutes);
app.use("/api/contests", authenticateToken, contestRoutes);
app.use("/api/admin/contests", authenticateToken, contestAdminRoutes);
app.use("/api/qa", authenticateToken, qnaRoutes);

app.use(errorHandler);

connectDatabase()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // Exit if database connection fails
  });
// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
