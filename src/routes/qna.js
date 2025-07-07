import express from "express";
import { prisma } from "../lib/database.js";

const router = express.Router();

// Get all Q&A pairs for authenticated user
router.get("/questions", async (req, res, next) => {
  try {
    const questions = await prisma.question.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res.json({ questions });
  } catch (error) {
    next(error);
  }
});

// Create a new question

router.post("/questions", async (req, res, next) => {
  try {
    const { title, body, tags, subject } = req.body;
    const newQuestion = await prisma.question.create({
      data: {
        title: title,
        body: body || null,
        tags: tags || null,
        subject: subject || null,
        authorId: req.user.id,
      },
    });
    res.status(201).json({ question: newQuestion });
  } catch (error) {
    next(error);
  }
});
// Get a specific question by ID
router.get("/questions/:id", async (req, res, next) => {
  try {
    const question = await prisma.question.findFirst({
      where: {
        id: req.params.id,
        authorId: req.user.id,
      },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json({ question });
  } catch (error) {
    next(error);
  }
});
// Submit a new answer to a question
router.post("/questions/:id/answers", async (req, res, next) => {
  try {
    const { content } = req.body;
    const newAnswer = await prisma.answer.create({
      data: {
        content: content,
        questionId: req.params.id,
        authorId: req.user.id,
      },
    });
    res.status(201).json({ answer: newAnswer });
  } catch (error) {
    next(error);
  }
});
// vote on a question
router.post("/questions/:id/vote", async (req, res, next) => {
  try {
    const { voteType } = req.body; // 'UP' or 'DOWN'
    const question = await prisma.question.findFirst({
      where: {
        id: req.params.id,
      },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    await prisma.questionVote.create({
      data: {
        questionId: req.params.id,
        userId: req.user.id,
        voteType: voteType, // 'UP' or 'DOWN'
      },
    });
    res.status(201).json({ message: "Vote recorded successfully" });
  } catch (error) {
    next(error);
  }
});
// Vote on an answer
router.post(
  "/questions/:questionId/answers/:answerId/vote",
  async (req, res, next) => {
    try {
      const { voteType } = req.body; // 'UP' or 'DOWN'
      const answer = await prisma.answer.findFirst({
        where: {
          id: req.params.answerId,
          questionId: req.params.questionId,
        },
      });

      if (!answer) {
        return res.status(404).json({ error: "Answer not found" });
      }

      await prisma.answerVote.create({
        data: {
          answerId: req.params.answerId,
          userId: req.user.id,
          voteType: voteType, // 'UP' or 'DOWN'
        },
      });

      res.status(201).json({ message: "Vote recorded successfully" });
    } catch (error) {
      next(error);
    }
  }
);
export default router;
