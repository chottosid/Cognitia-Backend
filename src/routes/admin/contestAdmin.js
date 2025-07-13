import express from "express";
import { prisma } from "../../lib/database.js";

const router = express.Router();

// Admin middleware - check if user is admin
const isAdmin = async (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Apply admin middleware to all routes
router.use(isAdmin);

// Get all questions with filtering for contest creation
router.get("/questions", async (req, res, next) => {
  try {
    const {
      subject,
      topics,
      difficulty,
      page = 1,
      limit = 50,
      search = "",
      excludeContestId,
    } = req.query;

    const where = {
      ...(subject && { subject }),
      ...(topics && { topics: { hasSome: Array.isArray(topics) ? topics : [topics] } }),
      ...(difficulty && { difficulty }),
      ...(search && { question: { contains: search, mode: "insensitive" } }),
    };

    if (excludeContestId) {
      const excludeIds = await prisma.questionAssignment.findMany({
        where: { contestId: excludeContestId },
        select: { questionId: true },
      }).then(assignments => assignments.map(a => a.questionId));
      if (excludeIds.length) where.id = { notIn: excludeIds };
    }

    const [questions, totalCount] = await Promise.all([
      prisma.questionBank.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.questionBank.count({ where }),
    ]);

    res.json({
      questions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create a new contest
router.post("/contests", async (req, res, next) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      difficulty,
      topics,
      eligibility,
      selectedQuestions,
    } = req.body;

    if (!title || !description || !startTime || !endTime || !selectedQuestions?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const questions = await prisma.questionBank.findMany({
      where: { id: { in: selectedQuestions.map(q => q.questionId) } },
    });

    if (questions.length !== selectedQuestions.length) {
      return res.status(400).json({ error: "Some questions do not exist" });
    }

    const contest = await prisma.contest.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        difficulty,
        topics,
        eligibility,
        status: new Date() >= new Date(startTime) ? "ONGOING" : "UPCOMING",
        assignments: {
          create: selectedQuestions.map(q => ({
            questionId: q.questionId,
            points: q.points || 5,
          })),
        },
      },
    });

    res.status(201).json({ contest });
  } catch (error) {
    next(error);
  }
});

// Update contest
router.put("/contests/:id", async (req, res, next) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      difficulty,
      topics,
      eligibility,
    } = req.body;

    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { attempts: true } } },
    });

    if (!contest) return res.status(404).json({ error: "Contest not found" });
    if (contest.status !== "UPCOMING" && contest._count.attempts > 0) {
      return res.status(400).json({ error: "Cannot modify contest after attempts have started" });
    }

    const updatedContest = await prisma.contest.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(difficulty && { difficulty }),
        ...(topics && { topics }),
        ...(eligibility && { eligibility }),
      },
    });

    res.json({ contest: updatedContest });
  } catch (error) {
    next(error);
  }
});

// Add or replace questions in contest
router.put("/contests/:id/questions", async (req, res, next) => {
  try {
    const { questions } = req.body;

    if (!questions?.length) {
      return res.status(400).json({ error: "Questions array is required" });
    }

    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { attempts: true } } },
    });

    if (!contest) return res.status(404).json({ error: "Contest not found" });
    if (contest.status !== "UPCOMING" && contest._count.attempts > 0) {
      return res.status(400).json({ error: "Cannot modify contest after attempts have started" });
    }

    const questionIds = questions.map(q => q.questionId);
    const validQuestions = await prisma.questionBank.findMany({
      where: { id: { in: questionIds } },
    });

    if (validQuestions.length !== questionIds.length) {
      return res.status(400).json({ error: "Some questions do not exist" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.questionAssignment.deleteMany({ where: { contestId: req.params.id } });
      await tx.questionAssignment.createMany({
        data: questions.map(q => ({
          questionId: q.questionId,
          contestId: req.params.id,
          points: q.points || 5,
        })),
      });
    });

    res.json({ success: true, message: `${questions.length} questions assigned to contest` });
  } catch (error) {
    next(error);
  }
});

// Get contest leaderboard
router.get("/contests/:id/leaderboard", async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: {
        attempts: {
          where: { status: "COMPLETED" },
          include: { user: { select: { id: true, name: true, institution: true } } },
          orderBy: [{ score: "desc" }, { timeSpent: "asc" }],
        },
        assignments: { select: { points: true } },
      },
    });

    if (!contest) return res.status(404).json({ error: "Contest not found" });

    const totalPoints = contest.assignments.reduce((sum, a) => sum + a.points, 0);

    const leaderboard = contest.attempts.map((attempt, index) => ({
      rank: index + 1,
      user: attempt.user,
      score: attempt.score,
      percentage: totalPoints > 0 ? Math.round((attempt.score / totalPoints) * 100) : 0,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      timeSpent: attempt.timeSpent,
    }));

    res.json({
      contest: {
        id: contest.id,
        title: contest.title,
        totalPoints,
      },
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
});

// Delete contest
router.delete("/contests/:id", async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { attempts: true } } },
    });

    if (!contest) return res.status(404).json({ error: "Contest not found" });
    if (contest._count.attempts > 0) {
      return res.status(400).json({ error: "Cannot delete contest with existing attempts" });
    }

    await prisma.contest.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: "Contest deleted successfully" });
  } catch (error) {
    next(error);
  }
});


// Get detailed contest information for editing
router.get("/contests/:id", async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: {
        assignments: {
          include: {
            question: true,
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            registrations: true,
            attempts: true,
          },
        },
      },
    });

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const detailedContest = {
      ...contest,
      questions: contest.assignments.map((assignment) => ({
        assignmentId: assignment.id,
        id: assignment.question.id,
        question: assignment.question.question,
        options: assignment.question.options,
        correctAnswer: assignment.question.correctAnswer,
        explanation: assignment.question.explanation,
        subject: assignment.question.subject,
        topics: assignment.question.topics,
        difficulty: assignment.question.difficulty,
        points: assignment.points,
      })),
      registeredUsers: contest._count.registrations,
      totalAttempts: contest._count.attempts,
      canModify: contest.status === "UPCOMING" && contest._count.attempts === 0,
      assignments: undefined,
      _count: undefined,
    };

    res.json({ contest: detailedContest });
  } catch (error) {
    next(error);
  }
});

// Update contest basic information
router.put("/contests/:id", async (req, res, next) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      difficulty,
      topics,
      eligibility,
    } = req.body;

    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { attempts: true } } },
    });

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    if (contest.status !== "UPCOMING" && contest._count.attempts > 0) {
      return res.status(400).json({
        error:
          "Cannot modify contest after participants have started attempting",
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (topics !== undefined) updateData.topics = topics;
    if (eligibility !== undefined) updateData.eligibility = eligibility;

    if (startTime || endTime) {
      const newStartTime = startTime ? new Date(startTime) : contest.startTime;
      const newEndTime = endTime ? new Date(endTime) : contest.endTime;

      if (newStartTime >= newEndTime) {
        return res
          .status(400)
          .json({ error: "End time must be after start time" });
      }

      updateData.startTime = newStartTime;
      updateData.endTime = newEndTime;

      const now = new Date();
      if (now >= newStartTime && now <= newEndTime) {
        updateData.status = "ONGOING";
      } else if (now > newEndTime) {
        updateData.status = "FINISHED";
      } else {
        updateData.status = "UPCOMING";
      }
    }

    const updatedContest = await prisma.contest.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ contest: updatedContest });
  } catch (error) {
    next(error);
  }
});

// Add multiple questions to contest
router.post("/contests/:id/questions", async (req, res, next) => {
  try {
    const { questions } = req.body; // Array of {questionId, points}

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Questions array is required" });
    }

    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { attempts: true } } },
    });

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    if (contest.status !== "UPCOMING" && contest._count.attempts > 0) {
      return res.status(400).json({
        error:
          "Cannot modify questions after participants have started attempting",
      });
    }

    const questionIds = questions.map((q) => q.questionId);

    // Validate questions exist
    const validQuestions = await prisma.questionBank.findMany({
      where: { id: { in: questionIds } },
    });

    if (validQuestions.length !== questionIds.length) {
      return res.status(400).json({ error: "Some questions do not exist" });
    }

    // Check for existing assignments
    const existingAssignments = await prisma.questionAssignment.findMany({
      where: {
        contestId: req.params.id,
        questionId: { in: questionIds },
      },
    });

    const existingQuestionIds = existingAssignments.map((a) => a.questionId);
    const newQuestions = questions.filter(
      (q) => !existingQuestionIds.includes(q.questionId)
    );

    if (newQuestions.length === 0) {
      return res
        .status(400)
        .json({ error: "All questions are already assigned to this contest" });
    }

    await prisma.questionAssignment.createMany({
      data: newQuestions.map((q) => ({
        questionId: q.questionId,
        contestId: req.params.id,
        points: q.points || 5,
      })),
    });

    res.json({
      success: true,
      message: `${newQuestions.length} questions added to contest`,
      addedQuestions: newQuestions.length,
      skippedQuestions: existingQuestionIds.length,
    });
  } catch (error) {
    next(error);
  }
});

// Remove questions from contest
router.delete("/contests/:id/questions", async (req, res, next) => {
  try {
    const { questionIds } = req.body;

    if (
      !questionIds ||
      !Array.isArray(questionIds) ||
      questionIds.length === 0
    ) {
      return res.status(400).json({ error: "Question IDs are required" });
    }

    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { attempts: true, assignments: true } } },
    });

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    if (contest.status !== "UPCOMING" && contest._count.attempts > 0) {
      return res.status(400).json({
        error:
          "Cannot modify questions after participants have started attempting",
      });
    }

    const remainingQuestions = contest._count.assignments - questionIds.length;
    if (remainingQuestions <= 0) {
      return res
        .status(400)
        .json({ error: "Contest must have at least one question" });
    }

    const deletedAssignments = await prisma.questionAssignment.deleteMany({
      where: {
        contestId: req.params.id,
        questionId: { in: questionIds },
      },
    });

    res.json({
      success: true,
      message: `${deletedAssignments.count} questions removed from contest`,
      removedQuestions: deletedAssignments.count,
    });
  } catch (error) {
    next(error);
  }
});

// Update question points in contest
router.put(
  "/contests/:id/questions/:questionId/points",
  async (req, res, next) => {
    try {
      const { points } = req.body;

      if (!points || points < 1) {
        return res.status(400).json({ error: "Points must be at least 1" });
      }

      const contest = await prisma.contest.findUnique({
        where: { id: req.params.id },
        include: { _count: { select: { attempts: true } } },
      });

      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }

      if (contest.status !== "UPCOMING" && contest._count.attempts > 0) {
        return res.status(400).json({
          error:
            "Cannot modify question points after participants have started attempting",
        });
      }

      const assignment = await prisma.questionAssignment.findFirst({
        where: {
          contestId: req.params.id,
          questionId: req.params.questionId,
        },
      });

      if (!assignment) {
        return res
          .status(404)
          .json({ error: "Question not found in this contest" });
      }

      const updatedAssignment = await prisma.questionAssignment.update({
        where: { id: assignment.id },
        data: { points },
      });

      res.json({
        success: true,
        message: "Question points updated",
        assignment: updatedAssignment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update contest status
router.patch("/contests/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["UPCOMING", "ONGOING", "FINISHED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const contest = await prisma.contest.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ success: true, contest });
  } catch (error) {
    next(error);
  }
});

// Get contest statistics
router.get("/contests/:id/stats", async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            registrations: true,
            attempts: true,
            assignments: true,
          },
        },
        attempts: {
          where: { status: "COMPLETED" },
          select: {
            score: true,
            correctAnswers: true,
            totalQuestions: true,
            timeSpent: true,
          },
        },
        assignments: {
          select: { points: true },
        },
      },
    });

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const completedAttempts = contest.attempts;
    const totalAttempts = contest._count.attempts;
    const totalPoints = contest.assignments.reduce(
      (sum, a) => sum + a.points,
      0
    );

    const stats = {
      contestInfo: {
        id: contest.id,
        title: contest.title,
        status: contest.status,
        startTime: contest.startTime,
        endTime: contest.endTime,
      },
      participation: {
        registeredUsers: contest._count.registrations,
        totalAttempts,
        completedAttempts: completedAttempts.length,
        completionRate:
          totalAttempts > 0
            ? Math.round((completedAttempts.length / totalAttempts) * 100)
            : 0,
      },
      questions: {
        totalQuestions: contest._count.assignments,
        totalPoints,
      },
      performance: {
        averageScore:
          completedAttempts.length > 0
            ? Math.round(
                completedAttempts.reduce((sum, a) => sum + a.score, 0) /
                  completedAttempts.length
              )
            : 0,
        averageCorrectAnswers:
          completedAttempts.length > 0
            ? Math.round(
                completedAttempts.reduce(
                  (sum, a) => sum + a.correctAnswers,
                  0
                ) / completedAttempts.length
              )
            : 0,
        averageTimeSpent:
          completedAttempts.length > 0
            ? Math.round(
                completedAttempts.reduce(
                  (sum, a) => sum + (a.timeSpent || 0),
                  0
                ) / completedAttempts.length
              )
            : 0,
        highestScore:
          completedAttempts.length > 0
            ? Math.max(...completedAttempts.map((a) => a.score))
            : 0,
        lowestScore:
          completedAttempts.length > 0
            ? Math.min(...completedAttempts.map((a) => a.score))
            : 0,
      },
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get all contest participants with their attempts
router.get("/contests/:id/participants", async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                institution: true,
              },
            },
          },
        },
        attempts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                institution: true,
              },
            },
          },
          orderBy: { score: "desc" },
        },
      },
    });

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const participants = contest.registrations.map((reg) => {
      const attempt = contest.attempts.find(
        (att) => att.userId === reg.user.id
      );
      return {
        user: reg.user,
        registrationTime: reg.registrationTime,
        attempt: attempt
          ? {
              id: attempt.id,
              status: attempt.status,
              score: attempt.score,
              correctAnswers: attempt.correctAnswers,
              totalQuestions: attempt.totalQuestions,
              timeSpent: attempt.timeSpent,
              startTime: attempt.startTime,
              endTime: attempt.endTime,
            }
          : null,
      };
    });

    res.json({
      contest: {
        id: contest.id,
        title: contest.title,
        status: contest.status,
      },
      participants,
      totalRegistered: participants.length,
      totalAttempted: contest.attempts.length,
    });
  } catch (error) {
    next(error);
  }
});

// Delete contest
router.delete("/contests/:id", async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { attempts: true } } },
    });

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    if (contest._count.attempts > 0) {
      return res.status(400).json({
        error:
          "Cannot delete contest with existing attempts. Consider marking it as finished instead.",
      });
    }

    await prisma.contest.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "Contest deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Auto-submit expired contest attempts
router.post("/auto-submit-expired", async (req, res, next) => {
  try {
    const now = new Date();

    const endedContests = await prisma.contest.findMany({
      where: {
        endTime: { lt: now },
        attempts: {
          some: {
            status: "IN_PROGRESS",
          },
        },
      },
      include: {
        attempts: {
          where: { status: "IN_PROGRESS" },
          include: {
            contest: {
              include: {
                assignments: { include: { question: true } },
              },
            },
          },
        },
      },
    });

    let submittedCount = 0;

    for (const contest of endedContests) {
      for (const attempt of contest.attempts) {
        const answers = attempt.answers ? JSON.parse(attempt.answers) : {};
        let score = 0;
        let correctAnswers = 0;

        attempt.contest.assignments.forEach((assignment) => {
          const userAnswer = answers[assignment.question.id];
          if (userAnswer === assignment.question.correctAnswer) {
            score += assignment.points;
            correctAnswers++;
          }
        });

        await prisma.contestAttempt.update({
          where: { id: attempt.id },
          data: {
            status: "COMPLETED",
            score,
            correctAnswers,
            endTime: now,
            timeSpent: Math.floor(
              (now.getTime() - new Date(attempt.startTime).getTime()) / 1000
            ),
          },
        });

        submittedCount++;
      }
    }

    res.json({ success: true, submittedAttempts: submittedCount });
  } catch (error) {
    next(error);
  }
});

// Bulk update questions in contest (replace all questions)
router.put("/contests/:id/questions", async (req, res, next) => {
  try {
    const { questions } = req.body; // Array of {questionId, points}

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ error: "Questions array is required and must not be empty" });
    }

    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { attempts: true } } },
    });

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    if (contest.status !== "UPCOMING" && contest._count.attempts > 0) {
      return res.status(400).json({
        error:
          "Cannot modify questions after participants have started attempting",
      });
    }

    const questionIds = questions.map((q) => q.questionId);

    // Validate all questions exist
    const validQuestions = await prisma.questionBank.findMany({
      where: { id: { in: questionIds } },
    });

    if (validQuestions.length !== questionIds.length) {
      return res.status(400).json({ error: "Some questions do not exist" });
    }

    // Delete existing assignments and create new ones in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all existing assignments
      await tx.questionAssignment.deleteMany({
        where: { contestId: req.params.id },
      });

      // Create new assignments
      await tx.questionAssignment.createMany({
        data: questions.map((q) => ({
          questionId: q.questionId,
          contestId: req.params.id,
          points: q.points || 5,
        })),
      });
    });

    res.json({
      success: true,
      message: `Contest questions updated. ${questions.length} questions assigned.`,
      totalQuestions: questions.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get contest leaderboard with detailed rankings (admin view)
router.get("/contests/:id/leaderboard", async (req, res, next) => {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: {
        attempts: {
          where: { status: "COMPLETED" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                institution: true,
              },
            },
          },
          orderBy: [
            { score: "desc" },
            { correctAnswers: "desc" },
            { timeSpent: "asc" },
          ],
        },
        assignments: {
          select: { points: true },
        },
      },
    });

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const totalPoints = contest.assignments.reduce(
      (sum, a) => sum + a.points,
      0
    );

    const leaderboard = contest.attempts.map((attempt, index) => ({
      rank: index + 1,
      user: attempt.user,
      score: attempt.score,
      percentage:
        totalPoints > 0 ? Math.round((attempt.score / totalPoints) * 100) : 0,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      timeSpent: attempt.timeSpent,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      submissionTime: attempt.endTime,
    }));

    res.json({
      contest: {
        id: contest.id,
        title: contest.title,
        status: contest.status,
        startTime: contest.startTime,
        endTime: contest.endTime,
        totalPoints,
      },
      leaderboard,
      totalParticipants: leaderboard.length,
      statistics: {
        averageScore:
          leaderboard.length > 0
            ? Math.round(
                leaderboard.reduce((sum, entry) => sum + entry.score, 0) /
                  leaderboard.length
              )
            : 0,
        averagePercentage:
          leaderboard.length > 0
            ? Math.round(
                leaderboard.reduce((sum, entry) => sum + entry.percentage, 0) /
                  leaderboard.length
              )
            : 0,
        averageTimeSpent:
          leaderboard.length > 0
            ? Math.round(
                leaderboard.reduce(
                  (sum, entry) => sum + (entry.timeSpent || 0),
                  0
                ) / leaderboard.length
              )
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Export contest data (admin only)
router.get("/contests/:id/export", async (req, res, next) => {
  try {
    const { format = "json" } = req.query;

    const contest = await prisma.contest.findUnique({
      where: { id: req.params.id },
      include: {
        assignments: {
          include: {
            question: true,
          },
        },
        attempts: {
          where: { status: "COMPLETED" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                institution: true,
              },
            },
          },
          orderBy: { score: "desc" },
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                institution: true,
              },
            },
          },
        },
      },
    });

    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }

    const exportData = {
      contest: {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        status: contest.status,
        difficulty: contest.difficulty,
        topics: contest.topics,
        eligibility: contest.eligibility,
      },
      questions: contest.assignments.map((assignment, index) => ({
        number: index + 1,
        question: assignment.question.question,
        options: assignment.question.options,
        correctAnswer: assignment.question.correctAnswer,
        explanation: assignment.question.explanation,
        subject: assignment.question.subject,
        topics: assignment.question.topics,
        difficulty: assignment.question.difficulty,
        points: assignment.points,
      })),
      registrations: contest.registrations.map((reg) => ({
        user: reg.user,
        registrationTime: reg.registrationTime,
      })),
      results: contest.attempts.map((attempt, index) => ({
        rank: index + 1,
        user: attempt.user,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        timeSpent: attempt.timeSpent,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        answers: attempt.answers,
      })),
      statistics: {
        totalRegistrations: contest.registrations.length,
        totalAttempts: contest.attempts.length,
        completionRate:
          contest.registrations.length > 0
            ? Math.round(
                (contest.attempts.length / contest.registrations.length) * 100
              )
            : 0,
        averageScore:
          contest.attempts.length > 0
            ? Math.round(
                contest.attempts.reduce((sum, a) => sum + a.score, 0) /
                  contest.attempts.length
              )
            : 0,
      },
    };

    if (format === "csv") {
      // For CSV format, we'll just return the results in a CSV-friendly format
      const csvData = contest.attempts.map((attempt, index) => ({
        rank: index + 1,
        name: attempt.user.name,
        email: attempt.user.email,
        institution: attempt.user.institution || "",
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        percentage: Math.round(
          (attempt.score /
            contest.assignments.reduce((sum, a) => sum + a.points, 0)) *
            100
        ),
        timeSpent: attempt.timeSpent,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
      }));

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${contest.title}_results.csv"`
      );

      // Simple CSV conversion (in production, use a proper CSV library)
      const headers = Object.keys(csvData[0] || {}).join(",");
      const rows = csvData.map((row) => Object.values(row).join(","));
      const csv = [headers, ...rows].join("\n");

      return res.send(csv);
    }

    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

export default router;
