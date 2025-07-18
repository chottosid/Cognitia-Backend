import request from "supertest";
import app from "../app"; // Assuming your Express app is exported from app.js
import { prisma } from "../lib/database.js";
import { authenticateToken } from "../middleware/auth.js";

// Mock middleware and database
jest.mock("../lib/database.js");
jest.mock("../middleware/auth.js", () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: "mockUserId" }; // Mock user
    next();
  }),
}));

describe("Analytics API Endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /dashboard/analytics", () => {
    it("should return analytics data", async () => {
      prisma.task.count.mockResolvedValueOnce(10); // Mock total tasks
      prisma.task.count.mockResolvedValueOnce(5); // Mock completed tasks
      prisma.task.count.mockResolvedValueOnce(3); // Mock in-progress tasks
      prisma.task.count.mockResolvedValueOnce(2); // Mock overdue tasks
      prisma.studySession.findMany.mockResolvedValueOnce([
        { duration: 120 },
        { duration: 60 },
      ]); // Mock study sessions
      prisma.question.findMany.mockResolvedValueOnce([{ voteCount: 3 }]); // Mock questions
      prisma.answer.findMany.mockResolvedValueOnce([
        { isAccepted: true, voteCount: 2 },
      ]); // Mock answers
      prisma.note.findMany.mockResolvedValueOnce([{ id: "note1" }]); // Mock notes
      prisma.note.count.mockResolvedValueOnce(1); // Mock public notes
      prisma.note.count.mockResolvedValueOnce(0); // Mock private notes
      prisma.task.groupBy.mockResolvedValueOnce([
        { subjectArea: "Math", _count: 5 },
      ]); // Mock subject distribution

      const res = await request(app)
        .get("/dashboard/analytics")
        .set("Authorization", "Bearer mockToken");

      expect(res.status).toBe(200);
      expect(res.body.analytics).toHaveProperty("tasks");
      expect(res.body.analytics).toHaveProperty("studyTime");
      expect(prisma.task.count).toHaveBeenCalledTimes(4);
    });
  });

  describe("GET /study-patterns", () => {
    it("should return study patterns for the week", async () => {
      prisma.studySession.aggregate.mockResolvedValue({
        _sum: { duration: 120 },
        _count: { _all: 2 },
      });

      const res = await request(app)
        .get("/study-patterns?period=week")
        .set("Authorization", "Bearer mockToken");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("patterns");
      expect(res.body).toHaveProperty("insights");
      expect(prisma.studySession.aggregate).toHaveBeenCalledTimes(7);
    });
  });

  describe("GET /progress", () => {
    it("should return progress tracking data", async () => {
      prisma.task.findMany.mockResolvedValueOnce([{ subjectArea: "Math" }]); // Mock subjects
      prisma.task.findMany.mockResolvedValueOnce([
        { status: "COMPLETED", updatedAt: new Date() },
        { status: "NOT_STARTED", updatedAt: new Date() },
      ]); // Mock tasks in subject

      const res = await request(app)
        .get("/progress")
        .set("Authorization", "Bearer mockToken");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("subjectProgress");
      expect(res.body).toHaveProperty("overallMetrics");
      expect(prisma.task.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe("GET /performance", () => {
    it("should return performance metrics", async () => {
      const res = await request(app)
        .get("/performance")
        .set("Authorization", "Bearer mockToken");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("performance");
      expect(res.body).toHaveProperty("recommendations");
    });
  });
});
