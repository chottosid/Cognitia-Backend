import { generateId, daysFromNow } from "./study-plan-data.js"

const CURRENT_USER = {
  id: "user_1",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "student",
  avatar: "/placeholder.svg?height=40&width=40",
  bio: "Computer Science student passionate about AI and machine learning.",
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2023-05-20"),
}

const STUDENTS = [
  {
    id: "user_2",
    name: "Alice Smith",
    email: "alice.smith@example.com",
    role: "student",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Physics major with interest in quantum mechanics.",
    createdAt: daysFromNow(-120),
    updatedAt: daysFromNow(-30),
  },
  {
    id: "user_3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "student",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Chemistry student researching organic compounds.",
    createdAt: daysFromNow(-100),
    updatedAt: daysFromNow(-25),
  },
  {
    id: "user_4",
    name: "Carol Williams",
    email: "carol.williams@example.com",
    role: "student",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Mathematics enthusiast focusing on abstract algebra.",
    createdAt: daysFromNow(-90),
    updatedAt: daysFromNow(-20),
  },
]

const NOTES_GROUPS = [
  {
    id: "group_1",
    name: "Computer Science",
    description: "Notes related to algorithms, data structures, and programming concepts.",
    userId: CURRENT_USER.id,
    createdAt: daysFromNow(-60),
    updatedAt: daysFromNow(-30),
  },
  {
    id: "group_2",
    name: "Mathematics",
    description: "Notes on calculus, linear algebra, and discrete mathematics.",
    userId: CURRENT_USER.id,
    createdAt: daysFromNow(-55),
    updatedAt: daysFromNow(-25),
  },
  {
    id: "group_3",
    name: "Physics",
    description: "Notes on classical mechanics, electromagnetism, and quantum physics.",
    userId: CURRENT_USER.id,
    createdAt: daysFromNow(-50),
    updatedAt: daysFromNow(-20),
  },
  {
    id: "group_4",
    name: "Chemistry",
    description: "Notes on organic chemistry, biochemistry, and chemical bonding.",
    userId: CURRENT_USER.id,
    createdAt: daysFromNow(-45),
    updatedAt: daysFromNow(-15),
  },
]

const NOTES = [
  {
    id: generateId(),
    authorId: CURRENT_USER.id,
    notesGroupId: NOTES_GROUPS[0].id,
    title: "Data Structures",
    visibility: "private",
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-5),
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
        updatedAt: daysFromNow(-5),
        size: 1024,
      },
      {
        id: generateId(),
        name: "Data Structures",
        type: "directory",
        updatedAt: daysFromNow(-3),
        size: 0,
        children: [
          {
            id: generateId(),
            name: "Arrays",
            type: "file",
            content:
              "# Arrays\n\nAn array is a collection of elements stored at contiguous memory locations. It is the simplest data structure where each element can be accessed using an index.\n\n## Characteristics of Arrays\n\n- Fixed size (in most languages)\n- Homogeneous elements (same data type)\n- Random access (constant time access to any element)\n- Contiguous memory allocation\n\n## Operations on Arrays\n\n- **Access**: O(1) - Constant time complexity\n- **Search**: O(n) - Linear time complexity (for unsorted arrays)\n- **Insertion**: O(n) - Linear time complexity (worst case)\n- **Deletion**: O(n) - Linear time complexity (worst case)\n\n## Types of Arrays\n\n1. **One-dimensional Arrays**: Linear arrays with elements arranged in a single row\n2. **Multi-dimensional Arrays**: Arrays with elements arranged in multiple rows and columns\n\n## Implementation\n\n```javascript\n// Declaring and initializing an array in JavaScript\nconst numbers = [1, 2, 3, 4, 5];\n\n// Accessing elements\nconst firstElement = numbers[0]; // 1\nconst thirdElement = numbers[2]; // 3\n\n// Modifying elements\nnumbers[4] = 10; // [1, 2, 3, 4, 10]\n\n// Array methods\nnumbers.push(6); // Add to end: [1, 2, 3, 4, 10, 6]\nnumbers.pop(); // Remove from end: [1, 2, 3, 4, 10]\nnumbers.unshift(0); // Add to beginning: [0, 1, 2, 3, 4, 10]\nnumbers.shift(); // Remove from beginning: [1, 2, 3, 4, 10]\n```",
            updatedAt: daysFromNow(-4),
            size: 1152,
          },
          {
            id: generateId(),
            name: "Linked Lists",
            type: "file",
            content:
              "# Linked Lists\n\nA linked list is a linear data structure where each element (node) contains data and a reference to the next node in the sequence.\n\n## Structure of a Node\n\n```\nclass Node {\n    data;\n    next;\n}\n```\n\n## Characteristics of Linked Lists\n\n- Dynamic size (can grow or shrink during execution)\n- Efficient insertions and deletions (when position is known)\n- Sequential access (elements must be accessed in order)\n\n## Operations on Linked Lists\n\n- **Access**: O(n) - Linear time complexity\n- **Search**: O(n) - Linear time complexity\n- **Insertion**: O(1) - Constant time complexity (when position is known)\n- **Deletion**: O(1) - Constant time complexity (when position is known)\n\n## Implementation\n\n```javascript\nclass Node {\n    constructor(data) {\n        this.data = data;\n        this.next = null;\n    }\n}\n\nclass LinkedList {\n    constructor() {\n        this.head = null;\n        this.size = 0;\n    }\n    \n    // Add a node to the end of the list\n    append(data) {\n        const newNode = new Node(data);\n        \n        if (!this.head) {\n            this.head = newNode;\n            return;\n        }\n        \n        let current = this.head;\n        while (current.next) {\n            current = current.next;\n        }\n        \n        current.next = newNode;\n        this.size++;\n    }\n    \n    // Add more methods as needed...\n}\n```",
            updatedAt: daysFromNow(-3),
            size: 1280,
          },
          {
            id: generateId(),
            name: "Doubly Linked Lists",
            type: "file",
            content:
              "# Doubly Linked Lists\n\nA doubly linked list is a linear data structure where each element (node) contains data and references to both the next and previous nodes in the sequence.\n\n## Structure of a Node\n\n```\nclass Node {\n    data;\n    next;\n    prev;\n}\n```\n\n## Characteristics of Doubly Linked Lists\n\n- Dynamic size (can grow or shrink during execution)\n- Efficient insertions and deletions (when position is known)\n- Bidirectional traversal (can be traversed in both directions)\n\n## Operations on Doubly Linked Lists\n\n- **Access**: O(n) - Linear time complexity\n- **Search**: O(n) - Linear time complexity\n- **Insertion**: O(1) - Constant time complexity (when position is known)\n- **Deletion**: O(1) - Constant time complexity (when position is known)\n\n## Implementation\n\n```javascript\nclass Node {\n    constructor(data) {\n        this.data = data;\n        this.next = null;\n        this.prev = null;\n    }\n}\n\nclass DoublyLinkedList {\n    constructor() {\n        this.head = null;\n        this.tail = null;\n        this.size = 0;\n    }\n    \n    // Add a node to the end of the list\n    append(data) {\n        const newNode = new Node(data);\n        \n        if (!this.head) {\n            this.head = newNode;\n            this.tail = newNode;\n            return;\n        }\n        \n        newNode.prev = this.tail;\n        this.tail.next = newNode;\n        this.tail = newNode;\n        this.size++;\n    }\n    \n    // Add more methods as needed...\n}\n```",
            updatedAt: daysFromNow(-4),
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
    createdAt: daysFromNow(-19),
    updatedAt: daysFromNow(-2),
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
        updatedAt: daysFromNow(-2),
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
    createdAt: daysFromNow(-14),
    updatedAt: daysFromNow(-3),
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
        updatedAt: daysFromNow(-3),
        size: 896,
      },
    ],
  },
]

const NOTE_VERSIONS = NOTES.map((note, index) => ({
  id: generateId(),
  noteId: note.id,
  content: `These are my notes on ${note.title}. This is version 1 of the content.`,
  versionNumber: 1,
  createdAt: note.createdAt,
}))

const RECENT_NOTES = NOTES.map((note, index) => ({
  id: note.id,
  title: note.title,
  lastViewed: note.updatedAt,
}))

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
    createdAt: daysFromNow(-5),
    updatedAt: daysFromNow(-3),
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
        updatedAt: daysFromNow(-3),
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
    createdAt: daysFromNow(-10),
    updatedAt: daysFromNow(-8),
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
        updatedAt: daysFromNow(-8),
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
    createdAt: daysFromNow(-15),
    updatedAt: daysFromNow(-12),
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
        updatedAt: daysFromNow(-12),
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
    createdAt: daysFromNow(-20),
    updatedAt: daysFromNow(-18),
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
        updatedAt: daysFromNow(-18),
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
    createdAt: daysFromNow(-25),
    updatedAt: daysFromNow(-22),
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
        updatedAt: daysFromNow(-22),
        size: 896,
      },
    ],
  },
]

// Function to format file size
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return bytes + " B"
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB"
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }
}

// Function to get a note by ID
function getNoteById(id) {
  return [...NOTES, ...GLOBAL_NOTES].find((note) => note.id === id)
}

// Function to get a file by ID from a note
function getFileById(note, fileId) {
  if (!note || !note.files) return null

  const findFile = (files) => {
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
function incrementNoteViewCount(noteId) {
  const note = getNoteById(noteId)
  if (note && "viewCount" in note) {
    note.viewCount = (note.viewCount ?? 0) + 1
  }
}

// Function to update note rating
function updateNoteRating(noteId, rating) {
  const note = getNoteById(noteId)
  if (note && "rating" in note && "ratingCount" in note) {
    const currentRating = note.rating ?? 0
    const currentRatingCount = note.ratingCount ?? 0
    const totalRating = currentRating * currentRatingCount
    note.ratingCount = currentRatingCount + 1
    note.rating = (totalRating + rating) / note.ratingCount
  }
}

export {
  CURRENT_USER,
  STUDENTS,
  NOTES_GROUPS,
  NOTES,
  NOTE_VERSIONS,
  RECENT_NOTES,
  formatFileSize,
  getNoteById,
  getFileById,
  incrementNoteViewCount,
  updateNoteRating,
  generateId,
}