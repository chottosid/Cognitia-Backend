import express from "express"
import { query } from "express-validator"
import { optionalAuth } from "../middleware/auth.js"
import { handleValidationErrors, validateUUID, validatePagination } from "../middleware/validation.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Get all users (public profiles only)
router.get(
  "/",
  [
    ...validatePagination,
    query("search").optional().isString().withMessage("Search must be a string"),
    query("role").optional().isIn(["all", "STUDENT", "TEACHER", "ADMIN"]).withMessage("Invalid role"),
    handleValidationErrors,
  ],
  optionalAuth,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search, role = "all" } = req.query

      // Build Prisma filter
      const where = {}
      if (role !== "all") where.role = role
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { bio: { contains: search, mode: "insensitive" } },
        ]
      }

      const totalItems = await prisma.user.count({ where })
      const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
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

      res.json({
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: Number(limit),
        },
      })
    } catch (error) {
      console.error("Get users error:", error)
      res.status(500).json({ error: "Failed to fetch users" })
    }
  },
)

// Get user by ID
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
    res.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

// Get user statistics (replace with real queries as needed)
router.get("/:id/stats", [validateUUID("id"), handleValidationErrors], async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // TODO: Replace with real stats queries
    const stats = {
      questionsAsked: Math.floor(Math.random() * 50) + 10,
      questionsAnswered: Math.floor(Math.random() * 100) + 20,
      notesCreated: Math.floor(Math.random() * 30) + 5,
      tasksCompleted: Math.floor(Math.random() * 80) + 15,
      contestsParticipated: Math.floor(Math.random() * 15) + 2,
      reputation: Math.floor(Math.random() * 1000) + 100,
      joinDate: user.createdAt,
      lastActive: user.updatedAt,
    }

    res.json({ stats })
  } catch (error) {
    console.error("Get user stats error:", error)
    res.status(500).json({ error: "Failed to fetch user statistics" })
  }
})

export default router