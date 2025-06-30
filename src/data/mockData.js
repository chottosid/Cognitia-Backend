const { v4: uuidv4 } = require("uuid")

// Helper functions
const generateId = () => uuidv4()

const daysAgo = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

const daysFromNow = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

const hoursAgo = (hours) => {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date
}

// Current user
const CURRENT_USER = {
  id: "user_1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "student",
  avatar: "/placeholder.svg?height=40&width=40",
  bio: "Computer Science student passionate about AI and machine learning.",
  institution: "MIT",
  location: "Cambridge, MA",
  website: "https://johndoe.dev",
  socialLinks: {
    github: "https://github.com/johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "https://twitter.com/johndoe",
  },
  interests: ["Machine Learning", "Algorithms", "Web Development", "Data Science"],
  skills: ["JavaScript", "Python", "React", "Node.js", "TensorFlow"],
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2023-05-20"),
}

// Mock students
const STUDENTS = [
  {
    id: "user_2",
    name: "Alice Smith",
    email: "alice.smith@example.com",
    role: "student",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Physics major with interest in quantum mechanics.",
    institution: "Stanford University",
    location: "Palo Alto, CA",
    interests: ["Quantum Physics", "Mathematics", "Research"],
    skills: ["MATLAB", "Python", "LaTeX", "Mathematica"],
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
    institution: "Harvard University",
    location: "Cambridge, MA",
    interests: ["Organic Chemistry", "Research", "Laboratory Work"],
    skills: ["ChemDraw", "NMR Analysis", "Synthesis", "Spectroscopy"],
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
    institution: "Caltech",
    location: "Pasadena, CA",
    interests: ["Abstract Algebra", "Number Theory", "Topology"],
    skills: ["Proof Writing", "Sage", "Python", "LaTeX"],
    createdAt: daysAgo(90),
    updatedAt: daysAgo(20),
  },
]

// Mock teachers
const TEACHERS = [
  {
    id: "user_5",
    name: "Dr. David Brown",
    email: "david.brown@example.com",
    role: "teacher",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Professor of Computer Science with 15 years of experience.",
    institution: "MIT",
    location: "Cambridge, MA",
    interests: ["Algorithms", "Machine Learning", "Teaching"],
    skills: ["Java", "Python", "C++", "Research", "Curriculum Design"],
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
    institution: "Stanford University",
    location: "Palo Alto, CA",
    interests: ["Particle Physics", "Research", "Education"],
    skills: ["ROOT", "C++", "Python", "Data Analysis", "Teaching"],
    createdAt: daysAgo(180),
    updatedAt: daysAgo(45),
  },
]

// All users combined
const USERS = [CURRENT_USER, ...STUDENTS, ...TEACHERS]

// Mock questions with more detailed data
const QUESTIONS = [
  {
    id: generateId(),
    title: "Understanding Calculus Integration Techniques vs Substitution",
    body: "I'm struggling with integration by parts. Can someone explain when to use it versus substitution methods? I've tried working through some examples but I'm still confused about which technique to apply in different scenarios. For example, when I see ∫x·e^x dx, should I use integration by parts or is there a substitution that works better?",
    authorId: STUDENTS[0].id,
    author: STUDENTS[0],
    tags: ["Mathematics", "Calculus", "Integration"],
    views: 124,
    isResolved: false,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    voteCount: 24,
    difficulty: "medium",
    subject: "Mathematics",
  },
  {
    id: generateId(),
    title: "Quantum Mechanics Probability Question",
    body: "How do we interpret the probability density function in quantum mechanics? I'm confused about the physical meaning. Is it related to the wave function squared? When we say |ψ(x)|² gives us the probability density, what does this actually mean in terms of measurement?",
    authorId: STUDENTS[1].id,
    author: STUDENTS[1],
    tags: ["Physics", "Quantum Mechanics", "Probability"],
    views: 89,
    isResolved: false,
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(4),
    voteCount: 18,
    difficulty: "hard",
    subject: "Physics",
  },
  {
    id: generateId(),
    title: "Recursion vs Iteration Efficiency",
    body: "In what scenarios is recursion more efficient than iteration? I'm trying to optimize an algorithm for tree traversal. Are there specific cases where one approach is clearly better than the other? I've heard that recursion can cause stack overflow issues, but when is it worth the risk?",
    authorId: STUDENTS[2].id,
    author: STUDENTS[2],
    tags: ["Computer Science", "Algorithms", "Recursion"],
    views: 156,
    isResolved: true,
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(5),
    voteCount: 32,
    difficulty: "medium",
    subject: "Computer Science",
  },
  {
    id: generateId(),
    title: "Organic Chemistry Reaction Mechanisms",
    body: "Can someone explain the mechanism for nucleophilic substitution reactions? I'm particularly confused about SN1 vs SN2 mechanisms and when each one occurs. What factors determine which pathway a reaction will follow?",
    authorId: STUDENTS[3]?.id || "fallback-author-id",
    author: STUDENTS[3],
    tags: ["Chemistry", "Organic Chemistry", "Reaction Mechanisms"],
    views: 78,
    isResolved: false,
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(8),
    voteCount: 15,
    difficulty: "medium",
    subject: "Chemistry",
  },
  {
    id: generateId(),
    title: "Linear Algebra Matrix Eigenvalues",
    body: "I'm having trouble understanding the geometric interpretation of eigenvalues and eigenvectors. Can someone provide an intuitive explanation of what they represent and why they're important in linear transformations?",
    authorId: STUDENTS[0].id,
    author: STUDENTS[0],
    tags: ["Mathematics", "Linear Algebra", "Eigenvalues"],
    views: 203,
    isResolved: true,
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(10),
    voteCount: 41,
    difficulty: "hard",
    subject: "Mathematics",
  },
]

// Mock answers with more detailed data
const ANSWERS = [
  {
    id: generateId(),
    questionId: QUESTIONS[2].id,
    authorId: STUDENTS[0].id,
    author: STUDENTS[0],
    content: `Recursion is typically more efficient for problems that have a recursive structure, like tree traversal. Here's why:

**When to use recursion:**
1. Tree and graph traversals
2. Divide and conquer algorithms
3. Problems with recursive substructure

**When to use iteration:**
1. Simple loops and counting
2. When memory is a concern
3. Performance-critical code

The call stack overhead can be a concern, but for balanced trees, the elegance and clarity of recursive code often outweighs the performance difference. For example:

\`\`\`python
# Recursive tree traversal (elegant)
def traverse(node):
    if node:
        process(node)
        traverse(node.left)
        traverse(node.right)

# Iterative version (more complex)
def traverse_iterative(root):
    stack = [root]
    while stack:
        node = stack.pop()
        if node:
            process(node)
            stack.append(node.right)
            stack.append(node.left)
\`\`\``,
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
    content: `I'd add that iteration is generally more efficient in terms of memory usage because it doesn't require additional stack frames. However, some algorithms are much more intuitive when expressed recursively.

**Memory considerations:**
- Recursion: O(depth) stack space
- Iteration: O(1) additional space (usually)

**Performance considerations:**
- Function call overhead in recursion
- Better compiler optimizations for loops
- Tail recursion optimization (when available)

For tree traversal specifically, if you're dealing with very deep trees, iteration might be safer to avoid stack overflow.`,
    isAccepted: false,
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    voteCount: 8,
  },
  {
    id: generateId(),
    questionId: QUESTIONS[4].id,
    authorId: TEACHERS[0].id,
    author: TEACHERS[0],
    content: `Great question! Eigenvalues and eigenvectors have a beautiful geometric interpretation:

**Geometric Meaning:**
- An eigenvector is a direction that doesn't change when a linear transformation is applied
- The eigenvalue tells you how much the eigenvector gets scaled

**Visual Example:**
Imagine stretching a rubber sheet:
- Some directions get stretched more (large eigenvalue)
- Some directions get compressed (small eigenvalue)  
- Some directions might even flip (negative eigenvalue)
- The eigenvectors are the "principal directions" of stretching

**Applications:**
1. **PCA**: Eigenvectors show directions of maximum variance
2. **Stability Analysis**: Eigenvalues determine system stability
3. **Google PageRank**: Uses the dominant eigenvector
4. **Quantum Mechanics**: Eigenstates are stable states

The key insight is that eigenvectors reveal the "natural directions" of a transformation, while eigenvalues quantify the effect along those directions.`,
    isAccepted: true,
    createdAt: hoursAgo(11),
    updatedAt: hoursAgo(11),
    voteCount: 28,
  },
]

// Mock tasks with more detailed data
const TASKS = [
  {
    id: "task_1",
    title: "Study Algorithms - Sorting",
    description:
      "Review quicksort, mergesort, and heapsort algorithms. Focus on time complexity analysis and implementation details.",
    dueDate: daysFromNow(2),
    status: "in_progress",
    priority: "high",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(5),
    tags: ["algorithms", "computer science", "sorting"],
    subjectArea: "Computer Science",
    estimatedTime: 120,
    difficulty: "medium",
    notes: "Started with quicksort implementation. Need to review worst-case scenarios.",
  },
  {
    id: "task_2",
    title: "Physics Lab Report - Wave Interference",
    description:
      "Complete the lab report on wave interference patterns. Include data analysis and theoretical comparison.",
    dueDate: daysFromNow(5),
    status: "not_started",
    priority: "medium",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    tags: ["physics", "lab report", "waves"],
    subjectArea: "Physics",
    estimatedTime: 90,
    difficulty: "medium",
    notes: "",
  },
  {
    id: "task_3",
    title: "Calculus Problem Set 5",
    description: "Complete integration problems focusing on integration by parts and partial fractions.",
    dueDate: daysFromNow(1),
    status: "completed",
    priority: "high",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
    completedAt: daysAgo(1),
    tags: ["mathematics", "calculus", "integration"],
    subjectArea: "Mathematics",
    estimatedTime: 60,
    difficulty: "medium",
    notes: "Completed all problems. Integration by parts was challenging but manageable.",
  },
  {
    id: "task_4",
    title: "Prepare for Quantum Mechanics Exam",
    description: "Review wave functions, probability interpretations, and the Schrödinger equation.",
    dueDate: daysFromNow(7),
    status: "not_started",
    priority: "high",
    userId: CURRENT_USER.id,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    tags: ["physics", "quantum mechanics", "exam"],
    subjectArea: "Physics",
    estimatedTime: 180,
    difficulty: "hard",
    notes: "",
  },
]

// Mock notes groups
const NOTES_GROUPS = [
  {
    id: "group_1",
    name: "Computer Science",
    description: "Notes related to algorithms, data structures, and programming concepts.",
    userId: CURRENT_USER.id,
    color: "#3b82f6",
    createdAt: daysAgo(60),
    updatedAt: daysAgo(30),
  },
  {
    id: "group_2",
    name: "Mathematics",
    description: "Notes on calculus, linear algebra, and discrete mathematics.",
    userId: CURRENT_USER.id,
    color: "#10b981",
    createdAt: daysAgo(55),
    updatedAt: daysAgo(25),
  },
  {
    id: "group_3",
    name: "Physics",
    description: "Physics concepts, formulas, and problem-solving techniques.",
    userId: CURRENT_USER.id,
    color: "#f59e0b",
    createdAt: daysAgo(50),
    updatedAt: daysAgo(20),
  },
  {
    id: "group_4",
    name: "Chemistry",
    description: "Organic and inorganic chemistry notes and reactions.",
    userId: CURRENT_USER.id,
    color: "#ef4444",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(15),
  },
]

// Mock notes with file structure
const NOTES = [
  {
    id: generateId(),
    authorId: CURRENT_USER.id,
    notesGroupId: NOTES_GROUPS[0].id,
    title: "Data Structures and Algorithms",
    visibility: "private",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
    rating: 4.5,
    ratingCount: 10,
    viewCount: 150,
    likeCount: 25,
    dislikeCount: 2,
    tags: ["algorithms", "data structures", "computer science"],
    files: [
      {
        id: generateId(),
        name: "Introduction",
        type: "file",
        content: `# Introduction to Data Structures and Algorithms

Data structures and algorithms form the foundation of computer science and software engineering. Understanding these concepts is crucial for writing efficient and scalable code.

## What are Data Structures?

Data structures are ways of organizing and storing data in a computer so that it can be accessed and modified efficiently. They define the relationship between data elements and the operations that can be performed on them.

## Common Data Structures

1. **Arrays**: Fixed-size sequential collection of elements
2. **Linked Lists**: Dynamic collection of nodes containing data and references
3. **Stacks**: Last-In-First-Out (LIFO) data structure
4. **Queues**: First-In-First-Out (FIFO) data structure
5. **Trees**: Hierarchical data structure with nodes
6. **Graphs**: Collection of vertices connected by edges
7. **Hash Tables**: Key-value pairs with fast lookup

## What are Algorithms?

Algorithms are step-by-step procedures for solving problems or performing tasks. They take input data, process it according to defined rules, and produce output.

## Algorithm Analysis

When analyzing algorithms, we consider:
- **Time Complexity**: How execution time grows with input size
- **Space Complexity**: How memory usage grows with input size
- **Big O Notation**: Mathematical notation for describing complexity

## Why Study DSA?

1. **Problem Solving**: Develop systematic approaches to complex problems
2. **Efficiency**: Write code that performs well at scale
3. **Interviews**: Essential for technical interviews
4. **Foundation**: Understanding for advanced topics like machine learning
5. **Optimization**: Improve existing code and systems`,
        updatedAt: daysAgo(5),
        size: 1024,
      },
    ],
  },
]

// Mock notifications
const NOTIFICATIONS = [
  {
    id: generateId(),
    type: "answer",
    questionId: QUESTIONS[0].id,
    questionTitle: QUESTIONS[0].title,
    answerId: generateId(),
    actorId: STUDENTS[1].id,
    actorName: STUDENTS[1].name,
    actorAvatar: STUDENTS[1].avatar,
    message: "answered your question",
    createdAt: hoursAgo(1),
    isRead: false,
  },
  {
    id: generateId(),
    type: "vote",
    questionId: QUESTIONS[2].id,
    questionTitle: QUESTIONS[2].title,
    actorId: STUDENTS[0].id,
    actorName: STUDENTS[0].name,
    actorAvatar: STUDENTS[0].avatar,
    message: "upvoted your question",
    createdAt: hoursAgo(3),
    isRead: false,
  },
  {
    id: generateId(),
    type: "acceptance",
    questionId: QUESTIONS[2].id,
    questionTitle: QUESTIONS[2].title,
    answerId: ANSWERS[0].id,
    actorId: STUDENTS[2].id,
    actorName: STUDENTS[2].name,
    actorAvatar: STUDENTS[2].avatar,
    message: "accepted your answer",
    createdAt: hoursAgo(5),
    isRead: true,
  },
  {
    id: generateId(),
    type: "comment",
    questionId: QUESTIONS[1].id,
    questionTitle: QUESTIONS[1].title,
    actorId: TEACHERS[0].id,
    actorName: TEACHERS[0].name,
    actorAvatar: TEACHERS[0].avatar,
    message: "commented on your question",
    createdAt: hoursAgo(8),
    isRead: true,
  },
]

// Mock study sessions
const SESSIONS = [
  {
    id: generateId(),
    userId: CURRENT_USER.id,
    taskId: TASKS[0].id,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    duration: 60,
    goal: "Complete algorithm review",
    notes: "Reviewed sorting algorithms and their time complexities",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    completed: true,
    subject: "Computer Science",
    productivity: 8,
  },
  {
    id: generateId(),
    userId: CURRENT_USER.id,
    taskId: TASKS[1].id,
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    duration: 45,
    goal: "Start physics lab report",
    notes: "Gathered data and began analysis section",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    completed: true,
    subject: "Physics",
    productivity: 7,
  },
]

// Mock progress data
const PROGRESS = [
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

// Mock saved items
const SAVED_ITEMS = [
  {
    id: generateId(),
    userId: CURRENT_USER.id,
    itemType: "question",
    itemId: QUESTIONS[0].id,
    savedAt: daysAgo(2),
    tags: ["important", "study"],
  },
  {
    id: generateId(),
    userId: CURRENT_USER.id,
    itemType: "note",
    itemId: NOTES[0].id,
    savedAt: daysAgo(5),
    tags: ["reference"],
  },
]

// Mock voting data
const VOTES = [
  {
    id: generateId(),
    userId: CURRENT_USER.id,
    itemType: "question",
    itemId: QUESTIONS[0].id,
    voteType: "up",
    createdAt: hoursAgo(2),
  },
  {
    id: generateId(),
    userId: CURRENT_USER.id,
    itemType: "answer",
    itemId: ANSWERS[0].id,
    voteType: "up",
    createdAt: hoursAgo(6),
  },
]

module.exports = {
  generateId,
  daysAgo,
  daysFromNow,
  hoursAgo,
  CURRENT_USER,
  STUDENTS,
  TEACHERS,
  USERS,
  QUESTIONS,
  ANSWERS,
  TASKS,
  NOTES_GROUPS,
  NOTES,
  NOTIFICATIONS,
  SESSIONS,
  PROGRESS,
  SAVED_ITEMS,
  VOTES,
}
