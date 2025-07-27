import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Question bank
  const questions = await Promise.all([
    // Mathematics
    prisma.questionBank.create({
      data: {
        question: "What is the value of π (pi) to two decimal places?",
        explanation: "The value of π (pi) to two decimal places is 3.14.",
        options: ["3.12", "3.14", "3.16", "3.18"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Geometry", "Constants"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the derivative of e^x?",
        explanation: "The derivative of e^x is e^x.",
        options: ["e^x", "x^e", "e^(x-1)", "x"],
        correctAnswer: 0,
        subject: "Mathematics",
        topics: ["Calculus", "Derivatives"],
        difficulty: "EASY",
      },
    }),

    // Physics
    prisma.questionBank.create({
      data: {
        question: "What is the acceleration due to gravity on Earth?",
        explanation: "The acceleration due to gravity on Earth is approximately 9.8 m/s².",
        options: ["9.8 m/s²", "10 m/s²", "8.9 m/s²", "9.5 m/s²"],
        correctAnswer: 0,
        subject: "Physics",
        topics: ["Mechanics", "Gravity"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the first law of thermodynamics?",
        explanation: "The first law of thermodynamics states that energy cannot be created or destroyed, only transformed.",
        options: ["Energy is constant", "Energy is created", "Energy is destroyed", "Energy is infinite"],
        correctAnswer: 0,
        subject: "Physics",
        topics: ["Thermodynamics", "Laws"],
        difficulty: "MEDIUM",
      },
    }),

    // Chemistry
    prisma.questionBank.create({
      data: {
        question: "What is the chemical symbol for gold?",
        explanation: "The chemical symbol for gold is Au.",
        options: ["Ag", "Au", "Gd", "Go"],
        correctAnswer: 1,
        subject: "Chemistry",
        topics: ["Periodic Table", "Elements"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the main component of natural gas?",
        explanation: "The main component of natural gas is methane (CH₄).",
        options: ["Methane", "Ethane", "Propane", "Butane"],
        correctAnswer: 0,
        subject: "Chemistry",
        topics: ["Organic Chemistry", "Fuels"],
        difficulty: "MEDIUM",
      },
    }),

    // Biology
    prisma.questionBank.create({
      data: {
        question: "What is the basic unit of heredity?",
        explanation: "The basic unit of heredity is the gene.",
        options: ["Chromosome", "Gene", "DNA", "RNA"],
        correctAnswer: 1,
        subject: "Biology",
        topics: ["Genetics", "Heredity"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the function of chlorophyll in plants?",
        explanation: "Chlorophyll absorbs light energy for photosynthesis.",
        options: ["Absorbs water", "Absorbs light", "Stores energy", "Produces oxygen"],
        correctAnswer: 1,
        subject: "Biology",
        topics: ["Plant Biology", "Photosynthesis"],
        difficulty: "EASY",
      },
    }),

    // Computer Science
    prisma.questionBank.create({
      data: {
        question: "What is the primary purpose of an operating system?",
        explanation: "An operating system manages hardware and software resources and provides services for computer programs.",
        options: ["To run applications", "To manage resources", "To store data", "To connect to the internet"],
        correctAnswer: 1,
        subject: "Computer Science",
        topics: ["Operating Systems", "Basics"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the difference between HTTP and HTTPS?",
        explanation: "HTTPS is the secure version of HTTP, using encryption for secure communication.",
        options: ["HTTPS is faster", "HTTPS is secure", "HTTP is secure", "No difference"],
        correctAnswer: 1,
        subject: "Computer Science",
        topics: ["Networking", "Protocols"],
        difficulty: "MEDIUM",
      },
    }),

    // English
    prisma.questionBank.create({
      data: {
        question: "What is the antonym of 'happy'?",
        explanation: "The antonym of 'happy' is 'sad'.",
        options: ["Joyful", "Sad", "Excited", "Angry"],
        correctAnswer: 1,
        subject: "English",
        topics: ["Vocabulary", "Antonyms"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is a noun?",
        explanation: "A noun is a word that represents a person, place, thing, or idea.",
        options: ["A verb", "A noun", "An adjective", "An adverb"],
        correctAnswer: 1,
        subject: "English",
        topics: ["Grammar", "Parts of Speech"],
        difficulty: "EASY",
      },
    }),

    // History
    prisma.questionBank.create({
      data: {
        question: "Who discovered America?",
        explanation: "Christopher Columbus is credited with discovering America in 1492.",
        options: ["Vasco da Gama", "Christopher Columbus", "Ferdinand Magellan", "James Cook"],
        correctAnswer: 1,
        subject: "History",
        topics: ["Exploration", "Discoveries"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What was the main cause of World War I?",
        explanation: "The assassination of Archduke Franz Ferdinand of Austria was the immediate cause of World War I.",
        options: ["Economic crisis", "Assassination", "Territorial disputes", "Colonialism"],
        correctAnswer: 1,
        subject: "History",
        topics: ["World Wars", "Causes"],
        difficulty: "MEDIUM",
      },
    }),

    // Geography
    prisma.questionBank.create({
      data: {
        question: "What is the largest ocean on Earth?",
        explanation: "The Pacific Ocean is the largest ocean on Earth.",
        options: ["Atlantic", "Indian", "Pacific", "Arctic"],
        correctAnswer: 2,
        subject: "Geography",
        topics: ["Oceans", "Earth"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the longest river in the world?",
        explanation: "The Nile River is traditionally considered the longest river in the world.",
        options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
        correctAnswer: 1,
        subject: "Geography",
        topics: ["Rivers", "Earth"],
        difficulty: "MEDIUM",
      },
    }),

    // Economics
    prisma.questionBank.create({
      data: {
        question: "What is the definition of inflation?",
        explanation: "Inflation is the rate at which the general level of prices for goods and services rises.",
        options: ["Decrease in prices", "Increase in prices", "Stable prices", "Fluctuating prices"],
        correctAnswer: 1,
        subject: "Economics",
        topics: ["Macroeconomics", "Inflation"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is a market economy?",
        explanation: "A market economy is an economic system where supply and demand determine prices and production.",
        options: ["Government-controlled", "Market-controlled", "Mixed", "Traditional"],
        correctAnswer: 1,
        subject: "Economics",
        topics: ["Economic Systems", "Markets"],
        difficulty: "MEDIUM",
      },
    }),

    // Psychology
    prisma.questionBank.create({
      data: {
        question: "What is the study of human behavior called?",
        explanation: "The study of human behavior is called psychology.",
        options: ["Sociology", "Psychology", "Anthropology", "Philosophy"],
        correctAnswer: 1,
        subject: "Psychology",
        topics: ["Basics", "Behavior"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is cognitive dissonance?",
        explanation: "Cognitive dissonance is the mental discomfort experienced when holding two conflicting beliefs.",
        options: ["Mental clarity", "Cognitive harmony", "Cognitive dissonance", "Emotional stability"],
        correctAnswer: 2,
        subject: "Psychology",
        topics: ["Cognition", "Theories"],
        difficulty: "MEDIUM",
      },
    }),
  ]);

  console.log("✅ Question bank created with", questions.length, "questions");

  // Check if the admin user already exists
  let admin = await prisma.user.findUnique({
    where: { email: "rashida.khan@student.du.ac.bd" },
  });

  // If the admin user does not exist, create it
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("secureadminpassword123", salt); // Replace with a secure password

    admin = await prisma.user.create({
      data: {
        name: "Dr. Mohammad Rahman",
        email: "dr.rahman@cognitia.edu.bd",
        password: hashedPassword, // Replace with a secure hashed password
      },
    });
  }

  // Create Model Tests and assign questions
  const modelTest1 = await prisma.modelTest.create({
    data: {
      title: "Advanced Mathematics Test",
      description: "A comprehensive test covering advanced topics in mathematics.",
      timeLimit: 60,
      subjects: ["Mathematics"],
      topics: ["Geometry", "Calculus"],
      difficulty: "MEDIUM",
      passingScore: 70,
      totalPoints: 100,
      userId: admin.id,
    },
  });

  const modelTest2 = await prisma.modelTest.create({
    data: {
      title: "Physics Fundamentals Test",
      description: "A test focusing on fundamental concepts in physics.",
      timeLimit: 60,
      subjects: ["Physics"],
      topics: ["Mechanics", "Thermodynamics"],
      difficulty: "EASY",
      passingScore: 60,
      totalPoints: 100,
      userId: admin.id,
    },
  });

  const modelTest3 = await prisma.modelTest.create({
    data: {
      title: "Chemistry Basics Test",
      description: "A test covering fundamental concepts in chemistry.",
      timeLimit: 60,
      subjects: ["Chemistry"],
      topics: ["Periodic Table", "Organic Chemistry"],
      difficulty: "EASY",
      passingScore: 65,
      totalPoints: 100,
      userId: admin.id,
    },
  });

  const modelTest4 = await prisma.modelTest.create({
    data: {
      title: "Biology Essentials Test",
      description: "A test focusing on essential topics in biology.",
      timeLimit: 60,
      subjects: ["Biology"],
      topics: ["Genetics", "Plant Biology"],
      difficulty: "EASY",
      passingScore: 60,
      totalPoints: 100,
      userId: admin.id,
    },
  });

  const modelTest5 = await prisma.modelTest.create({
    data: {
      title: "English Grammar and Vocabulary Test",
      description: "A test focusing on grammar and vocabulary skills.",
      timeLimit: 60,
      subjects: ["English"],
      topics: ["Grammar", "Vocabulary"],
      difficulty: "EASY",
      passingScore: 70,
      totalPoints: 100,
      userId: admin.id,
    },
  });

  const modelTest6 = await prisma.modelTest.create({
    data: {
      title: "World History Test",
      description: "A test covering significant events in world history.",
      timeLimit: 60,
      subjects: ["History"],
      topics: ["Exploration", "World Wars"],
      difficulty: "MEDIUM",
      passingScore: 65,
      totalPoints: 100,
      userId: admin.id,
    },
  });

  const modelTest7 = await prisma.modelTest.create({
    data: {
      title: "Geography Knowledge Test",
      description: "A test focusing on geographical features and facts.",
      timeLimit: 60,
      subjects: ["Geography"],
      topics: ["Oceans", "Rivers"],
      difficulty: "EASY",
      passingScore: 60,
      totalPoints: 100,
      userId: admin.id,
    },
  });

  const modelTest8 = await prisma.modelTest.create({
    data: {
      title: "Economics Fundamentals Test",
      description: "A test covering basic economic principles.",
      timeLimit: 60,
      subjects: ["Economics"],
      topics: ["Macroeconomics", "Economic Systems"],
      difficulty: "EASY",
      passingScore: 65,
      totalPoints: 100,
      userId: admin.id,
    },
  });

  const modelTest9 = await prisma.modelTest.create({
    data: {
      title: "Psychology Basics Test",
      description: "A test focusing on fundamental concepts in psychology.",
      timeLimit: 60,
      subjects: ["Psychology"],
      topics: ["Basics", "Cognition"],
      difficulty: "EASY",
      passingScore: 60,
      totalPoints: 100,
      userId: admin.id,
    },
  });

  const additionalQuestions = await Promise.all([
    // Mathematics
    prisma.questionBank.create({
      data: {
        question: "What is the square root of 144?",
        explanation: "The square root of 144 is 12.",
        options: ["10", "11", "12", "13"],
        correctAnswer: 2,
        subject: "Mathematics",
        topics: ["Algebra", "Roots"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the formula for the area of a circle?",
        explanation: "The area of a circle is given by πr², where r is the radius.",
        options: ["2πr", "πr²", "πd", "r²"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Geometry", "Formulas"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the value of sin(90°)?",
        explanation: "The value of sin(90°) is 1.",
        options: ["0", "0.5", "1", "Undefined"],
        correctAnswer: 2,
        subject: "Mathematics",
        topics: ["Trigonometry", "Functions"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the sum of the angles in a triangle?",
        explanation: "The sum of the angles in a triangle is 180°.",
        options: ["90°", "180°", "270°", "360°"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Geometry", "Angles"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the value of 2³?",
        explanation: "The value of 2³ is 8.",
        options: ["6", "8", "9", "12"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Algebra", "Exponents"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the formula for the perimeter of a rectangle?",
        explanation: "The perimeter of a rectangle is 2 × (length + width).",
        options: ["l × w", "2 × (l + w)", "l + w", "2 × l × w"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Geometry", "Formulas"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the value of log₁₀(100)?",
        explanation: "The value of log₁₀(100) is 2.",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Logarithms", "Functions"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the formula for the volume of a sphere?",
        explanation: "The volume of a sphere is (4/3)πr³, where r is the radius.",
        options: ["πr²", "(4/3)πr³", "2πr", "πr³"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Geometry", "Formulas"],
        difficulty: "MEDIUM",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the derivative of x²?",
        explanation: "The derivative of x² is 2x.",
        options: ["x", "2x", "x²", "2x²"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Calculus", "Derivatives"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the value of 0! (zero factorial)?",
        explanation: "The value of 0! is 1.",
        options: ["0", "1", "Undefined", "Infinity"],
        correctAnswer: 1,
        subject: "Mathematics",
        topics: ["Algebra", "Factorials"],
        difficulty: "EASY",
      },
    }),
  ]);

  // Additional Physics Questions
  const additionalPhysicsQuestions = await Promise.all([
    prisma.questionBank.create({
      data: {
        question: "What is the unit of force?",
        explanation: "The unit of force is the Newton (N).",
        options: ["Joule", "Newton", "Pascal", "Watt"],
        correctAnswer: 1,
        subject: "Physics",
        topics: ["Mechanics", "Units"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the formula for kinetic energy?",
        explanation: "The formula for kinetic energy is (1/2)mv², where m is mass and v is velocity.",
        options: ["mv²", "(1/2)mv²", "m²v", "(1/2)m²v"],
        correctAnswer: 1,
        subject: "Physics",
        topics: ["Energy", "Formulas"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the acceleration due to gravity on the Moon?",
        explanation: "The acceleration due to gravity on the Moon is approximately 1.6 m/s².",
        options: ["9.8 m/s²", "1.6 m/s²", "3.7 m/s²", "0.8 m/s²"],
        correctAnswer: 1,
        subject: "Physics",
        topics: ["Gravity", "Astronomy"],
        difficulty: "MEDIUM",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is Ohm's Law?",
        explanation: "Ohm's Law states that V = IR, where V is voltage, I is current, and R is resistance.",
        options: ["V = IR", "I = VR", "R = VI", "V = I²R"],
        correctAnswer: 0,
        subject: "Physics",
        topics: ["Electricity", "Laws"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the SI unit of power?",
        explanation: "The SI unit of power is the Watt (W).",
        options: ["Joule", "Watt", "Newton", "Pascal"],
        correctAnswer: 1,
        subject: "Physics",
        topics: ["Units", "Energy"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the principle of conservation of energy?",
        explanation: "The principle of conservation of energy states that energy cannot be created or destroyed, only transformed.",
        options: ["Energy is infinite", "Energy is constant", "Energy is created", "Energy is destroyed"],
        correctAnswer: 1,
        subject: "Physics",
        topics: ["Energy", "Principles"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the formula for work done?",
        explanation: "The formula for work done is W = F × d × cos(θ), where F is force, d is displacement, and θ is the angle between them.",
        options: ["F × d", "F × d × cos(θ)", "F × d × sin(θ)", "F × d × tan(θ)"],
        correctAnswer: 1,
        subject: "Physics",
        topics: ["Work", "Formulas"],
        difficulty: "MEDIUM",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the formula for pressure?",
        explanation: "The formula for pressure is P = F/A, where F is force and A is area.",
        options: ["F × A", "F/A", "A/F", "F²/A"],
        correctAnswer: 1,
        subject: "Physics",
        topics: ["Pressure", "Formulas"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the unit of electric charge?",
        explanation: "The unit of electric charge is the Coulomb (C).",
        options: ["Ampere", "Coulomb", "Volt", "Ohm"],
        correctAnswer: 1,
        subject: "Physics",
        topics: ["Electricity", "Units"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the formula for momentum?",
        explanation: "The formula for momentum is p = mv, where m is mass and v is velocity.",
        options: ["mv", "m/v", "v/m", "m²v"],
        correctAnswer: 0,
        subject: "Physics",
        topics: ["Mechanics", "Formulas"],
        difficulty: "EASY",
      },
    }),
  ]);

  const additionalChemistryQuestions = await Promise.all([
    prisma.questionBank.create({
      data: {
        question: "What is the atomic number of hydrogen?",
        explanation: "The atomic number of hydrogen is 1.",
        options: ["1", "2", "3", "4"],
        correctAnswer: 0,
        subject: "Chemistry",
        topics: ["Periodic Table", "Elements"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the chemical formula for water?",
        explanation: "The chemical formula for water is H₂O.",
        options: ["H₂O", "H₂O₂", "HO", "H₂"],
        correctAnswer: 0,
        subject: "Chemistry",
        topics: ["Compounds", "Formulas"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the pH of a neutral solution?",
        explanation: "The pH of a neutral solution is 7.",
        options: ["6", "7", "8", "9"],
        correctAnswer: 1,
        subject: "Chemistry",
        topics: ["Acids and Bases", "pH Scale"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the main gas found in the Earth's atmosphere?",
        explanation: "The main gas found in the Earth's atmosphere is nitrogen.",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
        correctAnswer: 1,
        subject: "Chemistry",
        topics: ["Gases", "Atmosphere"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the chemical symbol for sodium?",
        explanation: "The chemical symbol for sodium is Na.",
        options: ["Na", "S", "N", "So"],
        correctAnswer: 0,
        subject: "Chemistry",
        topics: ["Periodic Table", "Elements"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the process of converting a liquid to a gas called?",
        explanation: "The process of converting a liquid to a gas is called evaporation.",
        options: ["Condensation", "Evaporation", "Sublimation", "Freezing"],
        correctAnswer: 1,
        subject: "Chemistry",
        topics: ["States of Matter", "Processes"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the chemical formula for methane?",
        explanation: "The chemical formula for methane is CH₄.",
        options: ["CH₄", "C₂H₆", "C₃H₈", "C₄H₁₀"],
        correctAnswer: 0,
        subject: "Chemistry",
        topics: ["Organic Chemistry", "Compounds"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the process of a solid turning directly into a gas called?",
        explanation: "The process of a solid turning directly into a gas is called sublimation.",
        options: ["Evaporation", "Condensation", "Sublimation", "Freezing"],
        correctAnswer: 2,
        subject: "Chemistry",
        topics: ["States of Matter", "Processes"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the chemical symbol for gold?",
        explanation: "The chemical symbol for gold is Au.",
        options: ["Ag", "Au", "Gd", "Go"],
        correctAnswer: 1,
        subject: "Chemistry",
        topics: ["Periodic Table", "Elements"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the main component of natural gas?",
        explanation: "The main component of natural gas is methane (CH₄).",
        options: ["Methane", "Ethane", "Propane", "Butane"],
        correctAnswer: 0,
        subject: "Chemistry",
        topics: ["Organic Chemistry", "Fuels"],
        difficulty: "MEDIUM",
      },
    }),
  ]);

  const additionalBiologyQuestions = await Promise.all([
    prisma.questionBank.create({
      data: {
        question: "What is the powerhouse of the cell?",
        explanation: "The mitochondria is known as the powerhouse of the cell.",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
        correctAnswer: 1,
        subject: "Biology",
        topics: ["Cell Biology", "Organelles"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the process by which plants make their food?",
        explanation: "Photosynthesis is the process by which plants make their food using sunlight.",
        options: ["Respiration", "Photosynthesis", "Transpiration", "Digestion"],
        correctAnswer: 1,
        subject: "Biology",
        topics: ["Plant Biology", "Processes"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the basic structural unit of the human body?",
        explanation: "The cell is the basic structural unit of the human body.",
        options: ["Tissue", "Organ", "Cell", "System"],
        correctAnswer: 2,
        subject: "Biology",
        topics: ["Human Anatomy", "Basics"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the function of red blood cells?",
        explanation: "Red blood cells transport oxygen throughout the body.",
        options: ["Fight infections", "Transport oxygen", "Clot blood", "Store nutrients"],
        correctAnswer: 1,
        subject: "Biology",
        topics: ["Human Anatomy", "Circulatory System"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the largest organ in the human body?",
        explanation: "The skin is the largest organ in the human body.",
        options: ["Liver", "Skin", "Heart", "Lungs"],
        correctAnswer: 1,
        subject: "Biology",
        topics: ["Human Anatomy", "Organs"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the function of the stomata in plants?",
        explanation: "Stomata are responsible for gas exchange in plants.",
        options: ["Absorb water", "Exchange gases", "Store food", "Produce energy"],
        correctAnswer: 1,
        subject: "Biology",
        topics: ["Plant Biology", "Structures"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the genetic material in most living organisms?",
        explanation: "DNA is the genetic material in most living organisms.",
        options: ["RNA", "DNA", "Protein", "Lipids"],
        correctAnswer: 1,
        subject: "Biology",
        topics: ["Genetics", "Molecular Biology"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the process of cell division in eukaryotic cells?",
        explanation: "Mitosis is the process of cell division in eukaryotic cells.",
        options: ["Meiosis", "Mitosis", "Binary Fission", "Budding"],
        correctAnswer: 1,
        subject: "Biology",
        topics: ["Cell Biology", "Division"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the role of chlorophyll in plants?",
        explanation: "Chlorophyll absorbs light energy for photosynthesis.",
        options: ["Absorb water", "Absorb light", "Store energy", "Produce oxygen"],
        correctAnswer: 1,
        subject: "Biology",
        topics: ["Plant Biology", "Photosynthesis"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the smallest unit of life?",
        explanation: "The cell is the smallest unit of life.",
        options: ["Atom", "Molecule", "Cell", "Tissue"],
        correctAnswer: 2,
        subject: "Biology",
        topics: ["Basics", "Cell Biology"],
        difficulty: "EASY",
      },
    }),
  ]);

  const additionalEnglishQuestions = await Promise.all([
    prisma.questionBank.create({
      data: {
        question: "What is the synonym of 'quick'?",
        explanation: "A synonym for 'quick' is 'fast'.",
        options: ["Slow", "Fast", "Lazy", "Calm"],
        correctAnswer: 1,
        subject: "English",
        topics: ["Vocabulary", "Synonyms"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the plural form of 'child'?",
        explanation: "The plural form of 'child' is 'children'.",
        options: ["Childs", "Children", "Childes", "Child"],
        correctAnswer: 1,
        subject: "English",
        topics: ["Grammar", "Plurals"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the past tense of 'run'?",
        explanation: "The past tense of 'run' is 'ran'.",
        options: ["Run", "Ran", "Running", "Runned"],
        correctAnswer: 1,
        subject: "English",
        topics: ["Grammar", "Tenses"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the antonym of 'beautiful'?",
        explanation: "An antonym for 'beautiful' is 'ugly'.",
        options: ["Pretty", "Ugly", "Attractive", "Charming"],
        correctAnswer: 1,
        subject: "English",
        topics: ["Vocabulary", "Antonyms"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is a verb?",
        explanation: "A verb is a word that describes an action, state, or occurrence.",
        options: ["A noun", "A verb", "An adjective", "An adverb"],
        correctAnswer: 1,
        subject: "English",
        topics: ["Grammar", "Parts of Speech"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the superlative form of 'good'?",
        explanation: "The superlative form of 'good' is 'best'.",
        options: ["Good", "Better", "Best", "Goodest"],
        correctAnswer: 2,
        subject: "English",
        topics: ["Grammar", "Comparatives"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the meaning of the idiom 'break the ice'?",
        explanation: "'Break the ice' means to initiate a conversation in a social setting.",
        options: ["To break something", "To start a conversation", "To freeze water", "To create tension"],
        correctAnswer: 1,
        subject: "English",
        topics: ["Idioms", "Expressions"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the function of an adjective?",
        explanation: "An adjective describes or modifies a noun.",
        options: ["Describes a verb", "Describes a noun", "Describes an adverb", "Describes a pronoun"],
        correctAnswer: 1,
        subject: "English",
        topics: ["Grammar", "Parts of Speech"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the opposite of 'increase'?",
        explanation: "The opposite of 'increase' is 'decrease'.",
        options: ["Grow", "Decrease", "Expand", "Rise"],
        correctAnswer: 1,
        subject: "English",
        topics: ["Vocabulary", "Antonyms"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What is the meaning of the word 'benevolent'?",
        explanation: "'Benevolent' means kind and generous.",
        options: ["Cruel", "Kind", "Selfish", "Angry"],
        correctAnswer: 1,
        subject: "English",
        topics: ["Vocabulary", "Meanings"],
        difficulty: "EASY",
      },
    }),
  ]);

  // Additional History Questions
  const additionalHistoryQuestions = await Promise.all([
    prisma.questionBank.create({
      data: {
        question: "Who was the first President of the United States?",
        explanation: "George Washington was the first President of the United States.",
        options: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "John Adams"],
        correctAnswer: 1,
        subject: "History",
        topics: ["American History", "Presidents"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What year did World War II end?",
        explanation: "World War II ended in 1945.",
        options: ["1940", "1942", "1945", "1950"],
        correctAnswer: 2,
        subject: "History",
        topics: ["World Wars", "20th Century"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "Who was known as the Iron Lady?",
        explanation: "Margaret Thatcher, the Prime Minister of the United Kingdom, was known as the Iron Lady.",
        options: ["Indira Gandhi", "Margaret Thatcher", "Angela Merkel", "Queen Elizabeth II"],
        correctAnswer: 1,
        subject: "History",
        topics: ["World Leaders", "20th Century"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What was the main cause of the French Revolution?",
        explanation: "The main cause of the French Revolution was social and economic inequality.",
        options: ["Colonialism", "Economic inequality", "Religious conflict", "Territorial disputes"],
        correctAnswer: 1,
        subject: "History",
        topics: ["Revolutions", "18th Century"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "Who discovered the sea route to India?",
        explanation: "Vasco da Gama discovered the sea route to India in 1498.",
        options: ["Christopher Columbus", "Vasco da Gama", "Ferdinand Magellan", "Marco Polo"],
        correctAnswer: 1,
        subject: "History",
        topics: ["Exploration", "15th Century"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What was the name of the ship on which the Pilgrims traveled to America?",
        explanation: "The Pilgrims traveled to America on the Mayflower.",
        options: ["Santa Maria", "Mayflower", "Endeavour", "Victoria"],
        correctAnswer: 1,
        subject: "History",
        topics: ["American History", "Exploration"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "Who was the first Emperor of Rome?",
        explanation: "Augustus was the first Emperor of Rome.",
        options: ["Julius Caesar", "Augustus", "Nero", "Caligula"],
        correctAnswer: 1,
        subject: "History",
        topics: ["Roman Empire", "Ancient History"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What was the name of the treaty that ended World War I?",
        explanation: "The Treaty of Versailles ended World War I.",
        options: ["Treaty of Paris", "Treaty of Versailles", "Treaty of Ghent", "Treaty of Tordesillas"],
        correctAnswer: 1,
        subject: "History",
        topics: ["World Wars", "20th Century"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "Who was the leader of the Soviet Union during World War II?",
        explanation: "Joseph Stalin was the leader of the Soviet Union during World War II.",
        options: ["Vladimir Lenin", "Joseph Stalin", "Nikita Khrushchev", "Leonid Brezhnev"],
        correctAnswer: 1,
        subject: "History",
        topics: ["World Wars", "20th Century"],
        difficulty: "EASY",
      },
    }),
    prisma.questionBank.create({
      data: {
        question: "What was the name of the first human civilization?",
        explanation: "The Sumerians are considered the first human civilization.",
        options: ["Egyptians", "Sumerians", "Babylonians", "Assyrians"],
        correctAnswer: 1,
        subject: "History",
        topics: ["Ancient History", "Civilizations"],
        difficulty: "EASY",
      },
    }),
  ]);

//   await prisma.questionAssignment.createMany({
//     data: [
//       // Assign additional Mathematics questions to modelTest1
//       { questionId: questions[30].id, modelTestId: modelTest1.id, points: 10 },
//       { questionId: questions[31].id, modelTestId: modelTest1.id, points: 10 },
//       { questionId: questions[32].id, modelTestId: modelTest1.id, points: 10 },
//       { questionId: questions[33].id, modelTestId: modelTest1.id, points: 10 },
//       { questionId: questions[34].id, modelTestId: modelTest1.id, points: 10 },
//       { questionId: questions[35].id, modelTestId: modelTest1.id, points: 10 },
//       { questionId: questions[36].id, modelTestId: modelTest1.id, points: 10 },
//       { questionId: questions[37].id, modelTestId: modelTest1.id, points: 10 },
//       { questionId: questions[38].id, modelTestId: modelTest1.id, points: 10 },
//       { questionId: questions[39].id, modelTestId: modelTest1.id, points: 10 },

//       // Assign additional Physics questions to modelTest2
//       { questionId: questions[40].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[41].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[42].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[43].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[44].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[45].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[46].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[47].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[48].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[49].id, modelTestId: modelTest2.id, points: 10 },

//       // Assign additional Chemistry questions to modelTest3
//       { questionId: questions[50].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[51].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[52].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[53].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[54].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[55].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[56].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[57].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[58].id, modelTestId: modelTest2.id, points: 10 },
//       { questionId: questions[59].id, modelTestId: modelTest2.id, points: 10 },

//       // Assign additional Biology questions to modelTest31
//       { questionId: questions[60].id, modelTestId:modelTest2.id, points: 10 },
//       { questionId: questions[61].id, modelTestId:modelTest2.id, points: 10 },
//       { questionId: questions[62].id, modelTestId:modelTest2.id, points: 10 },
//       { questionId: questions[63].id, modelTestId:modelTest2.id, points: 10 },
//       { questionId: questions[64].id, modelTestId:modelTest2.id, points: 10 },
//       { questionId: questions[65].id, modelTestId:modelTest2.id, points: 10 },
//       { questionId: questions[66].id, modelTestId:modelTest2.id, points: 10 },
//       { questionId: questions[67].id, modelTestId:modelTest2.id, points: 10 },
//       { questionId: questions[68].id, modelTestId:modelTest2.id, points: 10 },
//       { questionId: questions[69].id, modelTestId:modelTest2.id, points: 10 },

//       // Assign additional English questions to modelTest32
//       { questionId: questions[70].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[71].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[72].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[73].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[74].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[75].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[76].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[77].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[78].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[79].id, modelTestId:modelTest1.id, points: 10 },

//       // Assign additional History questions to modelTest33
//       { questionId: questions[80].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[81].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[82].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[83].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[84].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[85].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[86].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[87].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[88].id, modelTestId:modelTest1.id, points: 10 },
//       { questionId: questions[89].id, modelTestId:modelTest1.id, points: 10 },
//     ],
//   });

  console.log("✅ Model tests and question assignments created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });