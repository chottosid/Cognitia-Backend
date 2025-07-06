import express from "express";
import { body, query } from "express-validator";
import {
  handleValidationErrors,
  validateTask,
  validateCuidOrUUID,
  validatePagination,
} from "../middleware/validation.js";
import { prisma } from "../lib/database.js";

const router = express.Router();

// // Get all model tests for authenticated user
// router.get("/", async (req, res, next) => {
//   try {
//     // If you want to show all model tests (not just user-created), remove the where clause
//     // If you want to show only the user's model tests, use: where: { createdById: req.user.id }
//     const modelTests = await prisma.modelTest.findMany({
//       // Uncomment the next line if you want only user-created tests
//       // where: { createdById: req.user.id },
//       orderBy: { createdAt: "desc" }
//     });
//     res.json({ modelTests });
//   } catch (error) {
//     next(error);
//   }
// });

router.get("/", async (req, res, next) => {
  try {
    const modelTests = await prisma.modelTest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        model_test_questions: true, // include the join table
      }
    });

    // Add questionsCount property to each test
    const modelTestsWithCount = modelTests.map(test => ({
      ...test,
      questionsCount: test.model_test_questions.length
    }));

    res.json({ modelTests: modelTestsWithCount });
  } catch (error) {
    next(error);
  }
});

// In modelTest.js
router.get("/:id", async (req, res, next) => {
  try {
    const modelTest = await prisma.modelTest.findUnique({
      where: { id: req.params.id }
    });
    if (!modelTest) return res.status(404).json({ error: "Test not found" });
    res.json({ modelTest });
  } catch (error) {
    next(error);
  }
});

// Get questions for a specific model test
router.get("/:id/questions", async (req, res, next) => {
  try {
    const modelTestId = req.params.id;
    // Fetch all model_test_questions for this model test, including the test_questions relation
    const links = await prisma.model_test_questions.findMany({
      where: { modelTestId },
      orderBy: { order: "asc" },
      include: {
        test_questions: true
      }
    });

    // Format questions to match frontend expectations
    const questions = links.map(link => {
      const q = link.test_questions;
      return {
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : (typeof q.options === "string" ? JSON.parse(q.options) : []),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        subject: q.subject,
        topic: q.topics && q.topics.length > 0 ? q.topics[0] : "", // or handle as array
        points: q.points
      };
    });

    res.json({ questions });
  } catch (error) {
    next(error);
  }
});

// Get a test attempt result by attempt ID
router.get("/attempt/:id", async (req, res, next) => {
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: req.params.id },
      include: {
        test: {
          include: {
            model_test_questions: {
              include: { test_questions: true }
            }
          }
        },
        user: true,
      },
    });
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    // Map questions into the format expected by the frontend
    const questions = (attempt.test.model_test_questions || []).map(link => {
      const q = link.test_questions;
      return {
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : (typeof q.options === "string" ? JSON.parse(q.options) : []),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        subject: q.subject,
        topic: q.topics && q.topics.length > 0 ? q.topics[0] : "",
        points: q.points
      };
    });
    // Attach questions array to test object
    attempt.test.questions = questions;
    // Optionally remove model_test_questions to avoid confusion
    delete attempt.test.model_test_questions;

    res.json({ attempt });
  } catch (error) {
    next(error);
  }
});

// Create a new test attempt
router.post("/attempt", async (req, res, next) => {
  try {
    const userId = req.user?.id || req.body.userId; // Use authenticated user if available, fallback to body
    const { testId, answers, timeSpent } = req.body;
    if (!testId || !answers) {
      return res.status(400).json({ error: "testId and answers are required" });
    }
    // Fetch the test to get totalPoints, passingScore, and questions
    const test = await prisma.modelTest.findUnique({ where: { id: testId } });
    if (!test) return res.status(404).json({ error: "Test not found" });
    // Calculate score and correct answers
    let score = 0;
    let correctAnswers = 0;
    let totalQuestions = 0;
    let parsedAnswers = answers;
    if (typeof answers === "string") {
      parsedAnswers = JSON.parse(answers);
    }
    // You may want to fetch the questions from the join table
    const links = await prisma.model_test_questions.findMany({
      where: { modelTestId: testId },
      include: { test_questions: true },
    });
    totalQuestions = links.length;
    links.forEach(link => {
      const q = link.test_questions;
      const userAnswer = parsedAnswers[q.id];
      if (userAnswer !== undefined && userAnswer === q.correctAnswer) {
        score += q.points || 1;
        correctAnswers++;
      }
    });
    // Create the attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        testId,
        userId,
        answers: JSON.stringify(parsedAnswers),
        timeSpent: timeSpent || 0,
        score,
        correctAnswers,
        totalQuestions,
        startTime: new Date(),
        endTime: new Date(),
        status: "COMPLETED",
      },
    });
    res.json({ attemptId: attempt.id });
  } catch (error) {
    next(error);
  }
});


export default router;