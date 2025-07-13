import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import bcrypt from "bcryptjs";
import { mockPrisma } from "../setup.js";

// Mock the mailer
jest.unstable_mockModule("../../utils/mailer.js", () => ({
  sendOtpEmail: jest.fn(),
}));

const { default: authRouter } = await import("../../routes/auth.js");

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

describe("Auth Routes", () => {
  describe("POST /register", () => {
    it("should register new user and send OTP", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        verified: false,
      });

      const response = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "STUDENT",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe(
        "OTP sent to email. Please verify to complete registration."
      );
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it("should return conflict if user already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
      });

      const response = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("User already exists with this email");
    });

    it("should validate required fields", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "T", // Too short
        email: "invalid-email",
        password: "123", // Too short
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("POST /verify-otp", () => {
    it("should verify OTP successfully", async () => {
      const user = {
        id: "user-123",
        email: "test@example.com",
        otp: "123456",
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({
        ...user,
        otp: null,
        otpExpires: null,
        verified: true,
      });

      const response = await request(app).post("/api/auth/verify-otp").send({
        email: "test@example.com",
        otp: "123456",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Registration complete. You can now log in."
      );
    });

    it("should return error for invalid OTP", async () => {
      const user = {
        id: "user-123",
        email: "test@example.com",
        otp: "123456",
        otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const response = await request(app).post("/api/auth/verify-otp").send({
        email: "test@example.com",
        otp: "654321",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid OTP");
    });

    it("should return error for expired OTP", async () => {
      const user = {
        id: "user-123",
        email: "test@example.com",
        otp: "123456",
        otpExpires: new Date(Date.now() - 10 * 60 * 1000), // Expired
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const response = await request(app).post("/api/auth/verify-otp").send({
        email: "test@example.com",
        otp: "123456",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("OTP expired");
    });
  });

  describe("POST /login", () => {
    it("should login successfully", async () => {
      const hashedPassword = await bcrypt.hash("password123", 12);
      const user = {
        id: "user-123",
        email: "test@example.com",
        password: hashedPassword,
        verified: true,
        name: "Test User",
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it("should return error for invalid email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid credentials");
    });

    it("should return error for invalid password", async () => {
      const hashedPassword = await bcrypt.hash("correctpassword", 12);
      const user = {
        id: "user-123",
        email: "test@example.com",
        password: hashedPassword,
        verified: true,
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid credentials");
    });

    it("should return error for unverified user", async () => {
      const hashedPassword = await bcrypt.hash("password123", 12);
      const user = {
        id: "user-123",
        email: "test@example.com",
        password: hashedPassword,
        verified: false,
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe(
        "User not verified. Please check your email for OTP."
      );
    });
  });
});
