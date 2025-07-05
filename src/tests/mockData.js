export const mockModelTests = [
  {
    id: "test-1",
    title: "Mathematics Test",
    description: "A comprehensive math test",
    timeLimit: 60,
    subjects: ["Mathematics"],
    topics: ["Algebra", "Geometry"],
    difficulty: "MEDIUM",
    passingScore: 70,
    totalPoints: 100,
    createdAt: new Date("2024-01-01"),
    model_test_questions: [
      { id: "link-1", order: 1 },
      { id: "link-2", order: 2 },
    ],
  },
  {
    id: "test-2",
    title: "Physics Test",
    description: "Basic physics concepts",
    timeLimit: 45,
    subjects: ["Physics"],
    topics: ["Mechanics"],
    difficulty: "EASY",
    passingScore: 60,
    totalPoints: 80,
    createdAt: new Date("2024-01-02"),
    model_test_questions: [{ id: "link-3", order: 1 }],
  },
];

export const mockTestQuestions = [
  {
    id: "q1",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
    explanation: "Basic arithmetic",
    subject: "Mathematics",
    topics: ["Algebra"],
    points: 5,
  },
  {
    id: "q2",
    question: "What is the speed of light?",
    options: [
      "299,792,458 m/s",
      "300,000,000 m/s",
      "250,000,000 m/s",
      "350,000,000 m/s",
    ],
    correctAnswer: 0,
    explanation: "Speed of light in vacuum",
    subject: "Physics",
    topics: ["Mechanics"],
    points: 10,
  },
];

export const mockModelTestQuestions = [
  {
    id: "link-1",
    modelTestId: "test-1",
    testQuestionId: "q1",
    order: 1,
    test_questions: mockTestQuestions[0],
  },
  {
    id: "link-2",
    modelTestId: "test-1",
    testQuestionId: "q2",
    order: 2,
    test_questions: mockTestQuestions[1],
  },
];

export const mockTestAttempt = {
  id: "attempt-1",
  testId: "test-1",
  userId: "user-123",
  status: "COMPLETED",
  startTime: new Date("2024-01-01T10:00:00Z"),
  endTime: new Date("2024-01-01T11:00:00Z"),
  timeSpent: 3600,
  score: 85,
  correctAnswers: 8,
  totalQuestions: 10,
  answers: JSON.stringify({ q1: 1, q2: 0 }),
  test: {
    ...mockModelTests[0],
    model_test_questions: mockModelTestQuestions,
  },
  user: {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
  },
};
