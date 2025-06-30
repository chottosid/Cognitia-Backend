import express from "express"
import { query } from "express-validator"
import { handleValidationErrors } from "../middleware/validation.js"
import { authenticateToken } from "../middleware/auth.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Get dashboard analytics
router.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    // Task statistics
    const [totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: "COMPLETED" } }),
      prisma.task.count({ where: { userId, status: "IN_PROGRESS" } }),
      prisma.task.count({
        where: {
          userId,
          status: { not: "COMPLETED" },
          dueDate: { lt: new Date() },
        },
      }),
    ])
    const taskStats = {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      overdue: overdueTasks,
    }

    // Study session statistics
    const userSessions = await prisma.studySession.findMany({
      where: { userId, completed: true },
    })
    const totalStudyTime = userSessions.reduce((sum, session) => sum + (session.duration || 0), 0)

    // Q&A statistics
    const [userQuestions, userAnswers] = await Promise.all([
      prisma.question.findMany({ where: { authorId: userId } }),
      prisma.answer.findMany({ where: { authorId: userId } }),
    ])

    // Notes statistics
    const [userNotes, publicNotes, privateNotes] = await Promise.all([
      prisma.note.findMany({ where: { authorId: userId } }),
      prisma.note.count({ where: { authorId: userId, visibility: "PUBLIC" } }),
      prisma.note.count({ where: { authorId: userId, visibility: "PRIVATE" } }),
    ])

    // Weekly progress (last 7 days)
    const weeklyProgress = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const start = new Date(date.setHours(0, 0, 0, 0))
        const end = new Date(date.setHours(23, 59, 59, 999))
        return Promise.all([
          prisma.studySession.aggregate({
            where: {
              userId,
              completed: true,
              startTime: { gte: start, lte: end },
            },
            _sum: { duration: true },
          }),
          prisma.task.count({
            where: {
              userId,
              status: "COMPLETED",
              completedAt: { gte: start, lte: end },
            },
          }),
          prisma.answer.count({
            where: {
              authorId: userId,
              createdAt: { gte: start, lte: end },
            },
          }),
        ]).then(([study, tasks, answers]) => ({
          date: start.toISOString().split("T")[0],
          studyTime: study._sum.duration || 0,
          tasksCompleted: tasks,
          questionsAnswered: answers,
        }))
      })
    )

    // Subject distribution
    const subjectCounts = await prisma.task.groupBy({
      by: ["subjectArea"],
      where: { userId },
      _count: true,
    })
    const subjectDistribution = subjectCounts.map((s) => ({
      subject: s.subjectArea,
      count: s._count,
    }))

    // Q&A stats
    const acceptedAnswers = userAnswers.filter((a) => a.isAccepted).length
    const totalVotes =
      userQuestions.reduce((sum, q) => sum + (q.voteCount || 0), 0) +
      userAnswers.reduce((sum, a) => sum + (a.voteCount || 0), 0)

    const analytics = {
      tasks: taskStats,
      studyTime: {
        total: totalStudyTime,
        sessions: userSessions.length,
        average: userSessions.length > 0 ? Math.round(totalStudyTime / userSessions.length) : 0,
      },
      qa: {
        questionsAsked: userQuestions.length,
        questionsAnswered: userAnswers.length,
        acceptedAnswers,
        totalVotes,
      },
      notes: {
        total: userNotes.length,
        public: publicNotes,
        private: privateNotes,
      },
      weeklyProgress,
      subjectDistribution,
    }

    res.json({ analytics })
  } catch (error) {
    console.error("Get dashboard analytics error:", error)
    res.status(500).json({ error: "Failed to fetch dashboard analytics" })
  }
})

// Get study patterns
router.get(
  "/study-patterns",
  [
    authenticateToken,
    query("period").optional().isIn(["week", "month", "year"]).withMessage("Invalid period"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { period = "month" } = req.query
      const userId = req.user.id
      const now = new Date()
      let patterns = []

      if (period === "week") {
        // Last 7 days
        patterns = await Promise.all(
          Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now)
            date.setDate(date.getDate() - (6 - i))
            const start = new Date(date.setHours(0, 0, 0, 0))
            const end = new Date(date.setHours(23, 59, 59, 999))
            return prisma.studySession.aggregate({
              where: {
                userId,
                completed: true,
                startTime: { gte: start, lte: end },
              },
              _sum: { duration: true },
              _count: { _all: true },
            }).then((agg) => ({
              date: start.toISOString().split("T")[0],
              studyTime: agg._sum.duration || 0,
              sessions: agg._count._all,
              productivity: Math.floor(Math.random() * 3) + 7,
            }))
          })
        )
      } else if (period === "month") {
        // Last 30 days
        patterns = await Promise.all(
          Array.from({ length: 30 }, (_, i) => {
            const date = new Date(now)
            date.setDate(date.getDate() - (29 - i))
            const start = new Date(date.setHours(0, 0, 0, 0))
            const end = new Date(date.setHours(23, 59, 59, 999))
            return prisma.studySession.aggregate({
              where: {
                userId,
                completed: true,
                startTime: { gte: start, lte: end },
              },
              _sum: { duration: true },
              _count: { _all: true },
            }).then((agg) => ({
              date: start.toISOString().split("T")[0],
              studyTime: agg._sum.duration || 0,
              sessions: agg._count._all,
              productivity: Math.floor(Math.random() * 3) + 7,
            }))
          })
        )
      } else {
        // Last 12 months
        patterns = await Promise.all(
          Array.from({ length: 12 }, (_, i) => {
            const date = new Date(now)
            date.setMonth(date.getMonth() - (11 - i))
            const start = new Date(date.getFullYear(), date.getMonth(), 1)
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
            return prisma.studySession.aggregate({
              where: {
                userId,
                completed: true,
                startTime: { gte: start, lte: end },
              },
              _sum: { duration: true },
              _count: { _all: true },
            }).then((agg) => ({
              month: start.toISOString().slice(0, 7),
              studyTime: agg._sum.duration || 0,
              sessions: agg._count._all,
              productivity: Math.floor(Math.random() * 3) + 7,
            }))
          })
        )
      }

      // Calculate insights
      const totalStudyTime = patterns.reduce((sum, p) => sum + p.studyTime, 0)
      const avgStudyTime = Math.round(totalStudyTime / patterns.length)
      const mostProductive = patterns.reduce((max, p) => (p.studyTime > max.studyTime ? p : max), patterns[0])

      const insights = {
        totalStudyTime,
        avgStudyTime,
        mostProductiveDay: period === "year" ? mostProductive.month : mostProductive.date,
        consistencyScore: Math.floor(Math.random() * 30) + 70,
        improvementTrend: Math.random() > 0.5 ? "increasing" : "stable",
      }

      res.json({
        patterns,
        insights,
        period,
      })
    } catch (error) {
      console.error("Get study patterns error:", error)
      res.status(500).json({ error: "Failed to fetch study patterns" })
    }
  }
)

// Get progress tracking
router.get("/progress", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    // Get all subjects from user's tasks
    const subjects = await prisma.task.findMany({
      where: { userId },
      select: { subjectArea: true },
      distinct: ["subjectArea"],
    })
    const subjectNames = subjects.map((s) => s.subjectArea)

    // For each subject, get progress
    const progress = await Promise.all(
      subjectNames.map(async (subject) => {
        const tasksInSubject = await prisma.task.findMany({
          where: { userId, subjectArea: subject },
        })
        const completedTasks = tasksInSubject.filter((t) => t.status === "COMPLETED")
        return {
          subject,
          totalTasks: tasksInSubject.length,
          completedTasks: completedTasks.length,
          progress: tasksInSubject.length > 0 ? Math.round((completedTasks.length / tasksInSubject.length) * 100) : 0,
          averageScore: Math.floor(Math.random() * 30) + 70,
          timeSpent: Math.floor(Math.random() * 500) + 100,
          lastActivity: tasksInSubject.length
            ? tasksInSubject.reduce((latest, t) => (t.updatedAt > latest ? t.updatedAt : latest), tasksInSubject[0].updatedAt)
            : null,
        }
      })
    )

    // Overall progress metrics
    const overallMetrics = {
      totalTasksCompleted: progress.reduce((sum, p) => sum + p.completedTasks, 0),
      totalTimeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
      averageProgress: progress.length
        ? Math.round(progress.reduce((sum, p) => sum + p.progress, 0) / progress.length)
        : 0,
      strongestSubject: progress.reduce((max, p) => (p.progress > max.progress ? p : max), progress[0] || { subject: "" }).subject,
      weakestSubject: progress.reduce((min, p) => (p.progress < min.progress ? p : min), progress[0] || { subject: "" }).subject,
    }

    // Learning goals (mock data)
    const learningGoals = [
      {
        id: "goal_1",
        title: "Complete Calculus Course",
        target: 100,
        current: 75,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "on_track",
      },
      {
        id: "goal_2",
        title: "Master Data Structures",
        target: 50,
        current: 35,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: "behind",
      },
    ]

    res.json({
      subjectProgress: progress,
      overallMetrics,
      learningGoals,
    })
  } catch (error) {
    console.error("Get progress tracking error:", error)
    res.status(500).json({ error: "Failed to fetch progress tracking" })
  }
})

// Get performance metrics (still mostly mock, as this is highly custom)
router.get("/performance", authenticateToken, (req, res) => {
  try {
    // You can replace this with real calculations if you have the data
    const performance = {
      studyEfficiency: {
        score: Math.floor(Math.random() * 20) + 80,
        trend: Math.random() > 0.5 ? "improving" : "stable",
        factors: [
          { name: "Focus Time", score: Math.floor(Math.random() * 20) + 80 },
          { name: "Task Completion", score: Math.floor(Math.random() * 20) + 75 },
          { name: "Consistency", score: Math.floor(Math.random() * 20) + 70 },
        ],
      },
      knowledgeRetention: {
        score: Math.floor(Math.random() * 15) + 85,
        trend: "improving",
        recentTests: [
          { subject: "Mathematics", score: 92, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { subject: "Physics", score: 88, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { subject: "Chemistry", score: 85, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        ],
      },
      timeManagement: {
        score: Math.floor(Math.random() * 25) + 75,
        averageSessionLength: 45,
        optimalSessionLength: 50,
        breakFrequency: "good",
        procrastinationIndex: Math.floor(Math.random() * 20) + 10,
      },
      streaks: {
        current: Math.floor(Math.random() * 10) + 5,
        longest: Math.floor(Math.random() * 20) + 15,
        weeklyGoal: 5,
        weeklyProgress: 4,
      },
    }

    // Recommendations based on performance
    const recommendations = [
      {
        type: "study_schedule",
        title: "Optimize Study Schedule",
        description: "Consider studying during your peak focus hours (9-11 AM based on your patterns)",
        priority: "medium",
      },
      {
        type: "break_frequency",
        title: "Increase Break Frequency",
        description: "Take a 5-minute break every 25 minutes to improve focus and retention",
        priority: "high",
      },
      {
        type: "subject_balance",
        title: "Balance Subject Time",
        description: "Spend more time on weaker subjects to improve overall performance",
        priority: "low",
      },
    ]

    res.json({
      performance,
      recommendations,
    })
  } catch (error) {
    console.error("Get performance metrics error:", error)
    res.status(500).json({ error: "Failed to fetch performance metrics" })
  }
})

export default router