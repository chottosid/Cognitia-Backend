import { generateId, daysAgo, CURRENT_USER } from "./mock-data"

// User profile types
export interface ProfileSocialLinks {
  github?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  website?: string
}

export interface ProfileEducation {
  id: string
  institution: string
  degree: string
  field: string
  startDate: Date
  endDate?: Date
  current: boolean
  description?: string
}

export interface ProfileExperience {
  id: string
  title: string
  company: string
  location?: string
  startDate: Date
  endDate?: Date
  current: boolean
  description?: string
}

export interface ProfileSkill {
  id: string
  name: string
  level: "beginner" | "intermediate" | "advanced" | "expert"
  endorsements: number
}

export interface ProfileCertification {
  id: string
  name: string
  organization: string
  issueDate: Date
  expirationDate?: Date
  credentialId?: string
  credentialURL?: string
}

export interface ProfileAchievement {
  id: string
  title: string
  description: string
  date: Date
  icon: string
  completed: boolean
  progress?: number
  maxProgress?: number
}

export interface ProfileActivity {
  id: string
  type: "question" | "answer" | "note" | "task"
  title: string
  date: Date
  link: string
  relatedId: string
}

export interface ProfileContest {
  id: string
  name: string
  date: Date
  rank: number
  totalParticipants: number
  score: number
  category: string
  medal?: "gold" | "silver" | "bronze"
}

export interface ProfileStatistics {
  studyHours: number
  questionsAsked: number
  questionsAnswered: number
  notesCreated: number
  tasksCompleted: number
  contestsParticipated: number
  ranking: number
  totalUsers: number
  percentile: number
  points: number
  streak: number
  longestStreak: number
}

export interface UserProfile {
  userId: string
  name: string
  email: string
  bio: string
  avatar?: string
  coverImage?: string
  university?: string
  department?: string
  year?: string
  location?: string
  website?: string
  phone?: string
  dateOfBirth?: Date
  joinDate: Date
  lastActive: Date
  interests: string[]
  socialLinks: ProfileSocialLinks
  education: ProfileEducation[]
  experience: ProfileExperience[]
  skills: ProfileSkill[]
  certifications: ProfileCertification[]
  achievements: ProfileAchievement[]
  activities: ProfileActivity[]
  contests: ProfileContest[]
  statistics: ProfileStatistics
}

// Mock profile data for current user
export const CURRENT_USER_PROFILE: UserProfile = {
  userId: CURRENT_USER.id,
  name: CURRENT_USER.name,
  email: CURRENT_USER.email,
  bio: "Computer Science student passionate about algorithms, machine learning, and web development. I enjoy solving complex problems and building innovative solutions.",
  avatar: CURRENT_USER.avatar,
  coverImage: "/placeholder.svg?height=400&width=1200",
  university: "Massachusetts Institute of Technology",
  department: "Computer Science",
  year: "3rd Year",
  location: "Cambridge, MA",
  website: "johndoe.dev",
  phone: "+1 (555) 123-4567",
  dateOfBirth: new Date("1999-05-15"),
  joinDate: daysAgo(365),
  lastActive: new Date(),
  interests: ["Algorithms", "Machine Learning", "Web Development", "Quantum Computing", "Data Structures"],
  socialLinks: {
    github: "github.com/johndoe",
    linkedin: "linkedin.com/in/johndoe",
    twitter: "twitter.com/johndoe",
    facebook: "facebook.com/johndoe",
    website: "johndoe.dev",
  },
  education: [
    {
      id: generateId(),
      institution: "Massachusetts Institute of Technology",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: new Date("2021-09-01"),
      current: true,
      description:
        "Focus on Artificial Intelligence and Machine Learning. Member of the Robotics Club and Competitive Programming Team.",
    },
    {
      id: generateId(),
      institution: "Phillips Academy",
      degree: "High School Diploma",
      field: "STEM Focus",
      startDate: new Date("2017-09-01"),
      endDate: new Date("2021-05-30"),
      current: false,
      description: "Graduated with honors. Captain of the Math Team.",
    },
  ],
  experience: [
    {
      id: generateId(),
      title: "Software Engineering Intern",
      company: "Google",
      location: "Mountain View, CA (Remote)",
      startDate: new Date("2023-05-15"),
      endDate: new Date("2023-08-15"),
      current: false,
      description:
        "Worked on the Google Cloud Platform team, developing and optimizing backend services using Go and Python.",
    },
    {
      id: generateId(),
      title: "Research Assistant",
      company: "MIT CSAIL",
      location: "Cambridge, MA",
      startDate: new Date("2022-09-01"),
      current: true,
      description:
        "Conducting research in natural language processing and machine learning algorithms under Prof. Sarah Johnson.",
    },
  ],
  skills: [
    {
      id: generateId(),
      name: "Python",
      level: "expert",
      endorsements: 42,
    },
    {
      id: generateId(),
      name: "Machine Learning",
      level: "advanced",
      endorsements: 38,
    },
    {
      id: generateId(),
      name: "Data Structures",
      level: "expert",
      endorsements: 45,
    },
    {
      id: generateId(),
      name: "Algorithms",
      level: "expert",
      endorsements: 47,
    },
    {
      id: generateId(),
      name: "JavaScript",
      level: "advanced",
      endorsements: 35,
    },
    {
      id: generateId(),
      name: "React",
      level: "intermediate",
      endorsements: 28,
    },
    {
      id: generateId(),
      name: "SQL",
      level: "advanced",
      endorsements: 32,
    },
    {
      id: generateId(),
      name: "C++",
      level: "intermediate",
      endorsements: 25,
    },
  ],
  certifications: [
    {
      id: generateId(),
      name: "TensorFlow Developer Certificate",
      organization: "Google",
      issueDate: daysAgo(180),
      credentialId: "TF12345",
      credentialURL: "https://credential.example.com/tf12345",
    },
    {
      id: generateId(),
      name: "AWS Certified Solutions Architect",
      organization: "Amazon Web Services",
      issueDate: daysAgo(240),
      expirationDate: daysAgo(-730), // 2 years from issue
      credentialId: "AWS98765",
      credentialURL: "https://credential.example.com/aws98765",
    },
  ],
  achievements: [
    {
      id: generateId(),
      title: "First Question Answered",
      description: "Answered your first question",
      date: daysAgo(300),
      icon: "check-circle",
      completed: true,
    },
    {
      id: generateId(),
      title: "Knowledge Seeker",
      description: "Read 50 questions",
      date: daysAgo(250),
      icon: "book-open",
      completed: true,
    },
    {
      id: generateId(),
      title: "Study Master",
      description: "Complete 100 study sessions",
      date: daysAgo(150),
      icon: "clock",
      completed: false,
      progress: 68,
      maxProgress: 100,
    },
    {
      id: generateId(),
      title: "Contest Champion",
      description: "Win a contest",
      date: daysAgo(90),
      icon: "trophy",
      completed: true,
    },
    {
      id: generateId(),
      title: "Note Taker",
      description: "Create 25 notes",
      date: daysAgo(120),
      icon: "file-text",
      completed: true,
    },
    {
      id: generateId(),
      title: "Helping Hand",
      description: "Answer 100 questions",
      date: daysAgo(80),
      icon: "help-circle",
      completed: false,
      progress: 32,
      maxProgress: 100,
    },
    {
      id: generateId(),
      title: "Task Master",
      description: "Complete 50 tasks",
      date: daysAgo(60),
      icon: "check-square",
      completed: false,
      progress: 42,
      maxProgress: 50,
    },
    {
      id: generateId(),
      title: "Streak Warrior",
      description: "Maintain a 30-day study streak",
      date: daysAgo(45),
      icon: "zap",
      completed: false,
      progress: 22,
      maxProgress: 30,
    },
  ],
  activities: [
    {
      id: generateId(),
      type: "question",
      title: "Asked a question about Calculus Integration",
      date: daysAgo(2),
      link: "/question/q123",
      relatedId: "q123",
    },
    {
      id: generateId(),
      type: "answer",
      title: "Answered a question about Quantum Physics",
      date: daysAgo(5),
      link: "/question/q456",
      relatedId: "q456",
    },
    {
      id: generateId(),
      type: "note",
      title: "Updated notes on Data Structures",
      date: daysAgo(7),
      link: "/notes/n789",
      relatedId: "n789",
    },
    {
      id: generateId(),
      type: "task",
      title: "Completed a task: Study for Algorithm Exam",
      date: daysAgo(3),
      link: "/study-plan",
      relatedId: "t101",
    },
    {
      id: generateId(),
      type: "question",
      title: "Asked a question about Neural Networks",
      date: daysAgo(10),
      link: "/question/q234",
      relatedId: "q234",
    },
    {
      id: generateId(),
      type: "answer",
      title: "Answered a question about JavaScript Promises",
      date: daysAgo(12),
      link: "/question/q567",
      relatedId: "q567",
    },
    {
      id: generateId(),
      type: "note",
      title: "Created new notes on Machine Learning",
      date: daysAgo(15),
      link: "/notes/n890",
      relatedId: "n890",
    },
    {
      id: generateId(),
      type: "task",
      title: "Completed a task: Finish Programming Assignment",
      date: daysAgo(8),
      link: "/study-plan",
      relatedId: "t102",
    },
    {
      id: generateId(),
      type: "question",
      title: "Asked a question about Database Indexing",
      date: daysAgo(18),
      link: "/question/q345",
      relatedId: "q345",
    },
    {
      id: generateId(),
      type: "answer",
      title: "Answered a question about React Hooks",
      date: daysAgo(20),
      link: "/question/q678",
      relatedId: "q678",
    },
    {
      id: generateId(),
      type: "note",
      title: "Updated notes on Web Development",
      date: daysAgo(22),
      link: "/notes/n901",
      relatedId: "n901",
    },
    {
      id: generateId(),
      type: "task",
      title: "Completed a task: Research Quantum Computing",
      date: daysAgo(25),
      link: "/study-plan",
      relatedId: "t103",
    },
  ],
  contests: [
    {
      id: generateId(),
      name: "Spring Mathematics Challenge",
      date: daysAgo(45),
      rank: 3,
      totalParticipants: 120,
      score: 92,
      category: "Mathematics",
      medal: "bronze",
    },
    {
      id: generateId(),
      name: "Computer Science Hackathon",
      date: daysAgo(90),
      rank: 1,
      totalParticipants: 85,
      score: 98,
      category: "Computer Science",
      medal: "gold",
    },
    {
      id: generateId(),
      name: "Physics Problem Solving",
      date: daysAgo(120),
      rank: 12,
      totalParticipants: 150,
      score: 78,
      category: "Physics",
    },
    {
      id: generateId(),
      name: "Algorithm Design Competition",
      date: daysAgo(180),
      rank: 5,
      totalParticipants: 200,
      score: 88,
      category: "Computer Science",
      medal: "silver",
    },
    {
      id: generateId(),
      name: "Data Science Challenge",
      date: daysAgo(210),
      rank: 7,
      totalParticipants: 175,
      score: 85,
      category: "Data Science",
    },
  ],
  statistics: {
    studyHours: 324,
    questionsAsked: 45,
    questionsAnswered: 132,
    notesCreated: 28,
    tasksCompleted: 87,
    contestsParticipated: 12,
    ranking: 42,
    totalUsers: 1250,
    percentile: 96.6,
    points: 4250,
    streak: 22,
    longestStreak: 30,
  },
}

// Function to format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

// Function to format relative time
export function formatRelativeTime(date: Date): string {
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
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`
}

// Function to get user profile by ID
export function getUserProfileById(userId: string): UserProfile | null {
  if (userId === CURRENT_USER.id) {
    return CURRENT_USER_PROFILE
  }
  return null
}

// Function to update user profile
export function updateUserProfile(profile: Partial<UserProfile>): UserProfile {
  // In a real app, this would update the database
  // For now, we'll just return the updated profile
  return {
    ...CURRENT_USER_PROFILE,
    ...profile,
  }
}
