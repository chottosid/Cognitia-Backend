import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import { mockPrisma, mockAuthMiddleware, mockUser } from "./setup.js";
import {
  mockModelTests,
  mockTestQuestions,
  mockModelTestQuestions,
  mockTestAttempt,
} from "./mockData.js";

// Import the router after mocking
const { default: modelTestRoutes } = await import("../routes/modelTest.js");

// Create test app
const app = express();
app.use(express.json());
app.use("/api/model-test", mockAuthMiddleware, modelTestRoutes);

describe("Model Test Routes", () => {
  describe("GET /api/model-test", () => {
    it("should return all model tests with question counts", async () => {
      mockPrisma.modelTest.findMany.mockResolvedValue(mockModelTests);

      const response = await request(app).get("/api/model-test").expect(200);

      expect(response.body).toHaveProperty("modelTests");
      expect(response.body.modelTests).toHaveLength(2);
      expect(response.body.modelTests[0]).toHaveProperty("questionsCount", 2);
      expect(response.body.modelTests[1]).toHaveProperty("questionsCount", 1);

      expect(mockPrisma.modelTest.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
        include: {
          model_test_questions: true,
        },
      });
    });
  });

  describe("GET /api/model-test/:id", () => {
    it("should return a specific model test", async () => {
      mockPrisma.modelTest.findUnique.mockResolvedValue(mockModelTests[0]);

      const response = await request(app)
        .get("/api/model-test/test-1")
        .expect(200);

      expect(response.body).toHaveProperty("modelTest");
      expect(response.body.modelTest.id).toBe("test-1");
      expect(response.body.modelTest.title).toBe("Mathematics Test");

      expect(mockPrisma.modelTest.findUnique).toHaveBeenCalledWith({
        where: { id: "test-1" },
      });
    });

    it("should return 404 for non-existent test", async () => {
      mockPrisma.modelTest.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/model-test/non-existent")
        .expect(404);

      expect(response.body).toHaveProperty("error", "Test not found");
    });
  });

  describe("GET /api/model-test/:id/questions", () => {
    it("should return questions for a specific test", async () => {
      mockPrisma.model_test_questions.findMany.mockResolvedValue(
        mockModelTestQuestions
      );

      const response = await request(app)
        .get("/api/model-test/test-1/questions")
        .expect(200);

      expect(response.body).toHaveProperty("questions");
      expect(response.body.questions).toHaveLength(2);
      expect(response.body.questions[0]).toHaveProperty("id", "q1");
      expect(response.body.questions[0]).toHaveProperty(
        "question",
        "What is 2 + 2?"
      );
      expect(response.body.questions[0]).toHaveProperty("options");
      expect(response.body.questions[0]).toHaveProperty("correctAnswer", 1);

      expect(mockPrisma.model_test_questions.findMany).toHaveBeenCalledWith({
        where: { modelTestId: "test-1" },
        orderBy: { order: "asc" },
        include: {
          test_questions: true,
        },
      });
    });

    it("should handle questions with string options", async () => {
      const mockQuestionsWithStringOptions = [
        {
          ...mockModelTestQuestions[0],
          test_questions: {
            ...mockModelTestQuestions[0].test_questions,
            options: JSON.stringify(["3", "4", "5", "6"]),
          },
        },
      ];

      mockPrisma.model_test_questions.findMany.mockResolvedValue(
        mockQuestionsWithStringOptions
      );

      const response = await request(app)
        .get("/api/model-test/test-1/questions")
        .expect(200);

      expect(response.body.questions[0].options).toEqual(["3", "4", "5", "6"]);
    });

    it("should return empty array for test with no questions", async () => {
      mockPrisma.model_test_questions.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/model-test/test-1/questions")
        .expect(200);

      expect(response.body.questions).toEqual([]);
    });
  });

  describe("GET /api/model-test/attempt/:id", () => {
    it("should return test attempt with questions", async () => {
      mockPrisma.testAttempt.findUnique.mockResolvedValue(mockTestAttempt);

      const response = await request(app)
        .get("/api/model-test/attempt/attempt-1")
        .expect(200);

      expect(response.body).toHaveProperty("attempt");
      expect(response.body.attempt.id).toBe("attempt-1");
      expect(response.body.attempt.test).toHaveProperty("questions");
      expect(response.body.attempt.test.questions).toHaveLength(2);
      expect(response.body.attempt.test).not.toHaveProperty(
        "model_test_questions"
      );

      expect(mockPrisma.testAttempt.findUnique).toHaveBeenCalledWith({
        where: { id: "attempt-1" },
        include: {
          test: {
            include: {
              model_test_questions: {
                include: { test_questions: true },
              },
            },
          },
          user: true,
        },
      });
    });

    it("should return 404 for non-existent attempt", async () => {
      mockPrisma.testAttempt.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/model-test/attempt/non-existent")
        .expect(404);

      expect(response.body).toHaveProperty("error", "Attempt not found");
    });
  });

  describe("POST /api/model-test/attempt", () => {
    it("should create a new test attempt", async () => {
      const testData = {
        testId: "test-1",
        answers: { q1: 1, q2: 0 },
        timeSpent: 3600,
      };

      mockPrisma.modelTest.findUnique.mockResolvedValue(mockModelTests[0]);
      mockPrisma.model_test_questions.findMany.mockResolvedValue(
        mockModelTestQuestions
      );
      mockPrisma.testAttempt.create.mockResolvedValue({
        id: "new-attempt-1",
        ...testData,
      });

      const response = await request(app)
        .post("/api/model-test/attempt")
        .send(testData)
        .expect(200);

      expect(response.body).toHaveProperty("attemptId", "new-attempt-1");

      expect(mockPrisma.testAttempt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          testId: "test-1",
          userId: "user-123",
          answers: JSON.stringify(testData.answers),
          timeSpent: 3600,
          status: "COMPLETED",
        }),
      });
    });

    it("should handle string answers", async () => {
      const testData = {
        testId: "test-1",
        answers: JSON.stringify({ q1: 1, q2: 0 }),
        timeSpent: 3600,
      };

      mockPrisma.modelTest.findUnique.mockResolvedValue(mockModelTests[0]);
      mockPrisma.model_test_questions.findMany.mockResolvedValue(
        mockModelTestQuestions
      );
      mockPrisma.testAttempt.create.mockResolvedValue({
        id: "new-attempt-2",
        ...testData,
      });

      const response = await request(app)
        .post("/api/model-test/attempt")
        .send(testData)
        .expect(200);

      expect(response.body).toHaveProperty("attemptId", "new-attempt-2");
    });

    it("should calculate correct score", async () => {
      const testData = {
        testId: "test-1",
        answers: { q1: 1, q2: 0 }, // Both correct
        timeSpent: 3600,
      };

      mockPrisma.modelTest.findUnique.mockResolvedValue(mockModelTests[0]);
      mockPrisma.model_test_questions.findMany.mockResolvedValue(
        mockModelTestQuestions
      );
      mockPrisma.testAttempt.create.mockResolvedValue({
        id: "new-attempt-3",
        ...testData,
      });

      await request(app)
        .post("/api/model-test/attempt")
        .send(testData)
        .expect(200);

      expect(mockPrisma.testAttempt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          score: 15, // 5 + 10 points
          correctAnswers: 2,
          totalQuestions: 2,
        }),
      });
    });

    it("should return 400 for missing testId", async () => {
      const testData = {
        answers: { q1: 1 },
      };

      const response = await request(app)
        .post("/api/model-test/attempt")
        .send(testData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "testId and answers are required"
      );
    });

    it("should return 400 for missing answers", async () => {
      const testData = {
        testId: "test-1",
      };

      const response = await request(app)
        .post("/api/model-test/attempt")
        .send(testData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "testId and answers are required"
      );
    });

    it("should return 404 for non-existent test", async () => {
      mockPrisma.modelTest.findUnique.mockResolvedValue(null);

      const testData = {
        testId: "non-existent",
        answers: { q1: 1 },
      };

      const response = await request(app)
        .post("/api/model-test/attempt")
        .send(testData)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Test not found");
    });

    it("should handle userId from request body when no auth user", async () => {
      // Create app without auth middleware
      const noAuthApp = express();
      noAuthApp.use(express.json());
      noAuthApp.use("/api/model-test", modelTestRoutes);

      const testData = {
        testId: "test-1",
        userId: "manual-user-123",
        answers: { q1: 1 },
      };

      mockPrisma.modelTest.findUnique.mockResolvedValue(mockModelTests[0]);
      mockPrisma.model_test_questions.findMany.mockResolvedValue([
        mockModelTestQuestions[0],
      ]);
      mockPrisma.testAttempt.create.mockResolvedValue({
        id: "new-attempt-4",
        ...testData,
      });

      const response = await request(noAuthApp)
        .post("/api/model-test/attempt")
        .send(testData)
        .expect(200);

      expect(response.body).toHaveProperty("attemptId", "new-attempt-4");
      expect(mockPrisma.testAttempt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "manual-user-123",
        }),
      });
    });
  });
});
