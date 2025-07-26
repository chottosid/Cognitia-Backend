import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import http from "http";
import { swaggerSpec, swaggerUi } from "./utils/swagger.js";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { autoSubmitExpiredTests } from "./jobs/autoSubmit.js";
import corsMiddleware from "./middleware/cors.js";
import errorHandler from "./middleware/errorHandler.js";
import { authenticateToken } from "./middleware/auth.js";
import {
  validateCuidOrUUID,
  handleValidationErrors,
} from "./middleware/validation.js";
import { detectMimeType } from "./utils/fileUtils.js";
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
import profileRoutes from "./routes/profile.js";
import { connectDatabase } from "./lib/database.js";
import { prisma } from "./lib/database.js";

import { createClient } from "redis";
import { parse } from "url";
import wss from "./notificationSocket.js";
import notificationsRouter from './routes/notifications.js';
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
  console.log("Request received:");
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
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' http://localhost:3000"
  );
  res.removeHeader("X-Frame-Options");
  next();
});

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

app.get("/api/users/count", async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ count: userCount });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ error: "Failed to fetch user count" });
  }
});

app.get("/api/notes/count", async (req, res) => {
  try {
    const notesCount = await prisma.note.count();
    res.json({ count: notesCount });
  } catch (error) {
    console.error("Error fetching notes count:", error);
    res.status(500).json({ error: "Failed to fetch notes count" });
  }
});

// File serving endpoint with better organization
app.get(
  "/api/notes/:id/file",
  [validateCuidOrUUID("id"), handleValidationErrors],
  async (req, res) => {
    try {
      const token = req.query.token;
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      let user;
      try {
        user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const note = await prisma.note.findUnique({
        where: { id: req.params.id },
        select: {
          file: true,
          title: true,
          visibility: true,
          authorId: true
        },
      });

      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }

      if (note.visibility === "PRIVATE" && note.authorId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!note.file) {
        return res.status(404).json({ error: "No file attached to this note" });
      }

      // contentType is pdf
      const contentType = await detectMimeType(note.file);
      const sanitizedFilename = note.title.replace(/[^a-zA-Z0-9.-]/g, "_");

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${sanitizedFilename}"`
      );
      res.setHeader("Cache-Control", "private, max-age=3600");
      res.send(note.file);
    } catch (error) {
      console.error("Serve note file error:", error);
      res.status(500).json({ error: "Failed to serve note file" });
    }
  }
);

// Group routes by functionality
// Authentication routes
app.use("/api/auth", authRoutes);
app.use('/api/notifications', authenticateToken, notificationsRouter);
// Protected routes
app.use("/api/dashboard", authenticateToken, dashboardRoutes);
app.use("/api/analytics", authenticateToken, analyticsRoutes);
app.use("/api/tasks", authenticateToken, tasksRoutes);
app.use("/api/model-test", authenticateToken, modelTestRoutes);
app.use("/api/notes", authenticateToken, notesRoutes);
app.use("/api/contests", authenticateToken, contestRoutes);
app.use("/api/qa", authenticateToken, qnaRoutes);
app.use("/api/profile", authenticateToken, profileRoutes);

// Admin routes
app.use("/api/admin/contests", authenticateToken, contestAdminRoutes);

app.use(errorHandler);

cron.schedule('* * * * *', async () => {
  try {
    await autoSubmitExpiredTests();
  } catch (err) {
    console.error('Error auto-submitting test attempts:', err);
  }
});

// Create HTTP server (for Express + WebSocket)
const server = http.createServer(app);

// WebSocket upgrade handling
server.on("upgrade", (req, socket, head) => {
   // For now, userId is passed as a query param (?userId=...)
  const { query } = parse(req.url, true);
  const userId = query.userId;
  if (!userId) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req, userId);
  });
});

// Connect DB then start server
connectDatabase()
  .then(() => {
    console.log("✅ Database connected successfully");
    // Start server
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // Exit if database connection fails
  });

export default app;

