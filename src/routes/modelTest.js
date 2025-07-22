import express from "express";
import { prisma } from "../lib/database.js";

const router = express.Router();

// Get user's past model tests
router.get("/", async (req, res, next) => {
  try {
    const { subjects, difficulty } = req.query;

    const filters = { userId: req.user.id };
    if (subjects) filters.subjects = { hasSome: subjects.split(",") };
    if (difficulty) filters.difficulty = difficulty;

    const modelTests = await prisma.modelTest.findMany({
      where: filters,
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

router.get("/recent-attempts", async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    // Get user's recent attempts across all their tests
    const attempts = await prisma.testAttempt.findMany({
      where: {
        userId: req.user.id,
        status: "COMPLETED",
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            totalPoints: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
    });

    const formattedAttempts = attempts.map((attempt) => ({
      id: attempt.id,
      testId: attempt.testId,
      score: attempt.score,
      status: attempt.status,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      timeSpent: attempt.timeSpent,
      test: attempt.test,
    }));

    res.json({ attempts: formattedAttempts });
  } catch (error) {
    console.error("Error in recent-attempts route:", error);
    next(error);
  }
});

router.post("/attempt/:attemptId/submit", async (req, res, next) => {
  try {
    const { answers, timeSpent, autoSubmit = false } = req.body;

    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: req.params.attemptId,
        status: "IN_PROGRESS",
        userId: req.user.id,
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

    let finalAnswers = answers || {};

    // Fix: Handle Json type from schema properly
    if (attempt.answers) {
      let existingAnswers = {};
      if (typeof attempt.answers === "object") {
        existingAnswers = attempt.answers;
      } else if (typeof attempt.answers === "string") {
        try {
          existingAnswers = JSON.parse(attempt.answers);
        } catch (parseError) {
          console.error("Error parsing existing answers:", parseError);
        }
      }
      finalAnswers = { ...existingAnswers, ...finalAnswers };
    }

    let score = 0;
    let correctAnswers = 0;

    attempt.test.assignments.forEach((assignment) => {
      const userAnswer = finalAnswers[assignment.question.id];
      if (
        userAnswer !== undefined &&
        userAnswer === assignment.question.correctAnswer
      ) {
        score += assignment.points;
        correctAnswers++;
      }
    });

    const updatedAttempt = await prisma.testAttempt.update({
      where: { id: req.params.attemptId },
      data: {
        answers: finalAnswers, // Let Prisma handle Json type
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
    console.error("Error in submit route:", error);
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
router.post("/create", async (req, res, next) => {
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

    const difficultyDistribution = {
      EASY: { easy: 0.7, medium: 0.2, hard: 0.1 },
      MEDIUM: { easy: 0.3, medium: 0.5, hard: 0.2 },
      HARD: { easy: 0.1, medium: 0.3, hard: 0.6 },
    };

    const distribution =
      difficultyDistribution[difficulty] || difficultyDistribution["MEDIUM"];
    const questionCounts = {
      easy: Math.round(questionCount * distribution.easy),
      medium: Math.round(questionCount * distribution.medium),
      hard: Math.round(questionCount * distribution.hard),
    };

    const whereBase = { subject: { in: subjects } };
    if (topics.length) whereBase.topics = { hasSome: topics };

    const fetchQuestions = async (level, count) => {
      return await prisma.questionBank.findMany({
        where: { ...whereBase, difficulty: level },
        take: count,
        orderBy: { createdAt: "desc" },
      });
    };

    const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
      fetchQuestions("EASY", questionCounts.easy),
      fetchQuestions("MEDIUM", questionCounts.medium),
      fetchQuestions("HARD", questionCounts.hard),
    ]);

    const allQuestions = [
      ...easyQuestions,
      ...mediumQuestions,
      ...hardQuestions,
    ];

    if (allQuestions.length < questionCount) {
      return res.status(400).json({
        error: `Only ${allQuestions.length} questions available. Requested ${questionCount}.`,
      });
    }

    const selectedQuestions = allQuestions.slice(0, questionCount);
    const totalPoints = selectedQuestions.length * 5;
    const passingScore = Math.ceil(totalPoints * 0.6);

    const modelTest = await prisma.modelTest.create({
      data: {
        // title: `Generated Test - ${subjects.join(", ")}`,
        // description: `Auto-generated test for ${subjects.join(
        //   ", "
        // )} (${difficulty})`,
        title,
        description,
        timeLimit,
        subjects,
        topics,
        difficulty,
        isCustom: false,
        passingScore,
        totalPoints,
        userId: req.user.id,
        assignments: {
          create: selectedQuestions.map((question) => ({
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

    let attempt = existingAttempt;

    // If no existing attempt, create a new one
    if (!existingAttempt) {
      attempt = await prisma.testAttempt.create({
        data: {
          testId: req.params.id,
          userId: req.user.id,
          totalQuestions: test.assignments.length,
          status: "IN_PROGRESS",
        },
      });
    }

    const questions = test.assignments.map((assignment, index) => ({
      id: assignment.question.id,
      question: assignment.question.question,
      options: assignment.question.options,
      points: assignment.points,
      number: index + 1,
    }));

    const response = {
      attemptId: attempt.id,
      timeLimit: test.timeLimit,
      questions,
      totalPoints: test.totalPoints,
    };

    // Fix: Handle Json type properly for existing attempts
    if (existingAttempt) {
      response.startTime = attempt.startTime;
      response.lastActivity = attempt.lastActivity;

      let savedAnswers = {};
      if (attempt.answers && typeof attempt.answers === "object") {
        savedAnswers = attempt.answers;
      } else if (attempt.answers && typeof attempt.answers === "string") {
        try {
          savedAnswers = JSON.parse(attempt.answers);
        } catch (parseError) {
          console.error("Error parsing saved answers:", parseError);
        }
      }

      response.savedAnswers = savedAnswers;
      response.isResuming = true;
    }

    res.json(response);
  } catch (error) {
    console.error("Error in start route:", error);
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

    // Fix: Handle Json type from Prisma schema properly
    let existingAnswers = {};
    if (attempt.answers && typeof attempt.answers === "object") {
      existingAnswers = attempt.answers;
    } else if (attempt.answers && typeof attempt.answers === "string") {
      try {
        existingAnswers = JSON.parse(attempt.answers);
      } catch (parseError) {
        console.error("Error parsing existing answers:", parseError);
      }
    }

    existingAnswers[questionId] = answer;

    await prisma.testAttempt.update({
      where: { id: req.params.attemptId },
      data: {
        answers: existingAnswers, // Prisma will handle Json type conversion
        lastActivity: new Date(),
      },
    });

    res.json({ success: true, message: "Answer saved" });
  } catch (error) {
    console.error("Error in answer route:", error);
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

    // Fix: Handle Json type properly
    let userAnswers = {};
    if (attempt.answers && typeof attempt.answers === "object") {
      userAnswers = attempt.answers;
    } else if (attempt.answers && typeof attempt.answers === "string") {
      try {
        userAnswers = JSON.parse(attempt.answers);
      } catch (parseError) {
        console.error("Error parsing answers in results:", parseError);
      }
    }

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
    console.error("Error in results route:", error);
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

    // Fix: Handle Json type properly
    let savedAnswers = {};
    if (attempt.answers && typeof attempt.answers === "object") {
      savedAnswers = attempt.answers;
    } else if (attempt.answers && typeof attempt.answers === "string") {
      try {
        savedAnswers = JSON.parse(attempt.answers);
      } catch (parseError) {
        console.error("Error parsing saved answers in resume:", parseError);
      }
    }

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
    console.error("Error in resume route:", error);
    next(error);
  }
});

export default router;
