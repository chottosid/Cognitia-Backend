import express from "express";
import { prisma } from "../lib/database.js";

const router = express.Router();

// Get all available contests
router.get("/", async (req, res, next) => {
  try {
    const currentDate = new Date();
    const contests = await prisma.contest.findMany({
      where: {
        OR: [
          { status: "UPCOMING" },
          { status: "ONGOING" },
          {
            status: "FINISHED",
            endTime: {
              gte: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000),
            }, // Show contests finished in last 7 days
          },
        ],
      },
      orderBy: { startTime: "asc" },
      include: {
        _count: { select: { assignments: true, registrations: true } },
        registrations: { where: { userId: req.user.id }, select: { id: true } },
        attempts: { where: { userId: req.user.id }, select: { id: true } },
      },
    });

    const enhancedContests = contests.map((contest) => ({
      ...contest,
      questionCount: contest._count.assignments,
      registeredUsers: contest._count.registrations,
      isRegistered: contest.registrations.length > 0,
      hasAttempted: contest.attempts.length > 0,
      _count: undefined,
      registrations: undefined,
      attempts: undefined,
    }));

    res.json({ contests: enhancedContests });
  } catch (error) {
    next(error);
  }
});

// Register for a contest
router.post("/:id/register", async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      select: { status: true },
    });

    if (!contest) return res.status(404).json({ error: "Contest not found" });
    if (contest.status !== "UPCOMING")
      return res
        .status(400)
        .json({ error: "Registration closed for this contest" });

    const existingRegistration = await prisma.contestRegistration.findUnique({
      where: {
        contestId_userId: { contestId: req.params.id, userId: req.user.id },
      },
    });

    if (existingRegistration)
      return res
        .status(400)
        .json({ error: "Already registered for this contest" });

    await prisma.contestRegistration.create({
      data: { contestId: req.params.id, userId: req.user.id },
    });

    res.json({ success: true, message: "Successfully registered for contest" });
  } catch (error) {
    next(error);
  }
});

// Get contests that the user has registered for
router.get("/registered", async (req, res, next) => {
  try {
    const registrations = await prisma.contestRegistration.findMany({
      where: { userId: req.user.id },
      include: {
        contest: {
          select: {
            id: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            status: true,
            difficulty: true,
            _count: { select: { assignments: true } },
          },
        },
      },
    });

    const contests = registrations.map((reg) => ({
      ...reg.contest,
      questionCount: reg.contest._count.assignments,
      registrationTime: reg.registrationTime,
    }));

    res.json({ contests });
  } catch (error) {
    next(error);
  }
});

// Start a contest attempt
router.post("/:id/start", async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: {
        assignments: { include: { question: true } },
        registrations: { where: { userId: req.user.id }, select: { id: true } },
        attempts: {
          where: { userId: req.user.id },
          select: { id: true, status: true },
        },
      },
    });

    if (!contest)
      return res.status(404).json({ error: "Contest not found or not active" });
    if (!contest.registrations.length)
      return res.status(403).json({ error: "Not registered for this contest" });

    const existingAttempt = contest.attempts.find(
      (a) => a.status === "IN_PROGRESS"
    );
    if (existingAttempt)
      return res.status(400).json({ error: "Test is already in progress" });

    const attempt = await prisma.contestAttempt.create({
      data: {
        contestId: req.params.id,
        userId: req.user.id,
        totalQuestions: contest.assignments.length,
        status: "IN_PROGRESS",
      },
    });

    const questions = contest.assignments.map((assignment, index) => ({
      id: assignment.question.id,
      question: assignment.question.question,
      options: assignment.question.options,
      points: assignment.points,
      number: index + 1,
    }));

    res.json({
      attemptId: attempt.id,
      startTime: attempt.startTime,
      endTime: contest.endTime,
      questions,
      totalQuestions: questions.length,
    });
  } catch (error) {
    next(error);
  }
});

// Save answer for a specific question during contest
router.post("/attempt/:attemptId/answer", async (req, res, next) => {
  try {
    const { questionId, answer } = req.body;

    const attempt = await prisma.contestAttempt.findFirst({
      where: {
        id: req.params.attemptId,
        userId: req.user.id,
        status: "IN_PROGRESS",
      },
      include: { contest: { include: { assignments: true } } },
    });

    if (!attempt)
      return res
        .status(404)
        .json({ error: "Active contest attempt not found" });

    const questionExists = attempt.contest.assignments.some(
      (assignment) => assignment.questionId === questionId
    );

    if (!questionExists)
      return res
        .status(400)
        .json({ error: "Question does not belong to this contest" });

    const existingAnswers = attempt.answers || {};
    existingAnswers[questionId] = answer;

    await prisma.contestAttempt.update({
      where: { id: req.params.attemptId },
      data: { answers: existingAnswers, lastActivity: new Date() },
    });

    res.json({ success: true, message: "Answer saved" });
  } catch (error) {
    next(error);
  }
});

// Submit contest attempt
router.post("/attempt/:attemptId/submit", async (req, res, next) => {
  try {
    const { timeSpent } = req.body;

    const attempt = await prisma.contestAttempt.findFirst({
      where: {
        id: req.params.attemptId,
        userId: req.user.id,
        status: "IN_PROGRESS",
      },
      include: {
        contest: { include: { assignments: { include: { question: true } } } },
      },
    });

    if (!attempt)
      return res
        .status(404)
        .json({ error: "Active contest attempt not found" });

    const answers = attempt.answers || {};
    let score = 0;
    let correctAnswers = 0;

    attempt.contest.assignments.forEach((assignment) => {
      if (
        answers[assignment.question.id] === assignment.question.correctAnswer
      ) {
        score += assignment.points;
        correctAnswers++;
      }
    });

    await prisma.contestAttempt.update({
      where: { id: req.params.attemptId },
      data: {
        status: "COMPLETED",
        score,
        correctAnswers,
        timeSpent: timeSpent || 0,
        endTime: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Contest attempt submitted successfully",
      score,
      correctAnswers,
      totalQuestions: attempt.totalQuestions,
    });
  } catch (error) {
    next(error);
  }
});

// Get contest attempt results
router.get("/attempt/:attemptId/results", async (req, res, next) => {
  try {
    const attempt = await prisma.contestAttempt.findFirst({
      where: {
        id: req.params.attemptId,
        userId: req.user.id,
        status: "COMPLETED",
      },
      include: {
        contest: {
          include: { assignments: { include: { question: true } } },
        },
      },
    });

    if (!attempt)
      return res.status(404).json({ error: "Completed attempt not found" });

    const questions = attempt.contest.assignments.map((assignment, index) => ({
      number: index + 1,
      id: assignment.question.id,
      question: assignment.question.question,
      options: assignment.question.options,
      correctAnswer: assignment.question.correctAnswer,
      userAnswer: attempt.answers[assignment.question.id],
      isCorrect:
        attempt.answers[assignment.question.id] ===
        assignment.question.correctAnswer,
      explanation: assignment.question.explanation,
      subject: assignment.question.subject,
      topics: assignment.question.topics,
      points: assignment.points,
    }));

    res.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        timeSpent: attempt.timeSpent,
        percentage: Math.round(
          (attempt.score /
            attempt.contest.assignments.reduce((sum, a) => sum + a.points, 0)) *
            100
        ),
      },
      contest: {
        id: attempt.contest.id,
        title: attempt.contest.title,
      },
      questions,
    });
  } catch (error) {
    next(error);
  }
});

// Get contest rankings
router.get("/:id/rankings", async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: {
        attempts: {
          where: { status: "COMPLETED" },
          include: {
            user: { select: { id: true, name: true, institution: true } },
          },
          orderBy: [{ score: "desc" }, { timeSpent: "asc" }],
        },
      },
    });

    if (!contest) return res.status(404).json({ error: "Contest not found" });

    const rankings = contest.attempts.map((attempt, index) => ({
      rank: index + 1,
      userId: attempt.user.id,
      name: attempt.user.name,
      institution: attempt.user.institution || "Not specified",
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      timeSpent: attempt.timeSpent,
      isCurrentUser: attempt.user.id === req.user.id,
    }));

    res.json({
      contest: {
        id: contest.id,
        title: contest.title,
      },
      rankings,
      totalParticipants: rankings.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
