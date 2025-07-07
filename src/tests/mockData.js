// Mock data with proper CUID format IDs
export const mockModelTests = [
  {
    id: "clh7x8y9z0001abc123def456",
    title: "Mathematics Test",
    description: "Basic mathematics test",
    timeLimit: 60,
    subjects: ["Mathematics"],
    topics: ["Algebra", "Geometry"],
    difficulty: "MEDIUM",
    createdAt: new Date("2023-01-01"),
    model_test_questions: [
      {
        id: "link1",
        modelTestId: "clh7x8y9z0001abc123def456",
        testQuestionId: "clh7x8y9z0002abc123def456",
      },
      {
        id: "link2",
        modelTestId: "clh7x8y9z0001abc123def456",
        testQuestionId: "clh7x8y9z0003abc123def456",
      },
    ],
  },
  {
    id: "clh7x8y9z0004abc123def456",
    title: "Science Test",
    description: "Basic science test",
    timeLimit: 45,
    subjects: ["Science"],
    topics: ["Physics"],
    difficulty: "EASY",
    createdAt: new Date("2023-01-02"),
    model_test_questions: [
      {
        id: "link3",
        modelTestId: "clh7x8y9z0004abc123def456",
        testQuestionId: "clh7x8y9z0005abc123def456",
      },
    ],
  },
];

export const mockTestQuestions = [
  {
    id: "clh7x8y9z0002abc123def456",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
    explanation: "2 + 2 = 4",
    subject: "Mathematics",
    topics: ["Algebra"],
    points: 5,
  },
  {
    id: "clh7x8y9z0003abc123def456",
    question: "What is 3 × 3?",
    options: ["6", "9", "12", "15"],
    correctAnswer: 1,
    explanation: "3 × 3 = 9",
    subject: "Mathematics",
    topics: ["Algebra"],
    points: 10,
  },
  {
    id: "clh7x8y9z0005abc123def456",
    question: "What is the speed of light?",
    options: [
      "299,792,458 m/s",
      "300,000,000 m/s",
      "150,000,000 m/s",
      "200,000,000 m/s",
    ],
    correctAnswer: 0,
    explanation: "The speed of light is 299,792,458 m/s",
    subject: "Science",
    topics: ["Physics"],
    points: 15,
  },
];

export const mockModelTestQuestions = [
  {
    id: "link1",
    modelTestId: "clh7x8y9z0001abc123def456",
    testQuestionId: "clh7x8y9z0002abc123def456",
    order: 1,
    test_questions: mockTestQuestions[0],
  },
  {
    id: "link2",
    modelTestId: "clh7x8y9z0001abc123def456",
    testQuestionId: "clh7x8y9z0003abc123def456",
    order: 2,
    test_questions: mockTestQuestions[1],
  },
];

export const mockTestAttempt = {
  id: "clh7x8y9z0006abc123def456",
  testId: "clh7x8y9z0001abc123def456",
  userId: "clh7x8y9z0007abc123def456",
  answers: JSON.stringify({
    clh7x8y9z0002abc123def456: 1,
    clh7x8y9z0003abc123def456: 1,
  }),
  score: 15,
  correctAnswers: 2,
  totalQuestions: 2,
  timeSpent: 1800,
  status: "COMPLETED",
  startTime: new Date("2023-01-01T10:00:00Z"),
  endTime: new Date("2023-01-01T10:30:00Z"),
  test: {
    ...mockModelTests[0],
    model_test_questions: mockModelTestQuestions,
  },
  user: {
    id: "clh7x8y9z0007abc123def456",
    email: "test@example.com",
    name: "Test User",
  },
};
