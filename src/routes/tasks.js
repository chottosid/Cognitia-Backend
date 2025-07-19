import express from "express";
import { body, query } from "express-validator";
import {
  handleValidationErrors,
  validateTask,
  validateCuidOrUUID,
  validatePagination,
} from "../middleware/validation.js";
import { prisma } from "../lib/database.js";
import multer from "multer";

const router = express.Router();

// Configure multer for file uploads
const upload = multer();

// Get all tasks for authenticated user
router.get("/", async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
});

router.get("/generate", async (req, res, next) => {
  console.log("Generating schedule for user:", req.user.id);
  try {
    // 1. Get list of tasks
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.id,
        status: {
          in: ["NOT_STARTED", "IN_PROGRESS"],
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        priority: true,
        subjectArea: true,
        estimatedTime: true,
      },
    });

    if (tasks.length === 0) {
      return res.status(404).json({ error: "No tasks found for the user" });
    }

    // 2. Get today's availability
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const availability = await prisma.availability.findMany({
      where: {
        userId: req.user.id,
        startTime: {
          gte: startOfDay,
        },
        endTime: {
          lte: endOfDay,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    let effectiveAvailability = availability;

    // 3. If no availability, use defaults
    if (availability.length === 0) {
      effectiveAvailability = [
        {
          startTime: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            9,
            0,
            0
          ),
          endTime: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            12,
            0,
            0
          ),
        },
        {
          startTime: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            16,
            0,
            0
          ),
          endTime: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            19,
            0,
            0
          ),
        },
        {
          startTime: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            21,
            0,
            0
          ),
          endTime: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            0,
            0
          ),
        },
      ];
    }

    // 4. Call Flask scheduling service
    console.log("Calling Flask API with tasks:", tasks.length);
    let response;
    try {
      // Format the data to match Flask API expectations
      const requestBody = {
        tasks: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || "",
          dueDate: task.dueDate.toISOString(),
          priority: task.priority,
          subjectArea: task.subjectArea,
          estimatedTime: task.estimatedTime || 1,
        })),
        availability: effectiveAvailability.map((avail) => ({
          startTime: avail.startTime.toISOString(),
          endTime: avail.endTime.toISOString(),
        })),
      };

      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      response = await fetch(`${process.env.FLASK_API_URL}/generate-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
    } catch (err) {
      console.error("Flask API error:", err);
      return res
        .status(500)
        .json({ error: "Could not reach scheduling service" });
    }

    const data = await response.json();
    console.log("Flask API response:", data);

    if (!response.ok) {
      return res
        .status(500)
        .json({ error: data.error || "Invalid schedule response" });
    }

    // Remove old schedules from today to future
    await prisma.studySession.deleteMany({
      where: {
        userId: req.user.id,
        startTime: {
          gte: startOfDay,
        },
      },
    });

    // 5. Save schedule to database
    const scheduleEntries = data.map((entry) => ({
      taskId: entry.taskId,
      startTime: new Date(entry.startTime),
      endTime: new Date(entry.endTime),
      duration: entry.duration,
      goal: entry.goal,
      userId: req.user.id,
    }));

    await prisma.studySession.createMany({
      data: scheduleEntries,
    });

    // 6. Return schedule to client
    res.json({
      message: "Schedule generated successfully",
      schedule: scheduleEntries,
    });
  } catch (error) {
    console.error("Generate schedule error:", error);
    return next(error);
  }
});

router.get("/today", async (req, res, next) => {
  console.log("Fetching today's schedule for user:", req.user.id);
  try {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: req.user.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

// Create a new study session
router.post("/sessions", async (req, res, next) => {
  try {
    const { startTime, endTime, goal, notes, taskId } = req.body;

    // Basic validation
    if (!startTime || !endTime) {
      return res
        .status(400)
        .json({ error: "Start time and end time are required" });
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ error: "End time must be after start time" });
    }

    // If taskId is provided, verify the task exists and belongs to the user
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          userId: req.user.id,
        },
      });

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
    }

    const newSession = await prisma.studySession.create({
      data: {
        startTime: startDate,
        endTime: endDate,
        goal: goal || null,
        notes: notes || null,
        taskId: taskId || null,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Study session created successfully",
      session: newSession,
    });
  } catch (error) {
    next(error);
  }
});

// Get study plan statistics
router.get("/stats", async (req, res, next) => {
  try {
    console.log("Here");
    const userId = req.user.id;
    // Fetch all tasks for the user
    const tasks = await prisma.task.findMany({
      where: { userId },
      select: { status: true, updatedAt: true },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "COMPLETED"
    ).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate streak
    const today = new Date();
    const streak = tasks
      .filter((task) => task.status === "COMPLETED")
      .map((task) => task.updatedAt)
      .sort((a, b) => b - a)
      .reduce((streak, date, index, dates) => {
        const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        if (index === 0 && diff === 0) return streak + 1; // Completed today
        if (index > 0 && diff === index) return streak + 1; // Consecutive days
        return streak;
      }, 0);

    res.json({
      totalTasks,
      completedTasks,
      progress: progress.toFixed(2),
      streak,
    });
  } catch (error) {
    next(error);
  }
});

// Get task by ID
router.get(
  "/:id",
  validateCuidOrUUID("id"),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const task = await prisma.task.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json({ task });
    } catch (error) {
      next(error);
    }
  }
);

// Create new task

router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    let { title, description, dueDate, priority, subjectArea, estimatedTime } =
      req.body;

    // Basic validation
    if (!title || !dueDate || !priority || !subjectArea) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    priority = priority.toUpperCase(); // Now this reassignment works

    const fileBuffer = req.file ? req.file.buffer : null;

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        priority,
        subjectArea,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
        userId: req.user.id,
        file: fileBuffer,
      },
    });

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    next(error);
  }
});

// Update task
router.put("/:id", upload.single("file"), async (req, res, next) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      subjectArea,
      estimatedTime,
    } = req.body;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      select: { id: true },
    });

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Prepare update data - only include file if one was uploaded
    const updateData = {
      title,
      description: description || null,
      dueDate: new Date(dueDate),
      priority,
      subjectArea,
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
    };

    // Only update file if a new one was uploaded
    if (req.file) {
      updateData.file = req.file.buffer;
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
});

// Get task file
router.get("/:id/file", async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      select: { file: true, title: true },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (!task.file) {
      return res.status(404).json({ error: "No file attached to this task" });
    }

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${task.title}_attachment"`
    );

    res.send(task.file);
  } catch (error) {
    next(error);
  }
});

// Update task status
router.put(
  "/:id/status",
  [
    validateCuidOrUUID("id"),
    body("status")
      .isIn(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"])
      .withMessage("Invalid status"),
    handleValidationErrors,
  ],
  async (req, res, next) => {
    try {
      const { status } = req.body;

      // Check if task exists and user owns it
      const existingTask = await prisma.task.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        select: { id: true },
      });

      if (!existingTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      const updatedTask = await prisma.task.update({
        where: { id: req.params.id },
        data: { status },
      });

      res.json({
        message: "Task status updated successfully",
        task: updatedTask,
      });
    } catch (error) {
      next(error);
    }
  }
);
// Mark task as completed
router.put("/:id/complete", async (req, res, next) => {
  try {
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      select: { id: true },
    });

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(), // Update completedAt to current timestamp
      },
    });

    res.json({
      message: "Task marked as completed",
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete(
  "/:id",
  [validateCuidOrUUID("id"), handleValidationErrors],
  async (req, res, next) => {
    try {
      // Check if task exists and user owns it
      const existingTask = await prisma.task.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
        select: { id: true },
      });

      if (!existingTask) {
        return res.status(404).json({ error: "Task not found" });
      }

      await prisma.task.delete({
        where: { id: req.params.id },
      });

      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
