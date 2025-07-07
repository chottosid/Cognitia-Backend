import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import { mockPrisma, mockAuthMiddleware, mockUser } from "./setup.js";

// Mock validation middleware
jest.unstable_mockModule("../middleware/validation.js", () => ({
  validateCuidOrUUID: () => (req, res, next) => next(), // Skip ID validation
  handleValidationErrors: (req, res, next) => next(), // Skip validation errors handling
}));

// Mock the authentication middleware before importing the routes
jest.unstable_mockModule("../middleware/auth.js", () => ({
  authenticateToken: (req, res, next) => {
    req.user = mockUser;
    next();
  },
}));

// Import the router after mocking
const { default: notesRoutes } = await import("../routes/notes.js");

// Create test app
const app = express();
app.use(express.json());
// No need for mockAuthMiddleware here as authenticateToken is already mocked
app.use("/api/notes", notesRoutes);

// Mock data for notes tests
const mockNotes = [
  {
    id: "note-1",
    title: "Math Notes",
    authorId: "user-123",
    notesGroupId: "group-1",
    visibility: "PRIVATE",
    files: [],
    tags: ["math", "algebra"],
    viewCount: 5,
    likeCount: 2,
    dislikeCount: 0,
    rating: 4.5,
    ratingCount: 2,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    author: {
      id: "user-123",
      name: "Test User",
      avatar: null,
    },
    notesGroup: {
      id: "group-1",
      name: "Math Group",
    },
  },
  {
    id: "note-2",
    title: "Physics Notes",
    authorId: "user-456",
    notesGroupId: "group-2",
    visibility: "PUBLIC",
    files: [],
    tags: ["physics", "mechanics"],
    viewCount: 25,
    likeCount: 10,
    dislikeCount: 1,
    rating: 4.2,
    ratingCount: 6,
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-04"),
    author: {
      id: "user-456",
      name: "Another User",
      avatar: null,
    },
    notesGroup: {
      id: "group-2",
      name: "Physics Group",
    },
  },
];

const mockNotesGroups = [
  {
    id: "group-1",
    name: "Math Group",
    description: "Notes for mathematics",
    userId: "user-123",
    createdAt: new Date("2024-01-01"),
    notes: [mockNotes[0]],
  },
  {
    id: "group-2",
    name: "Physics Group",
    description: "Notes for physics",
    userId: "user-123",
    createdAt: new Date("2024-01-02"),
    notes: [],
  },
];

describe("Notes Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/notes", () => {
    it("should return all notes (user's and public)", async () => {
      mockPrisma.note.findMany
        .mockResolvedValueOnce([mockNotes[0]]) // User's notes
        .mockResolvedValueOnce([mockNotes[1]]); // Public notes

      const response = await request(app)
        .get("/api/notes")
        .set("Authorization", "Bearer fake-token") // Mock auth header
        .expect(200);

      expect(response.body).toHaveProperty("notes");
      expect(response.body.notes).toHaveLength(2);
      expect(mockPrisma.note.findMany).toHaveBeenCalledTimes(2);
    });
  });

  describe("GET /api/notes/my", () => {
    it("should return only the user's notes", async () => {
      mockPrisma.note.findMany.mockResolvedValue([mockNotes[0]]);

      const response = await request(app)
        .get("/api/notes/my")
        .set("Authorization", "Bearer fake-token")
        .expect(200);

      expect(response.body).toHaveProperty("notes");
      expect(response.body.notes).toHaveLength(1);
      expect(response.body.notes[0].id).toBe("note-1");
      expect(mockPrisma.note.findMany).toHaveBeenCalledWith({
        where: { authorId: mockUser.id },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          notesGroup: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
    });
  });

  describe("GET /api/notes/recent", () => {
    it("should return recent notes", async () => {
      mockPrisma.note.findMany.mockResolvedValue([mockNotes[0]]);

      const response = await request(app)
        .get("/api/notes/recent")
        .set("Authorization", "Bearer fake-token")
        .expect(200);

      expect(response.body).toHaveProperty("notes");
      expect(mockPrisma.note.findMany).toHaveBeenCalledWith({
        where: { authorId: mockUser.id },
        orderBy: { updatedAt: "desc" },
        take: 12,
        include: {
          notesGroup: { select: { name: true } },
        },
      });
    });
  });

  describe("GET /api/notes/groups", () => {
    it("should return notes groups", async () => {
      mockPrisma.notesGroup.findMany.mockResolvedValue(mockNotesGroups);

      const response = await request(app)
        .get("/api/notes/groups")
        .set("Authorization", "Bearer fake-token")
        .expect(200);

      expect(response.body).toHaveProperty("groups");
      expect(response.body.groups).toHaveLength(2);
      expect(mockPrisma.notesGroup.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { createdAt: "desc" },
        include: {
          notes: {
            select: {
              id: true,
              title: true,
              updatedAt: true,
              visibility: true,
              rating: true,
            },
            orderBy: { updatedAt: "desc" },
          },
        },
      });
    });
  });

  describe("POST /api/notes/groups", () => {
    it("should create a new notes group", async () => {
      const newGroup = {
        name: "Chemistry Group",
        description: "Notes for chemistry",
      };

      mockPrisma.notesGroup.create.mockResolvedValue({
        id: "group-3",
        ...newGroup,
        userId: mockUser.id,
        createdAt: new Date(),
      });

      const response = await request(app)
        .post("/api/notes/groups")
        .set("Authorization", "Bearer fake-token")
        .send(newGroup)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "Notes group created successfully"
      );
      expect(response.body).toHaveProperty("group");
      expect(mockPrisma.notesGroup.create).toHaveBeenCalledWith({
        data: {
          name: newGroup.name,
          description: newGroup.description,
          userId: mockUser.id,
        },
      });
    });
  });

  describe("GET /api/notes/:id", () => {
    it("should return a specific note", async () => {
      mockPrisma.note.findUnique.mockResolvedValue(mockNotes[0]);
      mockPrisma.note.update.mockResolvedValue({
        ...mockNotes[0],
        viewCount: 6,
      });

      const response = await request(app)
        .get("/api/notes/note-1")
        .set("Authorization", "Bearer fake-token")
        .expect(200);

      expect(response.body).toHaveProperty("note");
      expect(response.body.note.id).toBe("note-1");
      expect(mockPrisma.note.findUnique).toHaveBeenCalledWith({
        where: { id: "note-1" },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          notesGroup: { select: { id: true, name: true } },
        },
      });
      expect(mockPrisma.note.update).toHaveBeenCalledWith({
        where: { id: "note-1" },
        data: { viewCount: { increment: 1 } },
      });
    });

    it("should return 404 for non-existent note", async () => {
      mockPrisma.note.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/notes/nonexistent")
        .set("Authorization", "Bearer fake-token")
        .expect(404);

      expect(response.body).toHaveProperty("error", "Note not found");
    });

    it("should return 403 for unauthorized access to private note", async () => {
      const privateNote = {
        ...mockNotes[0],
        authorId: "different-user",
        visibility: "PRIVATE",
      };

      mockPrisma.note.findUnique.mockResolvedValue(privateNote);

      const response = await request(app)
        .get("/api/notes/note-1")
        .set("Authorization", "Bearer fake-token")
        .expect(403);

      expect(response.body).toHaveProperty("error", "Access denied");
    });
  });
});
