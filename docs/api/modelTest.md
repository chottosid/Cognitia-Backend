# Model Test API Documentation

This document provides details about the endpoints in the `modelTest.js` file. These endpoints manage model tests, including creating, starting, submitting, and retrieving test attempts.

---

## **1. Get User's Past Model Tests**
### **GET** `/api/model-test/`
Fetches all past model tests for the authenticated user.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure
```json
{
  "modelTests": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "timeLimit": 60,
      "subjects": ["string"],
      "topics": ["string"],
      "difficulty": "MEDIUM",
      "createdAt": "datetime",
      "questions": [
        {
          "id": "string",
          "question": "string",
          "options": ["string"],
          "subject": "string",
          "topics": ["string"],
          "points": 5
        }
      ],
      "attempts": [
        {
          "id": "string",
          "score": 15,
          "correctAnswers": 3,
          "totalQuestions": 5,
          "timeSpent": 1200,
          "createdAt": "datetime"
        }
      ]
    }
  ]
}
```

---

## **2. Fetch Detailed Information About a Specific Model Test**
### **GET** `/api/model-test/:id`
Fetches detailed information about a specific model test, including answers and attempts.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Model test ID
- **Body**: None

#### Response Structure
```json
{
  "modelTest": {
    "id": "string",
    "title": "string",
    "description": "string",
    "timeLimit": 60,
    "subjects": ["string"],
    "topics": ["string"],
    "difficulty": "MEDIUM",
    "passingScore": 12,
    "totalPoints": 20,
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": ["string"],
        "correctAnswer": "string",
        "explanation": "string",
        "subject": "string",
        "topics": ["string"],
        "points": 5
      }
    ],
    "attempts": [
      {
        "id": "string",
        "status": "IN_PROGRESS",
        "score": 15,
        "correctAnswers": 3,
        "totalQuestions": 5,
        "timeSpent": 1200,
        "startTime": "datetime",
        "endTime": "datetime",
        "createdAt": "datetime"
      }
    ]
  }
}
```

---

## **3. Generate a New Model Test**
### **POST** `/api/model-test/generate`
Creates a new model test based on the provided criteria.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**:
```json
{
  "subjects": ["string"],
  "topics": ["string"],
  "difficulty": "MEDIUM",
  "timeLimit": 60,
  "questionCount": 20
}
```

#### Response Structure
```json
{
  "modelTest": {
    "id": "string",
    "title": "string",
    "description": "string",
    "timeLimit": 60,
    "subjects": ["string"],
    "topics": ["string"],
    "difficulty": "MEDIUM",
    "passingScore": 12,
    "totalPoints": 20,
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": ["string"],
        "subject": "string",
        "topics": ["string"],
        "points": 5
      }
    ]
  }
}
```

---

## **4. Start a Test Attempt**
### **POST** `/api/model-test/:id/start`
Starts a new attempt for a specific model test.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Model test ID
- **Body**: None

#### Response Structure
```json
{
  "attemptId": "string",
  "timeLimit": 60,
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": ["string"],
      "points": 5,
      "number": 1
    }
  ],
  "totalPoints": 20
}
```

---

## **5. Save Answer for a Question**
### **POST** `/api/model-test/attempt/:attemptId/answer`
Saves the user's answer for a specific question during a test attempt.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `attemptId`: Test attempt ID
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

## **6. Submit Test Attempt**
### **POST** `/api/model-test/attempt/:attemptId/submit`
Submits the user's test attempt and calculates the score.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `attemptId`: Test attempt ID
- **Body**:
```json
{
  "answers": {
    "questionId": "string"
  },
  "timeSpent": 1200,
  "autoSubmit": false
}
```

#### Response Structure
```json
{
  "success": true,
  "message": "Test attempt submitted successfully",
  "score": 15,
  "correctAnswers": 3,
  "totalQuestions": 5,
  "passed": true
}
```

---

## **7. Get Attempt Results**
### **GET** `/api/model-test/attempt/:attemptId/results`
Fetches detailed results for a completed test attempt.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `attemptId`: Test attempt ID
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
    "passed": true,
    "percentage": 75
  },
  "test": {
    "title": "string",
    "totalPoints": 20,
    "passingScore": 12
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

## **8. Get User's Attempts for a Specific Test**
### **GET** `/api/model-test/:id/attempts`
Retrieves all completed attempts for a specific model test.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Model test ID
- **Body**: None

#### Response Structure
```json
{
  "attempts": [
    {
      "id": "string",
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

## **9. Delete a Specific Model Test**
### **DELETE** `/api/model-test/:id`
Deletes a specific model test.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Model test ID
- **Body**: None

#### Response Structure
```json
{
  "success": true,
  "message": "Model test deleted successfully"
}
```

---

## **10. Get User's Overall Test Statistics**
### **GET** `/api/model-test/stats`
Fetches overall statistics for the authenticated user across all their tests.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure
```json
{
  "totalAttempts": 15,
  "totalTests": 5,
  "averageScore": 78,
  "averageTimeSpent": 1250,
  "highestScore": 95,
  "lowestScore": 60
}
```

---

## **11. Get User's Recent Attempts Across All Tests**
### **GET** `/api/model-test/recent-attempts`
Fetches recent test attempts across all tests for the authenticated user.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Query Parameters**:
  - `limit`: Number of attempts to return (default: 10)
- **Body**: None

#### Response Structure
```json
{
  "attempts": [
    {
      "id": "string",
      "status": "COMPLETED",
      "score": 15,
      "correctAnswers": 3,
      "totalQuestions": 5,
      "timeSpent": 1200,
      "startTime": "datetime",
      "endTime": "datetime",
      "createdAt": "datetime",
      "test": {
        "title": "Generated Test - Math",
        "totalPoints": 20
      }
    }
  ]
}
```

---

## **12. Resume an In-Progress Test**
### **GET** `/api/model-test/attempt/:attemptId/resume`
Resumes an in-progress test attempt with saved answers.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Params**:
  - `attemptId`: Test attempt ID
- **Body**: None

#### Response Structure
```json
{
  "attemptId": "string",
  "timeLimit": 60,
  "startTime": "datetime",
  "lastActivity": "datetime",
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": ["string"],
      "points": 5,
      "number": 1
    }
  ],
  "savedAnswers": {
    "questionId": "answer"
  },
  "totalPoints": 20
}
```
