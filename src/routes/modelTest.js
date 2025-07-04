import express from "express";
import { body, query } from "express-validator";
import {
  handleValidationErrors,
  validateTask,
  validateUUID,
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
        options: q.options, // should be an array (Json in Prisma)
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


export default router;