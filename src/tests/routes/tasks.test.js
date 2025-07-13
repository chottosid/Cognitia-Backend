import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import {
  mockPrisma,
  mockAuthMiddleware,
  mockUser,
  mockTask,
} from "../setup.js";

// Mock fetch for Flask API
global.fetch = jest.fn();

const { default: tasksRouter } = await import("../../routes/tasks.js");

const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);
app.use("/api/tasks", tasksRouter);

describe("Tasks Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FLASK_API_URL = "http://localhost:5000";
  });

  describe("GET /", () => {
    it("should get all tasks for authenticated user", async () => {
      mockPrisma.task.findMany.mockResolvedValue([mockTask]);

      const response = await request(app).get("/api/tasks");

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });
  });

  describe("GET /generate", () => {
    it("should generate schedule successfully", async () => {
      mockPrisma.task.findMany.mockResolvedValue([mockTask]);
      mockPrisma.availability.findMany.mockResolvedValue([]);
      mockPrisma.studySession.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.studySession.createMany.mockResolvedValue({ count: 1 });

      fetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            taskId: mockTask.id,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 60,
            goal: "Complete task",
          },
        ],
      });

      const response = await request(app).get("/api/tasks/generate");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Schedule generated successfully");
      expect(response.body.schedule).toBeDefined();
      expect(fetch).toHaveBeenCalled();
    });

    it("should return 404 if no tasks found", async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      const response = await request(app).get("/api/tasks/generate");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("No tasks found for the user");
    });

    it("should handle Flask API error", async () => {
      mockPrisma.task.findMany.mockResolvedValue([mockTask]);
      mockPrisma.availability.findMany.mockResolvedValue([]);

      fetch.mockRejectedValue(new Error("Network error"));

      const response = await request(app).get("/api/tasks/generate");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Could not reach scheduling service");
    });
  });

  describe("GET /today", () => {
    it("should get today's schedule", async () => {
      const mockSession = {
        id: "session-123",
        taskId: mockTask.id,
        startTime: new Date(),
        endTime: new Date(),
        duration: 60,
        userId: mockUser.id,
      };
      mockPrisma.studySession.findMany.mockResolvedValue([mockSession]);

      const response = await request(app).get("/api/tasks/today");

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(1);
    });
  });

  describe("GET /:id", () => {
    it("should get task by ID", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);

      const response = await request(app).get("/api/tasks/task-123");

      expect(response.status).toBe(200);
      expect(response.body.task).toEqual(mockTask);
    });

    it("should return 404 if task not found", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      const response = await request(app).get("/api/tasks/task-123");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Task not found");
    });
  });

  describe("POST /", () => {
    it("should create new task", async () => {
      mockPrisma.task.create.mockResolvedValue(mockTask);

      const response = await request(app).post("/api/tasks").send({
        title: "New Task",
        description: "Task description",
        dueDate: "2024-12-31",
        priority: "HIGH",
        subjectArea: "MATHEMATICS",
        estimatedTime: 2,
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Task created successfully");
      expect(response.body.task).toBeDefined();
    });
  });

  describe("PUT /:id", () => {
    it("should update task", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        title: "Updated Task",
      });

      const response = await request(app).put("/api/tasks/task-123").send({
        title: "Updated Task",
        description: "Updated description",
        dueDate: "2024-12-31",
        priority: "MEDIUM",
        subjectArea: "PHYSICS",
        estimatedTime: 3,
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task updated successfully");
    });

    it("should return 404 if task not found for update", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/tasks/task-123")
        .send({ title: "Updated Task" });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Task not found");
    });
  });

  describe("PUT /:id/status", () => {
    it("should update task status", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        status: "COMPLETED",
      });

      const response = await request(app)
        .put("/api/tasks/task-123/status")
        .send({ status: "COMPLETED" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task status updated successfully");
    });
  });

  describe("PUT /:id/complete", () => {
    it("should mark task as completed", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        status: "COMPLETED",
      });

      const response = await request(app).put("/api/tasks/task-123/complete");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task marked as completed");
    });
  });

  describe("DELETE /:id", () => {
    it("should delete task", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);
      mockPrisma.task.delete.mockResolvedValue(mockTask);

      const response = await request(app).delete("/api/tasks/task-123");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task deleted successfully");
    });

    it("should return 404 if task not found for deletion", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      const response = await request(app).delete("/api/tasks/task-123");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Task not found");
    });
  });
});
