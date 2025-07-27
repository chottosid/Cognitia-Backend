/**
 * @jest-environment node
 */

import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mock functions
const mockTaskCount = jest.fn();
const mockTaskFindMany = jest.fn();
const mockTaskGroupBy = jest.fn();
const mockStudySessionFindMany = jest.fn();
const mockStudySessionAggregate = jest.fn();
const mockQuestionFindMany = jest.fn();
const mockAnswerFindMany = jest.fn();
const mockAnswerCount = jest.fn();
const mockNoteFindMany = jest.fn();
const mockNoteCount = jest.fn();

// Create the mock module
const mockPrisma = {
  task: {
    count: mockTaskCount,
    findMany: mockTaskFindMany,
    groupBy: mockTaskGroupBy,
  },
  studySession: {
    findMany: mockStudySessionFindMany,
    aggregate: mockStudySessionAggregate,
  },
  question: {
    findMany: mockQuestionFindMany,
  },
  answer: {
    findMany: mockAnswerFindMany,
    count: mockAnswerCount,
  },
  note: {
    findMany: mockNoteFindMany,
    count: mockNoteCount,
  },
};

const mockAuthenticateToken = (req, res, next) => {
  req.user = { id: "test-user-id" };
  next();
};

const mockHandleValidationErrors = (req, res, next) => next();

// Mock the modules
jest.unstable_mockModule("../lib/database.js", () => ({
  prisma: mockPrisma,
}));

jest.unstable_mockModule("../middleware/auth.js", () => ({
  authenticateToken: mockAuthenticateToken,
}));

jest.unstable_mockModule("../middleware/validation.js", () => ({
  handleValidationErrors: mockHandleValidationErrors,
}));

// Import the router after mocking
const { default: analyticsRoutes } = await import("../routes/analytics.js");

// Create test app
const app = express();
app.use(express.json());
app.use("/api/analytics", analyticsRoutes);

describe("Analytics API Endpoints", () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock console to reduce test output noise
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/analytics/dashboard/analytics", () => {
    it("should return analytics data successfully", async () => {
      // Mock all database calls with realistic data
      mockTaskCount
        .mockResolvedValueOnce(25) // total tasks
        .mockResolvedValueOnce(15) // completed tasks
        .mockResolvedValueOnce(8) // in-progress tasks
        .mockResolvedValueOnce(2) // overdue tasks
        .mockResolvedValue(3); // for weekly progress calls

      mockStudySessionFindMany.mockResolvedValueOnce([
        { duration: 120 },
        { duration: 60 },
        { duration: 90 },
      ]);

      mockQuestionFindMany.mockResolvedValueOnce([
        { voteCount: 5 },
        { voteCount: 3 },
      ]);

      mockAnswerFindMany.mockResolvedValueOnce([
        { isAccepted: true, voteCount: 4 },
        { isAccepted: false, voteCount: 2 },
        { isAccepted: true, voteCount: 1 },
      ]);

      mockNoteFindMany.mockResolvedValueOnce([
        { id: "note1" },
        { id: "note2" },
        { id: "note3" },
      ]);

      mockNoteCount
        .mockResolvedValueOnce(2) // public notes
        .mockResolvedValueOnce(1); // private notes

      // Mock weekly progress calls
      mockStudySessionAggregate.mockResolvedValue({ _sum: { duration: 60 } });
      mockAnswerCount.mockResolvedValue(1);

      mockTaskGroupBy.mockResolvedValueOnce([
        { subjectArea: "Mathematics", _count: 10 },
        { subjectArea: "Physics", _count: 8 },
        { subjectArea: "Chemistry", _count: 7 },
      ]);

      const response = await request(app)
        .get("/api/analytics/dashboard/analytics")
        .expect(200);

      expect(response.body).toHaveProperty("analytics");
      expect(response.body.analytics).toHaveProperty("tasks");
      expect(response.body.analytics).toHaveProperty("studyTime");
      expect(response.body.analytics).toHaveProperty("qa");
      expect(response.body.analytics).toHaveProperty("notes");
      expect(response.body.analytics).toHaveProperty("weeklyProgress");
      expect(response.body.analytics).toHaveProperty("subjectDistribution");

      // Verify task statistics
      expect(response.body.analytics.tasks).toEqual({
        total: 25,
        completed: 15,
        inProgress: 8,
        overdue: 2,
      });

      // Verify study time statistics
      expect(response.body.analytics.studyTime).toEqual({
        total: 270, // 120 + 60 + 90
        sessions: 3,
        average: 90, // 270 / 3
      });

      // Verify database calls were made correctly
      expect(mockTaskCount).toHaveBeenCalled();
      expect(mockStudySessionFindMany).toHaveBeenCalledWith({
        where: { userId: "test-user-id", completed: true },
      });
    });

    it("should handle database errors gracefully", async () => {
      mockTaskCount.mockRejectedValueOnce(new Error("Database error"));

      const response = await request(app)
        .get("/api/analytics/dashboard/analytics")
        .expect(500);

      expect(response.body).toEqual({
        error: "Failed to fetch dashboard analytics",
      });
    });
  });

  describe("GET /api/analytics/study-patterns", () => {
    it("should return study patterns for week period", async () => {
      const mockAggregateResult = {
        _sum: { duration: 120 },
        _count: { _all: 2 },
      };

      mockStudySessionAggregate.mockResolvedValue(mockAggregateResult);

      const response = await request(app)
        .get("/api/analytics/study-patterns?period=week")
        .expect(200);

      expect(response.body).toHaveProperty("patterns");
      expect(response.body).toHaveProperty("insights");
      expect(response.body).toHaveProperty("period");
      expect(response.body.period).toBe("week");

      // Should have 7 entries for week
      expect(response.body.patterns).toHaveLength(7);
      expect(response.body.insights).toHaveProperty("totalStudyTime");
      expect(response.body.insights).toHaveProperty("avgStudyTime");
    });

    it("should return study patterns for month period (default)", async () => {
      const mockAggregateResult = {
        _sum: { duration: 300 },
        _count: { _all: 5 },
      };

      mockStudySessionAggregate.mockResolvedValue(mockAggregateResult);

      const response = await request(app)
        .get("/api/analytics/study-patterns")
        .expect(200);

      expect(response.body.period).toBe("month");
      expect(response.body.patterns.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/analytics/progress", () => {
    it("should return progress tracking data", async () => {
      // Mock subjects
      mockTaskFindMany
        .mockResolvedValueOnce([
          { subjectArea: "Mathematics" },
          { subjectArea: "Physics" },
        ])
        .mockResolvedValueOnce([
          { status: "COMPLETED", updatedAt: new Date() },
          { status: "IN_PROGRESS", updatedAt: new Date() },
          { status: "COMPLETED", updatedAt: new Date() },
        ])
        .mockResolvedValueOnce([
          { status: "COMPLETED", updatedAt: new Date() },
          { status: "NOT_STARTED", updatedAt: new Date() },
        ]);

      // Mock study sessions for subjects
      mockStudySessionAggregate
        .mockResolvedValueOnce({ _sum: { duration: 180 } })
        .mockResolvedValueOnce({ _sum: { duration: 120 } });

      const response = await request(app)
        .get("/api/analytics/progress")
        .expect(200);

      expect(response.body).toHaveProperty("subjectProgress");
      expect(response.body).toHaveProperty("overallMetrics");
      expect(response.body).toHaveProperty("learningGoals");

      expect(Array.isArray(response.body.subjectProgress)).toBe(true);
      expect(response.body.overallMetrics).toHaveProperty(
        "totalTasksCompleted"
      );
      expect(response.body.overallMetrics).toHaveProperty("averageProgress");
    });
  });

  describe("GET /api/analytics/performance", () => {
    it("should return performance metrics", async () => {
      const response = await request(app)
        .get("/api/analytics/performance")
        .expect(200);

      expect(response.body).toHaveProperty("performance");
      expect(response.body).toHaveProperty("recommendations");

      expect(response.body.performance).toHaveProperty("studyEfficiency");
      expect(response.body.performance).toHaveProperty("knowledgeRetention");
      expect(response.body.performance).toHaveProperty("timeManagement");
      expect(response.body.performance).toHaveProperty("streaks");

      expect(Array.isArray(response.body.recommendations)).toBe(true);
    });
  });
});
