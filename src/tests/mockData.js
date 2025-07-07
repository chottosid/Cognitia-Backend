export const mockModelTests = [
  {
    id: "clh7x8y9z0001abc123def456",
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
    id: "clh7x8y9z0002abc123def456",
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
    id: "clh7x8y9z0002abc123def456",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
    explanation: "Basic arithmetic",
    subject: "Mathematics",
    topics: ["Algebra"],
    points: 5,
  },
  {
    id: "clh7x8y9z0003abc123def456",
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
    modelTestId: "clh7x8y9z0001abc123def456",
    testQuestionId: "clh7x8y9z0002abc123def456",
    order: 1,
    test_questions: mockTestQuestions[0],
  },
  {
    id: "link-2",
    modelTestId: "clh7x8y9z0001abc123def456",
    testQuestionId: "clh7x8y9z0003abc123def456",
    order: 2,
    test_questions: mockTestQuestions[1],
  },
];

export const mockTestAttempt = {
  id: "clh7x8y9z0006abc123def456",
  testId: "clh7x8y9z0001abc123def456",
  userId: "user-123",
  status: "COMPLETED",
  startTime: new Date("2024-01-01T10:00:00Z"),
  endTime: new Date("2024-01-01T11:00:00Z"),
  timeSpent: 3600,
  score: 85,
  correctAnswers: 8,
  totalQuestions: 10,
  answers: JSON.stringify({
    clh7x8y9z0002abc123def456: 1,
    clh7x8y9z0003abc123def456: 0,
  }),
  test: {
    ...mockModelTests[0],
    questions: mockModelTestQuestions.map((mtq) => ({
      id: mtq.test_questions.id,
      question: mtq.test_questions.question,
      options: mtq.test_questions.options,
      correctAnswer: mtq.test_questions.correctAnswer,
      explanation: mtq.test_questions.explanation,
      subject: mtq.test_questions.subject,
      topics: mtq.test_questions.topics,
      points: mtq.test_questions.points,
    })),
  },
  user: {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
  },
};
