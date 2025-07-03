import express from "express";
import { body, query } from "express-validator";
import {
  handleValidationErrors,
  validateTask,
  validateUUID,
  validatePagination,
} from "../middleware/validation.js";
import { prisma } from "../lib/database.js";

const router = express.Router();

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

// Get task by ID
router.get("/:id", async (req, res, next) => {
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
});

// Create new task
router.post("/", async (req, res, next) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      subjectArea,
      tags = [],
      estimatedTime,
      notes,
    } = req.body;

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        priority,
        subjectArea,
        tags,
        estimatedTime: estimatedTime || null,
        notes: notes || null,
        userId: req.user.id,
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
router.put("/:id", async (req, res, next) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      subjectArea,
      tags,
      estimatedTime,
      notes,
    } = req.body;

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
      data: {
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        priority,
        subjectArea,
        tags: tags || [],
        estimatedTime: estimatedTime !== undefined ? estimatedTime : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    res.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
});

// Update task status
router.patch(
  "/:id/status",
  [
    validateUUID("id"),
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

      const updateData = { status };
      if (status === "COMPLETED") {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }

      const updatedTask = await prisma.task.update({
        where: { id: req.params.id },
        data: updateData,
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

// Delete task
router.delete(
  "/:id",
  [validateUUID("id"), handleValidationErrors],
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

// create schedule
router.post("/generate", async (req, res, next) => {
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
    const todayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const availability = await prisma.userAvailability.findMany({
      where: {
        userId: req.user.id,
        date: todayDate,
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
          startTime: new Date(now.getFullYear(),now.getMonth(),now.getDate(),9,0,0),
          endTime: new Date(now.getFullYear(),now.getMonth(),now.getDate(),12,0,0),
        },
        {
          startTime: new Date(now.getFullYear(),now.getMonth(),now.getDate(),16,0,0),
          endTime: new Date(now.getFullYear(),now.getMonth(),now.getDate(),19,0,0),
        },
        {
          startTime: new Date(now.getFullYear(),now.getMonth(),now.getDate(),21,0,0),
          endTime: new Date(now.getFullYear(),now.getMonth(),now.getDate(),23,0,0),
        },
      ];
    }

    // 4. Call Flask scheduling service
    let response;
    try {
      response = await fetch(`${process.env.FLASK_API_URL}/generate_schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks,
          availability: effectiveAvailability,
        }),
      });
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Could not reach scheduling service" });
    }

    const data = await response.json();

    if (!response.ok || !data.schedule || !data.taskId) {
      return res
        .status(500)
        .json({ error: data.error || "Invalid schedule response" });
    }

    const startTime = new Date(data.schedule.startTime);
    const endTime = new Date(data.schedule.endTime);
    const durationMinutes = (endTime - startTime) / 60000;

    // 5. Save to study_sessions
    await prisma.studySession.create({
      data: {
        userId: req.user.id,
        taskId: data.taskId,
        startTime,
        endTime,
        duration: durationMinutes,
        goal: data.schedule.goal,
      },
    });

    // 6. Return schedule to client
    return res.json({ schedule: data.schedule });
  } catch (error) {
    return next(error);
  }
});

//get today's schedule
router.get("/today", async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

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

export default router;
