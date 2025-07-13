import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import { mockPrisma, mockAuthMiddleware, mockUser } from "../setup.js";

const { default: dashboardRouter } = await import("../../routes/dashboard.js");

const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);
app.use("/api/dashboard", dashboardRouter);

describe("Dashboard Routes", () => {
  beforeEach(() => {
    // Mock all the complex queries
    mockPrisma.question.findMany.mockResolvedValue([]);
    mockPrisma.note.findMany.mockResolvedValue([]);
    mockPrisma.task.findMany.mockResolvedValue([]);
    mockPrisma.task.count.mockResolvedValue(0);
    mockPrisma.studySession.findMany.mockResolvedValue([]);
    mockPrisma.studySession.count.mockResolvedValue(0);
    mockPrisma.studySession.aggregate.mockResolvedValue({
      _sum: { duration: 0 },
    });
    mockPrisma.notification.count.mockResolvedValue(0);
    mockPrisma.answer.count.mockResolvedValue(0);
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
  });

  describe("GET /", () => {
    it("should get dashboard data", async () => {
      const mockQuestions = [
        {
          id: "q1",
          title: "How to solve this?",
          content: "Math question",
          authorId: "user-456",
          createdAt: new Date(),
          answers: [],
          author: { id: "user-456", name: "Other User", avatar: null },
        },
      ];

      const mockNotes = [
        {
          id: "note-1",
          title: "Math Notes",
          updatedAt: new Date(),
        },
      ];

      const mockTasks = [
        {
          id: "task-1",
          title: "Complete Assignment",
          status: "NOT_STARTED",
          sessions: [],
        },
      ];

      mockPrisma.question.findMany.mockResolvedValue(mockQuestions);
      mockPrisma.note.findMany.mockResolvedValue(mockNotes);
      mockPrisma.task.findMany.mockResolvedValueOnce(mockTasks); // For today's tasks
      mockPrisma.task.findMany.mockResolvedValueOnce(mockTasks); // For user tasks
      mockPrisma.task.count.mockResolvedValueOnce(5); // For completed tasks
      mockPrisma.task.count.mockResolvedValueOnce(10); // For total tasks
      mockPrisma.studySession.findMany.mockResolvedValue([]);
      mockPrisma.studySession.count.mockResolvedValue(3);
      mockPrisma.studySession.aggregate.mockResolvedValue({
        _sum: { duration: 180 },
      });
      mockPrisma.notification.count.mockResolvedValue(2);
      mockPrisma.answer.count.mockResolvedValue(8);

      const response = await request(app).get("/api/dashboard");

      expect(response.status).toBe(200);
      expect(response.body.feed).toBeDefined();
      expect(response.body.recentNotes).toBeDefined();
      expect(response.body.todaysTasks).toBeDefined();
      expect(response.body.todaysSessions).toBeDefined();
      expect(response.body.studyPlans).toBeDefined();
      expect(response.body.progress).toBeDefined();
      expect(response.body.stats).toBeDefined();
      expect(response.body.unreadNotifications).toBe(2);
      expect(response.body.currentUser).toEqual(mockUser);
    });

    it("should handle missing user in request", async () => {
      const appWithoutAuth = express();
      appWithoutAuth.use(express.json());
      appWithoutAuth.use((req, res, next) => {
        // No user in request
        next();
      });
      appWithoutAuth.use("/api/dashboard", dashboardRouter);

      const response = await request(appWithoutAuth).get("/api/dashboard");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe(
        "Unauthorized: user not found in request."
      );
    });
  });

  describe("GET /me", () => {
    it("should get user's data", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        avatar: null,
        bio: "Student",
        institution: "Test University",
        graduationYear: 2025,
        major: "Computer Science",
        grade: "A",
        location: "City",
        website: "https://example.com",
      };
      mockPrisma.user.findUnique.mockResolvedValue(userData);

      const response = await request(app).get("/api/dashboard/me");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(userData);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: {
          name: true,
          email: true,
          avatar: true,
          bio: true,
          institution: true,
          graduationYear: true,
          major: true,
          grade: true,
          location: true,
          website: true,
        },
      });
    });

    it("should return 404 if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app).get("/api/dashboard/me");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found");
    });
  });

  describe("PUT /me", () => {
    it("should update user's data", async () => {
      const updateData = {
        bio: "Updated bio",
        institution: "New University",
        graduationYear: 2026,
        major: "Data Science",
        grade: "A+",
        location: "New City",
        website: "https://newsite.com",
      };

      const updatedUser = {
        ...mockUser,
        ...updateData,
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const response = await request(app)
        .put("/api/dashboard/me")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: updateData,
      });
    });
  });
});
