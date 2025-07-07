import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import {
  mockPrisma,
  mockAuthMiddleware,
  mockUser,
  mockTasks,
  mockStudySessions,
} from "./setup.js";

// Mock validation middleware
jest.unstable_mockModule("../middleware/validation.js", () => ({
  validateCuidOrUUID: () => (req, res, next) => next(), // Skip ID validation
  handleValidationErrors: (req, res, next) => next(), // Skip validation errors handling
  validateTask: () => [], // Return empty array (no validation errors)
  validatePagination: () => [], // Return empty array (no validation errors)
}));

// Mock the authentication middleware before importing the routes
jest.unstable_mockModule("../middleware/auth.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = mockUser;
    next();
  },
}));

// Import the router after mocking
const { default: taskRoutes } = await import("../routes/tasks.js");

// Create test app
const app = express();
app.use(express.json());
// No need for mockAuthMiddleware here as authenticateToken is already mocked
app.use("/api/tasks", taskRoutes);

describe("Task Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/tasks", () => {
    it("should return all tasks for authenticated user", async () => {
      mockPrisma.task.findMany.mockResolvedValue(mockTasks);

      const response = await request(app).get("/api/tasks").expect(200);

      expect(response.body).toHaveProperty("tasks");
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0]).toHaveProperty("id", "task-1");
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should return a specific task", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTasks[0]);

      const response = await request(app).get("/api/tasks/task-1").expect(200);

      expect(response.body).toHaveProperty("task");
      expect(response.body.task.id).toBe("task-1");
      expect(mockPrisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: "task-1", userId: mockUser.id },
      });
    });

    it("should return 404 for non-existent task", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/tasks/nonexistent")
        .expect(404);

      expect(response.body).toHaveProperty("error", "Task not found");
    });
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const newTask = {
        title: "New Task",
        description: "Task description",
        dueDate: "2024-12-31",
        priority: "HIGH",
        subjectArea: "MATHEMATICS",
        estimatedTime: 2,
      };

      mockPrisma.task.create.mockResolvedValue({
        id: "task-2",
        ...newTask,
        userId: mockUser.id,
      });

      const response = await request(app)
        .post("/api/tasks")
        .send(newTask)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "Task created successfully"
      );
      expect(response.body).toHaveProperty("task");
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: newTask.title,
          userId: mockUser.id,
        }),
      });
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update an existing task", async () => {
      const updatedData = {
        title: "Updated Task",
        description: "Updated description",
        dueDate: "2024-12-31",
        priority: "MEDIUM",
        subjectArea: "SCIENCE",
        estimatedTime: 3,
      };

      mockPrisma.task.findFirst.mockResolvedValue(mockTasks[0]);
      mockPrisma.task.update.mockResolvedValue({
        ...mockTasks[0],
        ...updatedData,
      });

      const response = await request(app)
        .put("/api/tasks/task-1")
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Task updated successfully"
      );
      expect(response.body).toHaveProperty("task");
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: expect.objectContaining({
          title: updatedData.title,
        }),
      });
    });
  });

  describe("PUT /api/tasks/:id/status", () => {
    it("should update task status", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTasks[0]);
      mockPrisma.task.update.mockResolvedValue({
        ...mockTasks[0],
        status: "COMPLETED",
      });

      const response = await request(app)
        .put("/api/tasks/task-1/status")
        .send({ status: "COMPLETED" })
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Task status updated successfully"
      );
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: { status: "COMPLETED" },
      });
    });
  });

  describe("GET /api/tasks/today", () => {
    it("should return today's study sessions", async () => {
      mockPrisma.studySession.findMany.mockResolvedValue(mockStudySessions);

      const response = await request(app).get("/api/tasks/today").expect(200);

      expect(response.body).toHaveProperty("sessions");
      expect(response.body.sessions).toHaveLength(1);
      expect(mockPrisma.studySession.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          userId: mockUser.id,
        }),
      });
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTasks[0]);
      mockPrisma.task.delete.mockResolvedValue(mockTasks[0]);

      const response = await request(app)
        .delete("/api/tasks/task-1")
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Task deleted successfully"
      );
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: "task-1" },
      });
    });
  });

  describe("GET /api/tasks/generate", () => {
    it("should generate a schedule", async () => {
      // Mock tasks
      mockPrisma.task.findMany.mockResolvedValue([
        {
          id: "task-1",
          title: "Math Assignment",
          description: "Complete math problems",
          dueDate: new Date("2024-12-31"),
          priority: "HIGH",
          subjectArea: "MATHEMATICS",
          estimatedTime: 2,
        },
      ]);

      // Mock availability
      mockPrisma.availability.findMany.mockResolvedValue([
        {
          startTime: new Date("2024-01-01T09:00:00Z"),
          endTime: new Date("2024-01-01T12:00:00Z"),
        },
      ]);

      // Mock fetch for Flask API
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              taskId: "task-1",
              startTime: "2024-01-01T09:00:00Z",
              endTime: "2024-01-01T11:00:00Z",
              duration: 120,
              goal: "Complete math assignment",
            },
          ]),
      });

      // Mock the creation of study sessions
      mockPrisma.studySession.createMany.mockResolvedValue({ count: 1 });

      const response = await request(app)
        .get("/api/tasks/generate")
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Schedule generated successfully"
      );
      expect(response.body).toHaveProperty("schedule");
      expect(response.body.schedule).toHaveLength(1);

      // Verify deleteMany was called to clear old schedules
      expect(mockPrisma.studySession.deleteMany).toHaveBeenCalled();

      // Verify createMany was called to create new sessions
      expect(mockPrisma.studySession.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            taskId: "task-1",
            userId: mockUser.id,
          }),
        ]),
      });

      // Clean up
      global.fetch.mockRestore();
    });

    it("should return 404 if no tasks are found", async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/tasks/generate")
        .expect(404);

      expect(response.body).toHaveProperty(
        "error",
        "No tasks found for the user"
      );
    });
  });

  describe("PUT /api/tasks/:id/complete", () => {
    it("should mark a task as completed", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTasks[0]);
      mockPrisma.task.update.mockResolvedValue({
        ...mockTasks[0],
        status: "COMPLETED",
      });

      const response = await request(app)
        .put("/api/tasks/task-1/complete")
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Task marked as completed"
      );
      expect(response.body.task.status).toBe("COMPLETED");
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: "task-1" },
        data: { status: "COMPLETED" },
      });
    });

    it("should return 404 for non-existent task", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/tasks/nonexistent/complete")
        .expect(404);

      expect(response.body).toHaveProperty("error", "Task not found");
    });
  });
});
