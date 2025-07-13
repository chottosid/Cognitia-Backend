import express from "express";
import { prisma } from "../lib/database.js";

const router = express.Router();

// Get user's past model tests
router.get("/", async (req, res, next) => {
  try {
    const modelTests = await prisma.modelTest.findMany({
      where: { userId: req.user.id },
      include: {
        assignments: { include: { question: true } },
        attempts: {
          where: { userId: req.user.id },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const simplifiedModelTests = modelTests.map((test) => ({
      ...test,
      questions: test.assignments.map((assignment) => ({
        id: assignment.question.id,
        question: assignment.question.question,
        options: assignment.question.options,
        subject: assignment.question.subject,
        topics: assignment.question.topics,
        points: assignment.points,
      })),
      assignments: undefined, // Remove assignments
    }));

    res.json({ modelTests: simplifiedModelTests });
  } catch (error) {
    next(error);
  }
});

// Fetch detailed information about a specific model test
router.get("/:id", async (req, res, next) => {
  try {
    const modelTest = await prisma.modelTest.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        assignments: { include: { question: true } },
        attempts: {
          where: { userId: req.user.id },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!modelTest) {
      return res.status(404).json({ error: "Model test not found" });
    }

    const detailedModelTest = {
      ...modelTest,
      questions: modelTest.assignments.map((assignment) => ({
        id: assignment.question.id,
        question: assignment.question.question,
        options: assignment.question.options,
        correctAnswer: assignment.question.correctAnswer,
        explanation: assignment.question.explanation,
        subject: assignment.question.subject,
        topics: assignment.question.topics,
        points: assignment.points,
      })),
      attempts: modelTest.attempts.map((attempt) => ({
        id: attempt.id,
        status: attempt.status,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        timeSpent: attempt.timeSpent,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        createdAt: attempt.createdAt,
      })),
      assignments: undefined, // Remove assignments
    };

    res.json({ modelTest: detailedModelTest });
  } catch (error) {
    next(error);
  }
});

// Generate a new model test based on criteria
router.post("/generate", async (req, res, next) => {
  try {
    const {
      subjects = [],
      topics = [],
      difficulty = "MEDIUM",
      timeLimit = 60,
      questionCount = 20,
    } = req.body;

    if (!subjects.length) {
      return res
        .status(400)
        .json({ error: "At least one subject is required" });
    }

    const where = { difficulty, subject: { in: subjects } };
    if (topics.length) where.topics = { hasSome: topics };

    const availableQuestions = await prisma.questionBank.findMany({
      where,
      take: questionCount,
      orderBy: { createdAt: "desc" },
    });

    if (availableQuestions.length < questionCount) {
      return res.status(400).json({
        error: `Only ${availableQuestions.length} questions available. Requested ${questionCount}.`,
      });
    }

    const totalPoints = availableQuestions.length * 5;
    const passingScore = Math.ceil(totalPoints * 0.6);

    const modelTest = await prisma.modelTest.create({
      data: {
        title: `Generated Test - ${subjects.join(", ")}`,
        description: `Auto-generated test for ${subjects.join(
          ", "
        )} (${difficulty})`,
        timeLimit,
        subjects,
        topics,
        difficulty,
        isCustom: false,
        passingScore,
        totalPoints,
        userId: req.user.id,
        assignments: {
          create: availableQuestions.map((question) => ({
            questionId: question.id,
            points: 5,
          })),
        },
      },
      include: { assignments: { include: { question: true } } },
    });

    const simplifiedModelTest = {
      id: modelTest.id,
      title: modelTest.title,
      description: modelTest.description,
      timeLimit: modelTest.timeLimit,
      subjects: modelTest.subjects,
      topics: modelTest.topics,
      difficulty: modelTest.difficulty,
      passingScore: modelTest.passingScore,
      totalPoints: modelTest.totalPoints,
      questions: modelTest.assignments.map((assignment) => ({
        id: assignment.question.id,
        question: assignment.question.question,
        options: assignment.question.options,
        subject: assignment.question.subject,
        topics: assignment.question.topics,
        points: assignment.points,
      })),
    };

    res.status(201).json({ modelTest: simplifiedModelTest });
  } catch (error) {
    next(error);
  }
});

// Start a test attempt
router.post("/:id/start", async (req, res, next) => {
  try {
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId: req.params.id,
        userId: req.user.id,
        status: "IN_PROGRESS",
      },
    });

    if (existingAttempt) {
      return res.status(400).json({ error: "Test is already in progress" });
    }

    const test = await prisma.modelTest.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { assignments: { include: { question: true } } },
    });

    if (!test) {
      return res.status(404).json({ error: "Model test not found" });
    }

    if (!test.assignments.length) {
      return res.status(400).json({ error: "Test has no questions" });
    }

    const attempt = await prisma.testAttempt.create({
      data: {
        testId: req.params.id,
        userId: req.user.id,
        totalQuestions: test.assignments.length,
        status: "IN_PROGRESS",
      },
    });

    const questions = test.assignments.map((assignment, index) => ({
      id: assignment.question.id,
      question: assignment.question.question,
      options: assignment.question.options,
      points: assignment.points,
      number: index + 1,
    }));

    res.json({
      attemptId: attempt.id,
      timeLimit: test.timeLimit,
      questions,
      totalPoints: test.totalPoints,
    });
  } catch (error) {
    next(error);
  }
});

// Save answer for a specific question during test
router.post("/attempt/:attemptId/answer", async (req, res, next) => {
  try {
    const { questionId, answer } = req.body;

    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: req.params.attemptId,
        status: "IN_PROGRESS",
        test: { userId: req.user.id },
      },
      include: { test: { include: { assignments: true } } },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Active test attempt not found" });
    }

    const questionExists = attempt.test.assignments.some(
      (assignment) => assignment.questionId === questionId
    );

    if (!questionExists) {
      return res
        .status(400)
        .json({ error: "Question does not belong to this test attempt" });
    }

    const existingAnswers = attempt.answers ? JSON.parse(attempt.answers) : {};
    existingAnswers[questionId] = answer;

    await prisma.testAttempt.update({
      where: { id: req.params.attemptId },
      data: {
        answers: JSON.stringify(existingAnswers),
        lastActivity: new Date(),
      },
    });

    res.json({ success: true, message: "Answer saved" });
  } catch (error) {
    next(error);
  }
});

// Submit test attempt
router.post("/attempt/:attemptId/submit", async (req, res, next) => {
  try {
    const { answers, timeSpent, autoSubmit = false } = req.body;

    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: req.params.attemptId,
        status: "IN_PROGRESS",
        test: { userId: req.user.id },
      },
      include: {
        test: {
          include: { assignments: { include: { question: true } } },
        },
      },
    });

    if (!attempt) {
      return res
        .status(404)
        .json({ error: "Test attempt not found or already completed" });
    }

    let finalAnswers = answers;
    if (!finalAnswers && attempt.answers) {
      finalAnswers = JSON.parse(attempt.answers);
    } else if (answers && attempt.answers) {
      const existingAnswers = JSON.parse(attempt.answers);
      finalAnswers = { ...existingAnswers, ...answers };
    }

    let score = 0;
    let correctAnswers = 0;

    attempt.test.assignments.forEach((assignment) => {
      const userAnswer = finalAnswers?.[assignment.question.id];
      if (userAnswer === assignment.question.correctAnswer) {
        score += assignment.points;
        correctAnswers++;
      }
    });

    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: req.params.attemptId },
      data: {
        answers: JSON.stringify(finalAnswers || {}),
        timeSpent: timeSpent || 0,
        score,
        correctAnswers,
        endTime: new Date(),
        status: "COMPLETED",
        autoSubmitted: autoSubmit,
      },
    });

    res.json({
      success: true,
      message: "Test attempt submitted successfully",
      score,
      correctAnswers,
      totalQuestions: attempt.totalQuestions,
      passed: score >= attempt.test.passingScore,
    });
  } catch (error) {
    next(error);
  }
});

// Get attempt results with detailed answers
router.get("/attempt/:attemptId/results", async (req, res, next) => {
  try {
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: req.params.attemptId,
        status: "COMPLETED",
        test: { userId: req.user.id },
      },
      include: {
        test: {
          include: {
            assignments: {
              include: { question: true },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Completed attempt not found" });
    }

    const userAnswers = JSON.parse(attempt.answers);

    const questions = attempt.test.assignments.map((assignment, index) => {
      const q = assignment.question;
      const userAnswer = userAnswers[q.id];

      return {
        number: index + 1,
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer,
        isCorrect: userAnswer === q.correctAnswer,
        explanation: q.explanation,
        subject: q.subject,
        topics: q.topics,
        points: assignment.points,
      };
    });

    res.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        timeSpent: attempt.timeSpent,
        passed: attempt.score >= attempt.test.passingScore,
        percentage: Math.round(
          (attempt.score / attempt.test.totalPoints) * 100
        ),
      },
      test: {
        title: attempt.test.title,
        totalPoints: attempt.test.totalPoints,
        passingScore: attempt.test.passingScore,
      },
      questions,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's attempts for a specific test
router.get("/:id/attempts", async (req, res, next) => {
  try {
    const test = await prisma.modelTest.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!test) {
      return res.status(404).json({ error: "Model test not found" });
    }

    const attempts = await prisma.testAttempt.findMany({
      where: {
        testId: req.params.id,
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

    res.json({ attempts });
  } catch (error) {
    next(error);
  }
});

// Delete a specific model test
router.delete("/:id", async (req, res, next) => {
  try {
    const modelTest = await prisma.modelTest.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!modelTest) {
      return res.status(404).json({ error: "Model test not found" });
    }

    await prisma.modelTest.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: "Model test deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Get user's overall test statistics
router.get("/stats", async (req, res, next) => {
  try {
    const userTests = await prisma.modelTest.findMany({
      where: { userId: req.user.id },
      include: {
        attempts: {
          where: { status: "COMPLETED" },
        },
      },
    });

    const allAttempts = userTests.flatMap((test) => test.attempts);

    const totalAttempts = allAttempts.length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(
            allAttempts.reduce(
              (sum, attempt) => sum + (attempt.score || 0),
              0
            ) / totalAttempts
          )
        : 0;
    const averageTimeSpent =
      totalAttempts > 0
        ? Math.round(
            allAttempts.reduce(
              (sum, attempt) => sum + (attempt.timeSpent || 0),
              0
            ) / totalAttempts
          )
        : 0;
    const highestScore =
      totalAttempts > 0
        ? Math.max(...allAttempts.map((attempt) => attempt.score || 0))
        : 0;
    const lowestScore =
      totalAttempts > 0
        ? Math.min(...allAttempts.map((attempt) => attempt.score || 0))
        : 0;

    res.json({
      totalAttempts,
      totalTests: userTests.length,
      averageScore,
      averageTimeSpent,
      highestScore,
      lowestScore,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's recent attempts across all tests
router.get("/recent-attempts", async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const userTests = await prisma.modelTest.findMany({
      where: { userId: req.user.id },
      include: {
        attempts: {
          orderBy: { createdAt: "desc" },
          take: parseInt(limit),
        },
      },
    });

    const allAttempts = userTests
      .flatMap((test) =>
        test.attempts.map((attempt) => ({
          ...attempt,
          test: { title: test.title, totalPoints: test.totalPoints },
        }))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit));

    res.json({ attempts: allAttempts });
  } catch (error) {
    next(error);
  }
});

// Resume an in-progress test
router.get("/attempt/:attemptId/resume", async (req, res, next) => {
  try {
    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: req.params.attemptId,
        status: "IN_PROGRESS",
        test: { userId: req.user.id },
      },
      include: {
        test: {
          include: { assignments: { include: { question: true } } },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Active test attempt not found" });
    }

    const questions = attempt.test.assignments.map((assignment, index) => ({
      id: assignment.question.id,
      question: assignment.question.question,
      options: assignment.question.options,
      points: assignment.points,
      number: index + 1,
    }));

    const savedAnswers = attempt.answers ? JSON.parse(attempt.answers) : {};

    res.json({
      attemptId: attempt.id,
      timeLimit: attempt.test.timeLimit,
      startTime: attempt.startTime,
      lastActivity: attempt.lastActivity,
      questions,
      savedAnswers,
      totalPoints: attempt.test.totalPoints,
    });
  } catch (error) {
    next(error);
  }
});

export default router;