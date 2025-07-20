# Model Test API Documentation

This document provides details about the endpoints in the `modelTest.js` file. These endpoints manage model tests, including creating, starting, submitting, and retrieving test attempts.

**Important Notes:**

- All endpoints require authentication via Bearer token in the `Authorization` header
- The `answers` field in the database uses Prisma's `Json` type, which handles JSON data automatically
- Route order matters: specific routes like `/recent-attempts` and `/stats` must be defined before parameterized routes like `/:id`

---

## **1. Get User's Past Model Tests**

### **GET** `/api/model-test/`

Fetches all past model tests for the authenticated user. Supports filtering by query parameters.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Query Parameters**:
  - `subjects` (optional): Comma-separated list of subjects to filter by (e.g., `Math,Science`).
  - `difficulty` (optional): Difficulty level to filter by (`EASY`, `MEDIUM`, `HARD`, `EXPERT`).
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
      "isCustom": false,
      "passingScore": 12,
      "totalPoints": 20,
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "questions": [
        {
          "id": "string",
          "question": "string",
          "options": {},
          "subject": "string",
          "topics": ["string"],
          "points": 5
        }
      ],
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
          "createdAt": "datetime"
        }
      ]
    }
  ]
}
```

---

## **2. Get User's Recent Attempts Across All Tests**

### **GET** `/api/model-test/recent-attempts`

**⚠️ Route Order Important:** This route must be defined before `/:id` route to avoid conflicts.

Fetches recent test attempts across all tests for the authenticated user.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Query Parameters**:
  - `limit` (optional): Number of attempts to return (default: 10)
- **Body**: None

#### Response Structure

```json
{
  "attempts": [
    {
      "id": "string",
      "testId": "string",
      "score": 15,
      "status": "COMPLETED",
      "startTime": "datetime",
      "endTime": "datetime",
      "timeSpent": 1200,
      "test": {
        "id": "string",
        "title": "Generated Test - Math",
        "totalPoints": 20
      }
    }
  ]
}
```

---

## **3. Get User's Overall Test Statistics**

### **GET** `/api/model-test/stats`

**⚠️ Route Order Important:** This route must be defined before `/:id` route to avoid conflicts.

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

## **4. Fetch Detailed Information About a Specific Model Test**

### **GET** `/api/model-test/:id`

Fetches detailed information about a specific model test, including correct answers and attempts.

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
    "isCustom": false,
    "passingScore": 12,
    "totalPoints": 20,
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": {},
        "correctAnswer": 1,
        "explanation": "string",
        "subject": "string",
        "topics": ["string"],
        "points": 5
      }
    ],
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
        "createdAt": "datetime"
      }
    ]
  }
}
```

---

## **5. Generate a New Model Test**

### **POST** `/api/model-test/create`

Creates a new model test based on the provided criteria by selecting questions from the question bank. The selection logic ensures a robust distribution of questions based on the specified difficulty level.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Body**:

```json
{
  "subjects": ["Math", "Science"],
  "topics": ["Algebra", "Physics"],
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
    "title": "Generated Test - Math, Science",
    "description": "Auto-generated test for Math, Science (MEDIUM)",
    "timeLimit": 60,
    "subjects": ["Math", "Science"],
    "topics": ["Algebra", "Physics"],
    "difficulty": "MEDIUM",
    "passingScore": 60,
    "totalPoints": 100,
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": {},
        "subject": "Math",
        "topics": ["Algebra"],
        "points": 5
      }
    ]
  }
}
```

#### Enhanced Logic for Question Selection

The distribution of questions is determined by the difficulty level of the test:

- **EASY**:
  - 70% easy questions
  - 20% medium questions
  - 10% hard questions
- **MEDIUM**:
  - 30% easy questions
  - 50% medium questions
  - 20% hard questions
- **HARD**:
  - 10% easy questions
  - 30% medium questions
  - 60% hard questions

The system ensures that the total number of questions matches the requested `questionCount`. If there are insufficient questions available for any difficulty level, an error is returned.

#### Error Responses

- **400 Bad Request**: If no subjects are provided or insufficient questions are available

```json
{
  "error": "At least one subject is required"
}
```

```json
{
  "error": "Only 15 questions available. Requested 20."
}
```

---

## **6. Start a Test Attempt**

### **POST** `/api/model-test/:id/start`

Starts a new attempt for a specific model test or resumes an existing in-progress attempt.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Model test ID
- **Body**: None

#### Response Structure

**New Attempt:**

```json
{
  "attemptId": "string",
  "timeLimit": 60,
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": {},
      "points": 5,
      "number": 1
    }
  ],
  "totalPoints": 20
}
```

**Resuming Existing Attempt:**

```json
{
  "attemptId": "string",
  "timeLimit": 60,
  "startTime": "datetime",
  "lastActivity": "datetime",
  "savedAnswers": {
    "questionId": "answer"
  },
  "isResuming": true,
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": {},
      "points": 5,
      "number": 1
    }
  ],
  "totalPoints": 20
}
```

#### Error Responses

- **404 Not Found**: If model test doesn't exist
- **400 Bad Request**: If test has no questions

---

## **7. Save Answer for a Question**

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
  "answer": 1
}
```

#### Response Structure

```json
{
  "success": true,
  "message": "Answer saved"
}
```

#### Error Responses

- **404 Not Found**: If active test attempt not found
- **400 Bad Request**: If question doesn't belong to the test

**Note:** Answers are automatically saved and merged with existing answers. The `lastActivity` timestamp is updated on each save.

---

## **8. Submit Test Attempt**

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
    "questionId1": 1,
    "questionId2": 3
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

#### Error Responses

- **404 Not Found**: If test attempt not found or already completed

**Note:** Submitted answers are merged with previously saved answers. The attempt status changes to "COMPLETED".

---

## **9. Get Attempt Results**

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
      "options": {},
      "correctAnswer": 1,
      "userAnswer": 2,
      "isCorrect": false,
      "explanation": "string",
      "subject": "string",
      "topics": ["string"],
      "points": 5
    }
  ]
}
```

#### Error Responses

- **404 Not Found**: If completed attempt not found

---

## **10. Get User's Attempts for a Specific Test**

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

## **11. Resume an In-Progress Test**

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
      "options": {},
      "points": 5,
      "number": 1
    }
  ],
  "savedAnswers": {
    "questionId": 1
  },
  "totalPoints": 20
}
```

#### Error Responses

- **404 Not Found**: If active test attempt not found

---

## **12. Delete a Specific Model Test**

### **DELETE** `/api/model-test/:id`

Deletes a specific model test and all associated data.

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

#### Error Responses

- **404 Not Found**: If model test not found

---

## **Data Types and Enums**

### Difficulty Levels

- `EASY`
- `MEDIUM`
- `HARD`
- `EXPERT`

### Attempt Status

- `IN_PROGRESS`
- `COMPLETED`

### Important Notes on Data Types

- `options`: Stored as JSON object in database
- `answers`: Stored as JSON object, automatically handled by Prisma
- `correctAnswer`: Integer representing the option index
- `userAnswer`: Integer representing the user's selected option
- `topics` and `subjects`: Arrays of strings
- `timeSpent`: Time in seconds
- `score` and `points`: Integer values

---

## **Error Handling**

All endpoints include proper error handling:

- **Authentication errors**: 401 Unauthorized
- **Authorization errors**: 403 Forbidden
- **Not found errors**: 404 Not Found
- **Validation errors**: 400 Bad Request
- **Server errors**: 500 Internal Server Error

Error logs are written to the console with detailed information for debugging.
