# Tasks API Documentation

This document provides details about the endpoints in the `tasks.js` file. These endpoints manage tasks, including creating, retrieving, updating, deleting tasks, generating schedules, and handling file attachments.

---

## **1. Get All Tasks**
### **GET** `/api/tasks/`
Fetches all tasks for the authenticated user.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "dueDate": "datetime",
      "status": "NOT_STARTED",
      "priority": "MEDIUM",
      "subjectArea": "string",
      "tags": ["string"],
      "estimatedTime": 60,
      "completedAt": "datetime",
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "file": "bytes|null"
    }
  ]
}
```

---

## **2. Get Task by ID**
### **GET** `/api/tasks/:id`
Fetches a specific task by its ID.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Task ID
- **Body**: None

#### Response Structure
```json
{
  "task": {
    "id": "string",
    "title": "string",
    "description": "string",
    "dueDate": "datetime",
    "status": "NOT_STARTED",
    "priority": "MEDIUM",
    "subjectArea": "string",
    "tags": ["string"],
    "estimatedTime": 60,
    "completedAt": "datetime",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "file": "bytes|null"
  }
}
```

---

## **3. Create a New Task**
### **POST** `/api/tasks/`
Creates a new task for the authenticated user with optional file attachment.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
  - `Content-Type`: `multipart/form-data`
- **Body** (Form Data):
  - `title`: string (required)
  - `description`: string (optional)
  - `dueDate`: datetime (required)
  - `priority`: string (required) - "LOW", "MEDIUM", "HIGH"
  - `subjectArea`: string (required)
  - `estimatedTime`: integer (optional) - time in minutes
  - `file`: file (optional) - any file type, stored as binary data

#### Response Structure
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "string",
    "title": "string",
    "description": "string",
    "dueDate": "datetime",
    "status": "NOT_STARTED",
    "priority": "MEDIUM",
    "subjectArea": "string",
    "tags": ["string"],
    "estimatedTime": 60,
    "completedAt": null,
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "file": "bytes|null"
  }
}
```

---

## **4. Update a Task**
### **PUT** `/api/tasks/:id`
Updates an existing task with optional file replacement.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
  - `Content-Type`: `multipart/form-data`
- **Params**:
  - `id`: Task ID
- **Body** (Form Data):
  - `title`: string (optional)
  - `description`: string (optional)
  - `dueDate`: datetime (optional)
  - `priority`: string (optional) - "LOW", "MEDIUM", "HIGH"
  - `subjectArea`: string (optional)
  - `estimatedTime`: integer (optional) - time in minutes
  - `file`: file (optional) - replaces existing file if provided

#### Response Structure
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": "string",
    "title": "string",
    "description": "string",
    "dueDate": "datetime",
    "status": "NOT_STARTED",
    "priority": "MEDIUM",
    "subjectArea": "string",
    "tags": ["string"],
    "estimatedTime": 60,
    "completedAt": "datetime",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "file": "bytes|null"
  }
}
```

---

## **5. Get Task File**
### **GET** `/api/tasks/:id/file`
Downloads the file attached to a specific task.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Task ID
- **Body**: None

#### Response Structure
- **Success**: Returns the file as binary data with appropriate headers
  - `Content-Type`: `application/octet-stream`
  - `Content-Disposition`: `attachment; filename="{task_title}_attachment"`
- **Error**:
```json
{
  "error": "Task not found" | "No file attached to this task"
}
```

---

## **6. Update Task Status**
### **PUT** `/api/tasks/:id/status`
Updates the status of a task.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Task ID
- **Body**:
```json
{
  "status": "IN_PROGRESS"
}
```
- **Valid Status Values**: "NOT_STARTED", "IN_PROGRESS", "COMPLETED"

#### Response Structure
```json
{
  "message": "Task status updated successfully",
  "task": {
    "id": "string",
    "status": "IN_PROGRESS",
    "updatedAt": "datetime"
  }
}
```

---

## **7. Mark Task as Completed**
### **PUT** `/api/tasks/:id/complete`
Marks a task as completed.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Task ID
- **Body**: None

#### Response Structure
```json
{
  "message": "Task marked as completed",
  "task": {
    "id": "string",
    "status": "COMPLETED",
    "completedAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

## **8. Delete a Task**
### **DELETE** `/api/tasks/:id`
Deletes a specific task and its associated file.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Task ID
- **Body**: None

#### Response Structure
```json
{
  "message": "Task deleted successfully"
}
```

---

## **9. Generate Schedule**
### **GET** `/api/tasks/generate`
Generates a schedule for the authenticated user based on their tasks and availability.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure
```json
{
  "message": "Schedule generated successfully",
  "schedule": [
    {
      "taskId": "string",
      "startTime": "datetime",
      "endTime": "datetime",
      "duration": 60,
      "goal": "string",
      "userId": "string"
    }
  ]
}
```

#### Error Responses
```json
{
  "error": "No tasks found for the user" | "Could not reach scheduling service" | "Invalid schedule response"
}
```

---

## **10. Get Today's Schedule**
### **GET** `/api/tasks/today`
Fetches today's schedule for the authenticated user.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure
```json
{
  "sessions": [
    {
      "id": "string",
      "startTime": "datetime",
      "endTime": "datetime",
      "goal": "string",
      "notes": "string",
      "completed": false,
      "taskId": "string",
      "userId": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

---

## **File Handling Notes**

- **File Storage**: Files are stored directly in the database as binary data (Bytes)
- **File Types**: Any file type is supported
- **File Size**: Limited by server configuration (currently 50MB)
- **File Security**: Files are only accessible by the task owner
- **File Updates**: Uploading a new file replaces the existing one
- **File Deletion**: Files are automatically deleted when the task is deleted
