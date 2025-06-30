import express from "express"
import bcrypt from "bcryptjs"
import { body } from "express-validator"
import { generateToken, authenticateToken } from "../middleware/auth.js"
import { sendOtpEmail } from "../utils/mailer.js"
import crypto from "crypto"

import {
  handleValidationErrors,
  validateEmail,
  validatePassword,
} from "../middleware/validation.js"
import { prisma } from "../lib/database.js"

const router = express.Router()

// Register Step 1: Accept details, generate OTP
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
    validateEmail,
    validatePassword,
    body("role").optional().isIn(["STUDENT", "TEACHER"]).withMessage("Role must be STUDENT or TEACHER"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { name, email, password, role = "STUDENT", bio, institution } = req.body

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(409).json({ error: "User already exists with this email" })
      }

      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString()
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user with OTP (not yet verified)
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          bio: bio || "",
          institution: institution || "",
          avatar: "/placeholder.svg?height=40&width=40",
          otp,
          otpExpires,
          verified: false,
        },
      })

      // TODO: Send OTP via email here
      await sendOtpEmail(email, otp)

      res.status(201).json({
        message: "OTP sent to email. Please verify to complete registration.",
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ error: "Registration failed" })
    }
  }
)

router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { email, otp } = req.body
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || !user.otp || !user.otpExpires) {
        return res.status(400).json({ error: "No OTP found for this user" })
      }
      if (user.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" })
      }
      if (user.otpExpires < new Date()) {
        return res.status(400).json({ error: "OTP expired" })
      }

      // Clear OTP fields (mark as verified)
      await prisma.user.update({
        where: { email },
        data: { otp: null, otpExpires: null, verified: true },
      })

      res.json({ message: "Registration complete. You can now log in." })
    } catch (error) {
      console.error("OTP verification error:", error)
      res.status(500).json({ error: "OTP verification failed" })
    }
  }
)

// Login
router.post(
  "/login",
  [validateEmail, body("password").notEmpty().withMessage("Password is required"), handleValidationErrors],
  async (req, res) => {
    try {
      const { email, password } = req.body

      // Find user in DB
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Compare password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Check if user is verified
      if (!user.verified) {
        return res.status(403).json({ error: "User not verified. Please check your email for OTP." })
      }

      // Generate token
      const token = generateToken(user)

      // Remove password from response
      const { password: _, ...userResponse } = user

      res.json({
        message: "Login successful",
        user: userResponse,
        token,
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ error: "Login failed" })
    }
  }
)

export default router