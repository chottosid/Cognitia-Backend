import express from "express"
import { optionalAuth } from "../middleware/auth.js"
import { handleValidationErrors, validateUUID, validatePagination } from "../middleware/validation.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Get user profile by ID
router.get("/:id", [validateUUID("id"), handleValidationErrors], optionalAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        institution: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Get user's public content
    const [userQuestions, userAnswers, userNotes] = await Promise.all([
      prisma.question.findMany({ where: { authorId: user.id } }),
      prisma.answer.findMany({ where: { authorId: user.id } }),
      prisma.note.findMany({ where: { authorId: user.id, visibility: "PUBLIC" }, orderBy: { updatedAt: "desc" } }),
    ])

    // Calculate statistics
    const acceptedAnswers = userAnswers.filter((a) => a.isAccepted).length
    const questionVotes = userQuestions.reduce((sum, q) => sum + (q.voteCount || 0), 0)
    const answerVotes = userAnswers.reduce((sum, a) => sum + (a.voteCount || 0), 0)
    const stats = {
      questionsAsked: userQuestions.length,
      questionsAnswered: userAnswers.length,
      notesCreated: userNotes.length,
      acceptedAnswers,
      totalVotes: questionVotes + answerVotes,
      reputation: Math.floor(Math.random() * 1000) + 100, // You can replace with real logic
    }

    res.json({
      user,
      stats,
      recentActivity: {
        questions: userQuestions.slice(0, 5),
        answers: userAnswers.slice(0, 5),
        notes: userNotes.slice(0, 5),
      },
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    res.status(500).json({ error: "Failed to fetch user profile" })
  }
})

// Get user's questions
router.get(
  "/:id/questions",
  [validateUUID("id"), ...validatePagination, handleValidationErrors],
  optionalAuth,
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query

      const user = await prisma.user.findUnique({ where: { id: req.params.id } })
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      const [totalItems, userQuestions] = await Promise.all([
        prisma.question.count({ where: { authorId: user.id } }),
        prisma.question.findMany({
          where: { authorId: user.id },
          orderBy: { createdAt: "desc" },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          include: {
            answers: { select: { id: true } },
          },
        }),
      ])

      // Add answer count to each question
      const questionsWithAnswerCount = userQuestions.map((question) => ({
        ...question,
        answerCount: question.answers.length,
        answers: undefined,
      }))

      res.json({
        questions: questionsWithAnswerCount,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: Number(limit),
        },
      })
    } catch (error) {
      console.error("Get user questions error:", error)
      res.status(500).json({ error: "Failed to fetch user questions" })
    }
  },
)

// Get user's answers
router.get(
  "/:id/answers",
  [validateUUID("id"), ...validatePagination, handleValidationErrors],
  optionalAuth,
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query

      const user = await prisma.user.findUnique({ where: { id: req.params.id } })
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      const [totalItems, userAnswers] = await Promise.all([
        prisma.answer.count({ where: { authorId: user.id } }),
        prisma.answer.findMany({
          where: { authorId: user.id },
          orderBy: { createdAt: "desc" },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          include: {
            question: true,
          },
        }),
      ])

      res.json({
        answers: userAnswers,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: Number(limit),
        },
      })
    } catch (error) {
      console.error("Get user answers error:", error)
      res.status(500).json({ error: "Failed to fetch user answers" })
    }
  },
)

// Get user's public notes
router.get(
  "/:id/notes",
  [validateUUID("id"), ...validatePagination, handleValidationErrors],
  optionalAuth,
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query

      const user = await prisma.user.findUnique({ where: { id: req.params.id } })
      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      const [totalItems, userNotes] = await Promise.all([
        prisma.note.count({ where: { authorId: user.id, visibility: "PUBLIC" } }),
        prisma.note.findMany({
          where: { authorId: user.id, visibility: "PUBLIC" },
          orderBy: { updatedAt: "desc" },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
      ])

      res.json({
        notes: userNotes,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: Number(limit),
        },
      })
    } catch (error) {
      console.error("Get user notes error:", error)
      res.status(500).json({ error: "Failed to fetch user notes" })
    }
  },
)

export default router