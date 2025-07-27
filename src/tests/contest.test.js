/**
 * @jest-environment node
 */

import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mock functions
const mockContestFindMany = jest.fn();
const mockContestCreate = jest.fn();
const mockContestFindUnique = jest.fn();
const mockContestRegistrationCreate = jest.fn();
const mockContestRegistrationFindMany = jest.fn();
const mockContestAttemptCreate = jest.fn();
const mockContestAttemptFindFirst = jest.fn();

// Create the mock module
const mockPrisma = {
  contest: {
    findMany: mockContestFindMany,
    create: mockContestCreate,
    findUnique: mockContestFindUnique,
  },
  contestRegistration: {
    create: mockContestRegistrationCreate,
    findMany: mockContestRegistrationFindMany,
  },
  contestAttempt: {
    create: mockContestAttemptCreate,
    findFirst: mockContestAttemptFindFirst,
  },
};

// Mock auth middleware
const mockAuthenticateToken = (req, res, next) => {
  req.user = { id: "test-user-id", role: "STUDENT" };
  next();
};

const mockHandleValidationErrors = (req, res, next) => next();

jest.unstable_mockModule("../lib/database.js", () => ({
  prisma: mockPrisma,
}));

jest.unstable_mockModule("../middleware/auth.js", () => ({
  authenticateToken: mockAuthenticateToken,
}));

jest.unstable_mockModule("../middleware/validation.js", () => ({
  handleValidationErrors: mockHandleValidationErrors,
  validateCuidOrUUID: jest.fn(() => (req, res, next) => next()),
}));

const contestRoutes = await import("../routes/contest.js");

describe("Contest Routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(mockAuthenticateToken);
    app.use("/api/contests", contestRoutes.default);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("GET /api/contests", () => {
    it("should handle empty contest list", async () => {
      mockContestFindMany.mockResolvedValue([]);

      const response = await request(app).get("/api/contests");

      expect(response.status).toBe(200);
      expect(response.body.contests).toHaveLength(0);
    });
  });

  describe("POST /api/contests/:id/register", () => {
    it("should return 404 for non-existent contest", async () => {
      mockContestFindUnique.mockResolvedValue(null);

      const response = await request(app).post(
        "/api/contests/non-existent/register"
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Contest not found");
    });
  });

  describe("GET /api/contests/:id", () => {
    it("should get contest by id", async () => {
      const mockContest = {
        id: "contest-1",
        title: "Math Contest",
        description: "Basic math competition",
        startTime: new Date(),
        endTime: new Date(),
        questions: [],
      };

      mockContestFindUnique.mockResolvedValue(mockContest);

      const response = await request(app).get("/api/contests/contest-1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("contest");
      expect(response.body.contest.id).toBe("contest-1");
    });

    it("should return 404 for non-existent contest", async () => {
      mockContestFindUnique.mockResolvedValue(null);

      const response = await request(app).get("/api/contests/non-existent");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Contest not found");
    });
  });

  describe("GET /api/contests/:id/status", () => {
    it("should get contest status", async () => {
      const mockContest = {
        id: "contest-1",
        title: "Math Contest",
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() + 3600000),
        isActive: true,
      };

      mockContestFindUnique.mockResolvedValue(mockContest);

      const response = await request(app).get("/api/contests/contest-1/status");

      expect(response.status).toBe(200);
      // The actual response has contest.status, not just status
      expect(response.body).toHaveProperty("contest");
      expect(response.body.contest).toHaveProperty("status");
    });
  });
});
