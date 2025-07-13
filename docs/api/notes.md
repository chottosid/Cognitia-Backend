# Notes API Documentation

This document provides details about the endpoints in the `notes.js` file. These endpoints manage notes, including creating, retrieving, updating, and deleting notes and notes groups.

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
      "content": "string",
      "visibility": "PUBLIC",
      "author": {
        "id": "string",
        "name": "string",
        "avatar": "string"
      },
      "notesGroup": {
        "id": "string",
        "name": "string"
      },
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
      "content": "string",
      "visibility": "PRIVATE",
      "author": {
        "id": "string",
        "name": "string",
        "avatar": "string"
      },
      "notesGroup": {
        "id": "string",
        "name": "string"
      },
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
      "groupName": "string",
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
      "createdAt": "datetime",
      "notes": [
        {
          "id": "string",
          "title": "string",
          "updatedAt": "datetime",
          "visibility": "PUBLIC",
          "rating": 5
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
    "createdAt": "datetime"
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
    "content": "string",
    "visibility": "PRIVATE",
    "author": {
      "id": "string",
      "name": "string",
      "avatar": "string"
    },
    "notesGroup": {
      "id": "string",
      "name": "string"
    },
    "updatedAt": "datetime"
  }
}
```

---

## **7. Create a Note**
### **POST** `/api/notes/`
Creates a new note in a specific notes group.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**:
```json
{
  "title": "string",
  "notesGroupId": "string",
  "visibility": "PUBLIC",
  "tags": ["string"]
}
```

#### Response Structure
```json
{
  "message": "Note created successfully",
  "note": {
    "id": "string",
    "title": "string",
    "visibility": "PUBLIC",
    "tags": ["string"],
    "createdAt": "datetime"
  }
}
```

---

## **8. Delete a Note**
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

## **9. Delete a Notes Group**
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
