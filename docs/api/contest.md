# Contest API Documentation

This document provides details about the endpoints in the `contest.js` file. These endpoints manage contests, including creating, registering, starting, submitting, and retrieving contest attempts.

---

## **1. Get All Available Contests**
### **GET** `/api/contests/`
Fetches all available contests, including upcoming, ongoing, and recently finished contests.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure
```json
{
  "contests": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "startTime": "datetime",
      "endTime": "datetime",
      "status": "UPCOMING",
      "difficulty": "MEDIUM",
      "participants": 10,
      "topics": ["string"],
      "eligibility": "string",
      "questionCount": 20,
      "registeredUsers": 5,
      "isRegistered": true,
      "hasAttempted": false
    }
  ]
}
```

---

## **2. Register for a Contest**
### **POST** `/api/contests/:id/register`
Registers the authenticated user for a specific contest.

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
  "message": "Successfully registered for contest"
}
```

---

## **3. Get Registered Contests**
### **GET** `/api/contests/registered`
Fetches all contests that the authenticated user has registered for.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure
```json
{
  "contests": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "startTime": "datetime",
      "endTime": "datetime",
      "status": "UPCOMING",
      "difficulty": "MEDIUM",
      "questionCount": 20,
      "registrationTime": "datetime"
    }
  ]
}
```

---

## **4. Start a Contest Attempt**
### **POST** `/api/contests/:id/start`
Starts a new attempt for a specific contest.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Contest ID
- **Body**: None

#### Response Structure
```json
{
  "attemptId": "string",
  "startTime": "datetime",
  "endTime": "datetime",
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": ["string"],
      "points": 5,
      "number": 1
    }
  ],
  "totalQuestions": 20
}
```

---

## **5. Save Answer for a Question**
### **POST** `/api/contests/attempt/:attemptId/answer`
Saves the user's answer for a specific question during a contest attempt.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `attemptId`: Contest attempt ID
- **Body**:
```json
{
  "questionId": "string",
  "answer": "string"
}
```

#### Response Structure
```json
{
  "success": true,
  "message": "Answer saved"
}
```

---

## **6. Submit Contest Attempt**
### **POST** `/api/contests/attempt/:attemptId/submit`
Submits the user's contest attempt and calculates the score.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `attemptId`: Contest attempt ID
- **Body**:
```json
{
  "timeSpent": 1200
}
```

#### Response Structure
```json
{
  "success": true,
  "message": "Contest attempt submitted successfully",
  "score": 15,
  "correctAnswers": 3,
  "totalQuestions": 5
}
```

---

## **7. Get Contest Attempt Results**
### **GET** `/api/contests/attempt/:attemptId/results`
Fetches detailed results for a completed contest attempt.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `attemptId`: Contest attempt ID
- **Body**: None

#### Response Structure
```json
{
  "attempt": {
    "id": "string",
    "score": 15,
    "correctAnswers": 3,
    "totalQuestions": 5,
    "timeSpent": 1200,
    "percentage": 75
  },
  "contest": {
    "id": "string",
    "title": "string"
  },
  "questions": [
    {
      "number": 1,
      "id": "string",
      "question": "string",
      "options": ["string"],
      "correctAnswer": "string",
      "userAnswer": "string",
      "isCorrect": true,
      "explanation": "string",
      "subject": "string",
      "topics": ["string"],
      "points": 5
    }
  ]
}
```

---

## **8. Get Contest Rankings**
### **GET** `/api/contests/:id/rankings`
Fetches rankings for a specific contest after it has ended.

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
    "title": "string"
  },
  "rankings": [
    {
      "rank": 1,
      "userId": "string",
      "name": "string",
      "institution": "string",
      "score": 15,
      "correctAnswers": 3,
      "totalQuestions": 5,
      "timeSpent": 1200,
      "isCurrentUser": true
    }
  ],
  "totalParticipants": 10
}
```
      "isCurrentUser": true
    }
  ],
  "totalParticipants": 10,
  "userRank": 1
}
```

---

## **9. Get Contest Details**
### **GET** `/api/contests/:id`
Fetches detailed information about a specific contest for registered users.

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
    "description": "string",
    "startTime": "datetime",
    "endTime": "datetime",
    "status": "ONGOING",
    "difficulty": "MEDIUM",
    "topics": ["string"],
    "eligibility": "string",
    "registeredCount": 10,
    "questionCount": 20,
    "userStatus": {
      "isRegistered": true,
      "hasAttempted": false,
      "attemptStatus": null,
      "score": null
    }
  }
}
```

---

## **10. Get User Contest Statistics**
### **GET** `/api/contests/user/stats`
Fetches overall statistics for the authenticated user's contest participation.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure
```json
{
  "totalRegistrations": 5,
  "totalAttempts": 3,
  "completionRate": 60,
  "averageScore": 15,
  "averageTimeSpent": 1200,
  "highestScore": 20,
  "lowestScore": 10,
  "recentAttempts": [
    {
      "contestId": "string",
      "contestTitle": "string",
      "score": 15,
      "correctAnswers": 3,
      "totalQuestions": 5,
      "timeSpent": 1200,
      "createdAt": "datetime"
    }
  ]
}
```

---

## **11. Update Contest Status**
### **PATCH** `/api/contests/:id/status`
Updates the status of a contest (admin only).

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Contest ID
- **Body**:
```json
{
  "status": "ONGOING"
}
```

#### Response Structure
```json
{
  "success": true,
  "contest": {
    "id": "string",
    "status": "ONGOING"
  }
}
```

---

## **12. Auto-Submit Expired Contest Attempts**
### **POST** `/api/contests/auto-submit-expired`
Automatically submits all expired contest attempts (admin only).

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure
```json
{
  "success": true,
  "submittedAttempts": 5
}
```
```json
{
  "success": true,
  "submittedAttempts": 5
}
```
