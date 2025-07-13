import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import {
  mockPrisma,
  mockAuthMiddleware,
  mockUser,
  mockNote,
  mockNotesGroup,
} from "../setup.js";

const { default: notesRouter } = await import("../../routes/notes.js");

const app = express();
app.use(express.json());
app.use(mockAuthMiddleware);
app.use("/api/notes", notesRouter);

describe("Notes Routes", () => {
  describe("GET /", () => {
    it("should get all notes (user's + public)", async () => {
      const myNotes = [{ ...mockNote, authorId: mockUser.id }];
      const publicNotes = [
        { ...mockNote, id: "note-456", visibility: "PUBLIC" },
      ];

      mockPrisma.note.findMany.mockResolvedValueOnce(myNotes);
      mockPrisma.note.findMany.mockResolvedValueOnce(publicNotes);

      const response = await request(app).get("/api/notes");

      expect(response.status).toBe(200);
      expect(response.body.notes).toHaveLength(2);
    });
  });

  describe("GET /my", () => {
    it("should get user's notes only", async () => {
      mockPrisma.note.findMany.mockResolvedValue([mockNote]);

      const response = await request(app).get("/api/notes/my");

      expect(response.status).toBe(200);
      expect(response.body.notes).toHaveLength(1);
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

  describe("GET /recent", () => {
    it("should get recent notes", async () => {
      mockPrisma.note.findMany.mockResolvedValue([mockNote]);

      const response = await request(app).get("/api/notes/recent");

      expect(response.status).toBe(200);
      expect(response.body.notes).toHaveLength(1);
    });
  });

  describe("GET /groups", () => {
    it("should get notes groups", async () => {
      const groupWithNotes = {
        ...mockNotesGroup,
        notes: [mockNote],
      };
      mockPrisma.notesGroup.findMany.mockResolvedValue([groupWithNotes]);

      const response = await request(app).get("/api/notes/groups");

      expect(response.status).toBe(200);
      expect(response.body.groups).toHaveLength(1);
    });
  });

  describe("POST /groups", () => {
    it("should create notes group", async () => {
      mockPrisma.notesGroup.findFirst.mockResolvedValue(null);
      mockPrisma.notesGroup.create.mockResolvedValue(mockNotesGroup);

      const response = await request(app).post("/api/notes/groups").send({
        name: "New Group",
        description: "Group description",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Notes group created successfully");
      expect(response.body.group).toBeDefined();
    });

    it("should return conflict if group already exists", async () => {
      mockPrisma.notesGroup.findFirst.mockResolvedValue(mockNotesGroup);

      const response = await request(app).post("/api/notes/groups").send({
        name: "Existing Group",
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe(
        "Notes group with this name already exists"
      );
    });
  });

  describe("GET /:id", () => {
    it("should get note by ID", async () => {
      const noteWithAuthor = {
        ...mockNote,
        author: { id: mockUser.id, name: mockUser.name, avatar: null },
        notesGroup: { id: mockNotesGroup.id, name: mockNotesGroup.name },
      };
      mockPrisma.note.findUnique.mockResolvedValue(noteWithAuthor);

      const response = await request(app).get("/api/notes/note-123");

      expect(response.status).toBe(200);
      expect(response.body.note).toBeDefined();
    });

    it("should return 404 if note not found", async () => {
      mockPrisma.note.findUnique.mockResolvedValue(null);

      const response = await request(app).get("/api/notes/note-123");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Note not found");
    });

    it("should return 403 for private note not owned by user", async () => {
      const privateNote = {
        ...mockNote,
        authorId: "other-user",
        visibility: "PRIVATE",
      };
      mockPrisma.note.findUnique.mockResolvedValue(privateNote);

      const response = await request(app).get("/api/notes/note-123");

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Access denied");
    });
  });

  describe("POST /", () => {
    it("should create note", async () => {
      mockPrisma.notesGroup.findUnique.mockResolvedValue(mockNotesGroup);
      mockPrisma.note.create.mockResolvedValue(mockNote);

      const response = await request(app)
        .post("/api/notes")
        .send({
          title: "New Note",
          notesGroupId: mockNotesGroup.id,
          visibility: "private",
          tags: ["math"],
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Note created successfully");
    });

    it("should return 404 if notes group not found", async () => {
      mockPrisma.notesGroup.findUnique.mockResolvedValue(null);

      const response = await request(app).post("/api/notes").send({
        title: "New Note",
        notesGroupId: "invalid-group",
        visibility: "private",
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Notes group not found");
    });

    it("should return 403 if user doesn't own the notes group", async () => {
      const otherUsersGroup = { ...mockNotesGroup, userId: "other-user" };
      mockPrisma.notesGroup.findUnique.mockResolvedValue(otherUsersGroup);

      const response = await request(app).post("/api/notes").send({
        title: "New Note",
        notesGroupId: mockNotesGroup.id,
        visibility: "private",
      });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe(
        "Not authorized to add notes to this group"
      );
    });
  });

  describe("DELETE /:id", () => {
    it("should delete note", async () => {
      mockPrisma.note.findUnique.mockResolvedValue(mockNote);
      mockPrisma.note.delete.mockResolvedValue(mockNote);

      const response = await request(app).delete("/api/notes/note-123");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Note deleted successfully");
    });

    it("should return 404 if note not found", async () => {
      mockPrisma.note.findUnique.mockResolvedValue(null);

      const response = await request(app).delete("/api/notes/note-123");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Note not found");
    });

    it("should return 403 if user doesn't own the note", async () => {
      const otherUsersNote = { ...mockNote, authorId: "other-user" };
      mockPrisma.note.findUnique.mockResolvedValue(otherUsersNote);

      const response = await request(app).delete("/api/notes/note-123");

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Not authorized to delete this note");
    });
  });

  describe("DELETE /groups/:id", () => {
    it("should delete notes group", async () => {
      mockPrisma.notesGroup.findUnique.mockResolvedValue(mockNotesGroup);
      mockPrisma.notesGroup.delete.mockResolvedValue(mockNotesGroup);

      const response = await request(app).delete("/api/notes/groups/group-123");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Notes group deleted successfully");
    });

    it("should return 404 if notes group not found", async () => {
      mockPrisma.notesGroup.findUnique.mockResolvedValue(null);

      const response = await request(app).delete("/api/notes/groups/group-123");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Notes group not found");
    });

    it("should return 403 if user doesn't own the notes group", async () => {
      const otherUsersGroup = { ...mockNotesGroup, userId: "other-user" };
      mockPrisma.notesGroup.findUnique.mockResolvedValue(otherUsersGroup);

      const response = await request(app).delete("/api/notes/groups/group-123");

      expect(response.status).toBe(403);
      expect(response.body.error).toBe(
        "Not authorized to delete this notes group"
      );
    });
  });
});
