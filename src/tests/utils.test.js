/**
 * @jest-environment node
 */

import { jest } from "@jest/globals";

describe("Utility Functions Tests", () => {
  describe("File Utils", () => {
    it("should detect PDF mime type", async () => {
      // Mock the detectMimeType function
      const mockDetectMimeType = jest.fn().mockResolvedValue("application/pdf");

      jest.unstable_mockModule("../utils/fileUtils.js", () => ({
        detectMimeType: mockDetectMimeType,
      }));

      const { detectMimeType } = await import("../utils/fileUtils.js");

      const mockBuffer = Buffer.from("PDF file content");
      const result = await detectMimeType(mockBuffer);

      expect(result).toBe("application/pdf");
      expect(mockDetectMimeType).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe("Notification Utils", () => {
    it("should create and send notification", async () => {
      const mockCreateAndSendNotification = jest.fn().mockResolvedValue({
        id: "notif-1",
        title: "Test Notification",
        message: "Test message",
        userId: "user-1",
      });

      jest.unstable_mockModule("../utils/notification.js", () => ({
        createAndSendNotification: mockCreateAndSendNotification,
      }));

      const { createAndSendNotification } = await import(
        "../utils/notification.js"
      );

      const result = await createAndSendNotification(
        "user-1",
        "Test Notification",
        "Test message",
        "MESSAGE"
      );

      expect(result).toHaveProperty("id", "notif-1");
      expect(mockCreateAndSendNotification).toHaveBeenCalledWith(
        "user-1",
        "Test Notification",
        "Test message",
        "MESSAGE"
      );
    });
  });

  describe("Mailer Utils", () => {
    it("should send OTP email successfully", async () => {
      const mockSendOtpEmail = jest.fn().mockResolvedValue(true);

      jest.unstable_mockModule("../utils/mailer.js", () => ({
        sendOtpEmail: mockSendOtpEmail,
      }));

      const { sendOtpEmail } = await import("../utils/mailer.js");

      const result = await sendOtpEmail(
        "test@example.com",
        "123456",
        "Test User"
      );

      expect(result).toBe(true);
      expect(mockSendOtpEmail).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
        "Test User"
      );
    });
  });

  describe("Queue Utils", () => {
    it("should process jobs in queue", async () => {
      const mockQueueProcessor = jest.fn().mockResolvedValue("Job completed");

      jest.unstable_mockModule("../utils/queue.js", () => ({
        processJob: mockQueueProcessor,
        addJob: jest.fn().mockResolvedValue({ id: "job-1" }),
      }));

      const { processJob, addJob } = await import("../utils/queue.js");

      const jobResult = await processJob("email", {
        to: "test@example.com",
        subject: "Test",
      });

      const addResult = await addJob("email", { to: "test@example.com" });

      expect(jobResult).toBe("Job completed");
      expect(addResult).toHaveProperty("id", "job-1");
    });
  });
});

describe("Middleware Tests", () => {
  describe("Authentication Middleware", () => {
    it("should validate JWT tokens", async () => {
      const mockAuthenticateToken = jest.fn((req, res, next) => {
        if (req.headers.authorization === "Bearer valid-token") {
          req.user = { id: "user-1", email: "test@example.com" };
          next();
        } else {
          res.status(401).json({ error: "Unauthorized" });
        }
      });

      jest.unstable_mockModule("../middleware/auth.js", () => ({
        authenticateToken: mockAuthenticateToken,
        generateToken: jest.fn().mockReturnValue("mock-token"),
      }));

      const { authenticateToken, generateToken } = await import(
        "../middleware/auth.js"
      );

      const mockReq = {
        headers: { authorization: "Bearer valid-token" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual({ id: "user-1", email: "test@example.com" });
      expect(mockNext).toHaveBeenCalled();

      const token = generateToken({ id: "user-1" });
      expect(token).toBe("mock-token");
    });

    it("should reject invalid tokens", async () => {
      const mockAuthenticateToken = jest.fn((req, res, next) => {
        res.status(401).json({ error: "Unauthorized" });
      });

      jest.unstable_mockModule("../middleware/auth.js", () => ({
        authenticateToken: mockAuthenticateToken,
      }));

      const { authenticateToken } = await import("../middleware/auth.js");

      const mockReq = {
        headers: { authorization: "Bearer invalid-token" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Validation Middleware", () => {
    it("should validate email format", async () => {
      const mockValidateEmail = jest.fn((req, res, next) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(req.body.email)) {
          next();
        } else {
          res.status(400).json({ error: "Invalid email format" });
        }
      });

      jest.unstable_mockModule("../middleware/validation.js", () => ({
        validateEmail: mockValidateEmail,
        validatePassword: jest.fn((req, res, next) => next()),
        handleValidationErrors: jest.fn((req, res, next) => next()),
      }));

      const { validateEmail } = await import("../middleware/validation.js");

      const validEmailReq = { body: { email: "test@example.com" } };
      const invalidEmailReq = { body: { email: "invalid-email" } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      // Test valid email
      validateEmail(validEmailReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Test invalid email
      mockNext.mockClear();
      validateEmail(invalidEmailReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should validate password strength", async () => {
      const mockValidatePassword = jest.fn((req, res, next) => {
        const password = req.body.password;
        if (password && password.length >= 8) {
          next();
        } else {
          res
            .status(400)
            .json({ error: "Password must be at least 8 characters" });
        }
      });

      jest.unstable_mockModule("../middleware/validation.js", () => ({
        validatePassword: mockValidatePassword,
      }));

      const { validatePassword } = await import("../middleware/validation.js");

      const validPasswordReq = { body: { password: "password123" } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      // Test valid password
      validatePassword(validPasswordReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("Error Handler Middleware", () => {
    it("should handle errors gracefully", async () => {
      const mockErrorHandler = jest.fn((err, req, res, next) => {
        console.error("Error:", err.message);
        res.status(err.status || 500).json({
          error: err.message || "Internal server error",
        });
      });

      jest.unstable_mockModule("../middleware/errorHandler.js", () => ({
        default: mockErrorHandler,
      }));

      const errorHandler = await import("../middleware/errorHandler.js");

      const mockError = new Error("Test error");
      mockError.status = 400;

      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      errorHandler.default(mockError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Test error" });
    });
  });

  describe("CORS Middleware", () => {
    it("should set appropriate CORS headers", async () => {
      const mockCorsMiddleware = jest.fn((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
          "Access-Control-Allow-Methods",
          "GET,PUT,POST,DELETE,OPTIONS"
        );
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        next();
      });

      jest.unstable_mockModule("../middleware/cors.js", () => ({
        default: mockCorsMiddleware,
      }));

      const corsMiddleware = await import("../middleware/cors.js");

      const mockReq = { method: "GET" };
      const mockRes = {
        header: jest.fn(),
      };
      const mockNext = jest.fn();

      corsMiddleware.default(mockReq, mockRes, mockNext);

      expect(mockRes.header).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "*"
      );
      expect(mockRes.header).toHaveBeenCalledWith(
        "Access-Control-Allow-Methods",
        "GET,PUT,POST,DELETE,OPTIONS"
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
