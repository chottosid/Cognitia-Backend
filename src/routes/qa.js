import express from "express";
import { prisma } from "../lib/database.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";
import { body } from "express-validator";
import { createAndSendNotification } from "../utils/notification.js";

const router = express.Router();

// Get questions
router.get("/questions", async (req, res) => {
  try {
    console.log("Incoming /questions query params:", req.query);

    let {
      page = 1,
      limit = 10,
      search,
      tags,
      sortBy = "createdAt",
      sortOrder = "DESC",
      userId,
      status = "all",
    } = req.query;

    page = Number.parseInt(page) || 1;
    limit = Number.parseInt(limit) || 10;

    let tagsArray = null;
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === "string" && tags.trim() !== "") {
        tagsArray = tags.includes(",")
          ? tags.split(",").map((t) => t.trim())
          : [tags];
      }
    }

    // Build Prisma where clause
    const where = {};
    if (search && search.trim() !== "") {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ];
    }
    if (tagsArray && tagsArray.length > 0 && tagsArray[0] !== "") {
      where.tags = { hasSome: tagsArray };
    }
    if (userId) {
      where.authorId = userId;
    }

    // Validate sort parameters
    const validSortColumns = ["createdAt", "updatedAt", "title", "views"];
    const validSortOrders = ["asc", "desc"];
    const finalSortBy = validSortColumns.includes(sortBy)
      ? sortBy
      : "createdAt";
    const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase())
      ? sortOrder.toLowerCase()
      : "desc";

    // Fetch questions with Prisma
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { [finalSortBy]: finalSortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: true,
          answers: true,
          votes: true,
        },
      }),
      prisma.question.count({ where }),
    ]);

    // Calculate vote counts and answer counts
    const mappedQuestions = questions.map((q) => {
      const upvotes = q.votes.filter((v) => v.voteType === "UP").length;
      const downvotes = q.votes.filter((v) => v.voteType === "DOWN").length;
      const answerCount = q.answers.length;

      return {
        id: q.id,
        title: q.title,
        content: q.body,
        subject: q.subject,
        tags: q.tags,
        author: {
          id: q.authorId,
          name: q.author?.name || "",
          avatar: q.author?.avatar || null,
        },
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        views: q.views,
        upvotes,
        downvotes,
        answerCount,
        isAnswered: answerCount > 0,
        isFeatured: false,
      };
    });

    res.json({
      questions: mappedQuestions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
    });
  } catch (error) {
    console.error("Get questions error:", error);
    if (error instanceof Error) {
      res
        .status(500)
        .json({ error: "Failed to get questions", details: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Failed to get questions", details: error });
    }
  }
});

// Get single question with answers
router.get("/questions/:id", async (req, res) => {
  try {
    const questionId = req.params.id;
    console.log("Fetching question for questionId:", questionId);

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        author: true,
        answers: {
          include: {
            author: true,
            votes: true,
          },
          orderBy: [{ createdAt: "asc" }],
        },
        votes: true,
      },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Increment view count
    await prisma.question.update({
      where: { id: questionId },
      data: { views: question.views + 1 },
    });

    const upvotes = question.votes.filter((v) => v.voteType === "UP").length;
    const downvotes = question.votes.filter(
      (v) => v.voteType === "DOWN"
    ).length;

    const mappedQuestion = {
      id: question.id,
      title: question.title,
      content: question.body,
      subject: question.subject,
      tags: question.tags,
      author: {
        id: question.authorId,
        name: question.author?.name || "",
        avatar: question.author?.avatar || null,
      },
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      views: question.views + 1,
      upvotes,
      downvotes,
      answerCount: question.answers.length,
      isAnswered: question.answers.length > 0,
      isFeatured: false,
    };

    res.json({ question: mappedQuestion });
  } catch (error) {
    console.error("Get question error:", error);
    if (error instanceof Error) {
      res
        .status(500)
        .json({ error: "Failed to get question", details: error.message });
    } else {
      res.status(500).json({ error: "Failed to get question", details: error });
    }
  }
});

// Get answers for a question
router.get("/questions/:id/answers", async (req, res) => {
  try {
    const questionId = req.params.id;
    console.log("Fetching answers for questionId:", questionId);

    const answers = await prisma.answer.findMany({
      where: { questionId: questionId },
      include: {
        author: true,
        votes: true,
      },
      orderBy: [{ createdAt: "asc" }],
    });

    const mappedAnswers = answers.map((a) => {
      const upvotes = a.votes.filter((v) => v.voteType === "UP").length;
      const downvotes = a.votes.filter((v) => v.voteType === "DOWN").length;

      return {
        id: a.id,
        content: a.content,
        author: {
          id: a.authorId,
          name: a.author?.name || "",
          avatar: a.author?.avatar || null,
        },
        createdAt: a.createdAt,
        upvotes,
        downvotes,
      };
    });

    res.json({ answers: mappedAnswers });
  } catch (error) {
    console.error("Get answers error:", error);
    if (error instanceof Error) {
      res
        .status(500)
        .json({ error: "Failed to get answers", details: error.message });
    } else {
      res.status(500).json({ error: "Failed to get answers", details: error });
    }
  }
});

// Create question
router.post("/questions", authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, subject } = req.body;

    const question = await prisma.question.create({
      data: {
        authorId: req.user.id,
        title,
        body: content,
        tags: tags || [],
        subject,
      },
      include: {
        author: true,
      },
    });

    // Send notification to the user
    await createAndSendNotification({
      userId: req.user.id,
      type: "ACCEPTANCE",
      title: "Question Approved",
      message: "Your question has been posted and approved.",
    });

    res.status(201).json({
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    console.error("Create question error:", error);
    res
      .status(500)
      .json({ error: "Failed to create question", details: error.message });
  }
});

// Create answer
router.post("/questions/:id/answers", authenticateToken, async (req, res) => {
  try {
    const questionId = req.params.id;
    const { content } = req.body;

    if (!content || content.trim().length < 10) {
      return res
        .status(400)
        .json({ error: "Answer content must be at least 10 characters" });
    }

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Create answer
    const answer = await prisma.answer.create({
      data: {
        questionId: questionId,
        authorId: req.user.id,
        content: content.trim(),
      },
      include: {
        author: true,
      },
    });

    res.status(201).json({
      message: "Answer created successfully",
      answer,
    });
  } catch (error) {
    console.error("Create answer error:", error);
    res
      .status(500)
      .json({ error: "Failed to create answer", details: error.message });
  }
});

// Vote on question or answer
router.post("/vote", authenticateToken, async (req, res) => {
  try {
    const { targetType, targetId, voteType } = req.body;

    if (!["question", "answer"].includes(targetType)) {
      return res
        .status(400)
        .json({ error: "Target type must be question or answer" });
    }
    if (!["UP", "DOWN"].includes(voteType)) {
      return res.status(400).json({ error: "Vote type must be UP or DOWN" });
    }

    // Check if target exists
    let target;
    if (targetType === "question") {
      target = await prisma.question.findUnique({ where: { id: targetId } });
      if (!target) {
        return res.status(404).json({ error: "Question not found" });
      }
      if (target.authorId === req.user.id) {
        return res
          .status(400)
          .json({ error: "Cannot vote on your own question" });
      }
    } else {
      target = await prisma.answer.findUnique({ where: { id: targetId } });
      if (!target) {
        return res.status(404).json({ error: "Answer not found" });
      }
      if (target.authorId === req.user.id) {
        return res
          .status(400)
          .json({ error: "Cannot vote on your own answer" });
      }
    }

    // Check existing vote
    let existingVote;
    if (targetType === "question") {
      existingVote = await prisma.questionVote.findUnique({
        where: {
          questionId_userId: {
            questionId: targetId,
            userId: req.user.id,
          },
        },
      });
    } else {
      existingVote = await prisma.answerVote.findUnique({
        where: {
          answerId_userId: {
            answerId: targetId,
            userId: req.user.id,
          },
        },
      });
    }

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        if (targetType === "question") {
          await prisma.questionVote.delete({ where: { id: existingVote.id } });
        } else {
          await prisma.answerVote.delete({ where: { id: existingVote.id } });
        }
      } else {
        // Update vote
        if (targetType === "question") {
          await prisma.questionVote.update({
            where: { id: existingVote.id },
            data: { voteType },
          });
        } else {
          await prisma.answerVote.update({
            where: { id: existingVote.id },
            data: { voteType },
          });
        }
      }
    } else {
      // Create new vote
      if (targetType === "question") {
        await prisma.questionVote.create({
          data: {
            questionId: targetId,
            userId: req.user.id,
            voteType,
          },
        });
      } else {
        await prisma.answerVote.create({
          data: {
            answerId: targetId,
            userId: req.user.id,
            voteType,
          },
        });
      }
    }

    // Get updated vote counts
    let upVotes, downVotes;
    if (targetType === "question") {
      upVotes = await prisma.questionVote.count({
        where: { questionId: targetId, voteType: "UP" },
      });
      downVotes = await prisma.questionVote.count({
        where: { questionId: targetId, voteType: "DOWN" },
      });
    } else {
      upVotes = await prisma.answerVote.count({
        where: { answerId: targetId, voteType: "UP" },
      });
      downVotes = await prisma.answerVote.count({
        where: { answerId: targetId, voteType: "DOWN" },
      });
    }

    const voteCount = upVotes - downVotes;

    res.json({
      message: "Vote updated successfully",
      voteCount,
      upVotes,
      downVotes,
    });
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ error: "Failed to vote", details: error.message });
  }
});

// Get trending tags
router.get("/tags/trending", async (req, res) => {
  try {
    // Get tags from questions created in last 30 days
    const recentQuestions = await prisma.question.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: { tags: true },
    });

    // Flatten tags and count
    const tagCounts = {};
    recentQuestions.forEach((q) => {
      (q.tags || []).forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort and limit
    const trendingTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    res.json({ tags: trendingTags });
  } catch (error) {
    console.error("Get trending tags error:", error);
    res
      .status(500)
      .json({ error: "Failed to get trending tags", details: error.message });
  }
});

// Get questions of the authenticated user
router.get("/my-questions", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching questions for userId:", req.user.id);

    let {
      page = 1,
      limit = 10,
      search,
      tags,
      sortBy = "createdAt",
      sortOrder = "DESC",
      status = "all",
    } = req.query;

    page = Number.parseInt(page) || 1;
    limit = Number.parseInt(limit) || 10;

    let tagsArray = null;
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === "string" && tags.trim() !== "") {
        tagsArray = tags.includes(",")
          ? tags.split(",").map((t) => t.trim())
          : [tags];
      }
    }

    // Build Prisma where clause
    const where = { authorId: req.user.id };
    if (search && search.trim() !== "") {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
      ];
    }
    if (tagsArray && tagsArray.length > 0 && tagsArray[0] !== "") {
      where.tags = { hasSome: tagsArray };
    }

    // Validate sort parameters
    const validSortColumns = ["createdAt", "updatedAt", "title", "views"];
    const validSortOrders = ["asc", "desc"];
    const finalSortBy = validSortColumns.includes(sortBy)
      ? sortBy
      : "createdAt";
    const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase())
      ? sortOrder.toLowerCase()
      : "desc";

    // Fetch questions with Prisma
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { [finalSortBy]: finalSortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: true,
          answers: true,
          votes: true,
        },
      }),
      prisma.question.count({ where }),
    ]);

    // Calculate vote counts and answer counts, and filter by status if needed
    let mappedQuestions = questions.map((q) => {
      const upvotes = q.votes.filter((v) => v.voteType === "UP").length;
      const downvotes = q.votes.filter((v) => v.voteType === "DOWN").length;
      const answerCount = q.answers.length;

      return {
        id: q.id,
        title: q.title,
        content: q.body,
        subject: q.subject,
        tags: q.tags,
        author: {
          id: q.authorId,
          name: q.author?.name || "",
          avatar: q.author?.avatar || null,
        },
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
        views: q.views,
        upvotes,
        downvotes,
        answerCount,
        isAnswered: answerCount > 0,
        isFeatured: false,
      };
    });

    // Filter by status after mapping (for consistency with main endpoint)
    if (status === "resolved") {
      mappedQuestions = mappedQuestions.filter((q) => q.isAnswered);
    } else if (status === "unresolved") {
      mappedQuestions = mappedQuestions.filter((q) => !q.isAnswered);
    }

    // Update total count for status filtering
    const finalTotal = status === "all" ? total : mappedQuestions.length;

    res.json({
      questions: mappedQuestions,
      pagination: {
        page,
        limit,
        total: finalTotal,
        totalPages: Math.ceil(finalTotal / limit),
      },
    });
  } catch (error) {
    console.error("Get my questions error:", error);
    if (error instanceof Error) {
      res
        .status(500)
        .json({ error: "Failed to get questions", details: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Failed to get questions", details: error });
    }
  }
});

export default router;
