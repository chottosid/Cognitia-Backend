import { CURRENT_USER, STUDENTS, generateId } from "./mock-data"

// Types and interfaces
export type ContestDifficulty = "easy" | "medium" | "hard" | "expert"
export type ContestStatus = "upcoming" | "ongoing" | "finished"
export type ParticipationStatus = "registered" | "not-registered" | "participated"

export interface ContestProblem {
  id: string
  contestId: string
  title: string
  description: string
  difficulty: ContestDifficulty
  points: number
  timeLimit: number // in seconds
  memoryLimit: number // in MB
  sampleInput: string
  sampleOutput: string
  constraints: string
  explanation?: string
  hints?: string[]
  tags: string[]
}

export interface Contest {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  status: ContestStatus
  organizer: {
    id: string
    name: string
    avatar: string
  }
  difficulty: ContestDifficulty
  participants: number
  topics: string[]
  isVirtual: boolean
  eligibility?: string // e.g., "Open for all", "Students only", etc.
  prizes?: string[]
}

export interface ContestRegistration {
  id: string
  contestId: string
  userId: string
  registrationTime: Date
  isVirtual: boolean
}

export interface ContestSubmission {
  id: string
  contestId: string
  problemId: string
  userId: string
  code: string
  language: string
  status:
    | "accepted"
    | "wrong_answer"
    | "time_limit_exceeded"
    | "memory_limit_exceeded"
    | "runtime_error"
    | "compilation_error"
    | "pending"
  score: number
  executionTime?: number // in ms
  memoryUsed?: number // in KB
  submissionTime: Date
  verdict?: string
}

export interface ContestResult {
  contestId: string
  userId: string
  user: {
    id: string
    name: string
    avatar: string
    institution?: string
  }
  rank: number
  score: number
  solvedProblems: number
  totalProblems: number
  submissions: {
    problemId: string
    attempts: number
    score: number
    time: number // time of first accepted submission in minutes from start
  }[]
}

// Mock data
export const CONTEST_PROBLEMS: ContestProblem[] = [
  {
    id: generateId(),
    contestId: "contest1",
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "easy",
    points: 100,
    timeLimit: 1,
    memoryLimit: 256,
    sampleInput: "[2,7,11,15]\n9",
    sampleOutput: "[0,1]",
    constraints:
      "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    tags: ["array", "hash-table"],
  },
  {
    id: generateId(),
    contestId: "contest1",
    title: "Valid Parentheses",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order. Every close bracket has a corresponding open bracket of the same type.",
    difficulty: "easy",
    points: 100,
    timeLimit: 1,
    memoryLimit: 256,
    sampleInput: "()[]{}",
    sampleOutput: "true",
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    tags: ["string", "stack"],
  },
  {
    id: generateId(),
    contestId: "contest2",
    title: "Merge Two Sorted Lists",
    description:
      "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    difficulty: "easy",
    points: 100,
    timeLimit: 1,
    memoryLimit: 256,
    sampleInput: "[1,2,4]\n[1,3,4]",
    sampleOutput: "[1,1,2,3,4,4]",
    constraints:
      "The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order.",
    tags: ["linked-list", "recursion"],
  },
  {
    id: generateId(),
    contestId: "contest2",
    title: "Maximum Subarray",
    description:
      "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    difficulty: "medium",
    points: 200,
    timeLimit: 1,
    memoryLimit: 256,
    sampleInput: "[-2,1,-3,4,-1,2,1,-5,4]",
    sampleOutput: "6",
    explanation: "[4,-1,2,1] has the largest sum = 6.",
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    tags: ["array", "divide-and-conquer", "dynamic-programming"],
  },
  {
    id: generateId(),
    contestId: "contest3",
    title: "Climbing Stairs",
    description:
      "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "easy",
    points: 100,
    timeLimit: 1,
    memoryLimit: 256,
    sampleInput: "2",
    sampleOutput: "2",
    explanation: "There are two ways to climb to the top.\n1. 1 step + 1 step\n2. 2 steps",
    constraints: "1 <= n <= 45",
    tags: ["math", "dynamic-programming", "memoization"],
  },
  {
    id: generateId(),
    contestId: "contest3",
    title: "Binary Tree Inorder Traversal",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    difficulty: "easy",
    points: 100,
    timeLimit: 1,
    memoryLimit: 256,
    sampleInput: "[1,null,2,3]",
    sampleOutput: "[1,3,2]",
    constraints: "The number of nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100",
    tags: ["stack", "tree", "depth-first-search", "binary-tree"],
  },
  {
    id: generateId(),
    contestId: "contest4",
    title: "Symmetric Tree",
    description:
      "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
    difficulty: "easy",
    points: 100,
    timeLimit: 1,
    memoryLimit: 256,
    sampleInput: "[1,2,2,3,4,4,3]",
    sampleOutput: "true",
    constraints: "The number of nodes in the tree is in the range [1, 1000].\n-100 <= Node.val <= 100",
    tags: ["tree", "depth-first-search", "breadth-first-search", "binary-tree"],
  },
  {
    id: generateId(),
    contestId: "contest4",
    title: "Maximum Depth of Binary Tree",
    description:
      "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    difficulty: "easy",
    points: 100,
    timeLimit: 1,
    memoryLimit: 256,
    sampleInput: "[3,9,20,null,null,15,7]",
    sampleOutput: "3",
    constraints: "The number of nodes in the tree is in the range [0, 10^4].\n-100 <= Node.val <= 100",
    tags: ["tree", "depth-first-search", "breadth-first-search", "binary-tree"],
  },
  {
    id: generateId(),
    contestId: "contest5",
    title: "Convert Sorted Array to Binary Search Tree",
    description:
      "Given an integer array nums where the elements are sorted in ascending order, convert it to a height-balanced binary search tree. A height-balanced binary tree is a binary tree in which the depth of the two subtrees of every node never differs by more than one.",
    difficulty: "easy",
    points: 100,
    timeLimit: 1,
    memoryLimit: 256,
    sampleInput: "[-10,-3,0,5,9]",
    sampleOutput: "[0,-3,9,-10,null,5]",
    explanation: "One possible answer is [0,-3,9,-10,null,5], which represents the height balanced BST.",
    constraints: "1 <= nums.length <= 10^4\n-10^4 <= nums[i] <= 10^4\nnums is sorted in a strictly increasing order.",
    tags: ["array", "divide-and-conquer", "tree", "binary-search-tree", "binary-tree"],
  },
  {
    id: generateId(),
    contestId: "contest5",
    title: "Balanced Binary Tree",
    description:
      "Given a binary tree, determine if it is height-balanced. For this problem, a height-balanced binary tree is defined as: a binary tree in which the left and right subtrees of every node differ in height by no more than 1.",
    difficulty: "easy",
    points: 100,
    timeLimit: 1,
    memoryLimit: 256,
    sampleInput: "[3,9,20,null,null,15,7]",
    sampleOutput: "true",
    constraints: "The number of nodes in the tree is in the range [0, 5000].\n-10^4 <= Node.val <= 10^4",
    tags: ["tree", "depth-first-search", "binary-tree"],
  },
]

// Helper function to get current time
const now = new Date()

// Helper function to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Helper function to subtract days from a date
function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

// Helper function to add hours to a date
function addHours(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

// Mock contests
export const CONTESTS: Contest[] = [
  {
    id: "contest1",
    title: "Weekly Coding Challenge #1",
    description:
      "Solve algorithmic problems and compete with other students in this weekly coding challenge. The contest features problems of varying difficulty levels, from easy to hard.",
    startTime: subtractDays(now, 1),
    endTime: addDays(now, 1),
    status: "ongoing",
    organizer: {
      id: STUDENTS[0].id,
      name: STUDENTS[0].name,
      avatar: STUDENTS[0].avatar,
    },
    difficulty: "medium",
    participants: 120,
    topics: ["algorithms", "data-structures"],
    isVirtual: false,
    eligibility: "Open for all",
  },
  {
    id: "contest2",
    title: "Data Structures Mastery",
    description:
      "Test your knowledge of data structures with this challenging contest. Problems will focus on arrays, linked lists, trees, graphs, and more.",
    startTime: addDays(now, 3),
    endTime: addDays(now, 4),
    status: "upcoming",
    organizer: {
      id: STUDENTS[1].id,
      name: STUDENTS[1].name,
      avatar: STUDENTS[1].avatar,
    },
    difficulty: "hard",
    participants: 85,
    topics: ["data-structures", "algorithms"],
    isVirtual: false,
    eligibility: "Open for all",
  },
  {
    id: "contest3",
    title: "Dynamic Programming Challenge",
    description:
      "A contest focused on dynamic programming problems. Sharpen your DP skills and learn new techniques to solve complex problems efficiently.",
    startTime: subtractDays(now, 10),
    endTime: subtractDays(now, 9),
    status: "finished",
    organizer: {
      id: STUDENTS[2].id,
      name: STUDENTS[2].name,
      avatar: STUDENTS[2].avatar,
    },
    difficulty: "hard",
    participants: 95,
    topics: ["dynamic-programming", "algorithms"],
    isVirtual: false,
    eligibility: "Open for all",
  },
  {
    id: "contest4",
    title: "Beginner's Coding Contest",
    description:
      "A contest designed for beginners to practice their coding skills. Problems will focus on basic algorithms and data structures.",
    startTime: addDays(now, 7),
    endTime: addDays(now, 8),
    status: "upcoming",
    organizer: {
      id: STUDENTS[0].id,
      name: STUDENTS[0].name,
      avatar: STUDENTS[0].avatar,
    },
    difficulty: "easy",
    participants: 150,
    topics: ["algorithms", "data-structures", "beginner"],
    isVirtual: false,
    eligibility: "Beginners only",
  },
  {
    id: "contest5",
    title: "Graph Theory Contest",
    description:
      "A contest focused on graph theory problems. Test your knowledge of graph algorithms and data structures.",
    startTime: subtractDays(now, 5),
    endTime: subtractDays(now, 4),
    status: "finished",
    organizer: {
      id: STUDENTS[1].id,
      name: STUDENTS[1].name,
      avatar: STUDENTS[1].avatar,
    },
    difficulty: "medium",
    participants: 110,
    topics: ["graph-theory", "algorithms"],
    isVirtual: false,
    eligibility: "Open for all",
  },
  {
    id: "contest6",
    title: "Advanced Algorithms Challenge",
    description: "A contest featuring advanced algorithmic problems. Only for experienced competitive programmers.",
    startTime: addDays(now, 14),
    endTime: addDays(now, 15),
    status: "upcoming",
    organizer: {
      id: STUDENTS[2].id,
      name: STUDENTS[2].name,
      avatar: STUDENTS[2].avatar,
    },
    difficulty: "expert",
    participants: 75,
    topics: ["algorithms", "advanced"],
    isVirtual: false,
    eligibility: "Experienced programmers only",
  },
  {
    id: "contest7",
    title: "String Algorithms Contest",
    description: "A contest focused on string manipulation and pattern matching algorithms.",
    startTime: subtractDays(now, 15),
    endTime: subtractDays(now, 14),
    status: "finished",
    organizer: {
      id: STUDENTS[0].id,
      name: STUDENTS[0].name,
      avatar: STUDENTS[0].avatar,
    },
    difficulty: "medium",
    participants: 100,
    topics: ["strings", "algorithms"],
    isVirtual: false,
    eligibility: "Open for all",
  },
  {
    id: "contest8",
    title: "Virtual Contest: Past Problems",
    description: "A virtual contest featuring problems from past contests. Practice at your own pace.",
    startTime: now,
    endTime: addDays(now, 30),
    status: "ongoing",
    organizer: {
      id: STUDENTS[1].id,
      name: STUDENTS[1].name,
      avatar: STUDENTS[1].avatar,
    },
    difficulty: "medium",
    participants: 200,
    topics: ["algorithms", "data-structures", "virtual"],
    isVirtual: true,
    eligibility: "Open for all",
  },
]

// Mock contest registrations
export const CONTEST_REGISTRATIONS: ContestRegistration[] = [
  {
    id: generateId(),
    contestId: "contest1",
    userId: CURRENT_USER.id,
    registrationTime: subtractDays(now, 2),
    isVirtual: false,
  },
  {
    id: generateId(),
    contestId: "contest3",
    userId: CURRENT_USER.id,
    registrationTime: subtractDays(now, 11),
    isVirtual: false,
  },
  {
    id: generateId(),
    contestId: "contest5",
    userId: CURRENT_USER.id,
    registrationTime: subtractDays(now, 6),
    isVirtual: false,
  },
  {
    id: generateId(),
    contestId: "contest8",
    userId: CURRENT_USER.id,
    registrationTime: subtractDays(now, 1),
    isVirtual: true,
  },
]

// Mock contest submissions
export const CONTEST_SUBMISSIONS: ContestSubmission[] = [
  {
    id: generateId(),
    contestId: "contest3",
    problemId: CONTEST_PROBLEMS.find((p) => p.contestId === "contest3")?.id || "",
    userId: CURRENT_USER.id,
    code: "function climbStairs(n) {\n  if (n <= 2) return n;\n  let dp = [0, 1, 2];\n  for (let i = 3; i <= n; i++) {\n    dp[i] = dp[i-1] + dp[i-2];\n  }\n  return dp[n];\n}",
    language: "javascript",
    status: "accepted",
    score: 100,
    executionTime: 5,
    memoryUsed: 8192,
    submissionTime: subtractDays(now, 9),
    verdict: "Correct Answer",
  },
  {
    id: generateId(),
    contestId: "contest3",
    problemId: CONTEST_PROBLEMS.find((p) => p.contestId === "contest3" && p.title.includes("Binary Tree"))?.id || "",
    userId: CURRENT_USER.id,
    code: "function inorderTraversal(root) {\n  const result = [];\n  const stack = [];\n  let current = root;\n  \n  while (current || stack.length) {\n    while (current) {\n      stack.push(current);\n      current = current.left;\n    }\n    current = stack.pop();\n    result.push(current.val);\n    current = current.right;\n  }\n  \n  return result;\n}",
    language: "javascript",
    status: "accepted",
    score: 100,
    executionTime: 8,
    memoryUsed: 9216,
    submissionTime: subtractDays(now, 9),
    verdict: "Correct Answer",
  },
  {
    id: generateId(),
    contestId: "contest5",
    problemId: CONTEST_PROBLEMS.find((p) => p.contestId === "contest5")?.id || "",
    userId: CURRENT_USER.id,
    code: "function sortedArrayToBST(nums) {\n  if (!nums.length) return null;\n  \n  const mid = Math.floor(nums.length / 2);\n  const root = new TreeNode(nums[mid]);\n  \n  root.left = sortedArrayToBST(nums.slice(0, mid));\n  root.right = sortedArrayToBST(nums.slice(mid + 1));\n  \n  return root;\n}",
    language: "javascript",
    status: "accepted",
    score: 100,
    executionTime: 12,
    memoryUsed: 10240,
    submissionTime: subtractDays(now, 4),
    verdict: "Correct Answer",
  },
  {
    id: generateId(),
    contestId: "contest5",
    problemId: CONTEST_PROBLEMS.find((p) => p.contestId === "contest5" && p.title.includes("Balanced"))?.id || "",
    userId: CURRENT_USER.id,
    code: "function isBalanced(root) {\n  if (!root) return true;\n  \n  function getHeight(node) {\n    if (!node) return 0;\n    \n    const leftHeight = getHeight(node.left);\n    if (leftHeight === -1) return -1;\n    \n    const rightHeight = getHeight(node.right);\n    if (rightHeight === -1) return -1;\n    \n    if (Math.abs(leftHeight - rightHeight) > 1) return -1;\n    \n    return Math.max(leftHeight, rightHeight) + 1;\n  }\n  \n  return getHeight(root) !== -1;\n}",
    language: "javascript",
    status: "wrong_answer",
    score: 0,
    executionTime: 15,
    memoryUsed: 11264,
    submissionTime: subtractDays(now, 4),
    verdict: "Wrong Answer on test case 5",
  },
  {
    id: generateId(),
    contestId: "contest5",
    problemId: CONTEST_PROBLEMS.find((p) => p.contestId === "contest5" && p.title.includes("Balanced"))?.id || "",
    userId: CURRENT_USER.id,
    code: "function isBalanced(root) {\n  if (!root) return true;\n  \n  function getHeight(node) {\n    if (!node) return 0;\n    \n    const leftHeight = getHeight(node.left);\n    if (leftHeight === -1) return -1;\n    \n    const rightHeight = getHeight(node.right);\n    if (rightHeight === -1) return -1;\n    \n    if (Math.abs(leftHeight - rightHeight) > 1) return -1;\n    \n    return Math.max(leftHeight, rightHeight) + 1;\n  }\n  \n  return getHeight(root) !== -1;\n}",
    language: "javascript",
    status: "accepted",
    score: 100,
    executionTime: 10,
    memoryUsed: 10240,
    submissionTime: subtractDays(now, 4),
    verdict: "Correct Answer",
  },
]

// Mock contest results
export const CONTEST_RESULTS: ContestResult[] = [
  {
    contestId: "contest3",
    userId: CURRENT_USER.id,
    user: {
      id: CURRENT_USER.id,
      name: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      institution: CURRENT_USER.institution,
    },
    rank: 15,
    score: 200,
    solvedProblems: 2,
    totalProblems: 2,
    submissions: [
      {
        problemId: CONTEST_PROBLEMS.find((p) => p.contestId === "contest3")?.id || "",
        attempts: 1,
        score: 100,
        time: 45, // 45 minutes from start
      },
      {
        problemId:
          CONTEST_PROBLEMS.find((p) => p.contestId === "contest3" && p.title.includes("Binary Tree"))?.id || "",
        attempts: 1,
        score: 100,
        time: 75, // 75 minutes from start
      },
    ],
  },
  {
    contestId: "contest5",
    userId: CURRENT_USER.id,
    user: {
      id: CURRENT_USER.id,
      name: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      institution: CURRENT_USER.institution,
    },
    rank: 25,
    score: 100,
    solvedProblems: 1,
    totalProblems: 2,
    submissions: [
      {
        problemId: CONTEST_PROBLEMS.find((p) => p.contestId === "contest5")?.id || "",
        attempts: 1,
        score: 100,
        time: 60, // 60 minutes from start
      },
      {
        problemId: CONTEST_PROBLEMS.find((p) => p.contestId === "contest5" && p.title.includes("Balanced"))?.id || "",
        attempts: 2,
        score: 0,
        time: 0, // Not solved correctly
      },
    ],
  },
]

// Generate leaderboard for a contest
export function generateLeaderboard(contestId: string): ContestResult[] {
  const results: ContestResult[] = []

  // Add current user if they participated
  const userResult = CONTEST_RESULTS.find((r) => r.contestId === contestId && r.userId === CURRENT_USER.id)
  if (userResult) {
    results.push(userResult)
  }

  // Add other random participants
  for (let i = 1; i <= 50; i++) {
    if (i === userResult?.rank) continue // Skip user's position

    const student = STUDENTS[Math.floor(Math.random() * STUDENTS.length)]
    const problems = CONTEST_PROBLEMS.filter((p) => p.contestId === contestId)
    const totalProblems = problems.length
    const solvedProblems = Math.floor(Math.random() * (totalProblems + 1))
    const score = solvedProblems * 100

    const submissions = []
    for (let j = 0; j < totalProblems; j++) {
      if (j < solvedProblems) {
        submissions.push({
          problemId: problems[j].id,
          attempts: Math.floor(Math.random() * 3) + 1,
          score: 100,
          time: Math.floor(Math.random() * 180) + 30, // 30-210 minutes from start
        })
      } else {
        const attempts = Math.floor(Math.random() * 3)
        submissions.push({
          problemId: problems[j].id,
          attempts: attempts,
          score: 0,
          time: 0,
        })
      }
    }

    results.push({
      contestId,
      userId: student.id,
      user: {
        id: student.id,
        name: student.name,
        avatar: student.avatar,
        institution: student.institution,
      },
      rank: i,
      score,
      solvedProblems,
      totalProblems,
      submissions,
    })
  }

  // Sort by rank
  return results.sort((a, b) => a.rank - b.rank)
}

// Utility functions
export function getUserParticipationStatus(contestId: string): ParticipationStatus {
  const registration = CONTEST_REGISTRATIONS.find((r) => r.contestId === contestId && r.userId === CURRENT_USER.id)

  if (!registration) return "not-registered"

  const contest = CONTESTS.find((c) => c.id === contestId)
  if (contest?.status === "finished") return "participated"

  return "registered"
}

export function registerForContest(contestId: string, isVirtual = false): void {
  const existingRegistration = CONTEST_REGISTRATIONS.find(
    (r) => r.contestId === contestId && r.userId === CURRENT_USER.id,
  )

  if (!existingRegistration) {
    CONTEST_REGISTRATIONS.push({
      id: generateId(),
      contestId,
      userId: CURRENT_USER.id,
      registrationTime: new Date(),
      isVirtual,
    })

    // Update participant count
    const contest = CONTESTS.find((c) => c.id === contestId)
    if (contest) {
      contest.participants += 1
    }
  }
}

export function unregisterFromContest(contestId: string): void {
  const registrationIndex = CONTEST_REGISTRATIONS.findIndex(
    (r) => r.contestId === contestId && r.userId === CURRENT_USER.id,
  )

  if (registrationIndex !== -1) {
    CONTEST_REGISTRATIONS.splice(registrationIndex, 1)

    // Update participant count
    const contest = CONTESTS.find((c) => c.id === contestId)
    if (contest) {
      contest.participants -= 1
    }
  }
}

export function submitSolution(
  contestId: string,
  problemId: string,
  code: string,
  language: string,
): ContestSubmission {
  const submission: ContestSubmission = {
    id: generateId(),
    contestId,
    problemId,
    userId: CURRENT_USER.id,
    code,
    language,
    status: Math.random() > 0.3 ? "accepted" : "wrong_answer",
    score: Math.random() > 0.3 ? 100 : 0,
    executionTime: Math.floor(Math.random() * 100) + 5,
    memoryUsed: Math.floor(Math.random() * 10000) + 5000,
    submissionTime: new Date(),
    verdict: Math.random() > 0.3 ? "Correct Answer" : "Wrong Answer on test case " + Math.floor(Math.random() * 10),
  }

  CONTEST_SUBMISSIONS.push(submission)
  return submission
}

export function createContest(contest: Omit<Contest, "id" | "organizer" | "participants">): Contest {
  const newContest: Contest = {
    id: generateId(),
    ...contest,
    organizer: {
      id: CURRENT_USER.id,
      name: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
    },
    participants: 0,
  }

  CONTESTS.push(newContest)
  return newContest
}

export function updateContest(contestId: string, updates: Partial<Contest>): Contest | null {
  const contestIndex = CONTESTS.findIndex((c) => c.id === contestId)
  if (contestIndex === -1) return null

  CONTESTS[contestIndex] = { ...CONTESTS[contestIndex], ...updates }
  return CONTESTS[contestIndex]
}

export function deleteContest(contestId: string): boolean {
  const contestIndex = CONTESTS.findIndex((c) => c.id === contestId)
  if (contestIndex === -1) return false

  CONTESTS.splice(contestIndex, 1)
  return true
}

export function getContestProblems(contestId: string): ContestProblem[] {
  return CONTEST_PROBLEMS.filter((p) => p.contestId === contestId)
}

export function getContestSubmissions(contestId: string, userId: string = CURRENT_USER.id): ContestSubmission[] {
  return CONTEST_SUBMISSIONS.filter((s) => s.contestId === contestId && s.userId === userId)
}

export function getContestResult(contestId: string, userId: string = CURRENT_USER.id): ContestResult | null {
  return CONTEST_RESULTS.find((r) => r.contestId === contestId && r.userId === userId) || null
}

export function formatContestDate(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatContestDuration(startTime: Date, endTime: Date): string {
  const durationMs = endTime.getTime() - startTime.getTime()
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours === 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`
  } else if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`
  } else {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`
  }
}

export function getTimeRemaining(targetTime: Date): string {
  const now = new Date()
  const diffMs = targetTime.getTime() - now.getTime()

  if (diffMs <= 0) return "Started"

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export function getTimeElapsed(startTime: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - startTime.getTime()

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export function getTimeRemainingUntilEnd(endTime: Date): string {
  const now = new Date()
  const diffMs = endTime.getTime() - now.getTime()

  if (diffMs <= 0) return "Ended"

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}
