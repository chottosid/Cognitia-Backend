import { jest } from '@jest/globals';

// Mock Prisma client
export const mockPrisma = {
  modelTest: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  model_test_questions: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  test_questions: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  testAttempt: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

// Mock database module
jest.unstable_mockModule('../lib/database.js', () => ({
  prisma: mockPrisma,
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

// Mock authentication middleware
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'STUDENT',
};

export const mockAuthMiddleware = (req, res, next) => {
  req.user = mockUser;
  next();
};

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Clean up any resources
  await mockPrisma.$disconnect();
});
