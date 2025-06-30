import express from "express"
import { body } from "express-validator"
import { authenticateToken } from "../middleware/auth.js"
import { handleValidationErrors, validateAnswer, validateUUID } from "../middleware/validation.js"
import { prisma } from "../lib/database.js"

const router = express.Router()


// Get all answers for a question
router.get(
  "/question/:questionId",
  [validateUUID("questionId"), handleValidationErrors],
  async (req, res, next) => {
    try {
      const answers = await prisma.answer.findMany({
        where: { questionId: req.params.questionId },
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
        orderBy: { createdAt: "asc" },
      })

      // Calculate vote counts for each answer
      const answersWithVotes = answers.map(ans => {
        const upVotes = ans.votes.filter(v => v.voteType === "UP").length
        const downVotes = ans.votes.filter(v => v.voteType === "DOWN").length
        return {
          ...ans,
          voteCount: upVotes - downVotes,
          votes: undefined,
        }
      })

      res.json({ answers: answersWithVotes })
    } catch (error) {
      next(error)
    }
  }
)

// Create new answer
router.post(
  "/",
  [
    authenticateToken,
    body("questionId").isUUID().withMessage("Question ID must be a valid UUID"),
    ...validateAnswer,
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { questionId, content } = req.body

      // Check if question exists
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { id: true },
      })

      if (!question) {
        return res.status(404).json({ error: "Question not found" })
      }

      const newAnswer = await prisma.answer.create({
        data: {
          content,
          questionId,
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
        },
      })

      res.status(201).json({
        message: "Answer created successfully",
        answer: {
          ...newAnswer,
          voteCount: 0,
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

// Update answer
router.put(
  "/:id",
  [authenticateToken, validateUUID("id"), ...validateAnswer, handleValidationErrors],
  async (req, res, next) => {
    try {
      const { content } = req.body

      // Check if answer exists and user owns it
      const existingAnswer = await prisma.answer.findUnique({
        where: { id: req.params.id },
        select: { authorId: true },
      })

      if (!existingAnswer) {
        return res.status(404).json({ error: "Answer not found" })
      }

      if (existingAnswer.authorId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to update this answer" })
      }

      const updatedAnswer = await prisma.answer.update({
        where: { id: req.params.id },
        data: { content },
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
      })

      // Calculate vote count
      const upVotes = updatedAnswer.votes.filter((vote) => vote.voteType === "UP").length
      const downVotes = updatedAnswer.votes.filter((vote) => vote.voteType === "DOWN").length

      res.json({
        message: "Answer updated successfully",
        answer: {
          ...updatedAnswer,
          voteCount: upVotes - downVotes,
          votes: undefined,
        },
      })
    } catch (error) {
      next(error)
    }
  },
)

// Delete answer
router.delete("/:id", [authenticateToken, validateUUID("id"), handleValidationErrors], async (req, res, next) => {
  try {
    // Check if answer exists and user owns it or is admin
    const existingAnswer = await prisma.answer.findUnique({
      where: { id: req.params.id },
      select: { authorId: true },
    })

    if (!existingAnswer) {
      return res.status(404).json({ error: "Answer not found" })
    }

    if (existingAnswer.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this answer" })
    }

    await prisma.answer.delete({
      where: { id: req.params.id },
    })

    res.json({ message: "Answer deleted successfully" })
  } catch (error) {
    next(error)
  }
})

// Vote on answer
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

      // Check if answer exists
      const answer = await prisma.answer.findUnique({
        where: { id: req.params.id },
        select: { id: true },
      })

      if (!answer) {
        return res.status(404).json({ error: "Answer not found" })
      }

      // Check if user already voted
      const existingVote = await prisma.answerVote.findUnique({
        where: {
          answerId_userId: {
            answerId: req.params.id,
            userId: req.user.id,
          },
        },
      })

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Remove vote if same type
          await prisma.answerVote.delete({
            where: { id: existingVote.id },
          })
        } else {
          // Update vote if different type
          await prisma.answerVote.update({
            where: { id: existingVote.id },
            data: { voteType },
          })
        }
      } else {
        // Create new vote
        await prisma.answerVote.create({
          data: {
            voteType,
            answerId: req.params.id,
            userId: req.user.id,
          },
        })
      }

      // Get updated vote count
      const votes = await prisma.answerVote.findMany({
        where: { answerId: req.params.id },
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

// Accept answer
router.patch("/:id/accept", [authenticateToken, validateUUID("id"), handleValidationErrors], async (req, res, next) => {
  try {
    // Get answer with question info
    const answer = await prisma.answer.findUnique({
      where: { id: req.params.id },
      include: {
        question: {
          select: { authorId: true },
        },
      },
    })

    if (!answer) {
      return res.status(404).json({ error: "Answer not found" })
    }

    // Check if user owns the question
    if (answer.question.authorId !== req.user.id) {
      return res.status(403).json({ error: "Only question author can accept answers" })
    }

    // Unaccept all other answers for this question
    await prisma.answer.updateMany({
      where: { questionId: answer.questionId },
      data: { isAccepted: false },
    })

    // Accept this answer
    const updatedAnswer = await prisma.answer.update({
      where: { id: req.params.id },
      data: { isAccepted: true },
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
    })

    // Mark question as resolved
    await prisma.question.update({
      where: { id: answer.questionId },
      data: { isResolved: true },
    })

    // Calculate vote count
    const upVotes = updatedAnswer.votes.filter((vote) => vote.voteType === "UP").length
    const downVotes = updatedAnswer.votes.filter((vote) => vote.voteType === "DOWN").length

    res.json({
      message: "Answer accepted successfully",
      answer: {
        ...updatedAnswer,
        voteCount: upVotes - downVotes,
        votes: undefined,
      },
    })
  } catch (error) {
    next(error)
  }
})

export default router