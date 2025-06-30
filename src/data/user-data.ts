import { generateId } from "./study-plan-data"

// Helper function to generate dates in the past
export function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

// Helper function to generate dates in the future
export function daysFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

// Define user types
export type UserRole = "student" | "teacher" | "admin"
export type EducationLevel = "high_school" | "bachelors" | "masters" | "phd" | "other"
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert"
export type ActivityType = "question" | "answer" | "note" | "task" | "contest" | "comment"
export type ContestResult = "gold" | "silver" | "bronze" | "participation" | "disqualified"

// Define interfaces
export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: Date
  endDate?: Date
  current: boolean
  description?: string
  level: EducationLevel
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: Date
  endDate?: Date
  current: boolean
  description?: string
  location?: string
}

export interface Skill {
  id: string
  name: string
  level: SkillLevel
  endorsements: number
  category: string
}

export interface Certification {
  id: string
  name: string
  organization: string
  issueDate: Date
  expiryDate?: Date
  credentialId?: string
  credentialUrl?: string
  valid: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  dateEarned?: Date
  progress: number
  maxProgress: number
  completed: boolean
  icon: string
  category: string
}

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description?: string
  date: Date
  relatedId?: string
  metadata?: Record<string, any>
}

export interface ContestParticipation {
  id: string
  contestId: string
  contestName: string
  date: Date
  rank?: number
  totalParticipants?: number
  score?: number
  maxScore?: number
  result?: ContestResult
  solved?: number
  totalProblems?: number
  percentile?: number
}

export interface SocialLink {
  platform: string
  url: string
  username?: string
}

export interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  avatar?: string
  bio?: string
  role: UserRole
  joinDate: Date
  lastActive: Date
  location?: string
  education: Education[]
  experience: Experience[]
  skills: Skill[]
  certifications: Certification[]
  achievements: Achievement[]
  activities: Activity[]
  contestHistory: ContestParticipation[]
  socialLinks: SocialLink[]
  stats: {
    questionsAsked: number
    questionsAnswered: number
    notesCreated: number
    tasksCompleted: number
    contestsParticipated: number
    rating: number
    reputation: number
    streak: number
    followers: number
    following: number
  }
}

// Create mock users
export const USERS: UserProfile[] = [
  {
    id: "user_1",
    name: "Alex Johnson",
    username: "alexj",
    email: "alex.johnson@example.com",
    avatar: "/placeholder.svg?height=200&width=200",
    bio: "Computer Science student passionate about algorithms and data structures. Always looking to learn and improve my skills.",
    role: "student",
    joinDate: daysAgo(365),
    lastActive: new Date(),
    location: "New York, USA",
    education: [
      {
        id: generateId(),
        institution: "New York University",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: daysAgo(1095),
        current: true,
        level: "bachelors",
      },
      {
        id: generateId(),
        institution: "Stuyvesant High School",
        degree: "High School Diploma",
        field: "STEM",
        startDate: daysAgo(2190),
        endDate: daysAgo(1460),
        current: false,
        level: "high_school",
      },
    ],
    experience: [
      {
        id: generateId(),
        company: "Tech Innovations Inc.",
        position: "Software Engineering Intern",
        startDate: daysAgo(180),
        current: true,
        description: "Working on backend development using Node.js and MongoDB.",
        location: "Remote",
      },
      {
        id: generateId(),
        company: "CodeCamp",
        position: "Teaching Assistant",
        startDate: daysAgo(365),
        endDate: daysAgo(180),
        current: false,
        description: "Assisted in teaching Python programming to beginners.",
        location: "New York, USA",
      },
    ],
    skills: [
      {
        id: generateId(),
        name: "Python",
        level: "advanced",
        endorsements: 24,
        category: "Programming Languages",
      },
      {
        id: generateId(),
        name: "JavaScript",
        level: "intermediate",
        endorsements: 18,
        category: "Programming Languages",
      },
      {
        id: generateId(),
        name: "Data Structures",
        level: "advanced",
        endorsements: 32,
        category: "Computer Science",
      },
      {
        id: generateId(),
        name: "Algorithms",
        level: "advanced",
        endorsements: 29,
        category: "Computer Science",
      },
      {
        id: generateId(),
        name: "React",
        level: "intermediate",
        endorsements: 15,
        category: "Web Development",
      },
    ],
    certifications: [
      {
        id: generateId(),
        name: "Python for Data Science",
        organization: "DataCamp",
        issueDate: daysAgo(240),
        credentialId: "PC-123456",
        credentialUrl: "https://example.com/cert/PC-123456",
        valid: true,
      },
      {
        id: generateId(),
        name: "Algorithms Specialization",
        organization: "Coursera",
        issueDate: daysAgo(120),
        credentialId: "AS-789012",
        credentialUrl: "https://example.com/cert/AS-789012",
        valid: true,
      },
    ],
    achievements: [
      {
        id: generateId(),
        title: "Problem Solver",
        description: "Solved 100 algorithmic problems",
        dateEarned: daysAgo(30),
        progress: 100,
        maxProgress: 100,
        completed: true,
        icon: "award",
        category: "Problem Solving",
      },
      {
        id: generateId(),
        title: "Consistent Learner",
        description: "Maintained a 30-day streak",
        dateEarned: daysAgo(15),
        progress: 30,
        maxProgress: 30,
        completed: true,
        icon: "flame",
        category: "Engagement",
      },
      {
        id: generateId(),
        title: "Helpful Member",
        description: "Answered 50 questions from other students",
        progress: 42,
        maxProgress: 50,
        completed: false,
        icon: "helping-hand",
        category: "Community",
      },
    ],
    activities: [
      {
        id: generateId(),
        type: "question",
        title: "How to implement a balanced binary search tree?",
        date: daysAgo(5),
        relatedId: "q_123456",
      },
      {
        id: generateId(),
        type: "answer",
        title: "Answered: What's the time complexity of quicksort?",
        date: daysAgo(7),
        relatedId: "a_789012",
      },
      {
        id: generateId(),
        type: "note",
        title: "Uploaded notes on Dynamic Programming",
        date: daysAgo(10),
        relatedId: "n_345678",
      },
      {
        id: generateId(),
        type: "task",
        title: "Completed task: Implement Merge Sort",
        date: daysAgo(12),
        relatedId: "t_901234",
      },
      {
        id: generateId(),
        type: "contest",
        title: "Participated in Weekly Coding Challenge #42",
        date: daysAgo(15),
        relatedId: "c_567890",
      },
    ],
    contestHistory: [
      {
        id: generateId(),
        contestId: "c_567890",
        contestName: "Weekly Coding Challenge #42",
        date: daysAgo(15),
        rank: 12,
        totalParticipants: 245,
        score: 450,
        maxScore: 500,
        result: "silver",
        solved: 4,
        totalProblems: 5,
        percentile: 95.1,
      },
      {
        id: generateId(),
        contestId: "c_123456",
        contestName: "Algorithm Masters Tournament",
        date: daysAgo(45),
        rank: 8,
        totalParticipants: 180,
        score: 820,
        maxScore: 1000,
        result: "gold",
        solved: 8,
        totalProblems: 10,
        percentile: 95.6,
      },
      {
        id: generateId(),
        contestId: "c_789012",
        contestName: "Data Structures Challenge",
        date: daysAgo(75),
        rank: 25,
        totalParticipants: 210,
        score: 380,
        maxScore: 500,
        result: "bronze",
        solved: 3,
        totalProblems: 5,
        percentile: 88.1,
      },
    ],
    socialLinks: [
      {
        platform: "GitHub",
        url: "https://github.com/alexjohnson",
        username: "alexjohnson",
      },
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/alexjohnson",
        username: "alexjohnson",
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/alexj",
        username: "alexj",
      },
    ],
    stats: {
      questionsAsked: 28,
      questionsAnswered: 42,
      notesCreated: 15,
      tasksCompleted: 87,
      contestsParticipated: 12,
      rating: 1842,
      reputation: 756,
      streak: 15,
      followers: 124,
      following: 98,
    },
  },
  {
    id: "user_2",
    name: "Sophia Chen",
    username: "sophiac",
    email: "sophia.chen@example.com",
    avatar: "/placeholder.svg?height=200&width=200",
    bio: "Mathematics PhD student specializing in computational mathematics and machine learning algorithms.",
    role: "student",
    joinDate: daysAgo(420),
    lastActive: daysAgo(1),
    location: "Boston, USA",
    education: [
      {
        id: generateId(),
        institution: "MIT",
        degree: "PhD",
        field: "Applied Mathematics",
        startDate: daysAgo(730),
        current: true,
        level: "phd",
      },
      {
        id: generateId(),
        institution: "Stanford University",
        degree: "Master of Science",
        field: "Mathematics",
        startDate: daysAgo(1460),
        endDate: daysAgo(730),
        current: false,
        level: "masters",
      },
      {
        id: generateId(),
        institution: "UC Berkeley",
        degree: "Bachelor of Science",
        field: "Mathematics",
        startDate: daysAgo(2190),
        endDate: daysAgo(1460),
        current: false,
        level: "bachelors",
      },
    ],
    experience: [
      {
        id: generateId(),
        company: "AI Research Lab",
        position: "Research Assistant",
        startDate: daysAgo(365),
        current: true,
        description: "Conducting research on neural networks and optimization algorithms.",
        location: "Boston, USA",
      },
      {
        id: generateId(),
        company: "DataTech Solutions",
        position: "Data Science Intern",
        startDate: daysAgo(730),
        endDate: daysAgo(550),
        current: false,
        description: "Developed machine learning models for predictive analytics.",
        location: "San Francisco, USA",
      },
    ],
    skills: [
      {
        id: generateId(),
        name: "Machine Learning",
        level: "expert",
        endorsements: 45,
        category: "Data Science",
      },
      {
        id: generateId(),
        name: "Python",
        level: "advanced",
        endorsements: 38,
        category: "Programming Languages",
      },
      {
        id: generateId(),
        name: "TensorFlow",
        level: "advanced",
        endorsements: 32,
        category: "Machine Learning",
      },
      {
        id: generateId(),
        name: "Linear Algebra",
        level: "expert",
        endorsements: 50,
        category: "Mathematics",
      },
      {
        id: generateId(),
        name: "Statistical Analysis",
        level: "expert",
        endorsements: 42,
        category: "Data Science",
      },
    ],
    certifications: [
      {
        id: generateId(),
        name: "Deep Learning Specialization",
        organization: "Coursera",
        issueDate: daysAgo(180),
        credentialId: "DL-456789",
        credentialUrl: "https://example.com/cert/DL-456789",
        valid: true,
      },
      {
        id: generateId(),
        name: "Advanced Machine Learning",
        organization: "Stanford Online",
        issueDate: daysAgo(365),
        credentialId: "AML-123456",
        credentialUrl: "https://example.com/cert/AML-123456",
        valid: true,
      },
    ],
    achievements: [
      {
        id: generateId(),
        title: "Top Contributor",
        description: "Among top 1% of contributors in Mathematics",
        dateEarned: daysAgo(60),
        progress: 100,
        maxProgress: 100,
        completed: true,
        icon: "trophy",
        category: "Community",
      },
      {
        id: generateId(),
        title: "Math Wizard",
        description: "Solved 200 mathematics problems",
        dateEarned: daysAgo(90),
        progress: 200,
        maxProgress: 200,
        completed: true,
        icon: "calculator",
        category: "Problem Solving",
      },
      {
        id: generateId(),
        title: "Knowledge Sharer",
        description: "Created 25 highly-rated notes",
        progress: 18,
        maxProgress: 25,
        completed: false,
        icon: "book",
        category: "Content Creation",
      },
    ],
    activities: [
      {
        id: generateId(),
        type: "note",
        title: "Uploaded notes on Eigenvalues and Eigenvectors",
        date: daysAgo(3),
        relatedId: "n_123456",
      },
      {
        id: generateId(),
        type: "answer",
        title: "Answered: How to solve systems of linear equations efficiently?",
        date: daysAgo(5),
        relatedId: "a_234567",
      },
      {
        id: generateId(),
        type: "question",
        title: "Optimization techniques for neural networks?",
        date: daysAgo(8),
        relatedId: "q_345678",
      },
      {
        id: generateId(),
        type: "contest",
        title: "Won 1st place in Mathematics Challenge",
        date: daysAgo(20),
        relatedId: "c_456789",
      },
      {
        id: generateId(),
        type: "task",
        title: "Completed task: Implement gradient descent algorithm",
        date: daysAgo(25),
        relatedId: "t_567890",
      },
    ],
    contestHistory: [
      {
        id: generateId(),
        contestId: "c_456789",
        contestName: "Mathematics Challenge",
        date: daysAgo(20),
        rank: 1,
        totalParticipants: 178,
        score: 500,
        maxScore: 500,
        result: "gold",
        solved: 5,
        totalProblems: 5,
        percentile: 99.4,
      },
      {
        id: generateId(),
        contestId: "c_567890",
        contestName: "AI Algorithm Competition",
        date: daysAgo(60),
        rank: 5,
        totalParticipants: 220,
        score: 920,
        maxScore: 1000,
        result: "gold",
        solved: 9,
        totalProblems: 10,
        percentile: 97.7,
      },
      {
        id: generateId(),
        contestId: "c_678901",
        contestName: "Data Science Hackathon",
        date: daysAgo(120),
        rank: 3,
        totalParticipants: 150,
        score: 450,
        maxScore: 500,
        result: "gold",
        solved: 4,
        totalProblems: 5,
        percentile: 98.0,
      },
    ],
    socialLinks: [
      {
        platform: "GitHub",
        url: "https://github.com/sophiachen",
        username: "sophiachen",
      },
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/sophiachen",
        username: "sophiachen",
      },
      {
        platform: "ResearchGate",
        url: "https://researchgate.net/profile/Sophia_Chen",
        username: "Sophia_Chen",
      },
    ],
    stats: {
      questionsAsked: 35,
      questionsAnswered: 128,
      notesCreated: 18,
      tasksCompleted: 92,
      contestsParticipated: 15,
      rating: 2156,
      reputation: 1250,
      streak: 45,
      followers: 320,
      following: 75,
    },
  },
  {
    id: "user_3",
    name: "Marcus Williams",
    username: "marcusw",
    email: "marcus.williams@example.com",
    avatar: "/placeholder.svg?height=200&width=200",
    bio: "Software engineer with 5 years of experience. Passionate about web development, system design, and mentoring junior developers.",
    role: "teacher",
    joinDate: daysAgo(730),
    lastActive: daysAgo(2),
    location: "Seattle, USA",
    education: [
      {
        id: generateId(),
        institution: "University of Washington",
        degree: "Master of Science",
        field: "Computer Science",
        startDate: daysAgo(2190),
        endDate: daysAgo(1460),
        current: false,
        level: "masters",
      },
      {
        id: generateId(),
        institution: "University of Oregon",
        degree: "Bachelor of Science",
        field: "Computer Engineering",
        startDate: daysAgo(2920),
        endDate: daysAgo(2190),
        current: false,
        level: "bachelors",
      },
    ],
    experience: [
      {
        id: generateId(),
        company: "TechGiant Inc.",
        position: "Senior Software Engineer",
        startDate: daysAgo(730),
        current: true,
        description: "Leading a team of developers building cloud-based solutions.",
        location: "Seattle, USA",
      },
      {
        id: generateId(),
        company: "WebSolutions Co.",
        position: "Software Engineer",
        startDate: daysAgo(1825),
        endDate: daysAgo(730),
        current: false,
        description: "Developed and maintained web applications using React and Node.js.",
        location: "Portland, USA",
      },
      {
        id: generateId(),
        company: "StartupX",
        position: "Junior Developer",
        startDate: daysAgo(2555),
        endDate: daysAgo(1825),
        current: false,
        description: "Full-stack development for an e-commerce platform.",
        location: "San Diego, USA",
      },
    ],
    skills: [
      {
        id: generateId(),
        name: "JavaScript",
        level: "expert",
        endorsements: 65,
        category: "Programming Languages",
      },
      {
        id: generateId(),
        name: "React",
        level: "expert",
        endorsements: 58,
        category: "Web Development",
      },
      {
        id: generateId(),
        name: "Node.js",
        level: "advanced",
        endorsements: 52,
        category: "Web Development",
      },
      {
        id: generateId(),
        name: "System Design",
        level: "advanced",
        endorsements: 45,
        category: "Software Engineering",
      },
      {
        id: generateId(),
        name: "AWS",
        level: "advanced",
        endorsements: 40,
        category: "Cloud Computing",
      },
    ],
    certifications: [
      {
        id: generateId(),
        name: "AWS Certified Solutions Architect",
        organization: "Amazon Web Services",
        issueDate: daysAgo(365),
        expiryDate: daysFromNow(730),
        credentialId: "AWS-123456",
        credentialUrl: "https://example.com/cert/AWS-123456",
        valid: true,
      },
      {
        id: generateId(),
        name: "Professional Scrum Master I",
        organization: "Scrum.org",
        issueDate: daysAgo(545),
        credentialId: "PSM-789012",
        credentialUrl: "https://example.com/cert/PSM-789012",
        valid: true,
      },
      {
        id: generateId(),
        name: "MongoDB Certified Developer",
        organization: "MongoDB University",
        issueDate: daysAgo(730),
        expiryDate: daysAgo(365),
        credentialId: "MCD-345678",
        credentialUrl: "https://example.com/cert/MCD-345678",
        valid: false,
      },
    ],
    achievements: [
      {
        id: generateId(),
        title: "Master Mentor",
        description: "Helped 100 students with their questions",
        dateEarned: daysAgo(120),
        progress: 100,
        maxProgress: 100,
        completed: true,
        icon: "users",
        category: "Teaching",
      },
      {
        id: generateId(),
        title: "Content Creator",
        description: "Created 50 high-quality notes",
        dateEarned: daysAgo(180),
        progress: 50,
        maxProgress: 50,
        completed: true,
        icon: "file-text",
        category: "Content Creation",
      },
      {
        id: generateId(),
        title: "System Design Guru",
        description: "Answered 75 system design questions",
        progress: 68,
        maxProgress: 75,
        completed: false,
        icon: "layout",
        category: "Expertise",
      },
    ],
    activities: [
      {
        id: generateId(),
        type: "note",
        title: "Uploaded notes on Microservices Architecture",
        date: daysAgo(7),
        relatedId: "n_234567",
      },
      {
        id: generateId(),
        type: "answer",
        title: "Answered: Best practices for React performance optimization?",
        date: daysAgo(10),
        relatedId: "a_345678",
      },
      {
        id: generateId(),
        type: "question",
        title: "Strategies for scaling Node.js applications?",
        date: daysAgo(15),
        relatedId: "q_456789",
      },
      {
        id: generateId(),
        type: "task",
        title: "Created task: Build a RESTful API with Express",
        date: daysAgo(20),
        relatedId: "t_567890",
      },
      {
        id: generateId(),
        type: "contest",
        title: "Judged Web Development Hackathon",
        date: daysAgo(30),
        relatedId: "c_678901",
      },
    ],
    contestHistory: [
      {
        id: generateId(),
        contestId: "c_678901",
        contestName: "Web Development Hackathon",
        date: daysAgo(30),
        role: "Judge",
      },
      {
        id: generateId(),
        contestId: "c_789012",
        contestName: "Full-Stack Challenge",
        date: daysAgo(180),
        rank: 2,
        totalParticipants: 120,
        score: 950,
        maxScore: 1000,
        result: "silver",
        solved: 9,
        totalProblems: 10,
        percentile: 98.3,
      },
      {
        id: generateId(),
        contestId: "c_890123",
        contestName: "JavaScript Coding Competition",
        date: daysAgo(365),
        rank: 1,
        totalParticipants: 150,
        score: 1000,
        maxScore: 1000,
        result: "gold",
        solved: 10,
        totalProblems: 10,
        percentile: 99.3,
      },
    ],
    socialLinks: [
      {
        platform: "GitHub",
        url: "https://github.com/marcuswilliams",
        username: "marcuswilliams",
      },
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/marcuswilliams",
        username: "marcuswilliams",
      },
      {
        platform: "Personal Website",
        url: "https://marcuswilliams.dev",
      },
      {
        platform: "Medium",
        url: "https://medium.com/@marcusw",
        username: "@marcusw",
      },
    ],
    stats: {
      questionsAsked: 42,
      questionsAnswered: 215,
      notesCreated: 50,
      tasksCompleted: 78,
      contestsParticipated: 8,
      rating: 2350,
      reputation: 1850,
      streak: 30,
      followers: 520,
      following: 120,
    },
  },
]

// Function to get a user by ID
export function getUserById(id: string): UserProfile | undefined {
  return USERS.find((user) => user.id === id)
}

// Function to get a user by username
export function getUserByUsername(username: string): UserProfile | undefined {
  return USERS.find((user) => user.username === username)
}
