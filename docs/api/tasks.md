# Tasks API Documentation

This document provides details about the endpoints in the `tasks.js` file. These endpoints manage tasks, including creating, retrieving, updating, deleting tasks, and generating schedules.

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
      "updatedAt": "datetime"
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
    "updatedAt": "datetime"
  }
}
```

---

## **3. Create a New Task**
### **POST** `/api/tasks/`
Creates a new task for the authenticated user.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**:
```json
{
  "title": "string",
  "description": "string",
  "dueDate": "datetime",
  "priority": "MEDIUM",
  "subjectArea": "string",
  "estimatedTime": 60
}
```
- **File**: Optional file upload (stored directly in the database).

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
    "completedAt": "datetime",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

## **4. Update a Task**
### **PUT** `/api/tasks/:id`
Updates an existing task.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Task ID
- **Body**:
```json
{
  "title": "string",
  "description": "string",
  "dueDate": "datetime",
  "priority": "MEDIUM",
  "subjectArea": "string",
  "estimatedTime": 60
}
```
- **File**: Optional file upload (stored directly in the database).

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
    "updatedAt": "datetime"
  }
}
```

---

## **5. Update Task Status**
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

#### Response Structure
```json
{
  "message": "Task status updated successfully",
  "task": {
    "id": "string",
    "status": "IN_PROGRESS"
  }
}
```

---

## **6. Mark Task as Completed**
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
    "status": "COMPLETED"
  }
}
```

---

## **7. Delete a Task**
### **DELETE** `/api/tasks/:id`
Deletes a specific task.

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

## **8. Generate Schedule**
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
      "goal": "string"
    }
  ]
}
```

---

## **9. Get Today's Schedule**
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
      "taskId": "string"
    }
  ]
}
```
