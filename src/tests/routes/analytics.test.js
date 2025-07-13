import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import { mockPrisma, mockAuthMiddleware, mockUser } from "../setup.js";

const { default: analyticsRouter } = await import("../../routes/analytics.js");

const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);
app.use("/api/analytics", analyticsRouter);

describe("Analytics Routes", () => {
  beforeEach(() => {
    // Setup default mocks
    mockPrisma.task.count.mockResolvedValue(10);
    mockPrisma.studySession.findMany.mockResolvedValue([]);
    mockPrisma.studySession.aggregate.mockResolvedValue({
      _sum: { duration: 0 },
    });
    mockPrisma.question.findMany.mockResolvedValue([]);
    mockPrisma.answer.findMany.mockResolvedValue([]);
    mockPrisma.note.findMany.mockResolvedValue([]);
    mockPrisma.note.count.mockResolvedValue(5);
    mockPrisma.task.groupBy.mockResolvedValue([]);
  });

  describe("GET /dashboard/analytics", () => {
    it("should get dashboard analytics", async () => {
      // Mock task statistics
      mockPrisma.task.count
        .mockResolvedValueOnce(20) // total tasks
        .mockResolvedValueOnce(15) // completed tasks
        .mockResolvedValueOnce(3) // in progress tasks
        .mockResolvedValueOnce(2); // overdue tasks

      // Mock study sessions
      const mockSessions = [
        { duration: 60 },
        { duration: 90 },
        { duration: 45 },
      ];
      mockPrisma.studySession.findMany.mockResolvedValue(mockSessions);

      // Mock Q&A data
      const mockQuestions = [{ id: "q1", voteCount: 5 }];
      const mockAnswers = [{ id: "a1", isAccepted: true, voteCount: 3 }];
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions);
      mockPrisma.answer.findMany.mockResolvedValue(mockAnswers);

      // Mock notes data
      mockPrisma.note.findMany.mockResolvedValue([{ id: "n1" }]);
      mockPrisma.note.count
        .mockResolvedValueOnce(8) // public notes
        .mockResolvedValueOnce(12); // private notes

      // Mock weekly progress
      for (let i = 0; i < 7; i++) {
        mockPrisma.studySession.aggregate.mockResolvedValueOnce({
          _sum: { duration: 60 },
        });
        mockPrisma.task.count.mockResolvedValueOnce(2);
        mockPrisma.answer.count.mockResolvedValueOnce(1);
      }

      // Mock subject distribution
      mockPrisma.task.groupBy.mockResolvedValue([
        { subjectArea: "MATHEMATICS", _count: 5 },
        { subjectArea: "PHYSICS", _count: 3 },
      ]);

      const response = await request(app).get(
        "/api/analytics/dashboard/analytics"
      );

      expect(response.status).toBe(200);
      expect(response.body.analytics).toBeDefined();
      expect(response.body.analytics.tasks).toEqual({
        total: 20,
        completed: 15,
        inProgress: 3,
        overdue: 2,
      });
      expect(response.body.analytics.studyTime).toBeDefined();
      expect(response.body.analytics.qa).toBeDefined();
      expect(response.body.analytics.notes).toBeDefined();
      expect(response.body.analytics.weeklyProgress).toHaveLength(7);
      expect(response.body.analytics.subjectDistribution).toHaveLength(2);
    });
  });

  describe("GET /study-patterns", () => {
    it("should get weekly study patterns", async () => {
      // Mock 7 days of study session data
      for (let i = 0; i < 7; i++) {
        mockPrisma.studySession.aggregate.mockResolvedValueOnce({
          _sum: { duration: 90 },
          _count: { _all: 2 },
        });
      }

      const response = await request(app)
        .get("/api/analytics/study-patterns")
        .query({ period: "week" });

      expect(response.status).toBe(200);
      expect(response.body.patterns).toHaveLength(7);
      expect(response.body.insights).toBeDefined();
      expect(response.body.period).toBe("week");
      expect(response.body.patterns[0]).toHaveProperty("date");
      expect(response.body.patterns[0]).toHaveProperty("studyTime");
      expect(response.body.patterns[0]).toHaveProperty("sessions");
      expect(response.body.patterns[0]).toHaveProperty("productivity");
    });

    it("should get monthly study patterns", async () => {
      // Mock 30 days of study session data
      for (let i = 0; i < 30; i++) {
        mockPrisma.studySession.aggregate.mockResolvedValueOnce({
          _sum: { duration: 120 },
          _count: { _all: 3 },
        });
      }

      const response = await request(app)
        .get("/api/analytics/study-patterns")
        .query({ period: "month" });

      expect(response.status).toBe(200);
      expect(response.body.patterns).toHaveLength(30);
      expect(response.body.period).toBe("month");
    });

    it("should get yearly study patterns", async () => {
      // Mock 12 months of study session data
      for (let i = 0; i < 12; i++) {
        mockPrisma.studySession.aggregate.mockResolvedValueOnce({
          _sum: { duration: 3600 },
          _count: { _all: 60 },
        });
      }

      const response = await request(app)
        .get("/api/analytics/study-patterns")
        .query({ period: "year" });

      expect(response.status).toBe(200);
      expect(response.body.patterns).toHaveLength(12);
      expect(response.body.period).toBe("year");
      expect(response.body.patterns[0]).toHaveProperty("month");
    });

    it("should return validation error for invalid period", async () => {
      const response = await request(app)
        .get("/api/analytics/study-patterns")
        .query({ period: "invalid" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /progress", () => {
    it("should get progress tracking", async () => {
      const mockTasks = [
        {
          subjectArea: "MATHEMATICS",
          status: "COMPLETED",
          updatedAt: new Date(),
        },
        {
          subjectArea: "MATHEMATICS",
          status: "NOT_STARTED",
          updatedAt: new Date(),
        },
        { subjectArea: "PHYSICS", status: "COMPLETED", updatedAt: new Date() },
      ];

      mockPrisma.task.findMany
        .mockResolvedValueOnce([
          { subjectArea: "MATHEMATICS" },
          { subjectArea: "PHYSICS" },
        ]) // distinct subjects
        .mockResolvedValueOnce(
          mockTasks.filter((t) => t.subjectArea === "MATHEMATICS")
        ) // math tasks
        .mockResolvedValueOnce(
          mockTasks.filter((t) => t.subjectArea === "PHYSICS")
        ); // physics tasks

      const response = await request(app).get("/api/analytics/progress");

      expect(response.status).toBe(200);
      expect(response.body.subjectProgress).toBeDefined();
      expect(response.body.overallMetrics).toBeDefined();
      expect(response.body.learningGoals).toBeDefined();
      expect(response.body.subjectProgress).toHaveLength(2);
    });
  });

  describe("GET /performance", () => {
    it("should get performance metrics", async () => {
      const response = await request(app).get("/api/analytics/performance");

      expect(response.status).toBe(200);
      expect(response.body.performance).toBeDefined();
      expect(response.body.recommendations).toBeDefined();
      expect(response.body.performance.studyEfficiency).toBeDefined();
      expect(response.body.performance.knowledgeRetention).toBeDefined();
      expect(response.body.performance.timeManagement).toBeDefined();
      expect(response.body.performance.streaks).toBeDefined();
      expect(Array.isArray(response.body.recommendations)).toBe(true);
    });
  });
});
