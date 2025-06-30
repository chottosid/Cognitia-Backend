import express from "express"
import { body } from "express-validator"
import { handleValidationErrors, validatePagination } from "../middleware/validation.js"
import { authenticateToken } from "../middleware/auth.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Helper to get or create user settings row
async function getOrCreateUserSettings(userId) {
  let settings = await prisma.userSettings.findUnique({ where: { userId } })
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId,
        account: {},
        profile: {},
        notifications: {},
        privacy: {},
        security: {},
        appearance: {},
      },
    })
  }
  return settings
}

// Get account settings
router.get("/account", authenticateToken, async (req, res) => {
  try {
    const settings = await getOrCreateUserSettings(req.user.id)
    res.json({ settings: settings.account })
  } catch (error) {
    console.error("Get account settings error:", error)
    res.status(500).json({ error: "Failed to fetch account settings" })
  }
})

// Update account settings
router.put(
  "/account",
  [
    authenticateToken,
    body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
    body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio must be less than 500 characters"),
    body("institution").optional().trim().isLength({ max: 200 }).withMessage("Institution must be less than 200 characters"),
    body("location").optional().trim().isLength({ max: 100 }).withMessage("Location must be less than 100 characters"),
    body("website").optional().isURL().withMessage("Website must be a valid URL"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { name, bio, institution, location, website, socialLinks } = req.body
      const userId = req.user.id
      const settings = await getOrCreateUserSettings(userId)
      const updatedAccount = {
        ...settings.account,
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(institution !== undefined && { institution }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(socialLinks !== undefined && { socialLinks }),
      }
      await prisma.userSettings.update({
        where: { userId },
        data: { account: updatedAccount },
      })
      // Optionally update user table as well
      await prisma.user.update({
        where: { id: userId },
        data: { name, bio, institution, location, website },
      })
      res.json({ message: "Account settings updated successfully", settings: updatedAccount })
    } catch (error) {
      console.error("Update account settings error:", error)
      res.status(500).json({ error: "Failed to update account settings" })
    }
  }
)

// Get and update profile settings
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const settings = await getOrCreateUserSettings(req.user.id)
    res.json({ settings: settings.profile })
  } catch (error) {
    console.error("Get profile settings error:", error)
    res.status(500).json({ error: "Failed to fetch profile settings" })
  }
})

router.put(
  "/profile",
  [
    authenticateToken,
    body("visibility").optional().isIn(["public", "private"]).withMessage("Visibility must be public or private"),
    body("showEmail").optional().isBoolean().withMessage("showEmail must be a boolean"),
    body("showInstitution").optional().isBoolean().withMessage("showInstitution must be a boolean"),
    body("showLocation").optional().isBoolean().withMessage("showLocation must be a boolean"),
    body("showWebsite").optional().isBoolean().withMessage("showWebsite must be a boolean"),
    body("showSocialLinks").optional().isBoolean().withMessage("showSocialLinks must be a boolean"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const updates = req.body
      const userId = req.user.id
      const settings = await getOrCreateUserSettings(userId)
      const updatedProfile = { ...settings.profile, ...updates }
      await prisma.userSettings.update({
        where: { userId },
        data: { profile: updatedProfile },
      })
      res.json({ message: "Profile settings updated successfully", settings: updatedProfile })
    } catch (error) {
      console.error("Update profile settings error:", error)
      res.status(500).json({ error: "Failed to update profile settings" })
    }
  }
)

// Get and update notification settings
router.get("/notifications", authenticateToken, async (req, res) => {
  try {
    const settings = await getOrCreateUserSettings(req.user.id)
    res.json({ settings: settings.notifications })
  } catch (error) {
    console.error("Get notification settings error:", error)
    res.status(500).json({ error: "Failed to fetch notification settings" })
  }
})

router.put(
  "/notifications",
  [
    authenticateToken,
    body("emailNotifications").optional().isBoolean(),
    body("pushNotifications").optional().isBoolean(),
    body("questionAnswered").optional().isBoolean(),
    body("answerAccepted").optional().isBoolean(),
    body("newFollower").optional().isBoolean(),
    body("contestReminders").optional().isBoolean(),
    body("weeklyDigest").optional().isBoolean(),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const updates = req.body
      const userId = req.user.id
      const settings = await getOrCreateUserSettings(userId)
      const updatedNotifications = { ...settings.notifications, ...updates }
      await prisma.userSettings.update({
        where: { userId },
        data: { notifications: updatedNotifications },
      })
      res.json({ message: "Notification settings updated successfully", settings: updatedNotifications })
    } catch (error) {
      console.error("Update notification settings error:", error)
      res.status(500).json({ error: "Failed to update notification settings" })
    }
  }
)

// Get and update privacy settings
router.get("/privacy", authenticateToken, async (req, res) => {
  try {
    const settings = await getOrCreateUserSettings(req.user.id)
    res.json({ settings: settings.privacy })
  } catch (error) {
    console.error("Get privacy settings error:", error)
    res.status(500).json({ error: "Failed to fetch privacy settings" })
  }
})

router.put(
  "/privacy",
  [
    authenticateToken,
    body("profileVisibility").optional().isIn(["public", "private"]),
    body("activityVisibility").optional().isIn(["public", "private"]),
    body("notesVisibility").optional().isIn(["public", "private"]),
    body("allowDirectMessages").optional().isBoolean(),
    body("showOnlineStatus").optional().isBoolean(),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const updates = req.body
      const userId = req.user.id
      const settings = await getOrCreateUserSettings(userId)
      const updatedPrivacy = { ...settings.privacy, ...updates }
      await prisma.userSettings.update({
        where: { userId },
        data: { privacy: updatedPrivacy },
      })
      res.json({ message: "Privacy settings updated successfully", settings: updatedPrivacy })
    } catch (error) {
      console.error("Update privacy settings error:", error)
      res.status(500).json({ error: "Failed to update privacy settings" })
    }
  }
)

// Get and update security settings
router.get("/security", authenticateToken, async (req, res) => {
  try {
    const settings = await getOrCreateUserSettings(req.user.id)
    res.json({ settings: settings.security })
  } catch (error) {
    console.error("Get security settings error:", error)
    res.status(500).json({ error: "Failed to fetch security settings" })
  }
})

router.put(
  "/security",
  [
    authenticateToken,
    body("twoFactorEnabled").optional().isBoolean(),
    body("loginNotifications").optional().isBoolean(),
    body("sessionTimeout").optional().isInt({ min: 5, max: 1440 }),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const updates = req.body
      const userId = req.user.id
      const settings = await getOrCreateUserSettings(userId)
      const updatedSecurity = { ...settings.security, ...updates }
      await prisma.userSettings.update({
        where: { userId },
        data: { security: updatedSecurity },
      })
      res.json({ message: "Security settings updated successfully", settings: updatedSecurity })
    } catch (error) {
      console.error("Update security settings error:", error)
      res.status(500).json({ error: "Failed to update security settings" })
    }
  }
)

// Get and update appearance settings
router.get("/appearance", authenticateToken, async (req, res) => {
  try {
    const settings = await getOrCreateUserSettings(req.user.id)
    res.json({ settings: settings.appearance })
  } catch (error) {
    console.error("Get appearance settings error:", error)
    res.status(500).json({ error: "Failed to fetch appearance settings" })
  }
})

router.put(
  "/appearance",
  [
    authenticateToken,
    body("theme").optional().isIn(["light", "dark", "system"]),
    body("language").optional().isString(),
    body("timezone").optional().isString(),
    body("dateFormat").optional().isString(),
    body("timeFormat").optional().isIn(["12h", "24h"]),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const updates = req.body
      const userId = req.user.id
      const settings = await getOrCreateUserSettings(userId)
      const updatedAppearance = { ...settings.appearance, ...updates }
      await prisma.userSettings.update({
        where: { userId },
        data: { appearance: updatedAppearance },
      })
      res.json({ message: "Appearance settings updated successfully", settings: updatedAppearance })
    } catch (error) {
      console.error("Update appearance settings error:", error)
      res.status(500).json({ error: "Failed to update appearance settings" })
    }
  }
)

// Get activity log (assumes you have an activityLog table)
router.get("/activity-log", [authenticateToken, ...validatePagination, handleValidationErrors], async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const userId = req.user.id

    const totalItems = await prisma.activityLog.count({ where: { userId } })
    const activities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    })

    res.json({
      activities,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: Number(limit),
      },
    })
  } catch (error) {
    console.error("Get activity log error:", error)
    res.status(500).json({ error: "Failed to fetch activity log" })
  }
})

export default router