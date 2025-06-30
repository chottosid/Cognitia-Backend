import express from "express"
import { body, query } from "express-validator"
import { authenticateToken, optionalAuth } from "../middleware/auth.js"
import { handleValidationErrors, validateNote, validateUUID, validatePagination } from "../middleware/validation.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Get all notes with pagination and filtering
router.get(
  "/",
  [
    ...validatePagination,
    query("visibility").optional().isIn(["all", "public", "private"]).withMessage("Invalid visibility"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("authorId").optional().isString().withMessage("Author ID must be a valid string"),
    handleValidationErrors,
  ],
  optionalAuth,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, visibility = "all", search, authorId } = req.query

      // Build Prisma filter
      const where = {}
      if (visibility === "public") {
        where.visibility = "PUBLIC"
      } else if (visibility === "private") {
        if (req.user) {
          where.visibility = "PRIVATE"
          where.authorId = req.user.id
        } else {
          return res.json({ notes: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: limit } })
        }
      } else if (visibility === "all") {
        where.OR = [
          { visibility: "PUBLIC" },
          ...(req.user ? [{ authorId: req.user.id }] : []),
        ]
      }

      if (authorId) where.authorId = authorId
      if (search) where.title = { contains: search, mode: "insensitive" }

      const totalItems = await prisma.note.count({ where })
      const notes = await prisma.note.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          notesGroup: { select: { id: true, name: true } },
        },
      })

      res.json({
        notes,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: Number(limit),
        },
      })
    } catch (error) {
      console.error("Get notes error:", error)
      res.status(500).json({ error: "Failed to fetch notes" })
    }
  },
)

// Get recent notes (for dashboard)
router.get("/recent", authenticateToken, async (req, res) => {
  try {
    const recentNotes = await prisma.note.findMany({
      where: { authorId: req.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, updatedAt: true },
    })
    res.json({
      notes: recentNotes.map(note => ({
        id: note.id,
        title: note.title,
        lastViewed: note.updatedAt,
      })),
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent notes" })
  }
})

// Get note by ID
router.get("/:id", [validateUUID("id"), handleValidationErrors], optionalAuth, async (req, res) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        notesGroup: { select: { id: true, name: true } },
      },
    })
    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }

    // Check visibility permissions
    if (note.visibility === "PRIVATE" && (!req.user || note.authorId !== req.user.id)) {
      return res.status(403).json({ error: "Access denied" })
    }

    // Increment view count
    await prisma.note.update({
      where: { id: note.id },
      data: { viewCount: { increment: 1 } },
    })

    res.json({ note })
  } catch (error) {
    console.error("Get note error:", error)
    res.status(500).json({ error: "Failed to fetch note" })
  }
})

// Create new note
router.post("/", [authenticateToken, ...validateNote, handleValidationErrors], async (req, res) => {
  try {
    const { title, visibility, notesGroupId, files = [] } = req.body

    // Check if notes group exists and belongs to user
    const notesGroup = await prisma.notesGroup.findUnique({ where: { id: notesGroupId } })
    if (!notesGroup) {
      return res.status(404).json({ error: "Notes group not found" })
    }
    if (notesGroup.userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to add notes to this group" })
    }

    const note = await prisma.note.create({
      data: {
        authorId: req.user.id,
        notesGroupId,
        title,
        visibility,
        files,
        viewCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        rating: 0,
        ratingCount: 0,
      },
    })

    res.status(201).json({
      message: "Note created successfully",
      note,
    })
  } catch (error) {
    console.error("Create note error:", error)
    res.status(500).json({ error: "Failed to create note" })
  }
})

// Update note
router.put("/:id", [authenticateToken, validateUUID("id"), handleValidationErrors], async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } })
    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }
    if (note.authorId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update this note" })
    }

    const { title, visibility, files } = req.body

    const updatedNote = await prisma.note.update({
      where: { id: note.id },
      data: {
        title,
        visibility,
        files: files || note.files,
        updatedAt: new Date(),
      },
    })

    res.json({
      message: "Note updated successfully",
      note: updatedNote,
    })
  } catch (error) {
    console.error("Update note error:", error)
    res.status(500).json({ error: "Failed to update note" })
  }
})

// Delete note
router.delete("/:id", [authenticateToken, validateUUID("id"), handleValidationErrors], async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } })
    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }
    if (note.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized to delete this note" })
    }

    await prisma.note.delete({ where: { id: note.id } })

    res.json({ message: "Note deleted successfully" })
  } catch (error) {
    console.error("Delete note error:", error)
    res.status(500).json({ error: "Failed to delete note" })
  }
})

// Get notes groups
router.get("/groups/all", [authenticateToken, handleValidationErrors], async (req, res) => {
  try {
    const groups = await prisma.notesGroup.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    })
    res.json({ groups })
  } catch (error) {
    console.error("Get notes groups error:", error)
    res.status(500).json({ error: "Failed to fetch notes groups" })
  }
})

// Create notes group
router.post(
  "/groups",
  [
    authenticateToken,
    body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Name must be between 1 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { name, description } = req.body

      const group = await prisma.notesGroup.create({
        data: {
          name,
          description: description || "",
          userId: req.user.id,
        },
      })

      res.status(201).json({
        message: "Notes group created successfully",
        group,
      })
    } catch (error) {
      console.error("Create notes group error:", error)
      res.status(500).json({ error: "Failed to create notes group" })
    }
  },
)

// Rate note
router.post(
  "/:id/rate",
  [
    authenticateToken,
    validateUUID("id"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const note = await prisma.note.findUnique({ where: { id: req.params.id } })
      if (!note) {
        return res.status(404).json({ error: "Note not found" })
      }

      // Check if note is public
      if (note.visibility !== "PUBLIC") {
        return res.status(403).json({ error: "Can only rate public notes" })
      }

      const { rating } = req.body

      // Update rating (simple average)
      const newRatingCount = note.ratingCount + 1
      const newRating = ((note.rating * note.ratingCount) + rating) / newRatingCount

      const updatedNote = await prisma.note.update({
        where: { id: note.id },
        data: {
          rating: newRating,
          ratingCount: newRatingCount,
        },
      })

      res.json({
        message: "Rating recorded successfully",
        rating: updatedNote.rating,
        ratingCount: updatedNote.ratingCount,
      })
    } catch (error) {
      console.error("Rate note error:", error)
      res.status(500).json({ error: "Failed to rate note" })
    }
  },
)

export default router