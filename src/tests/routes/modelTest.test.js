import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import {
  mockPrisma,
  mockAuthMiddleware,
  mockUser,
  mockModelTest,
  mockQuestion,
  mockTestAttempt,
} from "../setup.js";

// Import the router
const { default: modelTestRouter } = await import("../../routes/modelTest.js");

const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);
app.use("/api/model-tests", modelTestRouter);

describe("Model Test Routes", () => {
  describe("GET /", () => {
    it("should get user's past model tests", async () => {
      mockPrisma.modelTest.findMany.mockResolvedValue([mockModelTest]);

      const response = await request(app).get("/api/model-tests");

      expect(response.status).toBe(200);
      expect(response.body.modelTests).toHaveLength(1);
      expect(mockPrisma.modelTest.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        include: {
          assignments: true,
          attempts: {
            where: { userId: mockUser.id },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("POST /generate", () => {
    it("should generate a new model test", async () => {
      mockPrisma.questionBank.findMany.mockResolvedValue([mockQuestion]);
      mockPrisma.modelTest.create.mockResolvedValue(mockModelTest);

      const response = await request(app)
        .post("/api/model-tests/generate")
        .send({
          subjects: ["MATHEMATICS"],
          topics: ["algebra"],
          difficulty: "MEDIUM",
          timeLimit: 60,
          questionCount: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body.modelTest).toBeDefined();
      expect(mockPrisma.questionBank.findMany).toHaveBeenCalled();
      expect(mockPrisma.modelTest.create).toHaveBeenCalled();
    });

    it("should return error if no subjects provided", async () => {
      const response = await request(app)
        .post("/api/model-tests/generate")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("At least one subject is required");
    });

    it("should return error if insufficient questions available", async () => {
      mockPrisma.questionBank.findMany.mockResolvedValue([]);

      const response = await request(app)
        .post("/api/model-tests/generate")
        .send({
          subjects: ["MATHEMATICS"],
          questionCount: 20,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Only 0 questions available");
    });
  });

  describe("POST /:id/start", () => {
    it("should start a test attempt", async () => {
      const testWithAssignments = {
        ...mockModelTest,
        assignments: [{ question: mockQuestion, points: 5 }],
      };
      mockPrisma.modelTest.findFirst.mockResolvedValue(testWithAssignments);
      mockPrisma.testAttempt.create.mockResolvedValue(mockTestAttempt);

      const response = await request(app).post(
        "/api/model-tests/test-123/start"
      );

      expect(response.status).toBe(200);
      expect(response.body.attemptId).toBe(mockTestAttempt.id);
      expect(response.body.questions).toHaveLength(1);
      expect(response.body.questions[0]).not.toHaveProperty("correctAnswer");
    });

    it("should return 404 if test not found", async () => {
      mockPrisma.modelTest.findFirst.mockResolvedValue(null);

      const response = await request(app).post(
        "/api/model-tests/test-123/start"
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Model test not found");
    });
  });

  describe("POST /attempt/:attemptId/answer", () => {
    it("should save individual question answer", async () => {
      mockPrisma.testAttempt.findFirst.mockResolvedValue(mockTestAttempt);
      mockPrisma.testAttempt.update.mockResolvedValue(mockTestAttempt);

      const response = await request(app)
        .post("/api/model-tests/attempt/attempt-123/answer")
        .send({
          questionId: "question-123",
          answer: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.testAttempt.update).toHaveBeenCalled();
    });

    it("should return 404 if attempt not found", async () => {
      mockPrisma.testAttempt.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/model-tests/attempt/attempt-123/answer")
        .send({
          questionId: "question-123",
          answer: 2,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Active test attempt not found");
    });
  });

  describe("POST /attempt/:attemptId/submit", () => {
    it("should submit test attempt", async () => {
      const attemptWithTest = {
        ...mockTestAttempt,
        test: {
          ...mockModelTest,
          assignments: [{ question: mockQuestion, points: 5 }],
        },
      };
      mockPrisma.testAttempt.findFirst.mockResolvedValue(attemptWithTest);
      mockPrisma.testAttempt.update.mockResolvedValue({
        ...mockTestAttempt,
        status: "COMPLETED",
        score: 5,
        correctAnswers: 1,
      });

      const response = await request(app)
        .post("/api/model-tests/attempt/attempt-123/submit")
        .send({
          answers: { "question-123": 2 },
          timeSpent: 30,
        });

      expect(response.status).toBe(200);
      expect(response.body.score).toBeDefined();
      expect(response.body.passed).toBeDefined();
      expect(response.body.percentage).toBeDefined();
    });

    it("should handle auto-submit", async () => {
      const attemptWithTest = {
        ...mockTestAttempt,
        answers: '{"question-123": 2}',
        test: {
          ...mockModelTest,
          assignments: [{ question: mockQuestion, points: 5 }],
        },
      };
      mockPrisma.testAttempt.findFirst.mockResolvedValue(attemptWithTest);
      mockPrisma.testAttempt.update.mockResolvedValue({
        ...mockTestAttempt,
        status: "COMPLETED",
        autoSubmitted: true,
      });

      const response = await request(app)
        .post("/api/model-tests/attempt/attempt-123/submit")
        .send({
          autoSubmit: true,
          timeSpent: 60,
        });

      expect(response.status).toBe(200);
      expect(response.body.autoSubmitted).toBe(true);
    });
  });

  describe("GET /attempt/:attemptId/results", () => {
    it("should get attempt results", async () => {
      const completedAttempt = {
        ...mockTestAttempt,
        status: "COMPLETED",
        test: {
          ...mockModelTest,
          assignments: [{ question: mockQuestion, points: 5 }],
        },
      };
      mockPrisma.testAttempt.findFirst.mockResolvedValue(completedAttempt);

      const response = await request(app).get(
        "/api/model-tests/attempt/attempt-123/results"
      );

      expect(response.status).toBe(200);
      expect(response.body.attempt).toBeDefined();
      expect(response.body.test).toBeDefined();
      expect(response.body.questions).toHaveLength(1);
      expect(response.body.questions[0].correctAnswer).toBeDefined();
    });

    it("should return 404 if completed attempt not found", async () => {
      mockPrisma.testAttempt.findFirst.mockResolvedValue(null);

      const response = await request(app).get(
        "/api/model-tests/attempt/attempt-123/results"
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Completed attempt not found");
    });
  });

  describe("GET /:id/attempts", () => {
    it("should get user's attempts for a specific test", async () => {
      mockPrisma.testAttempt.findMany.mockResolvedValue([mockTestAttempt]);

      const response = await request(app).get(
        "/api/model-tests/test-123/attempts"
      );

      expect(response.status).toBe(200);
      expect(response.body.attempts).toHaveLength(1);
      expect(mockPrisma.testAttempt.findMany).toHaveBeenCalledWith({
        where: {
          testId: "test-123",
          userId: mockUser.id,
          status: "COMPLETED",
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          score: true,
          correctAnswers: true,
          totalQuestions: true,
          timeSpent: true,
          createdAt: true,
        },
      });
    });
  });
});
