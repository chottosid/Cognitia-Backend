import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import bcrypt from "bcryptjs";
import { mockPrisma, mockUser } from "./setup.js";

// Mock the mailer module for OTP functionality
await jest.unstable_mockModule("../utils/mailer.js", () => ({
  sendOtpEmail: jest.fn().mockResolvedValue(),
}));

// Import the real auth module and override only generateToken
const realAuth = await import("../middleware/auth.js");
await jest.unstable_mockModule("../middleware/auth.js", () => ({
  ...realAuth,
  generateToken: () => "mocked-jwt-token",
}));

// Import the router after mocking
const { default: authRoutes } = await import("../routes/auth.js");

// Create test app
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User Registration", () => {
    it("should return 400 for invalid email", async () => {
      const invalidUser = {
        email: "invalidemail",
        password: "password123",
        name: "Test User",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should not register if user exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "Password123!",
        })
        .expect(409);

      expect(res.body).toHaveProperty(
        "error",
        "User already exists with this email"
      );
    });
  });

  describe("OTP Verification", () => {
    it("should verify OTP and mark user as verified", async () => {
      const now = new Date();
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        otp: "123456",
        otpExpires: new Date(now.getTime() + 60000),
      });
      mockPrisma.user.update.mockResolvedValue({});

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "test@example.com", otp: "123456" })
        .expect(200);

      expect(res.body).toHaveProperty("message");
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it("should fail for invalid OTP", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        otp: "123456",
        otpExpires: new Date(Date.now() + 60000),
      });

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "test@example.com", otp: "000000" })
        .expect(400);

      expect(res.body).toHaveProperty("error", "Invalid OTP");
    });
  });

  describe("User Login", () => {
    it("should login a verified user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        password: await bcrypt.hash("Password123!", 12),
        verified: true,
        name: "Test User",
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "Password123!" })
        .expect(200);

      expect(res.body).toHaveProperty("token", "mocked-jwt-token");
      expect(res.body).toHaveProperty("user");
    });

    it("should not login with wrong password", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        password: await bcrypt.hash("Password123!", 12),
        verified: true,
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "WrongPassword" })
        .expect(401);

      expect(res.body).toHaveProperty("error", "Invalid credentials");
    });

    it("should not login unverified user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        password: await bcrypt.hash("Password123!", 12),
        verified: false,
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "Password123!" })
        .expect(403);

      expect(res.body).toHaveProperty(
        "error",
        "User not verified. Please check your email for OTP."
      );
    });

    it("should return 401 for non-existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
    });
  });
});
