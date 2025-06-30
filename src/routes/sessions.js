import express from "express"
import { body, query } from "express-validator"
import { handleValidationErrors, validateUUID, validatePagination } from "../middleware/validation.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Get all sessions for authenticated user
router.get(
  "/",
  [
    ...validatePagination,
    query("taskId").optional().isUUID().withMessage("Task ID must be a valid UUID"),
    query("dateFrom").optional().isISO8601().withMessage("Date from must be a valid date"),
    query("dateTo").optional().isISO8601().withMessage("Date to must be a valid date"),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, taskId, dateFrom, dateTo } = req.query

      // Build where clause
      const where = { userId: req.user.id }

      // Filter by task
      if (taskId) {
        where.taskId = taskId
      }

      // Filter by date range
      if (dateFrom || dateTo) {
        where.startTime = {}
        if (dateFrom) {
          where.startTime.gte = new Date(dateFrom)
        }
        if (dateTo) {
          where.startTime.lte = new Date(dateTo)
        }
      }

      // Get sessions with pagination
      const [sessions, totalCount] = await Promise.all([
        prisma.studySession.findMany({
          where,
          orderBy: { startTime: "desc" },
          skip: (page - 1) * limit,
          take: Number.parseInt(limit),
          include: {
            task: {
              select: {
                id: true,
                title: true,
                subjectArea: true,
              },
            },
          },
        }),
        prisma.studySession.count({ where }),
      ])

      res.json({
        sessions,
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

// Get session by ID
router.get("/:id", [validateUUID("id"), handleValidationErrors], async (req, res, next) => {
  try {
    const session = await prisma.studySession.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            subjectArea: true,
          },
        },
      },
    })

    if (!session) {
      return res.status(404).json({ error: "Session not found" })
    }

    res.json({ session })
  } catch (error) {
    next(error)
  }
})

// Create new session
router.post(
  "/",
  [
    body("taskId").optional().isUUID().withMessage("Task ID must be a valid UUID"),
    body("startTime").isISO8601().withMessage("Start time must be a valid date"),
    body("endTime").optional().isISO8601().withMessage("End time must be a valid date"),
    body("goal").optional().trim().isLength({ max: 500 }).withMessage("Goal must be less than 500 characters"),
    body("notes").optional().trim().isLength({ max: 1000 }).withMessage("Notes must be less than 1000 characters"),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { taskId, startTime, endTime, goal, notes } = req.body

      // Validate task belongs to user if provided
      if (taskId) {
        const task = await prisma.task.findFirst({
          where: {
            id: taskId,
            userId: req.user.id,
          },
          select: { id: true },
        })

        if (!task) {
          return res.status(404).json({ error: "Task not found" })
        }
      }

      // Calculate duration if endTime is provided
      let duration = null
      let completed = false
      if (endTime) {
        const start = new Date(startTime)
        const end = new Date(endTime)
        if (end <= start) {
          return res.status(400).json({ error: "End time must be after start time" })
        }
        duration = Math.round((end - start) / (1000 * 60)) // minutes
        completed = true
      }

      const newSession = await prisma.studySession.create({
        data: {
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : null,
          duration,
          goal: goal || null,
          notes: notes || null,
          completed,
          userId: req.user.id,
          taskId: taskId || null,
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              subjectArea: true,
            },
          },
        },
      })

      res.status(201).json({
        message: "Session created successfully",
        session: newSession,
      })
    } catch (error) {
      next(error)
    }
  },
)

// Update session
router.put(
  "/:id",
  [
    validateUUID("id"),
    body("taskId").optional().isUUID().withMessage("Task ID must be a valid UUID"),
    body("startTime").optional().isISO8601().withMessage("Start time must be a valid date"),
    body("endTime").optional().isISO8601().withMessage("End time must be a valid date"),
    body("goal").optional().trim().isLength({ max: 500 }).withMessage("Goal must be less than 500 characters"),
    body("notes").optional().trim().isLength({ max: 1000 }).withMessage("Notes must be less than 1000 characters"),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { taskId, startTime, endTime, goal, notes } = req.body

      // Check if session exists and user owns it
      const existingSession = await prisma.studySession.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        select: { startTime: true, endTime: true },
      })

      if (!existingSession) {
        return res.status(404).json({ error: "Session not found" })
      }

      // Validate task belongs to user if provided
      if (taskId) {
        const task = await prisma.task.findFirst({
          where: {
            id: taskId,
            userId: req.user.id,
          },
          select: { id: true },
        })

        if (!task) {
          return res.status(404).json({ error: "Task not found" })
        }
      }

      // Calculate duration if both times are provided
      let duration = null
      let completed = false

      const newStartTime = startTime ? new Date(startTime) : existingSession.startTime
      const newEndTime = endTime ? new Date(endTime) : existingSession.endTime

      if (newStartTime && newEndTime) {
        if (newEndTime <= newStartTime) {
          return res.status(400).json({ error: "End time must be after start time" })
        }
        duration = Math.round((newEndTime - newStartTime) / (1000 * 60)) // minutes
        completed = true
      }

      const updatedSession = await prisma.studySession.update({
        where: { id: req.params.id },
        data: {
          ...(startTime && { startTime: new Date(startTime) }),
          ...(endTime !== undefined && { endTime: endTime ? new Date(endTime) : null }),
          ...(duration !== null && { duration }),
          ...(goal !== undefined && { goal }),
          ...(notes !== undefined && { notes }),
          ...(taskId !== undefined && { taskId }),
          completed,
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              subjectArea: true,
            },
          },
        },
      })

      res.json({
        message: "Session updated successfully",
        session: updatedSession,
      })
    } catch (error) {
      next(error)
    }
  },
)

// End session
router.patch(
  "/:id/end",
  [
    validateUUID("id"),
    body("endTime").optional().isISO8601().withMessage("End time must be a valid date"),
    body("notes").optional().trim().isLength({ max: 1000 }).withMessage("Notes must be less than 1000 characters"),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { endTime, notes } = req.body

      // Check if session exists and user owns it
      const existingSession = await prisma.studySession.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        select: { startTime: true, completed: true },
      })

      if (!existingSession) {
        return res.status(404).json({ error: "Session not found" })
      }

      if (existingSession.completed) {
        return res.status(400).json({ error: "Session is already completed" })
      }

      const sessionEndTime = endTime ? new Date(endTime) : new Date()

      if (sessionEndTime <= existingSession.startTime) {
        return res.status(400).json({ error: "End time must be after start time" })
      }

      // Calculate duration
      const duration = Math.round((sessionEndTime - existingSession.startTime) / (1000 * 60)) // minutes

      const updatedSession = await prisma.studySession.update({
        where: { id: req.params.id },
        data: {
          endTime: sessionEndTime,
          duration,
          completed: true,
          ...(notes !== undefined && { notes }),
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              subjectArea: true,
            },
          },
        },
      })

      res.json({
        message: "Session ended successfully",
        session: updatedSession,
      })
    } catch (error) {
      next(error)
    }
  },
)

// Delete session
router.delete("/:id", [validateUUID("id"), handleValidationErrors], async (req, res, next) => {
  try {
    // Check if session exists and user owns it
    const existingSession = await prisma.studySession.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      select: { id: true },
    })

    if (!existingSession) {
      return res.status(404).json({ error: "Session not found" })
    }

    await prisma.studySession.delete({
      where: { id: req.params.id },
    })

    res.json({ message: "Session deleted successfully" })
  } catch (error) {
    next(error)
  }
})

// Get session statistics
router.get("/stats/overview", async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get completed sessions
    const completedSessions = await prisma.studySession.findMany({
      where: {
        userId,
        completed: true,
      },
      select: {
        duration: true,
        startTime: true,
      },
    })

    const totalSessions = completedSessions.length
    const totalMinutes = completedSessions.reduce((sum, session) => sum + (session.duration || 0), 0)
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10

    // Calculate average session length
    const avgSessionLength = totalSessions > 0 ? Math.round((totalMinutes / totalSessions) * 10) / 10 : 0

    // Get sessions from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentSessions = completedSessions.filter((s) => new Date(s.startTime) >= sevenDaysAgo)
    const recentMinutes = recentSessions.reduce((sum, session) => sum + (session.duration || 0), 0)
    const recentHours = Math.round((recentMinutes / 60) * 10) / 10

    const stats = {
      totalSessions,
      totalHours,
      totalMinutes,
      avgSessionLength,
      recentSessions: recentSessions.length,
      recentHours,
      longestSession: totalSessions > 0 ? Math.max(...completedSessions.map((s) => s.duration || 0)) : 0,
    }

    res.json({ stats })
  } catch (error) {
    next(error)
  }
})

export default router
