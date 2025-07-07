import { jest } from "@jest/globals";

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
    create: jest.fn(),
    update: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

// Mock database module
jest.unstable_mockModule("../lib/database.js", () => ({
  prisma: mockPrisma,
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

// Mock authentication middleware
export const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "STUDENT",
};

export const mockAuthMiddleware = (req, res, next) => {
  // Inject mock user into request
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

// Add mock for tasks and study sessions
export const mockTasks = [
  {
    id: "task-1",
    title: "Complete Assignment",
    description: "Math homework",
    dueDate: new Date("2024-12-31"),
    priority: "HIGH",
    subjectArea: "MATHEMATICS",
    estimatedTime: 2,
    status: "NOT_STARTED",
    userId: "user-123",
    fileLink: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockStudySessions = [
  {
    id: "session-1",
    taskId: "task-1",
    startTime: new Date("2024-01-01T09:00:00Z"),
    endTime: new Date("2024-01-01T10:00:00Z"),
    duration: 60,
    goal: "Complete math homework",
    userId: "user-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Add task-related mocks to mockPrisma
mockPrisma.task = {
  findMany: jest.fn(),
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

mockPrisma.studySession = {
  findMany: jest.fn(),
  createMany: jest.fn(),
  deleteMany: jest.fn(),
};

mockPrisma.availability = {
  findMany: jest.fn(),
};

// Add notes-related mocks to mockPrisma
mockPrisma.note = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

mockPrisma.notesGroup = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
