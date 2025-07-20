# Notes API Documentation

This document provides details about the endpoints in the `notes.js` file. These endpoints manage notes, including creating, retrieving, updating, deleting notes and notes groups, and handling file attachments.

---

## **1. Get All Notes**

### **GET** `/api/notes/`

Fetches all notes, including the user's notes and public notes.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure

```json
{
  "notes": [
    {
      "id": "string",
      "title": "string",
      "visibility": "PUBLIC",
      "tags": ["string"],
      "author": {
        "id": "string",
        "name": "string",
        "avatar": "string|null"
      },
      "notesGroup": {
        "id": "string",
        "name": "string"
      },
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

---

## **2. Get User's Notes**

### **GET** `/api/notes/my`

Fetches only the authenticated user's notes.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure

```json
{
  "notes": [
    {
      "id": "string",
      "title": "string",
      "visibility": "PRIVATE",
      "tags": ["string"],
      "author": {
        "id": "string",
        "name": "string",
        "avatar": "string|null"
      },
      "notesGroup": {
        "id": "string",
        "name": "string"
      },
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

---

## **3. Get Recent Notes**

### **GET** `/api/notes/recent`

Fetches the most recent notes created or updated by the authenticated user.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure

```json
{
  "notes": [
    {
      "id": "string",
      "title": "string",
      "groupName": "string|null",
      "visibility": "PRIVATE",
      "tags": ["string"],
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

---

## **4. Get Notes Groups**

### **GET** `/api/notes/groups`

Fetches all notes groups created by the authenticated user.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure

```json
{
  "groups": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "userId": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "notes": [
        {
          "id": "string",
          "title": "string",
          "updatedAt": "datetime",
          "visibility": "PUBLIC"
        }
      ]
    }
  ]
}
```

---

## **5. Create Notes Group**

### **POST** `/api/notes/groups`

Creates a new notes group for the authenticated user.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Body**:

```json
{
  "name": "string",
  "description": "string"
}
```

#### Response Structure

```json
{
  "message": "Notes group created successfully",
  "group": {
    "id": "string",
    "name": "string",
    "description": "string",
    "userId": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

## **6. Get Note by ID**

### **GET** `/api/notes/:id`

Fetches a specific note by its ID.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Note ID
- **Body**: None

#### Response Structure

```json
{
  "note": {
    "id": "string",
    "title": "string",
    "visibility": "PRIVATE",
    "tags": ["string"],
    "author": {
      "id": "string",
      "name": "string",
      "avatar": "string|null"
    },
    "notesGroup": {
      "id": "string",
      "name": "string"
    },
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

## **7. Create a Note**

### **POST** `/api/notes/`

Creates a new note in a specific notes group with a required file attachment.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
  - `Content-Type`: `multipart/form-data`
- **Body** (Form Data):
  - `title`: string (required)
  - `notesGroupId`: string (required)
  - `visibility`: string (required) - "PRIVATE", "PUBLIC"
  - `tags`: array of strings (optional)
  - `files`: file (required) - any file type, stored as binary data

#### Response Structure

```json
{
  "message": "Note created successfully",
  "note": {
    "id": "string",
    "title": "string",
    "visibility": "PUBLIC",
    "tags": ["string"],
    "authorId": "string",
    "notesGroupId": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

## **8. Get Note File**

### **GET** `/api/notes/:id/file`

Downloads the file attached to a specific note.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Note ID
- **Body**: None

#### Response Structure

- **Success**: Returns the file as binary data with appropriate headers
  - `Content-Type`: `application/octet-stream`
  - `Content-Disposition`: `attachment; filename="{note_title}_file"`
- **Error**:

```json
{
  "error": "Note not found" | "Access denied" | "No file attached to this note"
}
```

---

## **9. Delete a Note**

### **DELETE** `/api/notes/:id`

Deletes a specific note by its ID.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Note ID
- **Body**: None

#### Response Structure

```json
{
  "message": "Note deleted successfully"
}
```

---

## **10. Delete a Notes Group**

### **DELETE** `/api/notes/groups/:id`

Deletes a specific notes group by its ID, including all associated notes.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Notes group ID
- **Body**: None

#### Response Structure

```json
{
  "message": "Notes group deleted successfully"
}
```

#### Error Responses

```json
{
  "error": "Notes group not found" | "Not authorized to delete this notes group"
}
```

---

## **11. Serve Note File**

### **GET** `/api/notes/:id/file`

Serves the file attached to a specific note.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Note ID
- **Body**: None

#### Response Structure

- **Success**: Returns the file as binary data with appropriate headers
  - `Content-Type`: `application/octet-stream`
  - `Content-Disposition`: `attachment; filename="{note_title}_file"`
- **Error**:

```json
{
  "error": "Note not found" | "Access denied" | "No file attached to this note"
}
```

#### Access Control

- **PRIVATE**: Only accessible by the note's author.
- **PUBLIC**/**SHARED**: Accessible by all authenticated users.

---

## **File Handling Notes**

- **File Requirement**: All notes must have a file attachment
- **File Storage**: Files are stored directly in the database as binary data (Bytes)
- **File Types**: Any file type is supported (PDF, DOCX, images, etc.)
- **File Size**: Limited by server configuration (currently 50MB)
- **File Security**: File access respects note visibility settings
- **File Deletion**: Files are automatically deleted when notes are deleted
- **Visibility Control**:
  - PRIVATE: Only note author can access the file
  - PUBLIC: All authenticated users can access the file
  - SHARED: All authenticated users can access the file
