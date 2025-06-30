// Helper function to generate IDs
export function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

// Helper function to get date X days ago or in the future
export function daysFromNow(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

// Helper to create dates relative to now
export const hoursFromNow = (hours) => {
  const date = new Date()
  date.setHours(date.getHours() + hours)
  return date
}

// Helper to create times for today
export const timeToday = (hours, minutes = 0) => {
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

// Current user ID (mock)
export const CURRENT_USER_ID = "user_1"

// Mock tasks with more data
export const TASKS = [
  {
    id: "task_1",
    title: "Study Algorithms",
    description: "Review quicksort, mergesort, and heapsort algorithms for the upcoming exam.",
    dueDate: daysFromNow(0),
    status: "in_progress",
    priority: "high",
    userId: CURRENT_USER_ID,
    createdAt: daysFromNow(-10),
    updatedAt: daysFromNow(-5),
    tags: ["algorithms", "computer science", "exam prep"],
    subjectArea: "Computer Science",
    estimatedTime: 120,
  },
  {
    id: "task_2",
    title: "Physics Lab Report",
    description: "Complete the lab report on wave interference patterns and submit it online.",
    dueDate: daysFromNow(0),
    status: "not_started",
    priority: "medium",
    userId: CURRENT_USER_ID,
    createdAt: daysFromNow(-8),
    updatedAt: daysFromNow(-8),
    tags: ["physics", "lab report", "waves"],
    subjectArea: "Physics",
    estimatedTime: 90,
  },
  {
    id: "task_3",
    title: "Mathematics Problem Set",
    description: "Solve the calculus problem set from Chapter 7 on integration techniques.",
    dueDate: daysFromNow(0),
    status: "not_started",
    priority: "high",
    userId: CURRENT_USER_ID,
    createdAt: daysFromNow(-7),
    updatedAt: daysFromNow(-7),
    tags: ["mathematics", "calculus", "integration"],
    subjectArea: "Mathematics",
    estimatedTime: 60,
  },
  {
    id: "task_4",
    title: "Read Research Paper",
    description: "Read and summarize the research paper on quantum computing applications in cryptography.",
    dueDate: daysFromNow(2),
    status: "not_started",
    priority: "low",
    userId: CURRENT_USER_ID,
    createdAt: daysFromNow(-6),
    updatedAt: daysFromNow(-6),
    tags: ["quantum computing", "research", "cryptography"],
    subjectArea: "Computer Science",
    estimatedTime: 120,
  },
  {
    id: "task_5",
    title: "Chemistry Experiment",
    description: "Prepare for the titration experiment and review the procedure beforehand.",
    dueDate: daysFromNow(3),
    status: "not_started",
    priority: "medium",
    userId: CURRENT_USER_ID,
    createdAt: daysFromNow(-5),
    updatedAt: daysFromNow(-5),
    tags: ["chemistry", "experiment", "titration"],
    subjectArea: "Chemistry",
    estimatedTime: 45,
  },
  {
    id: "task_6",
    title: "Literature Essay",
    description: "Write a 1500-word essay analyzing the themes in 'To Kill a Mockingbird'.",
    dueDate: daysFromNow(5),
    status: "not_started",
    priority: "high",
    userId: CURRENT_USER_ID,
    createdAt: daysFromNow(-4),
    updatedAt: daysFromNow(-4),
    tags: ["literature", "essay", "analysis"],
    subjectArea: "Literature",
    estimatedTime: 180,
  },
  {
    id: "task_7",
    title: "Programming Assignment",
    description: "Implement a binary search tree in Python with insert, delete, and traversal methods.",
    dueDate: daysFromNow(-3),
    status: "completed",
    priority: "medium",
    userId: CURRENT_USER_ID,
    createdAt: daysFromNow(-15),
    updatedAt: daysFromNow(-2),
    tags: ["programming", "data structures", "python"],
    subjectArea: "Computer Science",
    completedAt: daysFromNow(-2),
    estimatedTime: 150,
  },
  {
    id: "task_8",
    title: "Biology Quiz Preparation",
    description: "Study cell biology and molecular mechanisms for tomorrow's quiz.",
    dueDate: daysFromNow(-1),
    status: "completed",
    priority: "high",
    userId: CURRENT_USER_ID,
    createdAt: daysFromNow(-7),
    updatedAt: daysFromNow(-1),
    tags: ["biology", "quiz", "cell biology"],
    subjectArea: "Biology",
    completedAt: daysFromNow(-1),
    estimatedTime: 120,
  },
  {
    id: "task_9",
    title: "History Timeline",
    description: "Create a timeline of major events during the Industrial Revolution.",
    dueDate: daysFromNow(-2),
    status: "completed",
    priority: "medium",
    userId: CURRENT_USER_ID,
    createdAt: daysFromNow(-10),
    updatedAt: daysFromNow(-2),
    tags: ["history", "industrial revolution", "timeline"],
    subjectArea: "History",
    completedAt: daysFromNow(-2),
    estimatedTime: 90,
  },
  {
    id: "task_10",
    title: "Physics Problem Set",
    description: "Complete the mechanics problem set focusing on Newton's laws of motion.",
    dueDate: daysFromNow(-4),
    status: "completed",
    priority: "medium",
    userId: CURRENT_USER_ID,
    createdAt: daysFromNow(-12),
    updatedAt: daysFromNow(-4),
    tags: ["physics", "mechanics", "newton's laws"],
    subjectArea: "Physics",
    completedAt: daysFromNow(-4),
    estimatedTime: 60,
  },
]

// Get tasks for today
export const getTodaysTasks = () => {
  const today = new Date()
  return TASKS.filter((task) => {
    const taskDate = new Date(task.dueDate)
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear() &&
      task.status !== "completed"
    )
  })
}

// Get completed tasks
export const getCompletedTasks = () => {
  return TASKS.filter((task) => task.status === "completed")
}

// Get upcoming tasks (not due today and not completed)
export const getUpcomingTasks = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return TASKS.filter((task) => {
    const taskDate = new Date(task.dueDate)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate > today && task.status !== "completed"
  })
}

// Mock study sessions with more data for today
export const SESSIONS = [
  {
    id: "session_1",
    userId: CURRENT_USER_ID,
    taskId: "task_1",
    task: TASKS.find((t) => t.id === "task_1"),
    startTime: timeToday(9, 0),
    endTime: timeToday(11, 0),
    duration: 120,
    goal: "Complete review of sorting algorithms and implement examples",
    notes: "Focus on time complexity analysis and optimization techniques",
    createdAt: daysFromNow(-1),
    updatedAt: daysFromNow(-1),
    completed: false,
  },
  {
    id: "session_2",
    userId: CURRENT_USER_ID,
    taskId: "task_2",
    task: TASKS.find((t) => t.id === "task_2"),
    startTime: timeToday(13, 0),
    endTime: timeToday(14, 30),
    duration: 90,
    goal: "Write the physics lab report introduction and methodology sections",
    notes: "Include diagrams and experimental setup details",
    createdAt: daysFromNow(-1),
    updatedAt: daysFromNow(-1),
    completed: false,
  },
  {
    id: "session_3",
    userId: CURRENT_USER_ID,
    taskId: "task_3",
    task: TASKS.find((t) => t.id === "task_3"),
    startTime: timeToday(16, 0),
    endTime: timeToday(17, 0),
    duration: 60,
    goal: "Solve calculus integration problems from Chapter 7",
    notes: "Focus on integration by parts and substitution methods",
    createdAt: daysFromNow(-1),
    updatedAt: daysFromNow(-1),
    completed: false,
  },
  {
    id: "session_4",
    userId: CURRENT_USER_ID,
    taskId: "task_7",
    task: TASKS.find((t) => t.id === "task_7"),
    startTime: daysFromNow(-3),
    endTime: new Date(daysFromNow(-3).getTime() + 2.5 * 60 * 60 * 1000),
    duration: 150,
    goal: "Implement binary search tree in Python",
    notes: "Completed implementation of insert, delete, and traversal methods. Need to add balancing in the future.",
    createdAt: daysFromNow(-4),
    updatedAt: daysFromNow(-3),
    completed: true,
  },
  {
    id: "session_5",
    userId: CURRENT_USER_ID,
    taskId: "task_8",
    task: TASKS.find((t) => t.id === "task_8"),
    startTime: daysFromNow(-2),
    endTime: new Date(daysFromNow(-2).getTime() + 2 * 60 * 60 * 1000),
    duration: 120,
    goal: "Study cell biology for quiz",
    notes: "Reviewed cell structure, organelles, and cellular respiration. Created flashcards for key concepts.",
    createdAt: daysFromNow(-3),
    updatedAt: daysFromNow(-2),
    completed: true,
  },
  {
    id: "session_6",
    userId: CURRENT_USER_ID,
    taskId: "task_9",
    task: TASKS.find((t) => t.id === "task_9"),
    startTime: daysFromNow(-3),
    endTime: new Date(daysFromNow(-3).getTime() + 1.5 * 60 * 60 * 1000),
    duration: 90,
    goal: "Create Industrial Revolution timeline",
    notes: "Researched key events and innovations. Created digital timeline with images and descriptions.",
    createdAt: daysFromNow(-4),
    updatedAt: daysFromNow(-3),
    completed: true,
  },
]

// Get sessions for today
export const getTodaysSessions = () => {
  const today = new Date()
  return SESSIONS.filter((session) => {
    return (
      session.startTime.getDate() === today.getDate() &&
      session.startTime.getMonth() === today.getMonth() &&
      session.startTime.getFullYear() === today.getFullYear()
    )
  })
}

// Mock progress data
export const PROGRESS = [
  {
    id: "progress_1",
    userId: CURRENT_USER_ID,
    category: "Algorithms",
    score: 85,
    maxScore: 100,
    completedAt: daysFromNow(-20),
    createdAt: daysFromNow(-20),
    updatedAt: daysFromNow(-20),
  },
  {
    id: "progress_2",
    userId: CURRENT_USER_ID,
    category: "Data Structures",
    score: 92,
    maxScore: 100,
    completedAt: daysFromNow(-15),
    createdAt: daysFromNow(-15),
    updatedAt: daysFromNow(-15),
  },
  {
    id: "progress_3",
    userId: CURRENT_USER_ID,
    category: "Calculus",
    score: 78,
    maxScore: 100,
    completedAt: daysFromNow(-10),
    createdAt: daysFromNow(-10),
    updatedAt: daysFromNow(-10),
  },
  {
    id: "progress_4",
    userId: CURRENT_USER_ID,
    category: "Quantum Physics",
    score: 65,
    maxScore: 100,
    completedAt: daysFromNow(-5),
    createdAt: daysFromNow(-5),
    updatedAt: daysFromNow(-5),
  },
  {
    id: "progress_5",
    userId: CURRENT_USER_ID,
    category: "Organic Chemistry",
    score: 88,
    maxScore: 100,
    completedAt: daysFromNow(-8),
    createdAt: daysFromNow(-8),
    updatedAt: daysFromNow(-8),
  },
  {
    id: "progress_6",
    userId: CURRENT_USER_ID,
    category: "Literature Analysis",
    score: 95,
    maxScore: 100,
    completedAt: daysFromNow(-12),
    createdAt: daysFromNow(-12),
    updatedAt: daysFromNow(-12),
  },
]

// Get today's study plan with progress
export const STUDY_PLANS = TASKS.map((task, index) => {
  const session = SESSIONS.find((s) => s.taskId === task.id)
  const total = index === 0 ? 5 : index === 1 ? 10 : 6
  const completed = index === 0 ? 0 : index === 1 ? 2 : 3

  return {
    id: task.id,
    title: task.title,
    duration: session
      ? `${Math.round(((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60)) * 10) / 10} hours`
      : "Not scheduled",
    completed,
    total,
  }
})

// Helper function to format time
export function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

// Helper function to format date
export function formatDate(date, format = "full") {
  if (format === "full") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } else if (format === "short") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  } else if (format === "month-day") {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    })
  }
  return date.toLocaleDateString()
}

// Helper function to format relative time
export function formatRelativeTime(date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`
}

// Weekly study data for chart
export const WEEKLY_STUDY_DATA = [
  { day: "Monday", hours: 2.5 },
  { day: "Tuesday", hours: 1.8 },
  { day: "Wednesday", hours: 3.2 },
  { day: "Thursday", hours: 4.0 },
  { day: "Friday", hours: 0 },
  { day: "Saturday", hours: 0 },
  { day: "Sunday", hours: 0 },
]

// Focus areas data
export const FOCUS_AREAS = [
  { subject: "Mathematics", percentage: 40 },
  { subject: "Physics", percentage: 30 },
  { subject: "Computer Science", percentage: 30 },
]

// Monthly progress data for interactive charts
export const MONTHLY_PROGRESS = [
  { month: "January", completed: 45, total: 60 },
  { month: "February", completed: 52, total: 65 },
  { month: "March", completed: 48, total: 70 },
  { month: "April", completed: 60, total: 75 },
  { month: "May", completed: 65, total: 80 },
]

// Subject progress over time
export const SUBJECT_PROGRESS = [
  {
    subject: "Mathematics",
    data: [
      { week: "Week 1", score: 65 },
      { week: "Week 2", score: 70 },
      { week: "Week 3", score: 75 },
      { week: "Week 4", score: 82 },
    ],
  },
  {
    subject: "Physics",
    data: [
      { week: "Week 1", score: 60 },
      { week: "Week 2", score: 68 },
      { week: "Week 3", score: 72 },
      { week: "Week 4", score: 78 },
    ],
  },
  {
    subject: "Computer Science",
    data: [
      { week: "Week 1", score: 75 },
      { week: "Week 2", score: 80 },
      { week: "Week 3", score: 85 },
      { week: "Week 4", score: 90 },
    ],
  },
]

// Study time distribution by subject
export const STUDY_TIME_DISTRIBUTION = [
  { subject: "Mathematics", hours: 25, percentage: 35 },
  { subject: "Physics", hours: 18, percentage: 25 },
  { subject: "Computer Science", hours: 22, percentage: 30 },
  { subject: "Chemistry", hours: 5, percentage: 7 },
  { subject: "Biology", hours: 2, percentage: 3 },
]

// Task completion rate by priority
export const TASK_COMPLETION_RATE = [
  { priority: "High", completed: 85, total: 100 },
  { priority: "Medium", completed: 70, total: 100 },
  { priority: "Low", completed: 50, total: 100 },
]

// Study efficiency by time of day
export const STUDY_EFFICIENCY = [
  { timeOfDay: "Morning (6-10 AM)", efficiency: 90 },
  { timeOfDay: "Midday (10 AM-2 PM)", efficiency: 75 },
  { timeOfDay: "Afternoon (2-6 PM)", efficiency: 65 },
  { timeOfDay: "Evening (6-10 PM)", efficiency: 80 },
  { timeOfDay: "Night (10 PM-2 AM)", efficiency: 60 },
]

// Weekly goals and achievements
export const WEEKLY_GOALS = [
  {
    week: "Week 1",
    goals: [
      { id: "goal1", description: "Complete 10 math problems", achieved: true },
      { id: "goal2", description: "Read 2 chapters of physics textbook", achieved: true },
      { id: "goal3", description: "Finish programming assignment", achieved: false },
    ],
  },
  {
    week: "Week 2",
    goals: [
      { id: "goal4", description: "Study for calculus exam", achieved: true },
      { id: "goal5", description: "Complete lab report", achieved: true },
      { id: "goal6", description: "Review lecture notes", achieved: true },
    ],
  },
  {
    week: "Week 3",
    goals: [
      { id: "goal7", description: "Practice problem solving", achieved: false },
      { id: "goal8", description: "Prepare presentation", achieved: true },
      { id: "goal9", description: "Complete online quiz", achieved: true },
    ],
  },
]