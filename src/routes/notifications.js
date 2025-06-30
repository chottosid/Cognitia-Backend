import express from "express"
import { query, param } from "express-validator"
import { handleValidationErrors, validateUUID, validatePagination } from "../middleware/validation.js"
import { authenticateToken } from "../middleware/auth.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Get all notifications for authenticated user
router.get(
  "/",
  [
    authenticateToken,
    ...validatePagination,
    query("unreadOnly").optional().isBoolean().withMessage("unreadOnly must be a boolean"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { page = 1, limit = 10, unreadOnly = false } = req.query
      const userId = req.user.id

      const where = { userId }
      if (unreadOnly === "true" || unreadOnly === true) {
        where.isRead = false
      }

      const totalItems = await prisma.notification.count({ where })
      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      })

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      })

      res.json({
        notifications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: Number(limit),
        },
        unreadCount,
      })
    } catch (error) {
      console.error("Get notifications error:", error)
      res.status(500).json({ error: "Failed to fetch notifications" })
    }
  }
)

// Mark notification as read
router.patch(
  "/:id/read",
  [authenticateToken, validateUUID("id"), handleValidationErrors],
  async (req, res) => {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: req.params.id },
      })
      if (!notification || notification.userId !== req.user.id) {
        return res.status(404).json({ error: "Notification not found" })
      }

      const updated = await prisma.notification.update({
        where: { id: req.params.id },
        data: { isRead: true },
      })

      res.json({
        message: "Notification marked as read",
        notification: updated,
      })
    } catch (error) {
      console.error("Mark notification as read error:", error)
      res.status(500).json({ error: "Failed to mark notification as read" })
    }
  }
)

// Mark all notifications as read
router.patch(
  "/read-all",
  authenticateToken,
  async (req, res) => {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true },
      })

      res.json({ message: "All notifications marked as read" })
    } catch (error) {
      console.error("Mark all notifications as read error:", error)
      res.status(500).json({ error: "Failed to mark all notifications as read" })
    }
  }
)

// Delete notification
router.delete(
  "/:id",
  [authenticateToken, validateUUID("id"), handleValidationErrors],
  async (req, res) => {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: req.params.id },
      })
      if (!notification || notification.userId !== req.user.id) {
        return res.status(404).json({ error: "Notification not found" })
      }

      await prisma.notification.delete({ where: { id: req.params.id } })

      res.json({ message: "Notification deleted successfully" })
    } catch (error) {
      console.error("Delete notification error:", error)
      res.status(500).json({ error: "Failed to delete notification" })
    }
  }
)

// Get notification statistics
router.get(
  "/stats",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id
      const notifications = await prisma.notification.findMany({ where: { userId } })

      const stats = {
        total: notifications.length,
        unread: notifications.filter((n) => !n.isRead).length,
        byType: notifications.reduce((acc, n) => {
          const type = n.type?.toLowerCase() || "other"
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {}),
      }

      res.json({ stats })
    } catch (error) {
      console.error("Get notification stats error:", error)
      res.status(500).json({ error: "Failed to fetch notification statistics" })
    }
  }
)

export default router