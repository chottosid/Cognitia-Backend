import { v4 as uuidv4 } from "uuid"

// Types
export type TestDifficulty = "easy" | "medium" | "hard" | "expert"
export type TestStatus = "completed" | "in-progress"

export interface ModelTest {
  id: string
  title: string
  description: string
  timeLimit: number // in minutes
  subjects: string[]
  topics: string[]
  difficulty: TestDifficulty
  questions: TestQuestion[]
  isCustom: boolean
  passingScore: number
  totalPoints: number
  createdAt: Date
}

export interface TestQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  subject: string
  topic: string
  difficulty: TestDifficulty
  points: number
  explanation?: string
}

export interface TestAttempt {
  id: string
  userId: string
  testId: string
  status: TestStatus
  startTime: Date
  endTime?: Date
  timeSpent?: number // in seconds
  score?: number
  correctAnswers?: number
  totalQuestions: number
  answers: Record<string, number>
}

// Mock Data
export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Geography",
]

export const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  Mathematics: [
    "Algebra",
    "Geometry",
    "Calculus",
    "Trigonometry",
    "Statistics",
    "Probability",
    "Number Theory",
    "Linear Algebra",
  ],
  Physics: [
    "Mechanics",
    "Thermodynamics",
    "Electromagnetism",
    "Optics",
    "Quantum Physics",
    "Relativity",
    "Nuclear Physics",
    "Fluid Dynamics",
  ],
  Chemistry: [
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Physical Chemistry",
    "Analytical Chemistry",
    "Biochemistry",
    "Polymer Chemistry",
    "Electrochemistry",
    "Thermochemistry",
  ],
  Biology: [
    "Cell Biology",
    "Genetics",
    "Ecology",
    "Evolution",
    "Anatomy",
    "Physiology",
    "Microbiology",
    "Botany",
    "Zoology",
  ],
  "Computer Science": [
    "Algorithms",
    "Data Structures",
    "Programming Languages",
    "Database Systems",
    "Computer Networks",
    "Operating Systems",
    "Artificial Intelligence",
    "Machine Learning",
    "Web Development",
  ],
  English: ["Grammar", "Vocabulary", "Reading Comprehension", "Writing", "Literature", "Poetry", "Drama", "Prose"],
  History: [
    "Ancient History",
    "Medieval History",
    "Modern History",
    "World Wars",
    "Political History",
    "Cultural History",
    "Economic History",
    "Social History",
  ],
  Geography: [
    "Physical Geography",
    "Human Geography",
    "Cartography",
    "Climatology",
    "Oceanography",
    "Geomorphology",
    "Urban Geography",
    "Economic Geography",
  ],
}

// Generate questions for a subject and topic
const generateQuestions = (
  subject: string,
  topic: string,
  difficulty: TestDifficulty,
  count: number,
): TestQuestion[] => {
  const questions: TestQuestion[] = []
  const difficultyPoints = {
    easy: 5,
    medium: 10,
    hard: 15,
    expert: 20,
  }

  for (let i = 0; i < count; i++) {
    questions.push({
      id: uuidv4(),
      question: `${subject} ${topic} question ${i + 1} (${difficulty} difficulty)`,
      options: [
        `Option A for ${subject} ${topic} question ${i + 1}`,
        `Option B for ${subject} ${topic} question ${i + 1}`,
        `Option C for ${subject} ${topic} question ${i + 1}`,
        `Option D for ${subject} ${topic} question ${i + 1}`,
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      subject,
      topic,
      difficulty,
      points: difficultyPoints[difficulty],
      explanation: `Explanation for ${subject} ${topic} question ${i + 1}`,
    })
  }

  return questions
}

// Generate model tests
export const MODEL_TESTS: ModelTest[] = [
  {
    id: uuidv4(),
    title: "Mathematics Comprehensive Test",
    description: "A comprehensive test covering various topics in mathematics",
    timeLimit: 60,
    subjects: ["Mathematics"],
    topics: ["Algebra", "Geometry", "Calculus", "Trigonometry", "Statistics"],
    difficulty: "medium",
    questions: [
      ...generateQuestions("Mathematics", "Algebra", "medium", 5),
      ...generateQuestions("Mathematics", "Geometry", "medium", 5),
      ...generateQuestions("Mathematics", "Calculus", "medium", 5),
      ...generateQuestions("Mathematics", "Trigonometry", "medium", 3),
      ...generateQuestions("Mathematics", "Statistics", "medium", 2),
    ],
    isCustom: false,
    passingScore: 60,
    totalPoints: 200,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: uuidv4(),
    title: "Physics Fundamentals",
    description: "Test your knowledge of fundamental physics concepts",
    timeLimit: 45,
    subjects: ["Physics"],
    topics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics"],
    difficulty: "easy",
    questions: [
      ...generateQuestions("Physics", "Mechanics", "easy", 5),
      ...generateQuestions("Physics", "Thermodynamics", "easy", 5),
      ...generateQuestions("Physics", "Electromagnetism", "easy", 5),
      ...generateQuestions("Physics", "Optics", "easy", 5),
    ],
    isCustom: false,
    passingScore: 50,
    totalPoints: 100,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: uuidv4(),
    title: "Advanced Computer Science",
    description: "Challenge yourself with advanced computer science topics",
    timeLimit: 90,
    subjects: ["Computer Science"],
    topics: [
      "Algorithms",
      "Data Structures",
      "Operating Systems",
      "Database Systems",
      "Computer Networks",
      "Artificial Intelligence",
    ],
    difficulty: "hard",
    questions: [
      ...generateQuestions("Computer Science", "Algorithms", "hard", 5),
      ...generateQuestions("Computer Science", "Data Structures", "hard", 5),
      ...generateQuestions("Computer Science", "Operating Systems", "hard", 5),
      ...generateQuestions("Computer Science", "Database Systems", "hard", 5),
      ...generateQuestions("Computer Science", "Computer Networks", "hard", 5),
      ...generateQuestions("Computer Science", "Artificial Intelligence", "hard", 5),
    ],
    isCustom: false,
    passingScore: 180,
    totalPoints: 300,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: uuidv4(),
    title: "Biology and Chemistry Combined",
    description: "Test covering both biology and chemistry topics",
    timeLimit: 75,
    subjects: ["Biology", "Chemistry"],
    topics: ["Cell Biology", "Genetics", "Organic Chemistry", "Inorganic Chemistry", "Biochemistry"],
    difficulty: "medium",
    questions: [
      ...generateQuestions("Biology", "Cell Biology", "medium", 5),
      ...generateQuestions("Biology", "Genetics", "medium", 5),
      ...generateQuestions("Chemistry", "Organic Chemistry", "medium", 5),
      ...generateQuestions("Chemistry", "Inorganic Chemistry", "medium", 5),
      ...generateQuestions("Chemistry", "Biochemistry", "medium", 5),
    ],
    isCustom: false,
    passingScore: 125,
    totalPoints: 250,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: uuidv4(),
    title: "Expert Mathematics Challenge",
    description: "An extremely challenging mathematics test for experts",
    timeLimit: 120,
    subjects: ["Mathematics"],
    topics: ["Calculus", "Linear Algebra", "Number Theory", "Probability"],
    difficulty: "expert",
    questions: [
      ...generateQuestions("Mathematics", "Calculus", "expert", 5),
      ...generateQuestions("Mathematics", "Linear Algebra", "expert", 5),
      ...generateQuestions("Mathematics", "Number Theory", "expert", 5),
      ...generateQuestions("Mathematics", "Probability", "expert", 5),
    ],
    isCustom: false,
    passingScore: 160,
    totalPoints: 400,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
]

// Mock test attempts
const TEST_ATTEMPTS: TestAttempt[] = [
  {
    id: uuidv4(),
    userId: "user123",
    testId: MODEL_TESTS[0].id,
    status: "completed",
    startTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000),
    timeSpent: 50 * 60,
    score: 140,
    correctAnswers: 14,
    totalQuestions: 20,
    answers: {},
  },
  {
    id: uuidv4(),
    userId: "user123",
    testId: MODEL_TESTS[1].id,
    status: "completed",
    startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000),
    timeSpent: 40 * 60,
    score: 80,
    correctAnswers: 16,
    totalQuestions: 20,
    answers: {},
  },
  {
    id: uuidv4(),
    userId: "user123",
    testId: MODEL_TESTS[2].id,
    status: "completed",
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 85 * 60 * 1000),
    timeSpent: 85 * 60,
    score: 210,
    correctAnswers: 14,
    totalQuestions: 30,
    answers: {},
  },
  {
    id: uuidv4(),
    userId: "user123",
    testId: MODEL_TESTS[3].id,
    status: "in-progress",
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    totalQuestions: 25,
    answers: {},
  },
]

// Helper Functions
export function getModelTestById(id: string): ModelTest | undefined {
  return MODEL_TESTS.find((test) => test.id === id)
}

export function getUserTestAttempts(userId: string): TestAttempt[] {
  return TEST_ATTEMPTS.filter((attempt) => attempt.userId === userId)
}

export function createCustomTest(params: {
  title: string
  description: string
  timeLimit: number
  subjects: string[]
  topics: string[]
  difficulty: TestDifficulty
  questionCount: number
}): ModelTest {
  const { title, description, timeLimit, subjects, topics, difficulty, questionCount } = params

  // Distribute questions evenly among topics
  const questionsPerTopic = Math.floor(questionCount / topics.length)
  const remainingQuestions = questionCount % topics.length

  let questions: TestQuestion[] = []
  topics.forEach((topic, index) => {
    const subject = subjects.find((s) => TOPICS_BY_SUBJECT[s]?.includes(topic)) || subjects[0]
    const count = index < remainingQuestions ? questionsPerTopic + 1 : questionsPerTopic
    questions = [...questions, ...generateQuestions(subject, topic, difficulty, count)]
  })

  const difficultyPoints = {
    easy: 5,
    medium: 10,
    hard: 15,
    expert: 20,
  }

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  const passingScore = Math.floor(totalPoints * 0.6) // 60% passing score

  const newTest: ModelTest = {
    id: uuidv4(),
    title,
    description,
    timeLimit,
    subjects,
    topics,
    difficulty,
    questions,
    isCustom: true,
    passingScore,
    totalPoints,
    createdAt: new Date(),
  }

  MODEL_TESTS.push(newTest)
  return newTest
}

export function startTest(testId: string, userId: string): TestAttempt {
  const test = getModelTestById(testId)
  if (!test) {
    throw new Error(`Test with ID ${testId} not found`)
  }

  // Check if there's an in-progress attempt
  const existingAttempt = TEST_ATTEMPTS.find(
    (a) => a.userId === userId && a.testId === testId && a.status === "in-progress",
  )

  if (existingAttempt) {
    return existingAttempt
  }

  // Create a new attempt
  const newAttempt: TestAttempt = {
    id: uuidv4(),
    userId,
    testId,
    status: "in-progress",
    startTime: new Date(),
    totalQuestions: test.questions.length,
    answers: {},
  }

  TEST_ATTEMPTS.push(newAttempt)
  return newAttempt
}

export function submitAnswer(attemptId: string, questionId: string, answer: number): void {
  const attempt = TEST_ATTEMPTS.find((a) => a.id === attemptId)
  if (!attempt) {
    throw new Error(`Attempt with ID ${attemptId} not found`)
  }

  attempt.answers[questionId] = answer
}

export function finishTest(attemptId: string): TestAttempt {
  const attempt = TEST_ATTEMPTS.find((a) => a.id === attemptId)
  if (!attempt) {
    throw new Error(`Attempt with ID ${attemptId} not found`)
  }

  const test = getModelTestById(attempt.testId)
  if (!test) {
    throw new Error(`Test with ID ${attempt.testId} not found`)
  }

  // Calculate score and correct answers
  let score = 0
  let correctAnswers = 0

  test.questions.forEach((question) => {
    const userAnswer = attempt.answers[question.id]
    if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
      score += question.points
      correctAnswers++
    }
  })

  // Update attempt
  attempt.status = "completed"
  attempt.endTime = new Date()
  attempt.timeSpent = Math.floor((attempt.endTime.getTime() - attempt.startTime.getTime()) / 1000)
  attempt.score = score
  attempt.correctAnswers = correctAnswers

  return attempt
}

export function getTestResults(attemptId: string) {
  const attempt = TEST_ATTEMPTS.find((a) => a.id === attemptId)
  if (!attempt) {
    throw new Error(`Attempt with ID ${attemptId} not found`)
  }

  const test = getModelTestById(attempt.testId)
  if (!test) {
    throw new Error(`Test with ID ${attempt.testId} not found`)
  }

  // Generate question results
  const questionResults = test.questions.map((question) => {
    const userAnswer = attempt.answers[question.id]
    const isCorrect = userAnswer !== undefined && userAnswer === question.correctAnswer

    return {
      question,
      userAnswer,
      isCorrect,
    }
  })

  const isPassed = (attempt.score || 0) >= test.passingScore

  return {
    attempt,
    test,
    questionResults,
    isPassed,
  }
}
