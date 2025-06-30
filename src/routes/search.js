import express from "express"
import { query } from "express-validator"
import { optionalAuth } from "../middleware/auth.js"
import { handleValidationErrors, validatePagination } from "../middleware/validation.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Global search
router.get(
  "/",
  [
    query("q").notEmpty().withMessage("Search query is required"),
    query("type").optional().isIn(["all", "questions", "answers", "notes", "users"]).withMessage("Invalid search type"),
    ...validatePagination,
    handleValidationErrors,
  ],
  optionalAuth,
  async (req, res) => {
    try {
      const { q: searchQuery, type = "all", page = 1, limit = 10 } = req.query
      const searchLower = searchQuery.toLowerCase()
      const results = {
        questions: [],
        answers: [],
        notes: [],
        users: [],
      }

      // Search questions
      if (type === "all" || type === "questions") {
        results.questions = await prisma.question.findMany({
          where: {
            OR: [
              { title: { contains: searchQuery, mode: "insensitive" } },
              { body: { contains: searchQuery, mode: "insensitive" } },
              { tags: { has: searchQuery } },
            ],
          },
          include: {
            answers: true,
          },
        })
        results.questions = results.questions.map((question) => ({
          ...question,
          type: "question",
          answerCount: question.answers.length,
          answers: undefined,
        }))
      }

      // Search answers
      if (type === "all" || type === "answers") {
        results.answers = await prisma.answer.findMany({
          where: {
            content: { contains: searchQuery, mode: "insensitive" },
          },
          include: {
            question: true,
          },
        })
        results.answers = results.answers.map((answer) => ({
          ...answer,
          type: "answer",
        }))
      }

      // Search notes (only public ones or user's own)
      if (type === "all" || type === "notes") {
        const noteWhere = {
          title: { contains: searchQuery, mode: "insensitive" },
          OR: [
            { visibility: "PUBLIC" },
            ...(req.user ? [{ authorId: req.user.id }] : []),
          ],
        }
        results.notes = await prisma.note.findMany({
          where: noteWhere,
        })
        results.notes = results.notes.map((note) => ({
          ...note,
          type: "note",
        }))
      }

      // Search users
      if (type === "all" || type === "users") {
        results.users = await prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: searchQuery, mode: "insensitive" } },
              { email: { contains: searchQuery, mode: "insensitive" } },
              { bio: { contains: searchQuery, mode: "insensitive" } },
            ],
          },
        })
        results.users = results.users.map((user) => {
          const { password, ...publicUser } = user
          return {
            ...publicUser,
            type: "user",
          }
        })
      }

      // Combine all results if searching all types
      let combinedResults = []
      if (type === "all") {
        combinedResults = [
          ...results.questions,
          ...results.answers,
          ...results.notes,
          ...results.users,
        ]
      } else {
        combinedResults = results[type] || []
      }

      // Sort by relevance (simplified)
      combinedResults.sort((a, b) => {
        const aScore = getRelevanceScore(a, searchLower)
        const bScore = getRelevanceScore(b, searchLower)
        return bScore - aScore
      })

      // Pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + Number.parseInt(limit)
      const paginatedResults = combinedResults.slice(startIndex, endIndex)

      res.json({
        results: paginatedResults,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(combinedResults.length / limit),
          totalItems: combinedResults.length,
          itemsPerPage: Number.parseInt(limit),
        },
        searchQuery,
        searchType: type,
        resultCounts: {
          questions: results.questions.length,
          answers: results.answers.length,
          notes: results.notes.length,
          users: results.users.length,
          total: combinedResults.length,
        },
      })
    } catch (error) {
      console.error("Search error:", error)
      res.status(500).json({ error: "Search failed" })
    }
  },
)

// Search suggestions
router.get(
  "/suggestions",
  [query("q").notEmpty().withMessage("Search query is required"), handleValidationErrors],
  async (req, res) => {
    try {
      const { q: searchQuery } = req.query
      const searchLower = searchQuery.toLowerCase()
      const suggestions = []

      // Question titles
      const questionTitles = await prisma.question.findMany({
        where: { title: { contains: searchQuery, mode: "insensitive" } },
        select: { id: true, title: true },
        take: 10,
      })
      questionTitles.forEach((question) => {
        suggestions.push({
          text: question.title,
          type: "question",
          id: question.id,
        })
      })

      // Tags
      const questionsWithTags = await prisma.question.findMany({
        where: { tags: { has: searchQuery } },
        select: { tags: true },
        take: 20,
      })
      const allTags = new Set()
      questionsWithTags.forEach((question) => {
        question.tags.forEach((tag) => {
          if (tag.toLowerCase().includes(searchLower)) {
            allTags.add(tag)
          }
        })
      })
      Array.from(allTags).forEach((tag) => {
        suggestions.push({
          text: tag,
          type: "tag",
        })
      })

      // User names
      const userNames = await prisma.user.findMany({
        where: { name: { contains: searchQuery, mode: "insensitive" } },
        select: { id: true, name: true },
        take: 10,
      })
      userNames.forEach((user) => {
        suggestions.push({
          text: user.name,
          type: "user",
          id: user.id,
        })
      })

      // Note titles (public only)
      const noteTitles = await prisma.note.findMany({
        where: {
          title: { contains: searchQuery, mode: "insensitive" },
          visibility: "PUBLIC",
        },
        select: { id: true, title: true },
        take: 10,
      })
      noteTitles.forEach((note) => {
        suggestions.push({
          text: note.title,
          type: "note",
          id: note.id,
        })
      })

      // Limit and sort suggestions
      const limitedSuggestions = suggestions.slice(0, 10).sort((a, b) => a.text.localeCompare(b.text))

      res.json({ suggestions: limitedSuggestions })
    } catch (error) {
      console.error("Search suggestions error:", error)
      res.status(500).json({ error: "Failed to fetch search suggestions" })
    }
  },
)

// Helper function to calculate relevance score
function getRelevanceScore(item, searchTerm) {
  let score = 0

  // Exact matches get higher scores
  const getText = (item) => {
    switch (item.type) {
      case "question":
        return `${item.title} ${item.body || ""} ${(item.tags || []).join(" ")}`
      case "answer":
        return item.content
      case "note":
        return item.title
      case "user":
        return `${item.name} ${item.bio || ""}`
      default:
        return ""
    }
  }

  const text = getText(item).toLowerCase()

  // Title/name exact match
  if (item.title && item.title.toLowerCase() === searchTerm) {
    score += 100
  } else if (item.name && item.name.toLowerCase() === searchTerm) {
    score += 100
  }

  // Title/name starts with search term
  if (item.title && item.title.toLowerCase().startsWith(searchTerm)) {
    score += 50
  } else if (item.name && item.name.toLowerCase().startsWith(searchTerm)) {
    score += 50
  }

  // Contains search term
  if (text.includes(searchTerm)) {
    score += 10
  }

  // Boost popular content
  if (item.voteCount) {
    score += item.voteCount
  }
  if (item.views) {
    score += Math.log(item.views + 1)
  }

  return score
}