import bcrypt from "bcryptjs";
import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import { mockPrisma } from "./setup.js";

// Import the real module and override only generateToken
const realAuth = await import("../middleware/auth.js");
await jest.unstable_mockModule("../middleware/auth.js", () => ({
  ...realAuth,
  generateToken: () => "mocked-jwt-token",
}));

const { default: authRoutes } = await import("../routes/auth.js");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Login Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login a verified user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      password: await bcrypt.hash("Password123!", 12),
      verified: true,
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

    expect(res.body).toHaveProperty("error", "User not verified. Please check your email for OTP.");
  });
});
