import express from "express"
import { body, query } from "express-validator"
import { authenticateToken, optionalAuth } from "../middleware/auth.js"
import { handleValidationErrors, validateContest, validateUUID, validatePagination } from "../middleware/validation.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Get all contests
router.get(
  "/",
  [
    ...validatePagination,
    query("status").optional().isIn(["all", "UPCOMING", "ONGOING", "FINISHED"]).withMessage("Invalid status"),
    query("difficulty").optional().isIn(["all", "EASY", "MEDIUM", "HARD", "EXPERT"]).withMessage("Invalid difficulty"),
    query("search").optional().isString().withMessage("Search must be a string"),
    handleValidationErrors,
  ],
  optionalAuth,
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, status = "all", difficulty = "all", search } = req.query

      // Build where clause
      const where = {}

      // Filter by status
      if (status !== "all") {
        where.status = status
      }

      // Filter by difficulty
      if (difficulty !== "all") {
        where.difficulty = difficulty
      }

      // Filter by search term
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      }

      // Get contests with pagination
      const [contests, totalCount] = await Promise.all([
        prisma.contest.findMany({
          where,
          orderBy: [
            { status: "asc" }, // upcoming first, then ongoing, then finished
            { startTime: "asc" },
          ],
          skip: (page - 1) * limit,
          take: Number.parseInt(limit),
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            registrations: req.user
              ? {
                  where: { userId: req.user.id },
                  select: { id: true },
                }
              : false,
          },
        }),
        prisma.contest.count({ where }),
      ])

      // Add registration status for authenticated users
      const contestsWithRegistration = contests.map((contest) => {
        const registrationStatus =
          req.user && contest.registrations?.length > 0
            ? contest.status === "FINISHED"
              ? "participated"
              : "registered"
            : "not-registered"

        return {
          ...contest,
          registrationStatus,
          registrations: undefined, // Remove from response
        }
      })

      res.json({
        contests: contestsWithRegistration,
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

// Get contest by ID
router.get("/:id", [validateUUID("id"), handleValidationErrors], optionalAuth, async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        registrations: req.user
          ? {
              where: { userId: req.user.id },
              select: { id: true },
            }
          : false,
      },
    })

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" })
    }

    // Add registration status for authenticated users
    const registrationStatus =
      req.user && contest.registrations?.length > 0
        ? contest.status === "FINISHED"
          ? "participated"
          : "registered"
        : "not-registered"

    res.json({
      contest: {
        ...contest,
        registrationStatus,
        registrations: undefined,
      },
    })
  } catch (error) {
    next(error)
  }
})

// Register for contest
router.post(
  "/:id/register",
  [
    authenticateToken,
    validateUUID("id"),
    body("isVirtual").optional().isBoolean().withMessage("isVirtual must be a boolean"),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { isVirtual = false } = req.body

      const contest = await prisma.contest.findUnique({
        where: { id: req.params.id },
        select: { status: true },
      })

      if (!contest) {
        return res.status(404).json({ error: "Contest not found" })
      }

      if (contest.status === "FINISHED") {
        return res.status(400).json({ error: "Cannot register for finished contest" })
      }

      // Check if already registered
      const existingRegistration = await prisma.contestRegistration.findUnique({
        where: {
          contestId_userId: {
            contestId: req.params.id,
            userId: req.user.id,
          },
        },
      })

      if (existingRegistration) {
        return res.status(409).json({ error: "Already registered for this contest" })
      }

      // Create registration and update participant count
      const [registration] = await prisma.$transaction([
        prisma.contestRegistration.create({
          data: {
            contestId: req.params.id,
            userId: req.user.id,
            isVirtual,
          },
        }),
        prisma.contest.update({
          where: { id: req.params.id },
          data: { participants: { increment: 1 } },
        }),
      ])

      res.status(201).json({
        message: "Successfully registered for contest",
        registration,
      })
    } catch (error) {
      next(error)
    }
  },
)

// Unregister from contest
router.delete(
  "/:id/register",
  [authenticateToken, validateUUID("id"), handleValidationErrors],
  async (req, res, next) => {
    try {
      const contest = await prisma.contest.findUnique({
        where: { id: req.params.id },
        select: { status: true },
      })

      if (!contest) {
        return res.status(404).json({ error: "Contest not found" })
      }

      if (contest.status === "ONGOING" || contest.status === "FINISHED") {
        return res.status(400).json({ error: "Cannot unregister from ongoing or finished contest" })
      }

      // Find registration
      const registration = await prisma.contestRegistration.findUnique({
        where: {
          contestId_userId: {
            contestId: req.params.id,
            userId: req.user.id,
          },
        },
      })

      if (!registration) {
        return res.status(404).json({ error: "Registration not found" })
      }

      // Delete registration and update participant count
      await prisma.$transaction([
        prisma.contestRegistration.delete({
          where: { id: registration.id },
        }),
        prisma.contest.update({
          where: { id: req.params.id },
          data: { participants: { decrement: 1 } },
        }),
      ])

      res.json({ message: "Successfully unregistered from contest" })
    } catch (error) {
      next(error)
    }
  },
)

// Create new contest
router.post("/", [authenticateToken, ...validateContest, handleValidationErrors], async (req, res, next) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      difficulty,
      topics,
      isVirtual = false,
      eligibility = "Open for all",
    } = req.body

    // Validate dates
    const start = new Date(startTime)
    const end = new Date(endTime)
    const now = new Date()

    if (start <= now) {
      return res.status(400).json({ error: "Start time must be in the future" })
    }

    if (end <= start) {
      return res.status(400).json({ error: "End time must be after start time" })
    }

    const newContest = await prisma.contest.create({
      data: {
        title,
        description,
        startTime: start,
        endTime: end,
        difficulty,
        topics,
        isVirtual,
        eligibility,
        organizerId: req.user.id,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    res.status(201).json({
      message: "Contest created successfully",
      contest: newContest,
    })
  } catch (error) {
    next(error)
  }
})

// Get user's contest registrations
router.get(
  "/user/registrations",
  [authenticateToken, ...validatePagination, handleValidationErrors],
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query

      const [registrations, totalCount] = await Promise.all([
        prisma.contestRegistration.findMany({
          where: { userId: req.user.id },
          orderBy: { registrationTime: "desc" },
          skip: (page - 1) * limit,
          take: Number.parseInt(limit),
          include: {
            contest: {
              include: {
                organizer: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        }),
        prisma.contestRegistration.count({
          where: { userId: req.user.id },
        }),
      ])

      res.json({
        registrations,
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

export default router
