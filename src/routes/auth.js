import express from "express";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import multer from "multer";
import otpGenerator from "otp-generator";
import passport from "../middleware/googleAuth.js"; // ✅ Google Auth middleware
import jwt from "jsonwebtoken";
import { prisma } from "../lib/database.js";
import { generateToken, authenticateToken } from "../middleware/auth.js";
import { sendOtpEmail } from "../utils/mailer.js";
import { createAndSendNotification } from "../utils/notification.js";
import {
  handleValidationErrors,
  validateEmail,
  validatePassword,
} from "../middleware/validation.js";

const router = express.Router();
const upload = multer();

// ✅ 1. EMAIL + OTP REGISTRATION
router.post(
  "/register",
  upload.single("avatar"),
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
    validateEmail,
    validatePassword,
    body("role").optional().isIn(["STUDENT", "TEACHER"]).withMessage("Role must be STUDENT or TEACHER"),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { name, email, password, role = "STUDENT", bio, institution } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(409).json({ error: "User already exists" });

      // Generate OTP
      const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, alphabets: false });
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Store user with OTP
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          bio: bio || "",
          institution: institution || "",
          avatar: req.file ? req.file.buffer : null,
          otp,
          otpExpires,
          verified: false,
        },
      });

      await sendOtpEmail(email, otp); // ✅ send real email
      res.status(201).json({ message: "OTP sent to email. Please verify to complete registration." });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

// ✅ 2. VERIFY OTP
router.post("/verify-otp", [
  body("email").isEmail().withMessage("Valid email required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  handleValidationErrors,
], async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.otp || !user.otpExpires) return res.status(400).json({ error: "No OTP found" });
    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (user.otpExpires < new Date()) return res.status(400).json({ error: "OTP expired" });

    await prisma.user.update({
      where: { email },
      data: { otp: null, otpExpires: null, verified: true },
    });

    await createAndSendNotification({
      userId: user.id,
      type: "LOGIN",
      title: "Hello!",
      message: "Your account has been successfully created.",
    });

    res.json({ message: "Registration complete. You can now log in." });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

// ✅ 3. LOGIN WITH EMAIL + PASSWORD
router.post("/login", [
  validateEmail,
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
], async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.verified) return res.status(403).json({ error: "Please verify your email first." });

    await createAndSendNotification({
      userId: user.id,
      type: "LOGIN",
      title: "Welcome Back!",
      message: "Best of luck for today's work",
    });

    const token = generateToken(user);
    res.json({ message: "Login successful", user: { ...user, password: undefined }, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});


// ✅ 4. GOOGLE LOGIN
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    const token = generateToken(req.user);
    // ✅ Redirect to frontend with JWT
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

export default router;
