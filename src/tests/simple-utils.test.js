/**
 * @jest-environment node
 */

import { jest } from "@jest/globals";

describe("Simple Utility Tests", () => {
  describe("Basic Function Testing", () => {
    it("should test mock function creation", () => {
      const mockFn = jest.fn();
      mockFn("arg1", "arg2");
      
      expect(mockFn).toHaveBeenCalled();
      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should test mock return values", () => {
      const mockFn = jest.fn()
        .mockReturnValue("default")
        .mockReturnValueOnce("first")
        .mockReturnValueOnce("second");
      
      expect(mockFn()).toBe("first");
      expect(mockFn()).toBe("second");
      expect(mockFn()).toBe("default");
    });

    it("should test async mock functions", async () => {
      const mockAsyncFn = jest.fn().mockResolvedValue("async result");
      
      const result = await mockAsyncFn();
      expect(result).toBe("async result");
      expect(mockAsyncFn).toHaveBeenCalled();
    });
  });

  describe("Data Validation", () => {
    it("should validate email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test("test@example.com")).toBe(true);
      expect(emailRegex.test("user.name@domain.co.uk")).toBe(true);
      expect(emailRegex.test("invalid-email")).toBe(false);
      expect(emailRegex.test("@domain.com")).toBe(false);
      expect(emailRegex.test("user@")).toBe(false);
    });

    it("should validate password strength", () => {
      const isStrongPassword = (password) => {
        return password && 
               password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /[a-z]/.test(password) && 
               /[0-9]/.test(password);
      };
      
      expect(isStrongPassword("Password123")).toBe(true);
      expect(isStrongPassword("weakpass")).toBe(false);
      expect(isStrongPassword("SHORT1")).toBe(false);
      expect(isStrongPassword("password123")).toBe(false);
      expect(isStrongPassword("PASSWORD123")).toBe(false);
    });

    it("should validate required fields", () => {
      const validateRequired = (data, requiredFields) => {
        for (const field of requiredFields) {
          if (!data[field] || data[field] === "") {
            return { isValid: false, missing: field };
          }
        }
        return { isValid: true };
      };
      
      const validData = { name: "Test", email: "test@example.com", age: 25 };
      const invalidData = { name: "Test", email: "", age: 25 };
      
      expect(validateRequired(validData, ["name", "email", "age"])).toEqual({ isValid: true });
      expect(validateRequired(invalidData, ["name", "email", "age"])).toEqual({ isValid: false, missing: "email" });
    });
  });

  describe("HTTP and API Utils", () => {
    it("should understand HTTP status codes", () => {
      const statusCodes = {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500
      };
      
      expect(statusCodes.OK).toBe(200);
      expect(statusCodes.CREATED).toBe(201);
      expect(statusCodes.BAD_REQUEST).toBe(400);
      expect(statusCodes.UNAUTHORIZED).toBe(401);
      expect(statusCodes.FORBIDDEN).toBe(403);
      expect(statusCodes.NOT_FOUND).toBe(404);
      expect(statusCodes.INTERNAL_SERVER_ERROR).toBe(500);
    });

    it("should handle JSON operations", () => {
      const obj = { id: 1, name: "Test", items: [1, 2, 3] };
      const jsonString = JSON.stringify(obj);
      const parsed = JSON.parse(jsonString);
      
      expect(typeof jsonString).toBe("string");
      expect(parsed).toEqual(obj);
      expect(parsed).not.toBe(obj);
    });

    it("should sanitize user input", () => {
      const sanitizeInput = (input) => {
        if (typeof input !== "string") return "";
        return input.trim().replace(/[<>]/g, "");
      };
      
      expect(sanitizeInput("  hello world  ")).toBe("hello world");
      expect(sanitizeInput("<script>alert('xss')</script>")).toBe("scriptalert('xss')/script");
      expect(sanitizeInput(123)).toBe("");
      expect(sanitizeInput(null)).toBe("");
    });
  });

  describe("Date and Time Utils", () => {
    it("should handle date operations", () => {
      const now = new Date();
      const timestamp = now.getTime();
      
      expect(typeof timestamp).toBe("number");
      expect(timestamp).toBeGreaterThan(0);
      
      const isoString = now.toISOString();
      expect(typeof isoString).toBe("string");
      expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("Error Handling", () => {
    it("should handle errors gracefully", () => {
      expect(() => {
        throw new Error("Test error");
      }).toThrow("Test error");
      
      expect(() => {
        JSON.parse("invalid json");
      }).toThrow();
    });
  });
});
