import express from "express";
import { body, query } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import {
  handleValidationErrors,
  validateCuidOrUUID,
} from "../middleware/validation.js";
import { prisma } from "../lib/database.js";
import multer from "multer";
import { createAndSendNotification } from "../utils/notification.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer();

// Get all notes
router.get("/", async (req, res) => {
  try {
    // Get both user's notes and public notes
    const [myNotes, publicNotes] = await Promise.all([
      prisma.note.findMany({
        where: { authorId: req.user.id },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          notesGroup: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.note.findMany({
        where: { visibility: "PUBLIC" },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          notesGroup: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // Deduplicate notes by id
    const notesMap = new Map();
    [...myNotes, ...publicNotes].forEach((note) => {
      notesMap.set(note.id, note);
    });
    const uniqueNotes = Array.from(notesMap.values());

    res.json({
      notes: uniqueNotes.map((note) => ({
        ...note,
        groupName: note.notesGroup?.name || "",
      })),
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Get user's notes only
router.get("/my", async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { authorId: req.user.id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        notesGroup: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json({
      notes: notes.map((note) => ({
        ...note,
        groupName: note.notesGroup?.name || "",
      })),
    });
  } catch (error) {
    console.error("Get my notes error:", error);
    res.status(500).json({ error: "Failed to fetch user notes" });
  }
});

// Get recent notes (modified for frontend)
router.get("/recent", async (req, res) => {
  try {
    const recentNotes = await prisma.note.findMany({
      where: { authorId: req.user.id },
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: {
        notesGroup: { select: { name: true } },
      },
    });

    res.json({
      notes: recentNotes.map((note) => ({
        ...note,
        groupName: note.notesGroup?.name || null,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent notes" });
  }
});

// Get notes groups (updated for frontend)
router.get("/groups", async (req, res) => {
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
          },
          orderBy: { updatedAt: "desc" },
        },
      },
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
    body("name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Name must be between 1 and 100 characters"),
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

      // Check if group already exists
      const existingGroup = await prisma.notesGroup.findFirst({
        where: { name, userId: req.user.id },
      });
      if (existingGroup) {
        return res
          .status(409)
          .json({ error: "Notes group with this name already exists" });
      }
      // Create new notes group
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
router.get(
  "/:id",
  [validateCuidOrUUID("id"), handleValidationErrors],
  async (req, res) => {
    try {
      // Fetch note and log all relevant fields for debugging
      const note = await prisma.note.findUnique({
        where: { id: req.params.id },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          notesGroup: { select: { id: true, name: true } },
        },
      });
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      if (note.visibility === "PRIVATE" && note.authorId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json({ note });
    } catch (error) {
      console.error("Get note error:", error);
      res.status(500).json({ error: "Failed to fetch note" });
    }
  }
);

router.post(
  "/",
  upload.single("files"), // Changed from "file" to "files"
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("notesGroupId").notEmpty().withMessage("Notes group ID is required"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { title, notesGroupId, visibility, tags } = req.body;

      // Check if notes group exists and belongs to user
      const notesGroup = await prisma.notesGroup.findUnique({
        where: { id: notesGroupId },
      });

      if (!notesGroup) {
        return res.status(404).json({ error: "Notes group not found" });
      }
      if (notesGroup.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Not authorized to add notes to this group" });
      }

      // Handle file upload
      const fileBuffer = req.file ? req.file.buffer : null;

      if (!fileBuffer) {
        return res.status(400).json({ error: "File is required" });
      }

      const note = await prisma.note.create({
        data: {
          authorId: req.user.id,
          notesGroupId,
          title,
          visibility: visibility.toUpperCase(),
          file: fileBuffer,
          tags: tags || [],
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
  }
);

// Helper function to detect MIME type (add this before the route)
function detectMimeType(buffer) {
  // Check for PDF signature
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return "application/pdf";
  }
  // Check for PNG signature
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  // Check for JPEG signature
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return "image/jpeg";
  }
  // Default to octet-stream if unknown
  return "application/octet-stream";
}

// Delete a note
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the note exists and belongs to the user
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.authorId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this note" });
    }

    // Delete the note
    await prisma.note.delete({
      where: { id },
    });

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// Delete a notes group
router.delete("/groups/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the notes group exists and belongs to the user
    const notesGroup = await prisma.notesGroup.findUnique({
      where: { id },
    });

    if (!notesGroup) {
      return res.status(404).json({ error: "Notes group not found" });
    }

    if (notesGroup.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this notes group" });
    }

    // Delete the notes group (cascades to associated notes)
    await prisma.notesGroup.delete({
      where: { id },
    });

    res.status(200).json({ message: "Notes group deleted successfully" });
  } catch (error) {
    console.error("Delete notes group error:", error);
    res.status(500).json({ error: "Failed to delete notes group" });
  }
});

export default router;
