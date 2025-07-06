import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { LoremIpsum } from "lorem-ipsum";

const prisma = new PrismaClient();

// Enhanced text generator
const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});

// Helper functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomEnum = (values) => values[Math.floor(Math.random() * values.length)];
const randomTags = (count, pool) => {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Constants for data generation
const USER_COUNT = 150;
const NOTES_GROUP_COUNT = 50;
const NOTE_COUNT = 300;
const QUESTION_COUNT = 500;
const ANSWER_COUNT = 1500;
const TASK_COUNT = 400;
const SESSION_COUNT = 800;
const CONTEST_COUNT = 30;
const NOTIFICATION_COUNT = 600;
const VOTE_COUNT = 10000;
const SAVED_ITEM_COUNT = 5000;

const SUBJECTS = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Literature",
    "History",
    "Economics",
    "Psychology",
    "Engineering",
    "Art History",
    "Political Science",
    "Philosophy",
    "Business Administration",
    "Environmental Science"
];

const TAG_POOL = [
    "algorithms", "data-structures", "calculus", "linear-algebra", "quantum",
    "thermodynamics", "organic", "inorganic", "cell-biology", "genetics",
    "poetry", "novels", "world-war", "ancient-history", "microeconomics",
    "macroeconomics", "cognitive", "clinical", "mechanical", "electrical",
    "AI", "machine-learning", "databases", "networking", "operating-systems",
    "statistics", "probability", "electromagnetism", "optics", "biochemistry",
    "ecology", "evolution", "fiction", "non-fiction", "modern-history",
    "behavioral", "social", "civil", "chemical", "software",
    "web-development", "mobile-dev", "cloud-computing", "cybersecurity",
    "number-theory", "geometry", "topology", "differential-equations",
    "quantum-field", "relativity", "particle-physics", "astrophysics",
    "analytical-chem", "physical-chem", "polymer-chem", "nanotechnology",
    "molecular-bio", "zoology", "botany", "microbiology", "biotechnology",
    "american-lit", "british-lit", "world-lit", "creative-writing", "linguistics",
    "european-hist", "asian-hist", "african-hist", "military-hist", "cultural-hist",
    "game-theory", "developmental", "abnormal-psych", "neuroscience", "forensic",
    "aerospace", "biomedical", "industrial", "nuclear", "robotics"
];

const INSTITUTIONS = [
    "Harvard University",
    "Stanford University",
    "MIT",
    "University of Cambridge",
    "ETH Zurich",
    "University of Oxford",
    "California Institute of Technology",
    "Princeton University",
    "Yale University",
    "University of Chicago",
    "Imperial College London",
    "University of Pennsylvania",
    "Columbia University",
    "Cornell University",
    "University of Michigan",
    "Johns Hopkins University",
    "Northwestern University",
    "Duke University",
    "University of California, Berkeley",
    "University of Toronto",
    "University of Tokyo",
    "National University of Singapore",
    "Peking University",
    "Tsinghua University",
    "University of Melbourne"
];

async function main() {
    console.log("🌱 Starting database seed...");
    console.log("📊 Expected data volume:");
    console.log(`- Users: ${USER_COUNT}`);
    console.log(`- Notes Groups: ${NOTES_GROUP_COUNT}`);
    console.log(`- Notes: ${NOTE_COUNT}`);
    console.log(`- Questions: ${QUESTION_COUNT}`);
    console.log(`- Answers: ${ANSWER_COUNT}`);
    console.log(`- Tasks: ${TASK_COUNT}`);
    console.log(`- Study Sessions: ${SESSION_COUNT}`);
    console.log(`- Contests: ${CONTEST_COUNT}`);
    console.log(`- Notifications: ${NOTIFICATION_COUNT}`);
    console.log(`- Votes: ${VOTE_COUNT}`);
    console.log(`- Saved Items: ${SAVED_ITEM_COUNT}`);

    // Delete existing data
    console.log("🧹 Cleaning up old data...");
    try {
        await prisma.$transaction([
            prisma.savedItem.deleteMany(),
            prisma.notification.deleteMany(),
            prisma.testAttempt.deleteMany(),
            prisma.modelTest.deleteMany(),
            prisma.contestRegistration.deleteMany(),
            prisma.contest.deleteMany(),
            prisma.studySession.deleteMany(),
            prisma.task.deleteMany(),
            prisma.answerVote.deleteMany(),
            prisma.answer.deleteMany(),
            prisma.questionVote.deleteMany(),
            prisma.question.deleteMany(),
            prisma.note.deleteMany(),
            prisma.notesGroup.deleteMany(),
            prisma.user.deleteMany(),
        ]);
        console.log("✅ Database cleaned");
    } catch (error) {
        console.error("❌ Error cleaning database:", error);
        process.exit(1);
    }

    // USERS
    console.log("👥 Creating users...");
    const password = await bcrypt.hash("password123", 12);
    const users = [];

    // Create admin users
    for (let i = 0; i < 3; i++) {
        const admin = await prisma.user.create({
            data: {
                email: `admin${i}@studyplatform.com`,
                name: `Admin ${faker.name.firstName()}`,
                password,
                role: "ADMIN",
                bio: `Administrator ${i}`,
                institution: "Study Platform",
                avatar: `/avatars/admin${i}.jpg`,
                location: `${faker.address.city()}, ${faker.address.country()}`,
                website: faker.internet.url(),
                verified: true,
            }
        });
        users.push(admin);
    }

    // Create teachers
    for (let i = 0; i < 20; i++) {
        const teacher = await prisma.user.create({
            data: {
                email: `teacher${i}@example.com`,
                name: `Teacher ${i}`,
                password,
                role: "TEACHER",
                bio: `Teacher with ${randomInt(5, 30)} years experience`,
                institution: randomEnum(INSTITUTIONS),
                location: `${faker.address.city()}, ${faker.address.country()}`,
                website: faker.internet.url(),
                avatar: `/avatars/teacher${i}.jpg`,
                verified: true,
            }
        });
        users.push(teacher);
    }

    // Create students
    for (let i = 0; i < USER_COUNT - 23; i++) {
        const student = await prisma.user.create({
            data: {
                email: `student${i}@student.edu`,
                name: `Student ${i}`,
                password,
                role: "STUDENT",
                bio: `Student studying ${randomEnum(SUBJECTS)}`,
                institution: randomEnum(INSTITUTIONS),
                location: `${faker.address.city()}, ${faker.address.country()}`,
                website: Math.random() > 0.7 ? faker.internet.url() : null,
                avatar: `/avatars/student${i}.jpg`,
                verified: true,
            }
        });
        users.push(student);
    }
    console.log(`✅ ${users.length} users created`);

    // NOTES GROUPS
    console.log("📚 Creating notes groups...");
    const notesGroups = [];
    for (let i = 0; i < NOTES_GROUP_COUNT; i++) {
        const subject = randomEnum(SUBJECTS);
        const owner = randomEnum(users);
        const group = await prisma.notesGroup.create({
            data: {
                name: `${subject} ${randomEnum(["Study Group", "Lecture Notes", "Research Materials", "Course Notes", "Review Materials"])} ${i + 1}`,
                description: lorem.generateParagraphs(1),
                color: faker.color.rgb(),
                userId: owner.id,
            }
        });
        notesGroups.push(group);
    }
    console.log(`✅ ${notesGroups.length} notes groups created`);

    // NOTES
    console.log("📝 Creating notes...");
    const notes = [];
    for (let i = 0; i < NOTE_COUNT; i++) {
        const group = randomEnum(notesGroups);
        const author = users.find(u => u.id === group.userId) || randomEnum(users);
        const note = await prisma.note.create({
            data: {
                title: `${randomEnum(SUBJECTS)} ${randomEnum(["Lecture Notes", "Study Guide", "Research Paper", "Problem Set", "Review Sheet"])} ${i + 1}`,
                visibility: randomEnum(["PRIVATE", "PUBLIC", "SHARED"]),
                files: Array.from({ length: randomInt(1, 5) }, () => ({
                    name: `Note File ${faker.system.commonFileName()}`,
                    type: randomEnum(["file", "image", "pdf", "code"]),
                    content: lorem.generateParagraphs(randomInt(2, 5)),
                    size: randomInt(500, 5000),
                })),
                viewCount: randomInt(0, 500),
                likeCount: randomInt(0, 100),
                dislikeCount: randomInt(0, 20),
                rating: randomInt(30, 50) / 10,
                ratingCount: randomInt(5, 50),
                authorId: author.id,
                notesGroupId: group.id,
            }
        });
        notes.push(note);
    }
    console.log(`✅ ${notes.length} notes created`);

    // QUESTIONS
    console.log("❓ Creating questions...");
    const questions = [];
    for (let i = 0; i < QUESTION_COUNT; i++) {
        const subject = randomEnum(SUBJECTS);
        const tags = randomTags(randomInt(1, 5), TAG_POOL);
        const author = randomEnum(users);
        const question = await prisma.question.create({
            data: {
                title: `${lorem.generateWords(randomInt(3, 8))}?`,
                body: lorem.generateParagraphs(randomInt(2, 4)),
                tags,
                difficulty: randomEnum(["EASY", "MEDIUM", "HARD", "EXPERT"]),
                subject,
                authorId: author.id,
                isResolved: Math.random() > 0.7,
            }
        });
        questions.push(question);
    }
    console.log(`✅ ${questions.length} questions created`);

    // ANSWERS
    console.log("💡 Creating answers...");
    const answers = [];
    for (let i = 0; i < ANSWER_COUNT; i++) {
        const question = randomEnum(questions);
        const author = randomEnum(users);
        const answer = await prisma.answer.create({
            data: {
                content: lorem.generateParagraphs(randomInt(2, 5)),
                questionId: question.id,
                authorId: author.id,
                isAccepted: question.isResolved && Math.random() > 0.8,
            }
        });
        answers.push(answer);
    }
    console.log(`✅ ${answers.length} answers created`);

    // TASKS
    console.log("📅 Creating tasks...");
    const tasks = [];
    for (let i = 0; i < TASK_COUNT; i++) {
        const user = randomEnum(users);
        const task = await prisma.task.create({
            data: {
                title: `${randomEnum(SUBJECTS)} ${randomEnum(["Assignment", "Project", "Reading", "Research", "Exercise"])} ${i + 1}`,
                description: lorem.generateParagraphs(1),
                dueDate: randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
                status: randomEnum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
                priority: randomEnum(["LOW", "MEDIUM", "HIGH"]),
                subjectArea: randomEnum(SUBJECTS),
                tags: randomTags(randomInt(1, 3), TAG_POOL),
                estimatedTime: randomInt(30, 240),
                userId: user.id,
                completedAt: Math.random() > 0.7 ? randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) : null,
            }
        });
        tasks.push(task);
    }
    console.log(`✅ ${tasks.length} tasks created`);

    // STUDY SESSIONS
    console.log("⏳ Creating study sessions...");
    const sessions = [];
    for (let i = 0; i < SESSION_COUNT; i++) {
        const user = randomEnum(users);
        const task = Math.random() > 0.3 ? randomEnum(tasks.filter(t => t.userId === user.id)) : null;
        const duration = randomInt(15, 240);
        const startTime = randomDate(new Date(2023, 0, 1), new Date());
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

        const session = await prisma.studySession.create({
            data: {
                startTime,
                endTime,
                duration,
                goal: `Study ${randomEnum(SUBJECTS).toLowerCase()} ${faker.lorem.words(2)}`,
                notes: Math.random() > 0.5 ? lorem.generateSentences(randomInt(1, 3)) : null,
                completed: Math.random() > 0.1,
                userId: user.id,
                taskId: task?.id,
            }
        });
        sessions.push(session);
    }
    console.log(`✅ ${sessions.length} study sessions created`);

    // CONTESTS
    console.log("🏆 Creating contests...");
    const contests = [];
    for (let i = 0; i < CONTEST_COUNT; i++) {
        const startTime = randomDate(new Date(2023, 0, 1), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
        const endTime = new Date(startTime.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000);
        const organizer = randomEnum(users.filter(u => u.role === "TEACHER" || u.role === "ADMIN"));

        const contest = await prisma.contest.create({
            data: {
                title: `${randomEnum(["Weekly", "Monthly", "Annual", "Spring", "Fall", "Winter", "Summer"])} ${randomEnum(SUBJECTS)} ${randomEnum(["Challenge", "Competition", "Tournament", "Cup", "Olympiad"])} #${i + 1}`,
                description: lorem.generateParagraphs(2),
                startTime,
                endTime,
                status: startTime > new Date() ? "UPCOMING" : endTime < new Date() ? "FINISHED" : "ONGOING",
                difficulty: randomEnum(["EASY", "MEDIUM", "HARD", "EXPERT"]),
                participants: randomInt(50, 500),
                topics: randomTags(randomInt(2, 5), TAG_POOL),
                isVirtual: Math.random() > 0.5,
                eligibility: randomEnum(["Open for all", "Students only", "By invitation", "University students"]),
                organizerId: organizer.id,
            }
        });
        contests.push(contest);
    }
    console.log(`✅ ${contests.length} contests created`);

    // CONTEST REGISTRATIONS
    console.log("📝 Creating contest registrations...");
    for (const contest of contests) {
        const participantCount = randomInt(10, Math.floor(contest.participants * 0.8));
        const participants = users
            .filter(u => u.role === "STUDENT")
            .sort(() => 0.5 - Math.random())
            .slice(0, participantCount);

        for (const user of participants) {
            await prisma.contestRegistration.create({
                data: {
                    contestId: contest.id,
                    userId: user.id,
                    isVirtual: Math.random() > 0.5,
                }
            });
        }
    }
    console.log("✅ Contest registrations created");

    // MODEL TESTS
    console.log("📝 Creating model tests...");
    const modelTests = [];
    for (let i = 0; i < 20; i++) {
        const creator = randomEnum(users.filter(u => u.role === "TEACHER" || u.role === "ADMIN"));
        const test = await prisma.modelTest.create({
            data: {
                title: `${randomEnum(SUBJECTS)} Practice Test ${i + 1}`,
                description: lorem.generateParagraphs(1),
                timeLimit: randomInt(30, 180),
                subjects: [randomEnum(SUBJECTS)],
                topics: randomTags(randomInt(2, 5), TAG_POOL),
                difficulty: randomEnum(["EASY", "MEDIUM", "HARD", "EXPERT"]),
                questions: JSON.stringify(Array.from({ length: randomInt(10, 30) }, () => ({
                    question: lorem.generateSentences(1) + "?",
                    options: Array.from({ length: 4 }, () => lorem.generateWords(3)),
                    correctAnswer: randomInt(0, 3),
                    points: randomInt(1, 3),
                }))),
                isCustom: true,
                passingScore: randomInt(60, 80),
                totalPoints: randomInt(20, 100),
                createdById: creator.id,
            }
        });
        modelTests.push(test);
    }
    console.log(`✅ ${modelTests.length} model tests created`);

    // TEST ATTEMPTS
    console.log("📝 Creating test attempts...");
    for (const test of modelTests) {
        const attemptCount = randomInt(1, 10);
        for (let i = 0; i < attemptCount; i++) {
            const user = randomEnum(users);
            await prisma.testAttempt.create({
                data: {
                    status: "COMPLETED",
                    startTime: randomDate(new Date(test.createdAt), new Date()),
                    endTime: randomDate(new Date(test.createdAt), new Date()),
                    timeSpent: randomInt(300, test.timeLimit * 60),
                    score: randomInt(0, test.totalPoints),
                    correctAnswers: randomInt(0, JSON.parse(test.questions).length),
                    totalQuestions: JSON.parse(test.questions).length,
                    answers: JSON.stringify({}),
                    userId: user.id,
                    testId: test.id,
                }
            });
        }
    }
    console.log("✅ Test attempts created");

    // NOTIFICATIONS
    console.log("🔔 Creating notifications...");
    const notificationTypes = ["ANSWER", "VOTE", "ACCEPTANCE", "COMMENT", "MENTION", "SYSTEM"];
    for (let i = 0; i < NOTIFICATION_COUNT; i++) {
        const type = randomEnum(notificationTypes);
        const user = randomEnum(users);
        let actor = null;
        let title = "";
        let message = "";
        let relatedId = null;

        switch (type) {
            case "ANSWER":
                actor = randomEnum(users);
                const answeredQuestion = randomEnum(questions);
                title = "New Answer";
                message = `${actor.name} answered your question: "${answeredQuestion.title.substring(0, 30)}..."`;
                relatedId = answeredQuestion.id;
                break;
            case "VOTE":
                actor = randomEnum(users);
                title = "New Vote";
                message = `${actor.name} voted on your ${randomEnum(["question", "answer"])}`;
                relatedId = randomEnum([...questions, ...answers]).id;
                break;
            case "ACCEPTANCE":
                actor = randomEnum(users);
                const answer = randomEnum(answers.filter(a => a.isAccepted));
                title = "Answer Accepted";
                message = `${actor.name} accepted your answer`;
                relatedId = answer.id;
                break;
            case "COMMENT":
                actor = randomEnum(users);
                title = "New Comment";
                message = `${actor.name} commented on your ${randomEnum(["question", "answer"])}`;
                relatedId = randomEnum([...questions, ...answers]).id;
                break;
            case "MENTION":
                actor = randomEnum(users);
                title = "You Were Mentioned";
                message = `${actor.name} mentioned you in a ${randomEnum(["question", "answer", "note"])}`;
                relatedId = randomEnum([...questions, ...answers, ...notes]).id;
                break;
            case "SYSTEM":
                title = "System Notification";
                message = lorem.generateSentences(1);
                break;
        }

        await prisma.notification.create({
            data: {
                type,
                title,
                message,
                userId: user.id,
                actorId: actor?.id,
                actorName: actor?.name,
                actorAvatar: actor?.avatar,
                relatedId,
                relatedType: type === "ANSWER" ? "QUESTION" :
                    type === "VOTE" ? randomEnum(["QUESTION", "ANSWER"]) :
                        type === "ACCEPTANCE" ? "ANSWER" :
                            type === "COMMENT" ? randomEnum(["QUESTION", "ANSWER"]) :
                                type === "MENTION" ? randomEnum(["QUESTION", "ANSWER", "NOTE"]) : null,
                isRead: Math.random() > 0.5,
            }
        });
    }
    console.log(`✅ ${NOTIFICATION_COUNT} notifications created`);

    // VOTES
    console.log("👍 Creating votes...");
    for (let i = 0; i < VOTE_COUNT; i++) {
        const user = randomEnum(users);
        const voteType = Math.random() > 0.2 ? "UP" : "DOWN";

        try {
            if (Math.random() > 0.5) {
                // Question vote
                const question = randomEnum(questions);
                await prisma.questionVote.create({
                    data: {
                        voteType,
                        questionId: question.id,
                        userId: user.id,
                    }
                });
            } else {
                // Answer vote
                const answer = randomEnum(answers);
                await prisma.answerVote.create({
                    data: {
                        voteType,
                        answerId: answer.id,
                        userId: user.id,
                    }
                });
            }
        } catch (error) {
            // Ignore duplicate votes
        }
    }
    console.log(`✅ ${VOTE_COUNT} votes created`);

    // SAVED ITEMS
    console.log("🔖 Creating saved items...");
    for (let i = 0; i < SAVED_ITEM_COUNT; i++) {
        const user = randomEnum(users);
        const saveTarget = Math.random() > 0.5 ? "QUESTION" : "NOTE";

        try {
            if (saveTarget === "QUESTION") {
                const question = randomEnum(questions);
                await prisma.savedItem.create({
                    data: {
                        itemType: "QUESTION",
                        itemId: question.id,
                        userId: user.id,
                        tags: randomTags(randomInt(0, 3), TAG_POOL),
                    }
                });
            } else {
                const note = randomEnum(notes);
                await prisma.savedItem.create({
                    data: {
                        itemType: "NOTE",
                        itemId: note.id,
                        userId: user.id,
                        tags: randomTags(randomInt(0, 3), TAG_POOL),
                    }
                });
            }
        } catch (error) {
            // Ignore duplicate saved items
        }
    }
    console.log(`✅ ${SAVED_ITEM_COUNT} saved items created`);

    console.log("🎉 Database seeded successfully!");
    console.log("📊 Final stats:");
    console.table({
        "Users": await prisma.user.count(),
        "Notes Groups": await prisma.notesGroup.count(),
        "Notes": await prisma.note.count(),
        "Questions": await prisma.question.count(),
        "Answers": await prisma.answer.count(),
        "Tasks": await prisma.task.count(),
        "Study Sessions": await prisma.studySession.count(),
        "Contests": await prisma.contest.count(),
        "Contest Registrations": await prisma.contestRegistration.count(),
        "Model Tests": await prisma.modelTest.count(),
        "Test Attempts": await prisma.testAttempt.count(),
        "Notifications": await prisma.notification.count(),
        "Question Votes": await prisma.questionVote.count(),
        "Answer Votes": await prisma.answerVote.count(),
        "Saved Items": await prisma.savedItem.count(),
    });
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });