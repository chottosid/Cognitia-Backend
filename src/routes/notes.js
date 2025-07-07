import express from "express"
import { body, query } from "express-validator"
import { authenticateToken } from "../middleware/auth.js"
import { handleValidationErrors, validateCuidOrUUID } from "../middleware/validation.js"
import { prisma } from "../lib/database.js"
import multer from "multer"
import path from "path"

const router = express.Router()

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})
const upload = multer({ storage })

// Get all notes (simplified for frontend)
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Get both user's notes and public notes
    const [myNotes, publicNotes] = await Promise.all([
      prisma.note.findMany({
        where: { authorId: req.user.id },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          notesGroup: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.note.findMany({
        where: { visibility: "PUBLIC" },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          notesGroup: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" }
      })
    ]);

    // Deduplicate notes by id
    const notesMap = new Map();
    [...myNotes, ...publicNotes].forEach(note => {
      notesMap.set(note.id, note);
    });
    const uniqueNotes = Array.from(notesMap.values());

    res.json({
      notes: uniqueNotes,
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Get user's notes only
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { authorId: req.user.id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        notesGroup: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" }
    });

    res.json({ notes });
  } catch (error) {
    console.error("Get my notes error:", error);
    res.status(500).json({ error: "Failed to fetch user notes" });
  }
});

// Get recent notes (modified for frontend)
router.get("/recent", authenticateToken, async (req, res) => {
  try {
    const recentNotes = await prisma.note.findMany({
      where: { authorId: req.user.id },
      orderBy: { updatedAt: "desc" },
      take: 12, // Changed from 5 to 12 to match frontend
      include: {
        notesGroup: { select: { name: true } },
      },
    });

    res.json({
      notes: recentNotes.map(note => ({
        ...note,
        groupName: note.notesGroup?.name || null
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent notes" });
  }
});

// Get notes groups (updated for frontend)
router.get("/groups", authenticateToken, async (req, res) => {
  try {
    const groups = await prisma.notesGroup.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        notes: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            visibility: true,
            rating: true
          },
          orderBy: { updatedAt: "desc" }
        }
      }
    });

    res.json({ groups });
  } catch (error) {
    console.error("Get notes groups error:", error);
    res.status(500).json({ error: "Failed to fetch notes groups" });
  }
});

// Create notes group (unchanged but included for completeness)
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
      const { name, description } = req.body;

      const group = await prisma.notesGroup.create({
        data: {
          name,
          description: description || "",
          userId: req.user.id,
        },
      });

      res.status(201).json({
        message: "Notes group created successfully",
        group,
      });
    } catch (error) {
      console.error("Create notes group error:", error);
      res.status(500).json({ error: "Failed to create notes group" });
    }
  }
);

// Get note by ID
router.get("/:id", [validateCuidOrUUID("id"), handleValidationErrors], authenticateToken, async (req, res) => {
  // Debug log incoming request
  console.log(`[GET /api/notes/:id] id:`, req.params.id, 'user:', req.user?.id);
  try {
    // Fetch note and log all relevant fields for debugging
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        notesGroup: { select: { id: true, name: true } },
      },
    });
    console.log('[DEBUG] Note found:', note);
    if (!note) {
      console.log('[DEBUG] Note not found in DB for id:', req.params.id);
      return res.status(404).json({ error: "Note not found" });
    }
    // Log visibility and author for debugging
    console.log('[DEBUG] Note visibility:', note.visibility, 'authorId:', note.authorId, 'request user:', req.user.id);
    // Check visibility permissions
    if (note.visibility === "PRIVATE" && note.authorId !== req.user.id) {
      console.log('[DEBUG] Access denied: note is private and user is not the author');
      return res.status(403).json({ error: "Access denied" });
    }
    // Increment view count
    await prisma.note.update({
      where: { id: note.id },
      data: { viewCount: { increment: 1 } },
    });
    res.json({ note });
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({ error: "Failed to fetch note" });
  }
});
router.post("/", authenticateToken, upload.array("files"), async (req, res) => {
  try {
    const { title, notesGroupId, visibility, tags } = req.body;
    
    // Check if notes group exists and belongs to user
    const notesGroup = await prisma.notesGroup.findUnique({ 
      where: { id: notesGroupId } 
    });
    
    if (!notesGroup) {
      return res.status(404).json({ error: "Notes group not found" });
    }
    if (notesGroup.userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to add notes to this group" });
    }



    // Debug log incoming fields
    console.log("[POST /api/notes] Incoming fields:", {
      title,
      notesGroupId,
      visibility,
      tags,
      files: req.files && req.files.map(f => f.originalname)
    });

    // Prepare files metadata and parse JSON files
    const files = await Promise.all(
      (req.files || []).map(async (file) => {
        const fileMeta = {
          originalname: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        };
        // If file is JSON, read and parse content
        if (
          file.mimetype === "application/json" ||
          file.originalname.toLowerCase().endsWith(".json")
        ) {
          const fs = await import("fs/promises");
          try {
            const contentRaw = await fs.readFile(file.path, "utf8");
            fileMeta.content = JSON.parse(contentRaw);
          } catch (err) {
            fileMeta.content = null;
            fileMeta.contentError = "Failed to parse JSON: " + err.message;
          }
        }
        return fileMeta;
      })
    );

    const note = await prisma.note.create({
      data: {
        authorId: req.user.id,
        notesGroupId,
        title,
        visibility: visibility.toUpperCase(),
        files,
        tags: tags || [],
        viewCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        rating: 0,
        ratingCount: 0,
      },
    });

    res.status(201).json({
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// Get notes groups (updated for frontend)
router.get("/groups", authenticateToken, async (req, res) => {
  try {
    const groups = await prisma.notesGroup.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        notes: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            visibility: true,
            rating: true
          },
          orderBy: { updatedAt: "desc" }
        }
      }
    });

    res.json({ groups });
  } catch (error) {
    console.error("Get notes groups error:", error);
    res.status(500).json({ error: "Failed to fetch notes groups" });
  }
});

// Create notes group (unchanged but included for completeness)
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
      const { name, description } = req.body;

      const group = await prisma.notesGroup.create({
        data: {
          name,
          description: description || "",
          userId: req.user.id,
        },
      });

      res.status(201).json({
        message: "Notes group created successfully",
        group,
      });
    } catch (error) {
      console.error("Create notes group error:", error);
      res.status(500).json({ error: "Failed to create notes group" });
    }
  }
);

export default router;