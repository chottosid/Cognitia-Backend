import express from "express"
import { body, query } from "express-validator"
import { authenticateToken, optionalAuth } from "../middleware/auth.js"
import { handleValidationErrors, validateQuestion, validateUUID, validatePagination } from "../middleware/validation.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Get all questions with pagination and filtering
router.get(
  "/",
  [
    ...validatePagination,
    query("tags").optional().isString().withMessage("Tags must be a string"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("status").optional().isIn(["all", "resolved", "unresolved"]).withMessage("Invalid status"),
    query("sortBy")
      .optional()
      .isIn(["newest", "oldest", "most_viewed", "most_voted"])
      .withMessage("Invalid sort option"),
    handleValidationErrors,
  ],
  optionalAuth,
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, tags, search, status = "all", sortBy = "newest" } = req.query

      // Build where clause
      const where = {}

      // Filter by tags
      if (tags) {
        const tagArray = tags.split(",").map((tag) => tag.trim())
        where.tags = {
          hasSome: tagArray,
        }
      }

      // Filter by search term
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { body: { contains: search, mode: "insensitive" } },
        ]
      }

      // Filter by status
      if (status === "resolved") {
        where.isResolved = true
      } else if (status === "unresolved") {
        where.isResolved = false
      }

      // Build order by clause
      let orderBy = {}
      switch (sortBy) {
        case "oldest":
          orderBy = { createdAt: "asc" }
          break
        case "most_viewed":
          orderBy = { views: "desc" }
          break
        case "most_voted":
          orderBy = { votes: { _count: "desc" } }
          break
        case "newest":
        default:
          orderBy = { createdAt: "desc" }
          break
      }

      // Get questions with pagination
      const [questions, totalCount] = await Promise.all([
        prisma.question.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: Number.parseInt(limit),
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
            answers: {
              select: { id: true },
            },
            votes: {
              select: { voteType: true },
            },
            _count: {
              select: {
                answers: true,
                votes: true,
              },
            },
          },
        }),
        prisma.question.count({ where }),
      ])

      // Calculate vote counts and add answer count
      const questionsWithCounts = questions.map((question) => {
        const upVotes = question.votes.filter((vote) => vote.voteType === "UP").length
        const downVotes = question.votes.filter((vote) => vote.voteType === "DOWN").length

        return {
          ...question,
          voteCount: upVotes - downVotes,
          answerCount: question._count.answers,
          votes: undefined, // Remove votes array from response
          _count: undefined, // Remove _count from response
        }
      })

      res.json({
        questions: questionsWithCounts,
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

// Get question by ID
router.get("/:id", [validateUUID("id"), handleValidationErrors], optionalAuth, async (req, res, next) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        answers: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
            votes: {
              select: { voteType: true },
            },
          },
          orderBy: [{ isAccepted: "desc" }, { createdAt: "asc" }],
        },
        votes: {
          select: { voteType: true },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    })

    if (!question) {
      return res.status(404).json({ error: "Question not found" })
    }

    // Increment view count
    await prisma.question.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    })

    // Calculate vote counts
    const upVotes = question.votes.filter((vote) => vote.voteType === "UP").length
    const downVotes = question.votes.filter((vote) => vote.voteType === "DOWN").length

    // Calculate answer vote counts
    const answersWithVoteCounts = question.answers.map((answer) => {
      const answerUpVotes = answer.votes.filter((vote) => vote.voteType === "UP").length
      const answerDownVotes = answer.votes.filter((vote) => vote.voteType === "DOWN").length

      return {
        ...answer,
        voteCount: answerUpVotes - answerDownVotes,
        votes: undefined,
      }
    })

    res.json({
      question: {
        ...question,
        voteCount: upVotes - downVotes,
        answerCount: question._count.answers,
        votes: undefined,
        _count: undefined,
      },
      answers: answersWithVoteCounts,
    })
  } catch (error) {
    next(error)
  }
})

// Create new question
router.post("/", [authenticateToken, ...validateQuestion, handleValidationErrors], async (req, res, next) => {
  try {
    const { title, body, tags, difficulty = "MEDIUM", subject } = req.body

    const newQuestion = await prisma.question.create({
      data: {
        title,
        body,
        tags,
        difficulty,
        subject,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        _count: {
          select: {
            answers: true,
          },
        },
      },
    })

    res.status(201).json({
      message: "Question created successfully",
      question: {
        ...newQuestion,
        voteCount: 0,
        answerCount: 0,
        _count: undefined,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Update question
router.put(
  "/:id",
  [authenticateToken, validateUUID("id"), ...validateQuestion, handleValidationErrors],
  async (req, res, next) => {
    try {
      const { title, body, tags, difficulty, subject } = req.body

      // Check if question exists and user owns it
      const existingQuestion = await prisma.question.findUnique({
        where: { id: req.params.id },
        select: { authorId: true },
      })

      if (!existingQuestion) {
        return res.status(404).json({ error: "Question not found" })
      }

      if (existingQuestion.authorId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to update this question" })
      }

      const updatedQuestion = await prisma.question.update({
        where: { id: req.params.id },
        data: {
          title,
          body,
          tags,
          ...(difficulty && { difficulty }),
          ...(subject && { subject }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
          votes: {
            select: { voteType: true },
          },
          _count: {
            select: {
              answers: true,
            },
          },
        },
      })

      // Calculate vote count
      const upVotes = updatedQuestion.votes.filter((vote) => vote.voteType === "UP").length
      const downVotes = updatedQuestion.votes.filter((vote) => vote.voteType === "DOWN").length

      res.json({
        message: "Question updated successfully",
        question: {
          ...updatedQuestion,
          voteCount: upVotes - downVotes,
          answerCount: updatedQuestion._count.answers,
          votes: undefined,
          _count: undefined,
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

// Delete question
router.delete("/:id", [authenticateToken, validateUUID("id"), handleValidationErrors], async (req, res, next) => {
  try {
    // Check if question exists and user owns it or is admin
    const existingQuestion = await prisma.question.findUnique({
      where: { id: req.params.id },
      select: { authorId: true },
    })

    if (!existingQuestion) {
      return res.status(404).json({ error: "Question not found" })
    }

    if (existingQuestion.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this question" })
    }

    // Delete question (cascade will handle related records)
    await prisma.question.delete({
      where: { id: req.params.id },
    })

    res.json({ message: "Question deleted successfully" })
  } catch (error) {
    next(error)
  }
})

// Vote on question
router.post(
  "/:id/vote",
  [
    authenticateToken,
    validateUUID("id"),
    body("voteType").isIn(["UP", "DOWN"]).withMessage("Vote type must be UP or DOWN"),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { voteType } = req.body

      // Check if question exists
      const question = await prisma.question.findUnique({
        where: { id: req.params.id },
        select: { id: true },
      })

      if (!question) {
        return res.status(404).json({ error: "Question not found" })
      }

      // Check if user already voted
      const existingVote = await prisma.questionVote.findUnique({
        where: {
          questionId_userId: {
            questionId: req.params.id,
            userId: req.user.id,
          },
        },
      })

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Remove vote if same type
          await prisma.questionVote.delete({
            where: { id: existingVote.id },
          })
        } else {
          // Update vote if different type
          await prisma.questionVote.update({
            where: { id: existingVote.id },
            data: { voteType },
          })
        }
      } else {
        // Create new vote
        await prisma.questionVote.create({
          data: {
            voteType,
            questionId: req.params.id,
            userId: req.user.id,
          },
        })
      }

      // Get updated vote count
      const votes = await prisma.questionVote.findMany({
        where: { questionId: req.params.id },
        select: { voteType: true },
      })

      const upVotes = votes.filter((vote) => vote.voteType === "UP").length
      const downVotes = votes.filter((vote) => vote.voteType === "DOWN").length
      const voteCount = upVotes - downVotes

      res.json({
        message: "Vote recorded successfully",
        voteCount,
      })
    } catch (error) {
      next(error)
    }
  },
)

// Mark question as resolved
router.patch(
  "/:id/resolve",
  [authenticateToken, validateUUID("id"), handleValidationErrors],
  async (req, res, next) => {
    try {
      // Check if question exists and user owns it
      const existingQuestion = await prisma.question.findUnique({
        where: { id: req.params.id },
        select: { authorId: true, isResolved: true },
      })

      if (!existingQuestion) {
        return res.status(404).json({ error: "Question not found" })
      }

      if (existingQuestion.authorId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to resolve this question" })
      }

      const updatedQuestion = await prisma.question.update({
        where: { id: req.params.id },
        data: { isResolved: !existingQuestion.isResolved },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
        },
      })

      res.json({
        message: `Question marked as ${updatedQuestion.isResolved ? "resolved" : "unresolved"}`,
        question: updatedQuestion,
      })
    } catch (error) {
      next(error)
    }
  },
)

export default router
