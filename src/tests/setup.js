// Test setup file
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Setup before all tests
beforeAll(async () => {
  // You can add database seeding or setup here if needed
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Mock console.log in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};
