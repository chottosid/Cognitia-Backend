import { jest } from "@jest/globals";

// Mock Prisma client
export const mockPrisma = {
  modelTest: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  questionBank: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  testAttempt: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  testAssignment: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  task: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  studySession: {
    findMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  availability: {
    findMany: jest.fn(),
  },
  note: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  notesGroup: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  question: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  answer: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  notification: {
    findMany: jest.fn(),
    count: jest.fn(),
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

// Mock data
export const mockModelTest = {
  id: "test-123",
  title: "Generated Test - Mathematics",
  description: "Auto-generated test for Mathematics (MEDIUM)",
  timeLimit: 60,
  subjects: ["MATHEMATICS"],
  topics: ["algebra", "calculus"],
  difficulty: "MEDIUM",
  isCustom: false,
  passingScore: 60,
  totalPoints: 100,
  userId: "user-123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockQuestion = {
  id: "question-123",
  question: "What is 2 + 2?",
  options: ["2", "3", "4", "5"],
  correctAnswer: 2,
  explanation: "2 + 2 equals 4",
  subject: "MATHEMATICS",
  topics: ["arithmetic"],
  difficulty: "EASY",
  createdAt: new Date(),
};

export const mockTestAttempt = {
  id: "attempt-123",
  testId: "test-123",
  userId: "user-123",
  totalQuestions: 5,
  score: 80,
  correctAnswers: 4,
  timeSpent: 45,
  answers: '{"question-123": 2}',
  status: "IN_PROGRESS",
  createdAt: new Date(),
  endTime: null,
};

export const mockTask = {
  id: "task-123",
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
};

export const mockNote = {
  id: "note-123",
  title: "Math Notes",
  content: "Important formulas",
  authorId: "user-123",
  notesGroupId: "group-123",
  visibility: "PRIVATE",
  tags: ["math", "formulas"],
  rating: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockNotesGroup = {
  id: "group-123",
  name: "Mathematics",
  description: "Math related notes",
  userId: "user-123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Clean up any resources
  await mockPrisma.$disconnect();
});
