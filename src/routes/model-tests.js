import express from "express"
import { body, query } from "express-validator"
import {
  handleValidationErrors,
  validateModelTest,
  validateUUID,
  validatePagination,
} from "../middleware/validation.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Mock model test data
const MODEL_TESTS = [
  {
    id: "1",
    title: "Mathematics Comprehensive Test",
    description: "A comprehensive test covering various topics in mathematics",
    timeLimit: 60,
    subjects: ["Mathematics"],
    topics: ["Algebra", "Geometry", "Calculus", "Trigonometry", "Statistics"],
    difficulty: "medium",
    questions: [],
    isCustom: false,
    passingScore: 60,
    totalPoints: 200,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    createdById: "1",
  },
  {
    id: "2",
    title: "Physics Fundamentals",
    description: "Test your knowledge of fundamental physics concepts",
    timeLimit: 45,
    subjects: ["Physics"],
    topics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics"],
    difficulty: "easy",
    questions: [],
    isCustom: false,
    passingScore: 50,
    totalPoints: 100,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    createdById: "1",
  },
]

const TEST_ATTEMPTS = []

// Get all model tests
router.get(
  "/",
  [
    ...validatePagination,
    query("difficulty").optional().isIn(["all", "EASY", "MEDIUM", "HARD", "EXPERT"]).withMessage("Invalid difficulty"),
    query("subject").optional().isString().withMessage("Subject must be a string"),
    query("search").optional().isString().withMessage("Search must be a string"),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, difficulty = "all", subject, search } = req.query

      // Build where clause
      const where = {}

      // Filter by difficulty
      if (difficulty !== "all") {
        where.difficulty = difficulty
      }

      // Filter by subject
      if (subject) {
        where.subjects = {
          has: subject,
        }
      }

      // Filter by search term
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      }

      // Get tests with pagination
      const [tests, totalCount] = await Promise.all([
        prisma.modelTest.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: Number.parseInt(limit),
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            attempts: {
              where: { userId: req.user.id },
              orderBy: { startTime: "desc" },
              take: 1,
              select: {
                id: true,
                status: true,
                score: true,
                startTime: true,
              },
            },
            _count: {
              select: {
                attempts: {
                  where: { userId: req.user.id },
                },
              },
            },
          },
        }),
        prisma.modelTest.count({ where }),
      ])

      // Add attempt status for user
      const testsWithAttempts = tests.map((test) => {
        const lastAttempt = test.attempts[0] || null
        const hasInProgressAttempt = lastAttempt?.status === "IN_PROGRESS"

        return {
          ...test,
          attemptCount: test._count.attempts,
          lastAttempt,
          hasInProgressAttempt,
          attempts: undefined,
          _count: undefined,
        }
      })

      res.json({
        tests: testsWithAttempts,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: Number.parseInt(limit),
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

// Get test by ID
router.get("/:id", [validateUUID("id"), handleValidationErrors], async (req, res, next) => {
  try {
    const test = await prisma.modelTest.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        attempts: {
          where: { userId: req.user.id },
          orderBy: { startTime: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            score: true,
            startTime: true,
          },
        },
        _count: {
          select: {
            attempts: {
              where: { userId: req.user.id },
            },
          },
        },
      },
    })

    if (!test) {
      return res.status(404).json({ error: "Test not found" })
    }

    const lastAttempt = test.attempts[0] || null
    const hasInProgressAttempt = lastAttempt?.status === "IN_PROGRESS"

    res.json({
      test: {
        ...test,
        attemptCount: test._count.attempts,
        lastAttempt,
        hasInProgressAttempt,
        attempts: undefined,
        _count: undefined,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Start test attempt
router.post("/:id/start", [validateUUID("id"), handleValidationErrors], async (req, res, next) => {
  try {
    const test = await prisma.modelTest.findUnique({
      where: { id: req.params.id },
      select: { id: true, questions: true },
    })

    if (!test) {
      return res.status(404).json({ error: "Test not found" })
    }

    // Check if user has an in-progress attempt
    const inProgressAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId: test.id,
        userId: req.user.id,
        status: "IN_PROGRESS",
      },
    })

    if (inProgressAttempt) {
      return res.json({
        message: "Resuming existing attempt",
        attempt: inProgressAttempt,
      })
    }

    // Create new attempt
    const questions = Array.isArray(test.questions) ? test.questions : []
    const newAttempt = await prisma.testAttempt.create({
      data: {
        userId: req.user.id,
        testId: test.id,
        totalQuestions: questions.length || 10, // Default for demo
        answers: {},
      },
    })

    res.status(201).json({
      message: "Test attempt started",
      attempt: newAttempt,
    })
  } catch (error) {
    next(error)
  }
})

// Submit answer
router.post(
  "/attempts/:attemptId/answer",
  [
    validateUUID("attemptId"),
    body("questionId").isUUID().withMessage("Question ID must be a valid UUID"),
    body("answer").isInt({ min: 0, max: 3 }).withMessage("Answer must be between 0 and 3"),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { questionId, answer } = req.body

      const attempt = await prisma.testAttempt.findFirst({
        where: {
          id: req.params.attemptId,
          userId: req.user.id,
        },
      })

      if (!attempt) {
        return res.status(404).json({ error: "Test attempt not found" })
      }

      if (attempt.status !== "IN_PROGRESS") {
        return res.status(400).json({ error: "Test attempt is not in progress" })
      }

      // Update answers
      const currentAnswers = attempt.answers || {}
      currentAnswers[questionId] = answer

      await prisma.testAttempt.update({
        where: { id: req.params.attemptId },
        data: { answers: currentAnswers },
      })

      res.json({
        message: "Answer submitted successfully",
        answeredQuestions: Object.keys(currentAnswers).length,
        totalQuestions: attempt.totalQuestions,
      })
    } catch (error) {
      next(error)
    }
  },
)

// Finish test
router.post(
  "/attempts/:attemptId/finish",
  [validateUUID("attemptId"), handleValidationErrors],
  async (req, res, next) => {
    try {
      const attempt = await prisma.testAttempt.findFirst({
        where: {
          id: req.params.attemptId,
          userId: req.user.id,
        },
        include: {
          test: {
            select: {
              totalPoints: true,
              passingScore: true,
            },
          },
        },
      })

      if (!attempt) {
        return res.status(404).json({ error: "Test attempt not found" })
      }

      if (attempt.status !== "IN_PROGRESS") {
        return res.status(400).json({ error: "Test attempt is not in progress" })
      }

      // Calculate score (simplified - in real app, check against correct answers)
      const answeredQuestions = Object.keys(attempt.answers || {}).length
      const score = Math.floor(Math.random() * attempt.test.totalPoints) // Random score for demo
      const correctAnswers = Math.floor(Math.random() * answeredQuestions)

      const updatedAttempt = await prisma.testAttempt.update({
        where: { id: req.params.attemptId },
        data: {
          status: "COMPLETED",
          endTime: new Date(),
          timeSpent: Math.floor((new Date() - attempt.startTime) / 1000),
          score,
          correctAnswers,
        },
        include: {
          test: {
            select: {
              totalPoints: true,
              passingScore: true,
            },
          },
        },
      })

      res.json({
        message: "Test completed successfully",
        attempt: updatedAttempt,
        passed: score >= attempt.test.passingScore,
      })
    } catch (error) {
      next(error)
    }
  },
)

// Get test results
router.get(
  "/attempts/:attemptId/results",
  [validateUUID("attemptId"), handleValidationErrors],
  async (req, res, next) => {
    try {
      const attempt = await prisma.testAttempt.findFirst({
        where: {
          id: req.params.attemptId,
          userId: req.user.id,
        },
        include: {
          test: true,
        },
      })

      if (!attempt) {
        return res.status(404).json({ error: "Test attempt not found" })
      }

      if (attempt.status !== "COMPLETED") {
        return res.status(400).json({ error: "Test attempt is not completed" })
      }

      const passed = attempt.score >= attempt.test.passingScore
      const percentage = Math.round((attempt.score / attempt.test.totalPoints) * 100)

      res.json({
        attempt,
        test: attempt.test,
        passed,
        percentage,
        results: {
          score: attempt.score,
          totalPoints: attempt.test.totalPoints,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions,
          timeSpent: attempt.timeSpent,
          passingScore: attempt.test.passingScore,
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

// Get user's test history
router.get("/user/history", [...validatePagination, handleValidationErrors], async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const [attempts, totalCount] = await Promise.all([
      prisma.testAttempt.findMany({
        where: { userId: req.user.id },
        orderBy: { startTime: "desc" },
        skip: (page - 1) * limit,
        take: Number.parseInt(limit),
        include: {
          test: {
            select: {
              id: true,
              title: true,
              difficulty: true,
              totalPoints: true,
              passingScore: true,
            },
          },
        },
      }),
      prisma.testAttempt.count({
        where: { userId: req.user.id },
      }),
    ])

    res.json({
      attempts,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: Number.parseInt(limit),
      },
    })
  } catch (error) {
    next(error)
  }
})

// Create custom test
router.post("/custom", [...validateModelTest, handleValidationErrors], async (req, res, next) => {
  try {
    const { title, description, timeLimit, subjects, topics, difficulty, questionCount } = req.body

    const difficultyPoints = {
      EASY: 5,
      MEDIUM: 10,
      HARD: 15,
      EXPERT: 20,
    }

    const totalPoints = questionCount * difficultyPoints[difficulty]
    const passingScore = Math.floor(totalPoints * 0.6) // 60% passing score

    const newTest = await prisma.modelTest.create({
      data: {
        title,
        description,
        timeLimit,
        subjects,
        topics,
        difficulty,
        questions: [], // In real app, generate questions based on topics
        isCustom: true,
        passingScore,
        totalPoints,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    res.status(201).json({
      message: "Custom test created successfully",
      test: newTest,
    })
  } catch (error) {
    next(error)
  }
})

export default router
