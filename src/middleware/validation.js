import { body, param, query, validationResult } from "express-validator"

// Handle validation errors
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    })
  }
  next()
}

// Common validations
export const validateEmail = body("email")
  .isEmail()
  .normalizeEmail()
  .withMessage("Please provide a valid email address")

export const validatePassword = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long")
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number")

// Accept CUIDs (default for Prisma) or UUIDs
export const validateCuidOrUUID = (field = "id") =>
  param(field)
    .custom((value) => {
      // CUID regex: starts with 'c' and 24 chars long
      const cuidRegex = /^c[a-z0-9]{24}$/
      // UUID regex
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      return cuidRegex.test(value) || uuidRegex.test(value)
    })
    .withMessage(`${field} must be a valid CUID or UUID`)

// Pagination validation
export const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
]

// Question validation
export const validateQuestion = [
  body("title").trim().isLength({ min: 10, max: 200 }).withMessage("Title must be between 10 and 200 characters"),
  body("body").trim().isLength({ min: 20, max: 5000 }).withMessage("Body must be between 20 and 5000 characters"),
  body("tags").isArray({ min: 1, max: 5 }).withMessage("Must provide 1-5 tags"),
  body("tags.*").trim().isLength({ min: 2, max: 30 }).withMessage("Each tag must be between 2 and 30 characters"),
]

// Answer validation
export const validateAnswer = [
  body("content")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Answer content must be between 10 and 5000 characters"),
]

// Note validation
export const validateNote = [
  body("title").trim().isLength({ min: 1, max: 200 }).withMessage("Title must be between 1 and 200 characters"),
  body("visibility").isIn(["PRIVATE", "PUBLIC", "SHARED"]).withMessage("Visibility must be PRIVATE, PUBLIC, or SHARED"),
  body("notesGroupId").isUUID().withMessage("Notes group ID must be a valid UUID"),
]

// Task validation
export const validateTask = [
  body("title").trim().isLength({ min: 1, max: 200 }).withMessage("Title must be between 1 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  body("dueDate").isISO8601().withMessage("Due date must be a valid date"),
  body("priority").isIn(["LOW", "MEDIUM", "HIGH"]).withMessage("Priority must be LOW, MEDIUM, or HIGH"),
  body("subjectArea")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Subject area must be between 1 and 100 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("estimatedTime").optional().isInt({ min: 1 }).withMessage("Estimated time must be a positive integer"),
]

// Contest validation
export const validateContest = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("startTime").isISO8601().withMessage("Start time must be a valid date"),
  body("endTime").isISO8601().withMessage("End time must be a valid date"),
  body("difficulty")
    .isIn(["EASY", "MEDIUM", "HARD", "EXPERT"])
    .withMessage("Difficulty must be EASY, MEDIUM, HARD, or EXPERT"),
  body("topics").isArray({ min: 1 }).withMessage("Must provide at least one topic"),
]

// Model test validation
export const validateModelTest = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("timeLimit").isInt({ min: 5, max: 300 }).withMessage("Time limit must be between 5 and 300 minutes"),
  body("subjects").isArray({ min: 1 }).withMessage("Must provide at least one subject"),
  body("topics").isArray({ min: 1 }).withMessage("Must provide at least one topic"),
  body("difficulty")
    .isIn(["EASY", "MEDIUM", "HARD", "EXPERT"])
    .withMessage("Difficulty must be EASY, MEDIUM, HARD, or EXPERT"),
]
