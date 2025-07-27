/**
 * @jest-environment node
 */

import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mock server module to avoid actual server startup
const mockServerModule = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  listen: jest.fn(),
  use: jest.fn(),
};

// Mock database connection
const mockPrisma = {
  $queryRaw: jest.fn(),
  user: {
    count: jest.fn(),
  },
  note: {
    count: jest.fn(),
  },
};

jest.unstable_mockModule("../lib/database.js", () => ({
  prisma: mockPrisma,
  connectDatabase: jest.fn().mockResolvedValue(true),
}));

const { default: app } = await import("../server.js");

describe("Server Health Checks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /health", () => {
    it("should return healthy status when database is connected", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "healthy");
      expect(response.body).toHaveProperty("database", "connected");
      expect(response.body).toHaveProperty("version", "1.1.0");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("should return unhealthy status when database connection fails", async () => {
      mockPrisma.$queryRaw.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app).get("/health");

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty("status", "unhealthy");
      expect(response.body).toHaveProperty("database", "disconnected");
      expect(response.body).toHaveProperty(
        "error",
        "Database connection failed"
      );
    });
  });

  describe("GET /api/users/count", () => {
    it("should return user count", async () => {
      mockPrisma.user.count.mockResolvedValue(150);

      const response = await request(app).get("/api/users/count");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("count", 150);
      expect(mockPrisma.user.count).toHaveBeenCalled();
    });

    it("should handle database error gracefully", async () => {
      mockPrisma.user.count.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/users/count");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "error",
        "Failed to fetch user count"
      );
    });
  });

  describe("GET /api/notes/count", () => {
    it("should return notes count", async () => {
      mockPrisma.note.count.mockResolvedValue(75);

      const response = await request(app).get("/api/notes/count");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("count", 75);
      expect(mockPrisma.note.count).toHaveBeenCalled();
    });

    it("should handle database error gracefully", async () => {
      mockPrisma.note.count.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/notes/count");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "error",
        "Failed to fetch notes count"
      );
    });
  });
});

describe("Middleware Tests", () => {
  it("should handle JSON parsing", async () => {
    const response = await request(app)
      .post("/api/test-json")
      .send({ test: "data" })
      .set("Content-Type", "application/json");

    // Even if endpoint doesn't exist, it should parse JSON without error
    expect(response.status).not.toBe(400); // Not a JSON parsing error
  });

  it("should set CORS headers", async () => {
    const response = await request(app)
      .options("/health")
      .set("Origin", "http://localhost:3000");

    expect(response.headers).toHaveProperty("access-control-allow-origin");
  });
});

describe("Error Handling", () => {
  it("should handle 404 for non-existent routes", async () => {
    const response = await request(app).get("/non-existent-route");

    expect(response.status).toBe(404);
  });

  it("should handle invalid JSON gracefully", async () => {
    const response = await request(app)
      .post("/api/test")
      .send("invalid json")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
  });
});

describe("API Route Structure", () => {
  it("should have auth routes available", async () => {
    const response = await request(app).post("/api/auth/login");
    // Should not be 404, meaning the route exists
    expect(response.status).not.toBe(404);
  });

  it("should protect dashboard routes", async () => {
    const response = await request(app).get("/api/dashboard");
    // Should require authentication (401) or return data, not 404
    expect(response.status).not.toBe(404);
  });

  it("should have analytics routes available", async () => {
    const response = await request(app).get(
      "/api/analytics/dashboard/analytics"
    );
    // Should require authentication, not be 404
    expect(response.status).not.toBe(404);
  });

  it("should have notes routes available", async () => {
    const response = await request(app).get("/api/notes");
    // Should require authentication, not be 404
    expect(response.status).not.toBe(404);
  });

  it("should have tasks routes available", async () => {
    const response = await request(app).get("/api/tasks");
    // Should require authentication, not be 404
    expect(response.status).not.toBe(404);
  });

  it("should have contests routes available", async () => {
    const response = await request(app).get("/api/contests");
    // Should require authentication, not be 404
    expect(response.status).not.toBe(404);
  });

  it("should have Q&A routes available", async () => {
    const response = await request(app).get("/api/qa");
    // Should require authentication, not be 404
    expect(response.status).not.toBe(404);
  });

  it("should have profile routes available", async () => {
    const response = await request(app).get("/api/profile");
    // Should require authentication, not be 404
    expect(response.status).not.toBe(404);
  });

  it("should have model test routes available", async () => {
    const response = await request(app).get("/api/model-test");
    // Should require authentication, not be 404
    expect(response.status).not.toBe(404);
  });

  it("should have notification routes available", async () => {
    const response = await request(app).get("/api/notifications");
    // Should require authentication, not be 404
    expect(response.status).not.toBe(404);
  });
});
