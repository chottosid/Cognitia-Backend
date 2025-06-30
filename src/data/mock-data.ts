// User types
export type UserRole = "student" | "teacher" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

// Current user
export const CURRENT_USER: User = {
  id: "user_1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "student",
  avatar: "/placeholder.svg?height=40&width=40",
  bio: "Computer Science student passionate about AI and machine learning.",
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2023-05-20"),
}

// Helper function to generate IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Helper function to get date X days ago
export function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

// Helper to create dates relative to now
const hoursAgo = (hours: number): Date => {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date
}

// Mock students
export const STUDENTS: User[] = [
  {
    id: "user_2",
    name: "Alice Smith",
    email: "alice.smith@example.com",
    role: "student",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Physics major with interest in quantum mechanics.",
    createdAt: daysAgo(120),
    updatedAt: daysAgo(30),
  },
  {
    id: "user_3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "student",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Chemistry student researching organic compounds.",
    createdAt: daysAgo(100),
    updatedAt: daysAgo(25),
  },
  {
    id: "user_4",
    name: "Carol Williams",
    email: "carol.williams@example.com",
    role: "student",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Mathematics enthusiast focusing on abstract algebra.",
    createdAt: daysAgo(90),
    updatedAt: daysAgo(20),
  },
]

// Mock teachers
export const TEACHERS: User[] = [
  {
    id: "user_5",
    name: "Dr. David Brown",
    email: "david.brown@example.com",
    role: "teacher",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Professor of Computer Science with 15 years of experience.",
    createdAt: daysAgo(200),
    updatedAt: daysAgo(50),
  },
  {
    id: "user_6",
    name: "Prof. Emily Davis",
    email: "emily.davis@example.com",
    role: "teacher",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Physics researcher specializing in particle physics.",
    createdAt: daysAgo(180),
    updatedAt: daysAgo(45),
  },
]

// Experts
export const EXPERTS = [
  {
    id: "user_5",
    name: "Dr. David Brown",
    email: "david.brown@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "expert",
    createdAt: daysAgo(150),
    lastActive: daysAgo(0),
    specialization: "Computer Science",
    verified: true,
    rating: 4.8,
    students: 245,
  },
  {
    id: "user_6",
    name: "Prof. Emily Davis",
    email: "emily.davis@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "expert",
    createdAt: daysAgo(130),
    lastActive: daysAgo(1),
    specialization: "Mathematics",
    verified: true,
    rating: 4.9,
    students: 312,
  },
  {
    id: "user_7",
    name: "Dr. Frank Miller",
    email: "frank.miller@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "expert",
    createdAt: daysAgo(110),
    lastActive: daysAgo(3),
    specialization: "Physics",
    verified: true,
    rating: 4.7,
    students: 178,
  },
]

// Question types
export type QuestionDifficulty = "easy" | "medium" | "hard"
export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "essay"

export interface Question {
  id: string
  title: string
  content: string
  type: QuestionType
  difficulty: QuestionDifficulty
  points: number
  authorId: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  views: number
  likes: number
  dislikes: number
}

// Mock Questions
export const QUESTIONS = [
  {
    id: generateId(),
    title: "Understanding Calculus Integration Techniques ver2",
    body: "I'm struggling with integration by parts. Can someone explain when to use it versus substitution methods? I've tried working through some examples but I'm still confused about which technique to apply in different scenarios.",
    authorId: STUDENTS[0].id,
    author: STUDENTS[0],
    tags: ["Mathematics", "Calculus", "Integration"],
    views: 124,
    isResolved: false,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    voteCount: 24,
  },
  {
    id: generateId(),
    title: "Quantum Mechanics Probability Question",
    body: "How do we interpret the probability density function in quantum mechanics? I'm confused about the physical meaning. Is it related to the wave function squared?",
    authorId: STUDENTS[1].id,
    author: STUDENTS[1],
    tags: ["Physics", "Quantum Mechanics", "Probability"],
    views: 89,
    isResolved: false,
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(4),
    voteCount: 18,
  },
  {
    id: generateId(),
    title: "Recursion vs Iteration Efficiency",
    body: "In what scenarios is recursion more efficient than iteration? I'm trying to optimize an algorithm for tree traversal. Are there specific cases where one approach is clearly better than the other?",
    authorId: STUDENTS[2].id,
    author: STUDENTS[2],
    tags: ["Computer Science", "Algorithms", "Recursion"],
    views: 156,
    isResolved: true,
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(5),
    voteCount: 32,
  },
  {
    id: generateId(),
    title: "How Does Newton's Third Law Apply in Real Life?",
    body: "I understand the concept of action and reaction forces, but I’m having trouble visualizing how it applies to daily scenarios, like walking or swimming. Can someone provide clear examples?",
    authorId: STUDENTS[1].id,
    author: STUDENTS[1],
    tags: ["Physics", "Mechanics", "Newton's Laws"],
    views: 98,
    isResolved: false,
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
    voteCount: 17,
  },
]

// Mock Answers (for the third question which is resolved)
export const ANSWERS = [
  {
    id: generateId(),
    questionId: QUESTIONS[2].id,
    authorId: STUDENTS[0].id,
    author: STUDENTS[0],
    content:
      "Recursion is typically more efficient for problems that have a recursive structure, like tree traversal. The call stack overhead can be a concern, but for balanced trees, the elegance and clarity of recursive code often outweighs the performance difference. For very deep trees, consider tail recursion or iteration to avoid stack overflow.",
    isAccepted: true,
    createdAt: hoursAgo(5.5),
    updatedAt: hoursAgo(5.5),
    voteCount: 15,
  },
  {
    id: generateId(),
    questionId: QUESTIONS[2].id,
    authorId: STUDENTS[1].id,
    author: STUDENTS[1],
    content:
      "I'd add that iteration is generally more efficient in terms of memory usage because it doesn't require additional stack frames. However, some algorithms are much more intuitive when expressed recursively. Modern compilers can sometimes optimize tail-recursive functions to be as efficient as iterative ones.",
    isAccepted: false,
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    voteCount: 8,
  },
]

// Mock Question Votes
export const QUESTION_VOTES = [
  {
    id: generateId(),
    questionId: QUESTIONS[0].id,
    studentId: STUDENTS[1].id,
    voteValue: 1,
    votedAt: hoursAgo(1.5),
  },
  {
    id: generateId(),
    questionId: QUESTIONS[0].id,
    studentId: STUDENTS[2].id,
    voteValue: 1,
    votedAt: hoursAgo(1),
  },
]

// Task interface
export interface Task {
  id: string
  title: string
  description: string
  dueDate: Date
  status: "not_started" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  userId: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

// Mock tasks
export const TASKS: Task[] = [
  {
    id: "task_1",
    title: "Study Algorithms",
    description: "Review quicksort, mergesort, and heapsort algorithms.",
    dueDate: daysAgo(-2), // Due in 2 days
    status: "in_progress",
    priority: "high",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(5),
    tags: ["algorithms", "computer science"],
  },
  {
    id: "task_2",
    title: "Physics Lab Report",
    description: "Complete the lab report on wave interference patterns.",
    dueDate: daysAgo(-5), // Due in 5 days
    status: "not_started",
    priority: "medium",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    tags: ["physics", "lab report"],
  },
  {
    id: "task_3",
    title: "Mathematics Problem Set",
    description: "Solve the calculus problem set from Chapter 7.",
    dueDate: daysAgo(-1), // Due in 1 day
    status: "not_started",
    priority: "high",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    tags: ["mathematics", "calculus"],
  },
  {
    id: "task_4",
    title: "Read Research Paper",
    description: "Read and summarize the research paper on quantum computing.",
    dueDate: daysAgo(-7), // Due in 7 days
    status: "not_started",
    priority: "low",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
    tags: ["quantum computing", "research"],
  },
  {
    id: "task_5",
    title: "Programming Assignment",
    description: "Implement a binary search tree in Python.",
    dueDate: daysAgo(-3), // Due in 3 days
    status: "completed",
    priority: "medium",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(2),
    tags: ["programming", "data structures", "python"],
  },
]

// Study session interface
export interface StudySession {
  id: string
  userId: string
  taskId?: string
  startTime: Date
  endTime: Date
  duration: number // in minutes
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Mock study sessions
export const SESSIONS: StudySession[] = [
  {
    id: "session_1",
    userId: CURRENT_USER.id,
    taskId: TASKS[0].id,
    startTime: daysAgo(4),
    endTime: new Date(daysAgo(4).getTime() + 2 * 60 * 60 * 1000), // 2 hours later
    duration: 120, // 2 hours in minutes
    notes: "Reviewed quicksort and mergesort algorithms. Need to spend more time on heapsort.",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: "session_2",
    userId: CURRENT_USER.id,
    taskId: TASKS[4].id,
    startTime: daysAgo(3),
    endTime: new Date(daysAgo(3).getTime() + 3 * 60 * 60 * 1000), // 3 hours later
    duration: 180, // 3 hours in minutes
    notes: "Implemented binary search tree insert and delete operations. Need to work on traversal algorithms.",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: "session_3",
    userId: CURRENT_USER.id,
    startTime: daysAgo(2),
    endTime: new Date(daysAgo(2).getTime() + 1.5 * 60 * 60 * 1000), // 1.5 hours later
    duration: 90, // 1.5 hours in minutes
    notes: "General study session on linear algebra concepts.",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
]

// Progress interface
export interface Progress {
  id: string
  userId: string
  category: string
  score: number
  maxScore: number
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}

// Mock progress data
export const PROGRESS: Progress[] = [
  {
    id: "progress_1",
    userId: CURRENT_USER.id,
    category: "Algorithms",
    score: 85,
    maxScore: 100,
    completedAt: daysAgo(20),
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  {
    id: "progress_2",
    userId: CURRENT_USER.id,
    category: "Data Structures",
    score: 92,
    maxScore: 100,
    completedAt: daysAgo(15),
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  {
    id: "progress_3",
    userId: CURRENT_USER.id,
    category: "Calculus",
    score: 78,
    maxScore: 100,
    completedAt: daysAgo(10),
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: "progress_4",
    userId: CURRENT_USER.id,
    category: "Quantum Physics",
    score: 65,
    maxScore: 100,
    completedAt: daysAgo(5),
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
]

// Notes group interface
export interface NotesGroup {
  id: string
  name: string
  description?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Mock notes groups
export const NOTES_GROUPS: NotesGroup[] = [
  {
    id: "group_1",
    name: "Computer Science",
    description: "Notes related to algorithms, data structures, and programming concepts.",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(30),
  },
  {
    id: "group_2",
    name: "Mathematics",
    description: "Notes on calculus, linear algebra, and discrete mathematics.",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(55),
    updatedAt: daysAgo(25),
  },
  {
    id: "group_3",
    name: "Physics",
    description: "Notes on classical mechanics, electromagnetism, and quantum physics.",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(50),
    updatedAt: daysAgo(20),
  },
  {
    id: "group_4",
    name: "Chemistry",
    description: "Notes on organic chemistry, biochemistry, and chemical bonding.",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(15),
  },
]

// Note file interface
export interface NoteFile {
  id: string
  name: string
  type: "file" | "directory"
  content?: string
  children?: NoteFile[]
  updatedAt: Date
  size: number
}

// Note interface
export interface Note {
  id: string
  authorId: string
  notesGroupId: string
  title: string
  visibility: "private" | "public" | "shared"
  createdAt: Date
  updatedAt: Date
  files: NoteFile[]
  rating?: number
  ratingCount?: number
  viewCount?: number
  likeCount?: number
  dislikeCount?: number
}

// Mock notes
export const NOTES: Note[] = [
  {
    id: generateId(),
    authorId: CURRENT_USER.id,
    notesGroupId: NOTES_GROUPS[0].id,
    title: "Data Structures",
    visibility: "private",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5), // 5 days ago
    rating: 4.5,
    ratingCount: 10,
    viewCount: 150,
    likeCount: 25,
    dislikeCount: 2,
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content:
          "# Introduction to Data Structures\n\nData structures are a way of organizing and storing data so that it can be accessed and modified efficiently. They are essential for designing efficient algorithms and are used in almost every program or software system.\n\n## Types of Data Structures\n\n1. **Arrays**: A collection of elements identified by index or key\n2. **Linked Lists**: Linear collection of elements where each element points to the next\n3. **Stacks**: Collection of elements with Last-In-First-Out (LIFO) behavior\n4. **Queues**: Collection of elements with First-In-First-Out (FIFO) behavior\n5. **Trees**: Hierarchical structure with a root value and subtrees of children\n6. **Graphs**: Collection of nodes (vertices) and edges connecting pairs of nodes\n7. **Hash Tables**: Data structure that maps keys to values using a hash function\n\n## Choosing the Right Data Structure\n\nSelecting the appropriate data structure depends on the specific requirements of your application, such as:\n\n- The operations you need to perform (insertion, deletion, search, etc.)\n- Time complexity requirements for these operations\n- Memory usage constraints\n- The nature of the data being stored",
        updatedAt: daysAgo(5),
        size: 1024,
      },
      {
        id: generateId(),
        name: "Data Structures",
        type: "directory",
        updatedAt: daysAgo(3),
        size: 0,
        children: [
          {
            id: generateId(),
            name: "Arrays",
            type: "file",
            content:
              "# Arrays\n\nAn array is a collection of elements stored at contiguous memory locations. It is the simplest data structure where each element can be accessed using an index.\n\n## Characteristics of Arrays\n\n- Fixed size (in most languages)\n- Homogeneous elements (same data type)\n- Random access (constant time access to any element)\n- Contiguous memory allocation\n\n## Operations on Arrays\n\n- **Access**: O(1) - Constant time complexity\n- **Search**: O(n) - Linear time complexity (for unsorted arrays)\n- **Insertion**: O(n) - Linear time complexity (worst case)\n- **Deletion**: O(n) - Linear time complexity (worst case)\n\n## Types of Arrays\n\n1. **One-dimensional Arrays**: Linear arrays with elements arranged in a single row\n2. **Multi-dimensional Arrays**: Arrays with elements arranged in multiple rows and columns\n\n## Implementation\n\n```javascript\n// Declaring and initializing an array in JavaScript\nconst numbers = [1, 2, 3, 4, 5];\n\n// Accessing elements\nconst firstElement = numbers[0]; // 1\nconst thirdElement = numbers[2]; // 3\n\n// Modifying elements\nnumbers[4] = 10; // [1, 2, 3, 4, 10]\n\n// Array methods\nnumbers.push(6); // Add to end: [1, 2, 3, 4, 10, 6]\nnumbers.pop(); // Remove from end: [1, 2, 3, 4, 10]\nnumbers.unshift(0); // Add to beginning: [0, 1, 2, 3, 4, 10]\nnumbers.shift(); // Remove from beginning: [1, 2, 3, 4, 10]\n```",
            updatedAt: daysAgo(4),
            size: 1152,
          },
          {
            id: generateId(),
            name: "Linked Lists",
            type: "file",
            content:
              "# Linked Lists\n\nA linked list is a linear data structure where each element (node) contains data and a reference to the next node in the sequence.\n\n## Structure of a Node\n\n```\nclass Node {\n    data;\n    next;\n}\n```\n\n## Characteristics of Linked Lists\n\n- Dynamic size (can grow or shrink during execution)\n- Efficient insertions and deletions (when position is known)\n- Sequential access (elements must be accessed in order)\n\n## Operations on Linked Lists\n\n- **Access**: O(n) - Linear time complexity\n- **Search**: O(n) - Linear time complexity\n- **Insertion**: O(1) - Constant time complexity (when position is known)\n- **Deletion**: O(1) - Constant time complexity (when position is known)\n\n## Implementation\n\n```javascript\nclass Node {\n    constructor(data) {\n        this.data = data;\n        this.next = null;\n    }\n}\n\nclass LinkedList {\n    constructor() {\n        this.head = null;\n        this.size = 0;\n    }\n    \n    // Add a node to the end of the list\n    append(data) {\n        const newNode = new Node(data);\n        \n        if (!this.head) {\n            this.head = newNode;\n            return;\n        }\n        \n        let current = this.head;\n        while (current.next) {\n            current = current.next;\n        }\n        \n        current.next = newNode;\n        this.size++;\n    }\n    \n    // Add more methods as needed...\n}\n```",
            updatedAt: daysAgo(3),
            size: 1280,
          },
          {
            id: generateId(),
            name: "Doubly Linked Lists",
            type: "file",
            content:
              "# Doubly Linked Lists\n\nA doubly linked list is a linear data structure where each element (node) contains data and references to both the next and previous nodes in the sequence.\n\n## Structure of a Node\n\n```\nclass Node {\n    data;\n    next;\n    prev;\n}\n```\n\n## Characteristics of Doubly Linked Lists\n\n- Dynamic size (can grow or shrink during execution)\n- Efficient insertions and deletions (when position is known)\n- Bidirectional traversal (can be traversed in both directions)\n\n## Operations on Doubly Linked Lists\n\n- **Access**: O(n) - Linear time complexity\n- **Search**: O(n) - Linear time complexity\n- **Insertion**: O(1) - Constant time complexity (when position is known)\n- **Deletion**: O(1) - Constant time complexity (when position is known)\n\n## Implementation\n\n```javascript\nclass Node {\n    constructor(data) {\n        this.data = data;\n        this.next = null;\n        this.prev = null;\n    }\n}\n\nclass DoublyLinkedList {\n    constructor() {\n        this.head = null;\n        this.tail = null;\n        this.size = 0;\n    }\n    \n    // Add a node to the end of the list\n    append(data) {\n        const newNode = new Node(data);\n        \n        if (!this.head) {\n            this.head = newNode;\n            this.tail = newNode;\n            return;\n        }\n        \n        newNode.prev = this.tail;\n        this.tail.next = newNode;\n        this.tail = newNode;\n        this.size++;\n    }\n    \n    // Add more methods as needed...\n}\n```",
            updatedAt: daysAgo(4),
            size: 1408,
          },
        ],
      },
    ],
  },
  {
    id: generateId(),
    authorId: CURRENT_USER.id,
    notesGroupId: NOTES_GROUPS[2].id,
    title: "Quantum Physics",
    visibility: "private",
    createdAt: daysAgo(19),
    updatedAt: daysAgo(2), // 2 days ago
    rating: 4.8,
    ratingCount: 15,
    viewCount: 210,
    likeCount: 45,
    dislikeCount: 1,
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content:
          "# Introduction to Quantum Physics\n\nQuantum physics, also known as quantum mechanics, is a fundamental theory in physics that describes the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science.\n\n## Historical Development\n\nQuantum mechanics arose gradually from theories to explain observations which could not be reconciled with classical physics, such as Max Planck's solution in 1900 to the black-body radiation problem, and the correspondence between energy and frequency in Albert Einstein's 1905 paper which explained the photoelectric effect.\n\n## Key Concepts\n\n1. **Wave-Particle Duality**: Quantum entities exhibit both wave-like and particle-like properties.\n2. **Quantization**: Certain physical quantities can only take on discrete values.\n3. **Uncertainty Principle**: There is a fundamental limit to the precision with which complementary variables can be known.\n4. **Superposition**: Quantum systems can exist in multiple states simultaneously until measured.\n5. **Entanglement**: Quantum systems can become correlated in ways that cannot be explained by classical physics.",
        updatedAt: daysAgo(2),
        size: 1024,
      },
    ],
  },
  {
    id: generateId(),
    authorId: CURRENT_USER.id,
    notesGroupId: NOTES_GROUPS[3].id,
    title: "Organic Chemistry",
    visibility: "public",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(3), // 3 days ago
    rating: 4.0,
    ratingCount: 6,
    viewCount: 78,
    likeCount: 18,
    dislikeCount: 2,
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content:
          "# Introduction to Organic Chemistry\n\nOrganic chemistry is the study of the structure, properties, composition, reactions, and preparation of carbon-containing compounds. These compounds may contain any number of other elements, including hydrogen, nitrogen, oxygen, halogens, phosphorus, silicon, and sulfur.\n\n## Importance of Organic Chemistry\n\nOrganic chemistry is important because it is the study of life and all of the chemical reactions related to life. Several materials that we use heavily in our daily life are the products of organic chemistry, including plastics, drugs, petroleum, food, explosives, paints, cosmetics, and detergents.\n\n## Carbon: The Central Element\n\nCarbon is the central element in organic chemistry because of its ability to form strong bonds with other carbon atoms and with many other elements. This property allows carbon to form a vast number of compounds with diverse properties.\n\n## Types of Organic Compounds\n\n1. **Hydrocarbons**: Compounds containing only carbon and hydrogen\n2. **Alcohols**: Compounds containing the hydroxyl (-OH) group\n3. **Aldehydes and Ketones**: Compounds containing the carbonyl (C=O) group\n4. **Carboxylic Acids**: Compounds containing the carboxyl (-COOH) group\n5. **Amines**: Compounds containing nitrogen\n6. **Ethers**: Compounds containing an oxygen atom bonded to two carbon atoms",
        updatedAt: daysAgo(3),
        size: 896,
      },
    ],
  },
]

// Mock Note Versions
export const NOTE_VERSIONS = NOTES.map((note, index) => ({
  id: generateId(),
  noteId: note.id,
  content: `These are my notes on ${note.title}. This is version 1 of the content.`,
  versionNumber: 1,
  createdAt: note.createdAt,
}))

// Helper function to format relative time
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
  return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`
}

// Get recent notes with last viewed time
export const RECENT_NOTES = NOTES.map((note, index) => ({
  id: note.id,
  title: note.title,
  lastViewed: formatRelativeTime(note.updatedAt),
}))

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

// Function to increment view count for a question
export function incrementViewCount(questionId: string): void {
  const question = QUESTIONS.find((q) => q.id === questionId)
  if (question) {
    question.views += 1
  }
}

// Global Notes with additional metadata
export const GLOBAL_NOTES = [
  {
    id: generateId(),
    authorId: STUDENTS[0].id,
    author: STUDENTS[0],
    notesGroupId: generateId(),
    groupName: "Advanced Physics",
    title: "Quantum Field Theory Fundamentals",
    visibility: "public",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(3),
    viewCount: 342,
    likeCount: 87,
    dislikeCount: 4,
    rating: 4.7,
    ratingCount: 32,
    thumbnail: "/placeholder.svg?height=200&width=300",
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content:
          "# Introduction to Quantum Field Theory\n\nQuantum Field Theory (QFT) is the theoretical framework that combines quantum mechanics with special relativity to describe subatomic particles and their interactions. It forms the foundation of modern particle physics and has been incredibly successful in explaining phenomena at the smallest scales of nature.\n\n## Historical Development\n\nQFT emerged in the late 1920s and early 1930s through the work of physicists like Paul Dirac, Werner Heisenberg, and Wolfgang Pauli. It was developed to address the limitations of quantum mechanics when dealing with relativistic particles and the creation and annihilation of particles.\n\n## Key Concepts\n\n1. **Fields**: In QFT, particles are viewed as excitations of underlying quantum fields that permeate all of spacetime.\n2. **Second Quantization**: The wave functions of quantum mechanics become operator-valued fields.\n3. **Virtual Particles**: Temporary excitations of quantum fields that mediate interactions between particles.\n4. **Feynman Diagrams**: Pictorial representations of particle interactions in QFT.\n5. **Renormalization**: A collection of techniques used to deal with infinities that arise in calculations.",
        updatedAt: daysAgo(3),
        size: 1280,
      },
    ],
  },
  {
    id: generateId(),
    authorId: STUDENTS[1].id,
    author: STUDENTS[1],
    notesGroupId: generateId(),
    groupName: "Organic Chemistry",
    title: "Reaction Mechanisms in Organic Chemistry",
    visibility: "public",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(8),
    viewCount: 215,
    likeCount: 56,
    dislikeCount: 2,
    rating: 4.3,
    ratingCount: 18,
    thumbnail: "/placeholder.svg?height=200&width=300",
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content:
          "# Introduction to Reaction Mechanisms\n\nReaction mechanisms in organic chemistry describe the step-by-step sequence of elementary reactions by which overall chemical change occurs. Understanding these mechanisms is crucial for predicting the outcome of reactions and designing new synthetic pathways.\n\n## Importance of Reaction Mechanisms\n\nStudying reaction mechanisms allows chemists to:\n1. Predict the products of reactions\n2. Understand the stereochemistry of reactions\n3. Design more efficient synthetic routes\n4. Develop new catalysts and reagents\n\n## Types of Reaction Mechanisms\n\n1. **Substitution Reactions**: One atom or group is replaced by another\n2. **Elimination Reactions**: Atoms or groups are removed to form a multiple bond\n3. **Addition Reactions**: Atoms or groups are added to a multiple bond\n4. **Rearrangement Reactions**: Atoms within a molecule rearrange to form an isomer",
        updatedAt: daysAgo(8),
        size: 896,
      },
    ],
  },
  {
    id: generateId(),
    authorId: STUDENTS[2].id,
    author: STUDENTS[2],
    notesGroupId: generateId(),
    groupName: "Computer Science",
    title: "Advanced Algorithms and Data Structures",
    visibility: "public",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(12),
    viewCount: 567,
    likeCount: 124,
    dislikeCount: 7,
    rating: 4.8,
    ratingCount: 45,
    thumbnail: "/placeholder.svg?height=200&width=300",
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content:
          "# Introduction to Advanced Algorithms\n\nAdvanced algorithms are sophisticated methods for solving complex computational problems efficiently. They build upon basic algorithmic techniques and often combine multiple approaches to achieve optimal performance.\n\n## Importance of Advanced Algorithms\n\nAdvanced algorithms are essential for:\n1. Solving large-scale computational problems\n2. Optimizing resource usage in systems\n3. Enabling complex applications like machine learning and artificial intelligence\n4. Processing and analyzing big data\n\n## Categories of Advanced Algorithms\n\n1. **Graph Algorithms**: For solving problems related to networks and relationships\n2. **Dynamic Programming**: For solving problems by breaking them down into simpler subproblems\n3. **Greedy Algorithms**: For making locally optimal choices at each stage\n4. **Divide and Conquer**: For breaking problems into smaller, more manageable parts\n5. **Randomized Algorithms**: For using random numbers to solve problems efficiently",
        updatedAt: daysAgo(12),
        size: 1024,
      },
    ],
  },
  {
    id: generateId(),
    authorId: STUDENTS[0].id,
    author: STUDENTS[0],
    notesGroupId: generateId(),
    groupName: "Mathematics",
    title: "Linear Algebra Applications",
    visibility: "public",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(18),
    viewCount: 189,
    likeCount: 45,
    dislikeCount: 3,
    rating: 4.2,
    ratingCount: 15,
    thumbnail: "/placeholder.svg?height=200&width=300",
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content:
          "# Introduction to Linear Algebra Applications\n\nLinear algebra is a branch of mathematics that deals with vector spaces and linear mappings between these spaces. It includes the study of lines, planes, and subspaces, but is also concerned with properties common to all vector spaces.\n\n## Importance of Linear Algebra\n\nLinear algebra is fundamental to many fields including:\n1. Computer graphics and animation\n2. Machine learning and data science\n3. Quantum mechanics\n4. Economics and finance\n5. Engineering and physics\n\n## Key Concepts in Linear Algebra\n\n1. **Vectors and Vector Spaces**: Collections of objects that can be added together and multiplied by scalars\n2. **Matrices and Linear Transformations**: Representations of linear mappings between vector spaces\n3. **Eigenvalues and Eigenvectors**: Special scalars and vectors associated with linear transformations\n4. **Determinants**: Scalar values that can be computed from square matrices\n5. **Systems of Linear Equations**: Sets of equations involving the same variables",
        updatedAt: daysAgo(18),
        size: 896,
      },
    ],
  },
  {
    id: generateId(),
    authorId: STUDENTS[1].id,
    author: STUDENTS[1],
    notesGroupId: generateId(),
    groupName: "Biology",
    title: "Cell Biology and Molecular Mechanisms",
    visibility: "public",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(22),
    viewCount: 276,
    likeCount: 68,
    dislikeCount: 5,
    rating: 4.5,
    ratingCount: 22,
    thumbnail: "/placeholder.svg?height=200&width=300",
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content:
          "# Introduction to Cell Biology\n\nCell biology is the study of cell structure and function, focusing on the fundamental unit of life. It encompasses all aspects of cell function, including cell division, cellular metabolism, and cell communication.\n\n## Importance of Cell Biology\n\nUnderstanding cell biology is crucial for:\n1. Medical research and disease treatment\n2. Biotechnology and genetic engineering\n3. Understanding evolutionary processes\n4. Developing new pharmaceuticals\n\n## Key Concepts in Cell Biology\n\n1. **Cell Structure**: The organization and components of cells\n2. **Cell Membrane**: The barrier that separates the interior of the cell from the outside environment\n3. **Cellular Respiration**: The process by which cells convert nutrients into energy\n4. **Cell Division**: The process by which cells reproduce\n5. **Cell Signaling**: How cells communicate with each other",
        updatedAt: daysAgo(22),
        size: 896,
      },
    ],
  },
  {
    id: generateId(),
    authorId: STUDENTS[2].id,
    author: STUDENTS[2],
    notesGroupId: generateId(),
    groupName: "Computer Science",
    title: "Machine Learning Fundamentals",
    visibility: "public",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(28),
    viewCount: 432,
    likeCount: 98,
    dislikeCount: 6,
    rating: 4.6,
    ratingCount: 35,
    thumbnail: "/placeholder.svg?height=200&width=300",
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content:
          "# Introduction to Machine Learning\n\nMachine Learning (ML) is a subset of artificial intelligence that focuses on developing systems that can learn from and make decisions based on data. These systems improve their performance over time without being explicitly programmed to do so.\n\n## Importance of Machine Learning\n\nMachine learning is transforming numerous fields including:\n1. Healthcare (diagnosis and treatment recommendations)\n2. Finance (fraud detection and algorithmic trading)\n3. Transportation (autonomous vehicles)\n4. Marketing (customer segmentation and recommendation systems)\n5. Natural language processing (translation and sentiment analysis)\n\n## Types of Machine Learning\n\n1. **Supervised Learning**: Learning from labeled training data\n2. **Unsupervised Learning**: Finding patterns in unlabeled data\n3. **Reinforcement Learning**: Learning through interaction with an environment\n4. **Semi-supervised Learning**: Learning from a combination of labeled and unlabeled data\n5. **Deep Learning**: Learning using neural networks with multiple layers",
        updatedAt: daysAgo(28),
        size: 1024,
      },
    ],
  },
  {
    id: generateId(),
    authorId: STUDENTS[0].id,
    author: STUDENTS[0],
    notesGroupId: generateId(),
    groupName: "Physics",
    title: "Thermodynamics and Statistical Mechanics",
    visibility: "public",
    createdAt: daysAgo(35),
    updatedAt: daysAgo(32),
    viewCount: 198,
    likeCount: 42,
    dislikeCount: 3,
    rating: 4.4,
    ratingCount: 12,
    thumbnail: "/placeholder.svg?height=200&width=300",
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content:
          "# Introduction to Thermodynamics\n\nThermodynamics is the branch of physics that deals with heat, work, and temperature, and their relation to energy, entropy, and the physical properties of matter and radiation. The behavior of these quantities is governed by the four laws of thermodynamics.\n\n## Importance of Thermodynamics\n\nThermodynamics is fundamental to understanding:\n1. Energy conversion and efficiency\n2. Phase transitions and chemical reactions\n3. Engine and refrigeration cycles\n4. Climate science and atmospheric processes\n\n## Laws of Thermodynamics\n\n1. **Zeroth Law**: If two systems are each in thermal equilibrium with a third system, they are in thermal equilibrium with each other.\n2. **First Law**: Energy cannot be created or destroyed, only transferred or converted from one form to another.\n3. **Second Law**: The entropy of an isolated system always increases over time.\n4. **Third Law**: As the temperature approaches absolute zero, the entropy of a system approaches a constant minimum.",
        updatedAt: daysAgo(32),
        size: 896,
      },
    ],
  },
  {
    id: generateId(),
    authorId: STUDENTS[1].id,
    author: STUDENTS[1],
    notesGroupId: generateId(),
    groupName: "Chemistry",
    title: "Inorganic Chemistry Principles",
    visibility: "public",
    createdAt: daysAgo(40),
    updatedAt: daysAgo(38),
    viewCount: 156,
    likeCount: 34,
    dislikeCount: 2,
    rating: 4.1,
    ratingCount: 9,
    thumbnail: "/placeholder.svg?height=200&width=300",
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content:
          "# Introduction to Inorganic Chemistry\n\nInorganic chemistry is the study of the synthesis, reactions, structures, and properties of compounds of the elements. This field covers all chemical compounds except organic compounds (carbon-based compounds, usually containing C-H bonds).\n\n## Importance of Inorganic Chemistry\n\nInorganic chemistry is essential for understanding:\n1. Materials science and engineering\n2. Catalysis and industrial processes\n3. Environmental chemistry and pollution control\n4. Biological processes involving metal ions\n\n## Key Areas in Inorganic Chemistry\n\n1. **Coordination Chemistry**: The study of compounds containing metal-ligand bonds\n2. **Main Group Chemistry**: The chemistry of elements in groups 1, 2, and 13-18\n3. **Transition Metal Chemistry**: The chemistry of d-block elements\n4. **Organometallic Chemistry**: The study of compounds containing metal-carbon bonds\n5. **Solid State Chemistry**: The study of the synthesis, structure, and properties of solid phase materials",
        updatedAt: daysAgo(38),
        size: 896,
      },
    ],
  },
]

// Function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + " B"
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB"
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }
}

// Function to get a note by ID
export function getNoteById(id: string) {
  return [...NOTES, ...GLOBAL_NOTES].find((note) => note.id === id)
}

// Function to get a file by ID from a note
export function getFileById(note: any, fileId: string): NoteFile | null {
  if (!note || !note.files) return null

  // Helper function to search recursively through the file tree
  const findFile = (files: NoteFile[]): NoteFile | null => {
    for (const file of files) {
      if (file.id === fileId) return file
      if (file.type === "directory" && file.children) {
        const found = findFile(file.children)
        if (found) return found
      }
    }
    return null
  }

  return findFile(note.files)
}

// Function to increment note view count
export function incrementNoteViewCount(noteId: string): void {
  const note = getNoteById(noteId)
  if (note && "viewCount" in note && typeof note.viewCount === "number") {
    note.viewCount += 1
  }
}

// Function to update note rating
export function updateNoteRating(noteId: string, rating: number): void {
  const note = getNoteById(noteId)
  if (note && "rating" in note && "ratingCount" in note) {
    note.ratingCount = note.ratingCount ?? 0
    const totalRating = (note.rating ?? 0) * note.ratingCount
    note.ratingCount += 1
    note.rating = (totalRating + rating) / note.ratingCount
  }
}
