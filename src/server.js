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
import tasksRoutes from "./routes/tasks.js";
import modelTestRoutes from "./routes/modelTest.js";
import { connectDatabase } from "./lib/database.js";
// Load environment variables

if (process.env.NODE_ENV == "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config({ path: ".env" });
}

const app = express();
const PORT = process.env.PORT;

// Security and optimization middleware
app.use(helmet());
app.use(compression());
app.use(corsMiddleware);
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
app.use("/api/analytics", authenticateToken, analyticsRoutes);
app.use("/api/tasks", authenticateToken, tasksRoutes);
app.use("/api/model-test", authenticateToken, modelTestRoutes);

// I am adding this for compatibility
// Alias for dashboard route to support /api/dashboard
app.get("/api/dashboard", (req, res, next) => {
  req.url = "/dashboard";
  return analyticsRoutes(req, res, next);
});
// 404 handler

// Error handling middleware
app.use(errorHandler);

// Swagger documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true
}));

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
