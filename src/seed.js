import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (optional - be careful in production!)
  await prisma.testAttempt.deleteMany({});
  await prisma.contestAttempt.deleteMany({});
  await prisma.questionAssignment.deleteMany({});
  await prisma.contestRegistration.deleteMany({});
  await prisma.studySession.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.notesGroup.deleteMany({});
  await prisma.contest.deleteMany({});
  await prisma.modelTest.deleteMany({});
  await prisma.questionBank.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Users (Bangladesh context)
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "dr.rahman@cognitia.edu.bd",
      name: "Dr. Mohammad Rahman",
      password: hashedPassword,
      role: "ADMIN",
      bio: "Professor of Computer Science at BUET, specializing in algorithms and machine learning",
      institution: "Bangladesh University of Engineering and Technology (BUET)",
      graduationYear: 2005,
      major: "Computer Science and Engineering",
      location: "Dhaka, Bangladesh",
      verified: true,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: "fahim.ahmed@student.buet.ac.bd",
      name: "Fahim Ahmed",
      password: hashedPassword,
      role: "STUDENT",
      bio: "CSE student passionate about competitive programming and algorithms. Regular participant in ACM ICPC",
      institution: "Bangladesh University of Engineering and Technology (BUET)",
      graduationYear: 2025,
      major: "Computer Science and Engineering",
      grade: "3rd Year",
      location: "Dhaka, Bangladesh",
      verified: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "rashida.khan@student.du.ac.bd",
      name: "Rashida Khan",
      password: hashedPassword,
      role: "STUDENT",
      bio: "Mathematics student with strong interest in discrete mathematics and cryptography",
      institution: "University of Dhaka",
      graduationYear: 2024,
      major: "Mathematics",
      grade: "4th Year",
      location: "Dhaka, Bangladesh",
      verified: true,
    },
  });

  console.log("✅ Users created");

  // Create Question Bank (Math & CS focused for Bangladesh)
  const questions = await Promise.all([
    // Computer Science - Data Structures & Algorithms
    prisma.questionBank.create({
      data: {
        question:
          "What is the time complexity of finding the minimum element in a min-heap?",
        explanation:
          "In a min-heap, the minimum element is always at the root (index 0), so accessing it takes O(1) constant time.",
        options: ["O(log n)", "O(1)", "O(n)", "O(n log n)"],
        correctAnswer: 1,
        subject: "Computer Science",
        topics: ["Data Structures", "Heap", "Time Complexity"],
        difficulty: "MEDIUM",
      },
    }),

    prisma.questionBank.create({
      data: {
        question:
          "Which sorting algorithm is most suitable for sorting a linked list?",
        explanation:
          "Merge sort is ideal for linked lists as it doesn't require random access and has O(n log n) time complexity with O(1) extra space for linked lists.",
        options: ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"],
        correctAnswer: 2,
        subject: "Computer Science",
        topics: ["Sorting", "Linked List", "Algorithms"],
        difficulty: "MEDIUM",
      },
    }),

    prisma.questionBank.create({
      data: {
        question:
          "What is the maximum number of nodes in a binary tree of height h?",
        explanation:
          "A complete binary tree of height h has maximum 2^(h+1) - 1 nodes. Each level can have at most 2^level nodes.",
        options: ["2^h", "2^h - 1", "2^(h+1) - 1", "2^(h-1)"],
        correctAnswer: 2,
        subject: "Computer Science",
        topics: ["Binary Tree", "Data Structures"],
        difficulty: "MEDIUM",
      },
    }),

    prisma.questionBank.create({
      data: {
        question: "In dynamic programming, what is memoization?",
        explanation:
          "Memoization is a technique where we store the results of expensive function calls and reuse them when the same inputs occur again.",
        options: [
          "Breaking problem into subproblems",
          "Storing results to avoid recomputation",
          "Using recursion",
          "Optimizing space complexity",
        ],
        correctAnswer: 1,
        subject: "Computer Science",
        topics: ["Dynamic Programming", "Algorithms"],
        difficulty: "MEDIUM",
      },
    }),

    prisma.questionBank.create({
      data: {
        question: "What is the space complexity of the merge sort algorithm?",
        explanation:
          "Merge sort requires O(n) extra space for the temporary arrays used during the merge process.",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: 2,
        subject: "Computer Science",
        topics: ["Sorting", "Space Complexity", "Algorithms"],
        difficulty: "MEDIUM",
      },
    }),

    // Advanced CS Topics
    prisma.questionBank.create({
      data: {
        question:
          "In graph theory, what is the time complexity of Dijkstra's algorithm using a binary heap?",
        explanation:
          "Dijkstra's algorithm with binary heap has time complexity O((V + E) log V) where V is vertices and E is edges.",
        options: ["O(V²)", "O(E log V)", "O(V log V)", "O((V + E) log V)"],
        correctAnswer: 3,
        subject: "Computer Science",
        topics: ["Graph Theory", "Shortest Path", "Algorithms"],
        difficulty: "HARD",
      },
    }),

    prisma.questionBank.create({
      data: {
        question:
          "What does NP-Complete mean in computational complexity theory?",
        explanation:
          "NP-Complete problems are in NP and every problem in NP can be reduced to them in polynomial time. They are the hardest problems in NP.",
        options: [
          "Problems that can be solved in polynomial time",
          "Problems that are not solvable",
          "Hardest problems in NP class",
          "Problems with exponential solutions only",
        ],
        correctAnswer: 2,
        subject: "Computer Science",
        topics: ["Complexity Theory", "NP-Complete"],
        difficulty: "HARD",
      },
    }),

    // Mathematics - Calculus
    prisma.questionBank.create({
      data: {
        question: "What is the derivative of ln(x²)?",
        explanation:
          "Using chain rule: d/dx[ln(x²)] = (1/x²) × 2x = 2/x. Alternatively, ln(x²) = 2ln(x), so d/dx = 2/x.",
        options: ["1/x²", "2/x", "2x", "x/2"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Calculus", "Derivatives", "Chain Rule"],
        difficulty: "MEDIUM",
      },
    }),

    prisma.questionBank.create({
      data: {
        question: "Evaluate the integral ∫x·e^x dx",
        explanation:
          "Using integration by parts with u = x, dv = e^x dx: ∫x·e^x dx = x·e^x - ∫e^x dx = x·e^x - e^x + C = e^x(x-1) + C",
        options: ["e^x(x+1) + C", "e^x(x-1) + C", "x·e^x + C", "e^x/x + C"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Calculus", "Integration", "Integration by Parts"],
        difficulty: "HARD",
      },
    }),

    prisma.questionBank.create({
      data: {
        question: "What is lim(x→0) (sin x)/x?",
        explanation:
          "This is a fundamental limit. As x approaches 0, (sin x)/x approaches 1. This can be proven using L'Hôpital's rule or geometric arguments.",
        options: ["0", "1", "∞", "undefined"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Calculus", "Limits"],
        difficulty: "MEDIUM",
      },
    }),

    // Mathematics - Discrete Mathematics
    prisma.questionBank.create({
      data: {
        question: "How many ways can you arrange 5 distinct books on a shelf?",
        explanation:
          "This is a permutation problem. The number of ways to arrange n distinct objects is n! = 5! = 5×4×3×2×1 = 120.",
        options: ["25", "60", "120", "625"],
        correctAnswer: 2,
        subject: "Mathematics",
        topics: ["Discrete Mathematics", "Permutations", "Combinatorics"],
        difficulty: "EASY",
      },
    }),

    prisma.questionBank.create({
      data: {
        question:
          "In how many ways can you choose 3 students from a class of 10?",
        explanation:
          "This is a combination problem: C(10,3) = 10!/(3!×7!) = (10×9×8)/(3×2×1) = 720/6 = 120.",
        options: ["30", "120", "720", "1000"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Discrete Mathematics", "Combinations", "Combinatorics"],
        difficulty: "MEDIUM",
      },
    }),

    prisma.questionBank.create({
      data: {
        question: "What is the sum of the first n natural numbers?",
        explanation:
          "The sum of first n natural numbers is given by the formula n(n+1)/2. This can be derived using arithmetic series formula.",
        options: ["n²", "n(n+1)/2", "n(n-1)/2", "2n+1"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Discrete Mathematics", "Series", "Number Theory"],
        difficulty: "EASY",
      },
    }),

    // Mathematics - Linear Algebra
    prisma.questionBank.create({
      data: {
        question: "What is the determinant of a 2×2 matrix [[a,b],[c,d]]?",
        explanation:
          "The determinant of a 2×2 matrix [[a,b],[c,d]] is calculated as ad - bc.",
        options: ["a+d-b-c", "ad-bc", "ac-bd", "ab-cd"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Linear Algebra", "Matrices", "Determinants"],
        difficulty: "EASY",
      },
    }),

    prisma.questionBank.create({
      data: {
        question: "Two vectors are orthogonal if their dot product is:",
        explanation:
          "Two vectors are orthogonal (perpendicular) if and only if their dot product equals zero.",
        options: ["1", "0", "-1", "undefined"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Linear Algebra", "Vectors", "Dot Product"],
        difficulty: "MEDIUM",
      },
    }),

    // Advanced Mathematics
    prisma.questionBank.create({
      data: {
        question: "What is the Fundamental Theorem of Calculus?",
        explanation:
          "The Fundamental Theorem of Calculus connects derivatives and integrals, stating that differentiation and integration are inverse operations.",
        options: [
          "Integration and differentiation are inverse operations",
          "All functions are differentiable",
          "Limits always exist",
          "Continuous functions are integrable",
        ],
        correctAnswer: 0,
        subject: "Mathematics",
        topics: ["Calculus", "Fundamental Theorems"],
        difficulty: "MEDIUM",
      },
    }),

    // CS - Programming Concepts
    prisma.questionBank.create({
      data: {
        question: "In object-oriented programming, what is polymorphism?",
        explanation:
          "Polymorphism allows objects of different types to be treated as objects of a common base type, with the specific behavior determined at runtime.",
        options: [
          "Having multiple constructors",
          "Same interface, different implementations",
          "Creating multiple objects",
          "Inheriting from multiple classes",
        ],
        correctAnswer: 1,
        subject: "Computer Science",
        topics: ["Object Oriented Programming", "Polymorphism"],
        difficulty: "MEDIUM",
      },
    }),

    prisma.questionBank.create({
      data: {
        question: "What is the primary advantage of using a hash table?",
        explanation:
          "Hash tables provide average O(1) time complexity for search, insert, and delete operations, making them very efficient for key-value storage.",
        options: [
          "Maintains sorted order",
          "Uses less memory",
          "Average O(1) operations",
          "No collisions possible",
        ],
        correctAnswer: 2,
        subject: "Computer Science",
        topics: ["Data Structures", "Hash Tables"],
        difficulty: "MEDIUM",
      },
    }),

    // Competitive Programming Style Questions
    prisma.questionBank.create({
      data: {
        question:
          "What is the time complexity of the Euclidean algorithm for finding GCD?",
        explanation:
          "The Euclidean algorithm has time complexity O(log(min(a,b))) where a and b are the input numbers.",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(√n)"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Number Theory", "Algorithms", "GCD"],
        difficulty: "MEDIUM",
      },
    }),

    prisma.questionBank.create({
      data: {
        question: "In modular arithmetic, what is (7 × 8) mod 5?",
        explanation:
          "7 × 8 = 56. Then 56 mod 5 = 1, since 56 = 11 × 5 + 1. Alternatively, (7 mod 5) × (8 mod 5) mod 5 = 2 × 3 mod 5 = 6 mod 5 = 1.",
        options: ["0", "1", "2", "3"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Number Theory", "Modular Arithmetic"],
        difficulty: "EASY",
      },
    }),

    // More advanced topics
    prisma.questionBank.create({
      data: {
        question: "What is the chromatic number of a complete graph K_n?",
        explanation:
          "The chromatic number of a complete graph K_n is n, because every vertex is connected to every other vertex, so each needs a different color.",
        options: ["n-1", "n", "n+1", "2n"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Graph Theory", "Graph Coloring"],
        difficulty: "HARD",
      },
    }),

    prisma.questionBank.create({
      data: {
        question:
          "In Big O notation, what does O(n log n) typically represent?",
        explanation:
          "O(n log n) is the time complexity of efficient comparison-based sorting algorithms like merge sort, heap sort, and average case of quick sort.",
        options: [
          "Linear search complexity",
          "Efficient sorting algorithms",
          "Binary search complexity",
          "Matrix multiplication",
        ],
        correctAnswer: 1,
        subject: "Computer Science",
        topics: ["Complexity Analysis", "Big O Notation"],
        difficulty: "MEDIUM",
      },
    }),

    // Database and CS Theory
    prisma.questionBank.create({
      data: {
        question: "What is the purpose of indexing in databases?",
        explanation:
          "Database indexing creates a data structure that improves the speed of data retrieval operations, similar to an index in a book.",
        options: [
          "Reduce storage space",
          "Speed up data retrieval",
          "Ensure data integrity",
          "Backup data automatically",
        ],
        correctAnswer: 1,
        subject: "Computer Science",
        topics: ["Databases", "Indexing"],
        difficulty: "EASY",
      },
    }),

    // Number Theory
    prisma.questionBank.create({
      data: {
        question: "What is Fermat's Little Theorem?",
        explanation:
          "Fermat's Little Theorem states that if p is prime and a is not divisible by p, then a^(p-1) ≡ 1 (mod p).",
        options: [
          "a^p ≡ a (mod p) for prime p",
          "a^(p-1) ≡ 1 (mod p) for prime p, gcd(a,p)=1",
          "p^2 = a^2 + b^2 has no integer solutions",
          "Every even number > 2 is sum of two primes",
        ],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Number Theory", "Modular Arithmetic"],
        difficulty: "HARD",
      },
    }),

    // Programming Paradigms
    prisma.questionBank.create({
      data: {
        question: "What is functional programming?",
        explanation:
          "Functional programming is a paradigm that treats computation as evaluation of mathematical functions, avoiding changing state and mutable data.",
        options: [
          "Programming with functions only",
          "Object-oriented programming",
          "Computation as mathematical functions",
          "Event-driven programming",
        ],
        correctAnswer: 2,
        subject: "Computer Science",
        topics: ["Programming Paradigms", "Functional Programming"],
        difficulty: "MEDIUM",
      },
    }),
  ]);

  console.log("✅ Question bank created with", questions.length, "questions");

  // Create Model Tests (Math & CS focused)
  const modelTest1 = await prisma.modelTest.create({
    data: {
      title: "Data Structures & Algorithms Mastery",
      description:
        "Comprehensive test covering fundamental data structures, algorithms, and complexity analysis essential for competitive programming",
      timeLimit: 90,
      subjects: ["Computer Science"],
      topics: [
        "Data Structures",
        "Algorithms",
        "Time Complexity",
        "Dynamic Programming",
      ],
      difficulty: "MEDIUM",
      isCustom: false,
      passingScore: 75,
      totalPoints: 150,
      userId: admin.id,
    },
  });

  const modelTest2 = await prisma.modelTest.create({
    data: {
      title: "Advanced Mathematics for CS",
      description:
        "Mathematical foundations essential for computer science including discrete math, calculus, and linear algebra",
      timeLimit: 75,
      subjects: ["Mathematics"],
      topics: [
        "Discrete Mathematics",
        "Linear Algebra",
        "Calculus",
        "Number Theory",
      ],
      difficulty: "HARD",
      passingScore: 70,
      totalPoints: 120,
      userId: admin.id,
    },
  });

  // Assign questions to model tests
  await prisma.questionAssignment.createMany({
    data: [
      // CS Data Structures & Algorithms test
      { questionId: questions[0].id, modelTestId: modelTest1.id, points: 15 },
      { questionId: questions[1].id, modelTestId: modelTest1.id, points: 15 },
      { questionId: questions[2].id, modelTestId: modelTest1.id, points: 15 },
      { questionId: questions[3].id, modelTestId: modelTest1.id, points: 20 },
      { questionId: questions[4].id, modelTestId: modelTest1.id, points: 15 },
      { questionId: questions[5].id, modelTestId: modelTest1.id, points: 25 },
      { questionId: questions[6].id, modelTestId: modelTest1.id, points: 25 },
      { questionId: questions[16].id, modelTestId: modelTest1.id, points: 10 },
      { questionId: questions[17].id, modelTestId: modelTest1.id, points: 10 },

      // Mathematics test
      { questionId: questions[7].id, modelTestId: modelTest2.id, points: 15 },
      { questionId: questions[8].id, modelTestId: modelTest2.id, points: 20 },
      { questionId: questions[9].id, modelTestId: modelTest2.id, points: 10 },
      { questionId: questions[10].id, modelTestId: modelTest2.id, points: 10 },
      { questionId: questions[11].id, modelTestId: modelTest2.id, points: 15 },
      { questionId: questions[12].id, modelTestId: modelTest2.id, points: 10 },
      { questionId: questions[13].id, modelTestId: modelTest2.id, points: 10 },
      { questionId: questions[14].id, modelTestId: modelTest2.id, points: 15 },
      { questionId: questions[18].id, modelTestId: modelTest2.id, points: 15 },
      { questionId: questions[23].id, modelTestId: modelTest2.id, points: 20 },
    ],
  });

  console.log("✅ Model tests created with question assignments");

  // Create Contests (Bangladesh competitive programming context)
  const now = new Date();
  const futureDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
  const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
  const pastEndDate = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days ago

  const contest1 = await prisma.contest.create({
    data: {
      title: "BUET Inter-University Programming Contest",
      description:
        "Annual programming contest featuring algorithmic challenges, data structures, and mathematical problem solving. Preparation for ACM ICPC.",
      startTime: futureDate,
      endTime: new Date(futureDate.getTime() + 5 * 60 * 60 * 1000), // 5 hours duration
      status: "UPCOMING",
      difficulty: "HARD",
      topics: [
        "Algorithms",
        "Data Structures",
        "Dynamic Programming",
        "Graph Theory",
      ],
      eligibility: "University students from Bangladesh",
    },
  });

  const contest2 = await prisma.contest.create({
    data: {
      title: "Bangladesh Mathematics Olympiad Qualifier",
      description:
        "National level mathematics competition covering advanced topics in discrete math, number theory, and combinatorics",
      startTime: pastDate,
      endTime: pastEndDate,
      status: "FINISHED",
      difficulty: "EXPERT",
      topics: [
        "Number Theory",
        "Combinatorics",
        "Discrete Mathematics",
        "Graph Theory",
      ],
      eligibility: "Undergraduate students in Mathematics and CS",
    },
  });

  // Assign questions to contests
  await prisma.questionAssignment.createMany({
    data: [
      // Programming contest questions (harder CS problems)
      { questionId: questions[0].id, contestId: contest1.id, points: 100 },
      { questionId: questions[3].id, contestId: contest1.id, points: 200 },
      { questionId: questions[5].id, contestId: contest1.id, points: 300 },
      { questionId: questions[6].id, contestId: contest1.id, points: 400 },
      { questionId: questions[21].id, contestId: contest1.id, points: 150 },

      // Mathematics olympiad questions
      { questionId: questions[8].id, contestId: contest2.id, points: 35 },
      { questionId: questions[18].id, contestId: contest2.id, points: 25 },
      { questionId: questions[20].id, contestId: contest2.id, points: 40 },
      { questionId: questions[23].id, contestId: contest2.id, points: 50 },
    ],
  });

  // Register students for contests
  await prisma.contestRegistration.createMany({
    data: [
      { contestId: contest1.id, userId: student1.id },
      { contestId: contest1.id, userId: student2.id },
      { contestId: contest2.id, userId: student1.id },
      { contestId: contest2.id, userId: student2.id },
    ],
  });

  console.log("✅ Contests created with registrations");

  // Create Tasks (Bangladesh academic context)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: "Implement Red-Black Tree in C++",
        description:
          "Complete assignment for CSE 204 (Data Structures). Implement insertion, deletion, and search operations with proper balancing. Include test cases for BUET online judge.",
        dueDate: nextWeek,
        status: "IN_PROGRESS",
        priority: "HIGH",
        subjectArea: "Computer Science",
        tags: ["data-structures", "trees", "algorithms", "cpp"],
        estimatedTime: 300, // 5 hours
        userId: student1.id,
      },
      {
        title: "Number Theory Problem Set",
        description:
          "Solve problems on modular arithmetic, GCD, prime factorization for Mathematics competition preparation. Focus on contest-style problems.",
        dueDate: tomorrow,
        status: "NOT_STARTED",
        priority: "HIGH",
        subjectArea: "Mathematics",
        tags: ["number-theory", "contest-math", "modular-arithmetic"],
        estimatedTime: 180, // 3 hours
        userId: student2.id,
      },
      {
        title: "Dynamic Programming Practice",
        description:
          "Solve 15 DP problems from UVa and Codeforces. Focus on optimization problems and memoization techniques for ACM ICPC preparation.",
        dueDate: nextMonth,
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        subjectArea: "Computer Science",
        tags: ["dynamic-programming", "competitive-programming", "algorithms"],
        estimatedTime: 600, // 10 hours
        userId: student1.id,
      },
    ],
  });

  console.log("✅ Tasks created");

  // Create Notes Groups (Bangladesh academic context)
  const notesGroup1 = await prisma.notesGroup.create({
    data: {
      name: "ACM ICPC Preparation Notes",
      description:
        "Collection of algorithms, data structures, and mathematical concepts for competitive programming",
      userId: student1.id,
    },
  });

  const notesGroup2 = await prisma.notesGroup.create({
    data: {
      name: "Advanced Mathematics for CS",
      description:
        "Discrete mathematics, linear algebra, and number theory notes for computer science applications",
      userId: student2.id,
    },
  });

  console.log("✅ Notes groups created");

  // Create sample file content for notes
  const samplePdfContent = Buffer.from(
    "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Sample Algorithm Notes) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000194 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n294\n%%EOF"
  );

  const sampleTextContent = Buffer.from(
    "Advanced Dynamic Programming Techniques\n\n1. Memoization vs Tabulation\n- Top-down approach (memoization)\n- Bottom-up approach (tabulation)\n\n2. Common DP Patterns\n- Linear DP\n- Interval DP\n- Tree DP\n- Digit DP\n\n3. Optimization Techniques\n- Space optimization\n- Matrix exponentiation\n- Convex hull optimization\n\nExamples:\n- Longest Common Subsequence\n- Knapsack Problem\n- Edit Distance\n- Coin Change"
  );

  // Create Notes with file attachments
  await prisma.note.createMany({
    data: [
      {
        title: "Dynamic Programming Fundamentals",
        visibility: "PUBLIC",
        file: sampleTextContent,
        tags: ["algorithms", "dynamic-programming", "optimization"],
        authorId: student1.id,
        notesGroupId: notesGroup1.id,
      },
      {
        title: "Graph Algorithms Cheat Sheet",
        visibility: "PUBLIC",
        file: samplePdfContent,
        tags: ["algorithms", "graphs", "bfs", "dfs", "shortest-path"],
        authorId: student1.id,
        notesGroupId: notesGroup1.id,
      },
      {
        title: "Number Theory for Programming Contests",
        visibility: "SHARED",
        file: Buffer.from(
          "Modular Arithmetic Rules:\n\n(a + b) mod m = ((a mod m) + (b mod m)) mod m\n(a * b) mod m = ((a mod m) * (b mod m)) mod m\n\nFermat's Little Theorem:\nIf p is prime and gcd(a,p) = 1, then a^(p-1) ≡ 1 (mod p)\n\nEuler's Totient Function:\nφ(n) = number of integers ≤ n that are coprime to n\n\nChinese Remainder Theorem:\nSystem of congruences can be solved if moduli are pairwise coprime"
        ),
        tags: ["number-theory", "modular-arithmetic", "contest-math"],
        authorId: student2.id,
        notesGroupId: notesGroup2.id,
      },
      {
        title: "Linear Algebra for Computer Graphics",
        visibility: "PRIVATE",
        file: Buffer.from(
          "Matrix Operations in Computer Graphics:\n\n1. Translation Matrix:\n[1 0 tx]\n[0 1 ty]\n[0 0 1 ]\n\n2. Rotation Matrix (2D):\n[cos θ  -sin θ  0]\n[sin θ   cos θ  0]\n[0       0      1]\n\n3. Scaling Matrix:\n[sx  0   0]\n[0   sy  0]\n[0   0   1]\n\nComposite Transformations:\nT = T3 * T2 * T1 (applied right to left)"
        ),
        tags: ["linear-algebra", "matrices", "computer-graphics"],
        authorId: student2.id,
        notesGroupId: notesGroup2.id,
      },
    ],
  });

  console.log("✅ Notes created with file attachments");

  // Create study sessions with better progression
  const sessionStartTime1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const sessionStartTime2 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago

  await prisma.studySession.createMany({
    data: [
      {
        startTime: sessionStartTime1,
        endTime: new Date(sessionStartTime1.getTime() + 2 * 60 * 60 * 1000), // 2 hours
        goal: "Complete Red-Black Tree insertion algorithm",
        notes:
          "Implemented basic insertion. Need to work on balancing rotations.",
        completed: true,
        userId: student1.id,
        taskId: (
          await prisma.task.findFirst({
            where: { title: "Implement Red-Black Tree in C++" },
          })
        )?.id,
      },
      {
        startTime: sessionStartTime2,
        endTime: new Date(sessionStartTime2.getTime() + 90 * 60 * 1000), // 1.5 hours
        goal: "Solve modular arithmetic problems",
        notes: "Practiced 10 problems on modular exponentiation and inverse.",
        completed: true,
        userId: student2.id,
        taskId: (
          await prisma.task.findFirst({
            where: { title: "Number Theory Problem Set" },
          })
        )?.id,
      },
      {
        startTime: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
        endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // 3 hours from now
        goal: "Dynamic Programming practice session",
        notes: null,
        completed: false,
        userId: student1.id,
        taskId: (
          await prisma.task.findFirst({
            where: { title: "Dynamic Programming Practice" },
          })
        )?.id,
      },
    ],
  });

  console.log("✅ Study sessions created");

  // Create test attempts for model tests
  const dpAttempt = await prisma.testAttempt.create({
    data: {
      testId: modelTest1.id,
      userId: student1.id,
      status: "COMPLETED",
      startTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(
        now.getTime() - 3 * 24 * 60 * 60 * 1000 + 75 * 60 * 1000
      ), // 75 minutes
      timeSpent: 4500, // 75 minutes in seconds
      score: 125,
      correctAnswers: 7,
      totalQuestions: 9,
      answers: JSON.stringify({
        [questions[0].id]: 1, // correct
        [questions[1].id]: 2, // correct
        [questions[2].id]: 2, // correct
        [questions[3].id]: 1, // correct
        [questions[4].id]: 2, // correct
        [questions[5].id]: 3, // correct
        [questions[6].id]: 2, // correct
        [questions[16].id]: 1, // incorrect
        [questions[17].id]: 2, // incorrect
      }),
    },
  });

  const mathAttempt = await prisma.testAttempt.create({
    data: {
      testId: modelTest2.id,
      userId: student2.id,
      status: "COMPLETED",
      startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      endTime: new Date(
        now.getTime() - 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
      ), // 60 minutes
      timeSpent: 3600, // 60 minutes in seconds
      score: 95,
      correctAnswers: 7,
      totalQuestions: 9,
      answers: JSON.stringify({
        [questions[7].id]: 1, // correct
        [questions[8].id]: 1, // correct
        [questions[9].id]: 1, // correct
        [questions[10].id]: 2, // correct
        [questions[11].id]: 1, // correct
        [questions[12].id]: 1, // correct
        [questions[13].id]: 1, // correct
        [questions[14].id]: 0, // incorrect
        [questions[18].id]: 0, // incorrect
      }),
    },
  });

  console.log("✅ Test attempts created");

  // Update existing contest attempts to have more realistic answers
  await prisma.contestAttempt.updateMany({
    where: { contestId: contest2.id },
    data: {
      answers: JSON.stringify({
        [questions[8].id]: 1, // correct
        [questions[18].id]: 1, // correct
        [questions[20].id]: 1, // correct
        [questions[23].id]: 1, // correct
      }),
    },
  });

  console.log("✅ Contest attempts updated with correct answers");

  console.log("🎉 Database seeded successfully with Bangladesh context!");
  console.log("\n📊 Summary:");
  console.log(`👥 Users: 3 (1 admin from BUET, 2 students from BUET & DU)`);
  console.log(`❓ Questions: ${questions.length} (Math & CS focused)`);
  console.log(`📝 Model Tests: 2 (Data Structures & Advanced Math)`);
  console.log(`🏆 Contests: 2 (Programming Contest & Math Olympiad)`);
  console.log(`📚 Tasks: 3 (CS assignments & Math problems)`);
  console.log(`📖 Notes Groups: 2 (ICPC prep & Advanced Math)`);
  console.log(`📄 Notes: 4 (With sample file attachments)`);
  console.log(`📚 Study Sessions: 3 (Past and future sessions)`);
  console.log(`🔔 Notifications: 3 (Including Bengali welcome message)`);
  console.log(`🎯 Contest Attempts: 2 (Math Olympiad results)`);
  console.log(`📊 Test Attempts: 2 (Model test completions)`);
  console.log("\n👤 Login Credentials:");
  console.log("📧 Email: dr.rahman@cognitia.edu.bd (Admin)");
  console.log("🔑 Password: password123");
  console.log("📧 Email: fahim.ahmed@student.buet.ac.bd (Student)");
  console.log("🔑 Password: password123");
  console.log("📧 Email: rashida.khan@student.du.ac.bd (Student)");
  console.log("🔑 Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
