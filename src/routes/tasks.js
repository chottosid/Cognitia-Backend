import express from "express"
import { body, query } from "express-validator"
import { handleValidationErrors, validateTask, validateUUID, validatePagination } from "../middleware/validation.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Get all tasks for authenticated user
router.get(
  "/",
  [
    ...validatePagination,
    query("status").optional().isIn(["all", "NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).withMessage("Invalid status"),
    query("priority").optional().isIn(["all", "LOW", "MEDIUM", "HIGH"]).withMessage("Invalid priority"),
    query("subjectArea").optional().isString().withMessage("Subject area must be a string"),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, status = "all", priority = "all", subjectArea } = req.query

      // Build where clause
      const where = { userId: req.user.id }

      // Filter by status
      if (status !== "all") {
        where.status = status
      }

      // Filter by priority
      if (priority !== "all") {
        where.priority = priority
      }

      // Filter by subject area
      if (subjectArea) {
        where.subjectArea = {
          contains: subjectArea,
          mode: "insensitive",
        }
      }

      // Get tasks with pagination
      const [tasks, totalCount] = await Promise.all([
        prisma.task.findMany({
          where,
          orderBy: { dueDate: "asc" },
          skip: (page - 1) * limit,
          take: Number.parseInt(limit),
          include: {
            sessions: {
              select: { id: true },
            },
          },
        }),
        prisma.task.count({ where }),
      ])

      res.json({
        tasks,
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

// Get task by ID
router.get("/:id", [validateUUID("id"), handleValidationErrors], async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        sessions: {
          orderBy: { startTime: "desc" },
          take: 5, // Last 5 sessions
        },
      },
    })

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json({ task })
  } catch (error) {
    next(error)
  }
})

// Create new task
router.post("/", [...validateTask, handleValidationErrors], async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, subjectArea, tags = [], estimatedTime, notes } = req.body

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        priority,
        subjectArea,
        tags,
        estimatedTime: estimatedTime || null,
        notes: notes || null,
        userId: req.user.id,
      },
    })

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    })
  } catch (error) {
    next(error)
  }
})

// Update task
router.put("/:id", [validateUUID("id"), ...validateTask, handleValidationErrors], async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, subjectArea, tags, estimatedTime, notes } = req.body

    // Check if task exists and user owns it
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      select: { id: true },
    })

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" })
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        priority,
        subjectArea,
        tags: tags || [],
        estimatedTime: estimatedTime !== undefined ? estimatedTime : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    })

    res.json({
      message: "Task updated successfully",
      task: updatedTask,
    })
  } catch (error) {
    next(error)
  }
})

// Update task status
router.patch(
  "/:id/status",
  [
    validateUUID("id"),
    body("status").isIn(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).withMessage("Invalid status"),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { status } = req.body

      // Check if task exists and user owns it
      const existingTask = await prisma.task.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        select: { id: true },
      })

      if (!existingTask) {
        return res.status(404).json({ error: "Task not found" })
      }

      const updateData = { status }
      if (status === "COMPLETED") {
        updateData.completedAt = new Date()
      } else {
        updateData.completedAt = null
      }

      const updatedTask = await prisma.task.update({
        where: { id: req.params.id },
        data: updateData,
      })

      res.json({
        message: "Task status updated successfully",
        task: updatedTask,
      })
    } catch (error) {
      next(error)
    }
  },
)

// Delete task
router.delete("/:id", [validateUUID("id"), handleValidationErrors], async (req, res, next) => {
  try {
    // Check if task exists and user owns it
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      select: { id: true },
    })

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" })
    }

    await prisma.task.delete({
      where: { id: req.params.id },
    })

    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    next(error)
  }
})

// Get task statistics
router.get("/stats/overview", async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get task counts by status
    const taskStats = await prisma.task.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    })

    // Get task counts by priority
    const priorityStats = await prisma.task.groupBy({
      by: ["priority"],
      where: { userId },
      _count: { priority: true },
    })

    // Get task counts by subject
    const subjectStats = await prisma.task.groupBy({
      by: ["subjectArea"],
      where: { userId },
      _count: { subjectArea: true },
    })

    // Get overdue tasks count
    const overdueCount = await prisma.task.count({
      where: {
        userId,
        status: { not: "COMPLETED" },
        dueDate: { lt: new Date() },
      },
    })

    // Format the response
    const stats = {
      total: taskStats.reduce((sum, stat) => sum + stat._count.status, 0),
      completed: taskStats.find((s) => s.status === "COMPLETED")?._count.status || 0,
      inProgress: taskStats.find((s) => s.status === "IN_PROGRESS")?._count.status || 0,
      notStarted: taskStats.find((s) => s.status === "NOT_STARTED")?._count.status || 0,
      overdue: overdueCount,
      byPriority: {
        high: priorityStats.find((s) => s.priority === "HIGH")?._count.priority || 0,
        medium: priorityStats.find((s) => s.priority === "MEDIUM")?._count.priority || 0,
        low: priorityStats.find((s) => s.priority === "LOW")?._count.priority || 0,
      },
      bySubject: subjectStats.reduce((acc, stat) => {
        acc[stat.subjectArea] = stat._count.subjectArea
        return acc
      }, {}),
    }

    res.json({ stats })
  } catch (error) {
    next(error)
  }
})

export default router
