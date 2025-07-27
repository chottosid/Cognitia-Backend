/**
 * @jest-environment node
 */

import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mock functions
const mockUserFindUnique = jest.fn();
const mockUserCreate = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserCount = jest.fn();
const mockOtpFindFirst = jest.fn();
const mockOtpCreate = jest.fn();
const mockOtpDelete = jest.fn();

// Create the mock module
const mockPrisma = {
  user: {
    findUnique: mockUserFindUnique,
    create: mockUserCreate,
    update: mockUserUpdate,
    count: mockUserCount,
  },
  otp: {
    findFirst: mockOtpFindFirst,
    create: mockOtpCreate,
    delete: mockOtpDelete,
  },
};

// Mock bcrypt
const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
};

// Mock email service
const mockSendOtpEmail = jest.fn();

// Mock JWT
const mockJwt = {
  sign: jest.fn(),
  verify: jest.fn(),
};

jest.unstable_mockModule("../lib/database.js", () => ({
  prisma: mockPrisma,
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: mockBcrypt,
}));
jest.unstable_mockModule("../utils/mailer.js", () => ({
  sendOtpEmail: mockSendOtpEmail,
}));
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: mockJwt,
}));
jest.unstable_mockModule("otp-generator", () => ({
  default: {
    generate: jest.fn(() => "123456"),
  },
}));

const authRoutes = await import("../routes/auth.js");

describe("Auth Routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes.default);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("should return 401 for invalid email", async () => {
      mockUserFindUnique.mockResolvedValue(null);

      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });

    it("should return 401 for wrong password", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        password: "hashedPassword",
        isVerified: true,
      };

      mockUserFindUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });

    it("should return 400 for missing email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        password: "password123",
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "invalid-email",
        password: "password123",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/verify-otp", () => {
  });

  describe("POST /api/auth/resend-otp", () => {
  });

  describe("POST /api/auth/forgot-password", () => {
  });

  describe("POST /api/auth/reset-password", () => {
  });
});
