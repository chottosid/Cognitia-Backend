# Dashboard API Documentation

This document provides details about the endpoints in the `dashboard.js` file. These endpoints manage user dashboard data and profile information, including avatar management.

---

## **1. Get Dashboard Data**

### **GET** `/api/dashboard/`

Fetches comprehensive dashboard data for the authenticated user.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure

```json
{
  "feed": [
    {
      "id": "string",
      "title": "string",
      "body": "string",
      "tags": ["string"],
      "views": 0,
      "subject": "string",
      "createdAt": "datetime",
      "answerCount": 5,
      "author": {
        "id": "string",
        "name": "string",
        "avatar": "bytes|null"
      }
    }
  ],
  "recentNotes": [
    {
      "id": "string",
      "title": "string",
      "lastViewed": "2 hours ago"
    }
  ],
  "todaysTasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "dueDate": "datetime",
      "status": "NOT_STARTED",
      "priority": "MEDIUM",
      "subjectArea": "string"
    }
  ],
  "todaysSessions": [
    {
      "id": "string",
      "startTime": "datetime",
      "endTime": "datetime",
      "goal": "string",
      "completed": false,
      "taskId": "string"
    }
  ],
  "studyPlans": [
    {
      "id": "string",
      "title": "string",
      "duration": "2.5 hours",
      "completed": 0,
      "total": 1
    }
  ],
  "progress": [
    {
      "label": "Completed Tasks",
      "value": 15
    },
    {
      "label": "Completed Sessions",
      "value": 8
    }
  ],
  "stats": {
    "totalTasks": 25,
    "completedTasks": 15,
    "totalStudyHours": 45.5,
    "questionsAsked": 12,
    "questionsAnswered": 18
  },
  "unreadNotifications": 3,
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "status": "IN_PROGRESS",
      "dueDate": "datetime"
    }
  ],
  "sessions": [
    {
      "id": "string",
      "startTime": "datetime",
      "endTime": "datetime",
      "completed": true
    }
  ],
  "currentUser": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "bytes|null",
    "role": "STUDENT"
  }
}
```

---

## **2. Get User Profile Data**

### **GET** `/api/dashboard/me`

Fetches the authenticated user's profile information.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure

```json
{
  "name": "string",
  "email": "string",
  "avatar": "bytes|null",
  "bio": "string",
  "institution": "string",
  "graduationYear": "number|null",
  "major": "string|null",
  "grade": "string|null",
  "location": "string|null",
  "website": "string|null"
}
```

---

## **3. Update User Profile**

### **PUT** `/api/dashboard/me`

Updates the authenticated user's profile information with optional avatar upload.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
  - `Content-Type`: `multipart/form-data`
- **Body** (Form Data):
  - `bio`: string (optional)
  - `institution`: string (optional)
  - `graduationYear`: number (optional)
  - `major`: string (optional)
  - `grade`: string (optional)
  - `location`: string (optional)
  - `website`: string (optional)
  - `avatar`: file (optional) - image file to replace current avatar

#### Response Structure

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "avatar": "bytes|null",
  "bio": "string",
  "institution": "string",
  "graduationYear": "number|null",
  "major": "string|null",
  "grade": "string|null",
  "location": "string|null",
  "website": "string|null",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## **4. Get User Avatar**

### **GET** `/api/dashboard/me/avatar`

Downloads the authenticated user's avatar image.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure

- **Success**: Returns the avatar image as binary data with appropriate headers
  - `Content-Type`: `image/jpeg`
  - `Content-Disposition`: `inline; filename="{user_name}_avatar.jpg"`
- **Error**:

```json
{
  "error": "User not found" | "No avatar found"
}
```

---

## **Profile Update Notes**

- **Partial Updates**: All fields in the update request are optional
- **Avatar Replacement**: Uploading a new avatar replaces the existing one
- **Avatar Persistence**: If no avatar is uploaded in update, existing avatar is preserved
- **File Storage**: Avatars are stored directly in the database as binary data
- **File Types**: Any image file type is supported
- **File Size**: Limited by server configuration (currently 50MB)

---

## **Dashboard Features**

- **Real-time Data**: Dashboard provides up-to-date information about user activities
- **Today's Focus**: Shows today's tasks and study sessions
- **Progress Tracking**: Displays completion statistics and progress metrics
- **Recent Activity**: Shows recent notes and Q&A activity
- **Study Plans**: Displays scheduled study sessions with duration estimates
- **Notifications**: Shows count of unread notifications
