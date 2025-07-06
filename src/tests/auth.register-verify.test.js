import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import { mockPrisma } from "./setup.js";

// Only mock sendOtpEmail for registration/verify-otp
await jest.unstable_mockModule("../utils/mailer.js", () => ({
  sendOtpEmail: jest.fn().mockResolvedValue(),
}));

const { default: authRoutes } = await import("../routes/auth.js");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Register/Verify Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user and send OTP", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: "user-1", email: "test@example.com" });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "Password123!",
        })
        .expect(201);

      expect(res.body).toHaveProperty("message");
      expect(mockPrisma.user.create).toHaveBeenCalled();
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

      expect(res.body).toHaveProperty("error", "User already exists with this email");
    });
  });

  describe("POST /api/auth/verify-otp", () => {
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
});
