import express from "express"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Get dashboard data
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id

    // Recent questions (Q&A feed)
    const recentQuestions = await prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        answers: { select: { id: true } },
        author: { select: { id: true, name: true, avatar: true } },
      },
    })
    const feed = recentQuestions.map((q) => ({
      ...q,
      answerCount: q.answers.length,
      answers: undefined,
    }))

    // Recent notes
    const recentNotesRaw = await prisma.note.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, updatedAt: true },
    })
    const recentNotes = recentNotesRaw.map((note) => ({
      id: note.id,
      title: note.title,
      lastViewed: formatRelativeTime(note.updatedAt),
    }))

    // Today's tasks
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    const todaysTasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: startOfDay, lt: endOfDay },
        status: { not: "COMPLETED" },
      },
    })

    // Today's study sessions
    const todaysSessions = await prisma.studySession.findMany({
      where: {
        userId,
        startTime: { gte: startOfDay, lt: endOfDay },
      },
    })

    // Study plan progress (example: show all tasks with their latest session)
    const userTasks = await prisma.task.findMany({
      where: { userId },
      include: {
        sessions: {
          orderBy: { startTime: "desc" },
          take: 1,
        },
      },
    })
    const studyPlans = userTasks.map((task) => ({
      id: task.id,
      title: task.title,
      duration: task.sessions[0]
        ? `${Math.round(((task.sessions[0].endTime - task.sessions[0].startTime) / (1000 * 60 * 60)) * 10) / 10} hours`
        : "Not scheduled",
      completed: task.status === "COMPLETED" ? 1 : 0,
      total: 1,
    }))

    // Progress data (customize as needed)
    // Example: count of completed tasks and sessions
    const completedTasks = await prisma.task.count({
      where: { userId, status: "COMPLETED" },
    })
    const totalTasks = await prisma.task.count({ where: { userId } })
    const completedSessions = await prisma.studySession.count({
      where: { userId, completed: true },
    })
    const progressData = [
      { label: "Completed Tasks", value: completedTasks },
      { label: "Completed Sessions", value: completedSessions },
    ]

    // Unread notifications count
    const unreadNotifications = await prisma.notification.count({
      where: { userId, isRead: false },
    })

    // Statistics
    const totalStudyMinutes = await prisma.studySession.aggregate({
      where: { userId, completed: true },
      _sum: { duration: true },
    })
    const questionsAsked = await prisma.question.count({ where: { authorId: userId } })
    const questionsAnswered = await prisma.answer.count({ where: { authorId: userId } })

    const stats = {
      totalTasks,
      completedTasks,
      totalStudyHours: (totalStudyMinutes._sum.duration || 0) / 60,
      questionsAsked,
      questionsAnswered,
    }

    res.json({
      feed,
      recentNotes,
      todaysTasks,
      todaysSessions,
      studyPlans,
      progress: progressData,
      stats,
      unreadNotifications,
    })
  } catch (error) {
    console.error("Get dashboard error:", error)
    res.status(500).json({ error: "Failed to fetch dashboard data" })
  }
})

// Helper function to format relative time
function formatRelativeTime(date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`
}

export default router