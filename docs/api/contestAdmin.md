# Admin Contest API Documentation

This document provides details about the admin-specific endpoints in the `contestAdmin.js` file. These endpoints allow admins to manage contests, questions, and participants.

---

## **1. Get All Questions**
### **GET** `/api/admin/contests/questions`
Fetches all questions with filtering options for contest creation.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Query Parameters**:
  - `subject`: Filter by subject
  - `topics`: Filter by topics (array)
  - `difficulty`: Filter by difficulty
  - `page`: Page number (default: 1)
  - `limit`: Number of questions per page (default: 50)
  - `search`: Search query
  - `excludeContestId`: Exclude questions already assigned to a specific contest
- **Body**: None

#### Response Structure
```json
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": ["string"],
      "correctAnswer": "string",
      "explanation": "string",
      "subject": "string",
      "topics": ["string"],
      "difficulty": "MEDIUM",
      "createdAt": "datetime"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100
  }
}
```

---

## **2. Create a New Contest**
### **POST** `/api/admin/contests`
Creates a new contest with selected questions.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**:
```json
{
  "title": "string",
  "description": "string",
  "startTime": "datetime",
  "endTime": "datetime",
  "difficulty": "MEDIUM",
  "topics": ["string"],
  "eligibility": "string",
  "selectedQuestions": [
    {
      "questionId": "string",
      "points": 5
    }
  ]
}
```

#### Response Structure
```json
{
  "contest": {
    "id": "string",
    "title": "string",
    "description": "string",
    "startTime": "datetime",
    "endTime": "datetime",
    "status": "UPCOMING",
    "difficulty": "MEDIUM",
    "topics": ["string"],
    "eligibility": "string"
  }
}
```

---

## **3. Update Contest**
### **PUT** `/api/admin/contests/:id`
Updates basic information about a contest.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Contest ID
- **Body**:
```json
{
  "title": "string",
  "description": "string",
  "startTime": "datetime",
  "endTime": "datetime",
  "difficulty": "MEDIUM",
  "topics": ["string"],
  "eligibility": "string"
}
```

#### Response Structure
```json
{
  "contest": {
    "id": "string",
    "title": "string",
    "description": "string",
    "startTime": "datetime",
    "endTime": "datetime",
    "status": "UPCOMING",
    "difficulty": "MEDIUM",
    "topics": ["string"],
    "eligibility": "string"
  }
}
```

---

## **4. Add or Replace Questions in Contest**
### **PUT** `/api/admin/contests/:id/questions`
Replaces all questions in a contest with a new set.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Contest ID
- **Body**:
```json
{
  "questions": [
    {
      "questionId": "string",
      "points": 5
    }
  ]
}
```

#### Response Structure
```json
{
  "success": true,
  "message": "5 questions assigned to contest"
}
```

---

## **5. Get Contest Leaderboard**
### **GET** `/api/admin/contests/:id/leaderboard`
Fetches the leaderboard for a specific contest.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Contest ID
- **Body**: None

#### Response Structure
```json
{
  "contest": {
    "id": "string",
    "title": "string",
    "totalPoints": 100
  },
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": "string",
        "name": "string",
        "institution": "string"
      },
      "score": 90,
      "percentage": 90,
      "correctAnswers": 18,
      "totalQuestions": 20,
      "timeSpent": 1200
    }
  ]
}
```

---

## **6. Delete Contest**
### **DELETE** `/api/admin/contests/:id`
Deletes a contest if no attempts exist.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Contest ID
- **Body**: None

#### Response Structure
```json
{
  "success": true,
  "message": "Contest deleted successfully"
}
```
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Contest ID
- **Body**:
```json
{
  "questions": [
    {
      "questionId": "string",
      "points": 5
    }
  ]
}
```

#### Response Structure
```json
{
  "success": true,
  "message": "Contest questions updated. 5 questions assigned.",
  "totalQuestions": 5
}
```

---

## **8. Get Contest Leaderboard**
### **GET** `/api/admin/contests/:id/leaderboard`
Fetches the leaderboard for a specific contest.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Contest ID
- **Body**: None

#### Response Structure
```json
{
  "contest": {
    "id": "string",
    "title": "string",
    "status": "FINISHED",
    "startTime": "datetime",
    "endTime": "datetime",
    "totalPoints": 100
  },
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "institution": "string"
      },
      "score": 90,
      "percentage": 90,
      "correctAnswers": 18,
      "totalQuestions": 20,
      "timeSpent": 1200,
      "submissionTime": "datetime"
    }
  ],
  "totalParticipants": 10,
  "statistics": {
    "averageScore": 75,
    "averagePercentage": 75,
    "averageTimeSpent": 1300
  }
}
```

---

## **9. Export Contest Data**
### **GET** `/api/admin/contests/:id/export`
Exports contest data in JSON or CSV format.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Contest ID
- **Query Parameters**:
  - `format`: `json` (default) or `csv`
- **Body**: None

#### Response Structure
- **JSON**:
```json
{
  "contest": { ... },
  "questions": [ ... ],
  "registrations": [ ... ],
  "results": [ ... ],
  "statistics": { ... }
}
```
- **CSV**: Returns a CSV file for download.

---

## **10. Delete Contest**
### **DELETE** `/api/admin/contests/:id`
Deletes a contest if no attempts exist.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Contest ID
- **Body**: None

#### Response Structure
```json
{
  "success": true,
  "message": "Contest deleted successfully"
}
```
