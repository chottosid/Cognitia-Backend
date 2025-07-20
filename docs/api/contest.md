# Contest API Documentation

This document provides details about the endpoints in the `contest.js` file. These endpoints manage contests, including registration, participation, and result tracking.

**Important Notes:**

- All endpoints require authentication via Bearer token in the `Authorization` header
- Contest timing is strictly enforced with auto-submission when contests end
- Users can resume contests after disconnection
- Answers are automatically saved and can be retrieved when resuming

---

## **1. Get All Available Contests**

### **GET** `/api/contest/`

Fetches all available contests with user-specific information about registration and attempts.

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
      "participants": 150,
      "topics": ["Math", "Science"],
      "eligibility": "Open to all students",
      "questionCount": 25,
      "registeredUsers": 200,
      "isRegistered": true,
      "hasAttempted": false,
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

#### Contest Status

- `UPCOMING`: Contest hasn't started yet
- `ONGOING`: Contest is currently active
- `FINISHED`: Contest has ended

---

## **2. Register for a Contest**

### **POST** `/api/contest/:id/register`

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

#### Error Responses

- **404 Not Found**: Contest not found
- **400 Bad Request**: Registration closed (contest not UPCOMING) or already registered

---

## **3. Get Registered Contests**

### **GET** `/api/contest/registered`

Fetches all contests that the user has registered for.

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
      "questionCount": 25,
      "registrationTime": "datetime"
    }
  ]
}
```

---

## **4. Check Current Contest Attempt (Resume)**

### **GET** `/api/contest/attempt/current`

**⚠️ Route Order Important:** This route must be defined before parameterized routes.

Checks if the user has any active contest attempt that can be resumed. Also handles auto-submission if contest has ended.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure

**Active Attempt Found:**

```json
{
  "attempt": {
    "id": "string",
    "contestId": "string",
    "contestTitle": "Math Championship 2024",
    "startTime": "datetime",
    "endTime": "datetime",
    "lastActivity": "datetime",
    "savedAnswers": {
      "questionId1": 2,
      "questionId2": 1
    },
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": {},
        "points": 5,
        "number": 1
      }
    ],
    "totalQuestions": 25,
    "timeRemaining": 1800000
  }
}
```

**No Active Attempt:**

```json
{
  "attempt": null
}
```

**Contest Auto-Submitted:**

```json
{
  "attempt": null,
  "message": "Contest has ended and was auto-submitted"
}
```

---

## **5. Start Contest Attempt**

### **POST** `/api/contest/:id/start`

Starts a new contest attempt or resumes an existing one.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Params**:
  - `id`: Contest ID
- **Body**: None

#### Response Structure

**New Attempt:**

```json
{
  "attemptId": "string",
  "startTime": "datetime",
  "endTime": "datetime",
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": {},
      "points": 5,
      "number": 1
    }
  ],
  "totalQuestions": 25,
  "timeRemaining": 3600000
}
```

**Resuming Existing Attempt:**

```json
{
  "attemptId": "string",
  "startTime": "datetime",
  "endTime": "datetime",
  "lastActivity": "datetime",
  "savedAnswers": {
    "questionId": 2
  },
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": {},
      "points": 5,
      "number": 1
    }
  ],
  "totalQuestions": 25,
  "isResuming": true,
  "timeRemaining": 2400000
}
```

#### Error Responses

- **404 Not Found**: Contest not found
- **400 Bad Request**: Contest not started, already ended, or already completed
- **403 Forbidden**: Not registered for contest

---

## **6. Save Answer During Contest**

### **POST** `/api/contest/attempt/:attemptId/answer`

Saves user's answer for a specific question during the contest. Includes auto-submission if contest ends.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Params**:
  - `attemptId`: Contest attempt ID
- **Body**:

```json
{
  "questionId": "string",
  "answer": 2
}
```

#### Response Structure

**Success:**

```json
{
  "success": true,
  "message": "Answer saved",
  "timeRemaining": 1800000
}
```

**Contest Ended (Auto-Submit):**

```json
{
  "error": "Contest has ended",
  "autoSubmitted": true
}
```

#### Error Responses

- **404 Not Found**: Active contest attempt not found
- **400 Bad Request**: Question doesn't belong to contest or contest has ended

**Note:** Answers are automatically saved and can be retrieved when resuming. The `lastActivity` timestamp is updated on each save.

---

## **7. Submit Contest Attempt**

### **POST** `/api/contest/attempt/:attemptId/submit`

Submits the user's contest attempt manually or handles auto-submission.

#### Request Structure

- **Headers**:
  - `Authorization`: Bearer token
- **Params**:
  - `attemptId`: Contest attempt ID
- **Body**:

```json
{
  "timeSpent": 2400,
  "isAutoSubmit": false
}
```

#### Response Structure

```json
{
  "success": true,
  "message": "Contest attempt submitted successfully",
  "score": 85,
  "correctAnswers": 17,
  "totalQuestions": 25,
  "isAutoSubmitted": false
}
```

#### Error Responses

- **404 Not Found**: Active contest attempt not found

**Note:** If `timeSpent` is not provided, it's calculated automatically from start time.

---

## **8. Get Contest Attempt Results**

### **GET** `/api/contest/attempt/:attemptId/results`

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
    "score": 85,
    "correctAnswers": 17,
    "totalQuestions": 25,
    "timeSpent": 2400,
    "percentage": 85
  },
  "contest": {
    "id": "string",
    "title": "Math Championship 2024"
  },
  "questions": [
    {
      "number": 1,
      "id": "string",
      "question": "string",
      "options": {},
      "correctAnswer": 2,
      "userAnswer": 1,
      "isCorrect": false,
      "explanation": "string",
      "subject": "Math",
      "topics": ["Algebra"],
      "points": 5
    }
  ]
}
```

#### Error Responses

- **404 Not Found**: Completed attempt not found

---

## **9. Get Contest Rankings**

### **GET** `/api/contest/:id/rankings`

Fetches the leaderboard/rankings for a specific contest.

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
    "title": "Math Championship 2024"
  },
  "rankings": [
    {
      "rank": 1,
      "userId": "string",
      "name": "John Doe",
      "institution": "ABC University",
      "score": 95,
      "correctAnswers": 19,
      "totalQuestions": 25,
      "timeSpent": 1800,
      "isCurrentUser": false
    }
  ],
  "totalParticipants": 150
}
```

#### Error Responses

- **404 Not Found**: Contest not found

---

## **10. Check Contest Status**

### **GET** `/api/contest/:id/status`

**⚠️ Route Order Important:** This route should be defined before `/:id/start` to avoid conflicts.

Checks the current status and timing information of a contest.

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
    "title": "Math Championship 2024",
    "startTime": "datetime",
    "endTime": "datetime",
    "status": "ONGOING",
    "timeToStart": 0,
    "timeToEnd": 1800000,
    "isActive": true,
    "hasStarted": true,
    "hasEnded": false
  }
}
```

#### Time Fields

- `timeToStart`: Milliseconds until contest starts (0 if already started)
- `timeToEnd`: Milliseconds until contest ends (0 if already ended)
- `isActive`: `true` if contest is currently ongoing
- `hasStarted`: `true` if contest start time has passed
- `hasEnded`: `true` if contest end time has passed

---

## **Auto-Submission Mechanism**

The system includes several auto-submission safeguards:

1. **Time-based Auto-submission**: When a contest ends, any active attempts are automatically submitted
2. **Answer Saving Auto-submission**: If a user tries to save an answer after contest ends, the attempt is auto-submitted
3. **Resume Auto-submission**: When checking for current attempts, ended contests are auto-submitted

### Auto-Submission Process

1. Calculates score based on saved answers
2. Updates attempt status to "COMPLETED"
3. Sets end time to contest end time
4. Calculates time spent from start time to end time
5. Logs the auto-submission for monitoring

---

## **Data Types and Enums**

### Contest Status

- `UPCOMING`: Contest registration is open, contest hasn't started
- `ONGOING`: Contest is currently active, users can participate
- `FINISHED`: Contest has ended

### Difficulty Levels

- `EASY`
- `MEDIUM`
- `HARD`
- `EXPERT`

### Attempt Status

- `IN_PROGRESS`: User is currently taking the contest
- `COMPLETED`: Contest attempt has been submitted (manually or auto)

---

## **Important Implementation Notes**

### Route Ordering

Routes must be defined in this specific order to avoid conflicts:

1. `/api/contest/registered`
2. `/api/contest/attempt/current`
3. `/api/contest/:id/status`
4. `/api/contest/:id/register`
5. `/api/contest/:id/start`
6. `/api/contest/:id/rankings`
7. `/api/contest/attempt/:attemptId/answer`
8. `/api/contest/attempt/:attemptId/submit`
9. `/api/contest/attempt/:attemptId/results`
10. `/api/contest/` (GET all contests)

### Database Constraints

- **Unique Contest Attempts**: Each user can have only one attempt per contest (enforced by unique constraint on `contestId` and `userId`)
- **Answer Storage**: Answers are stored as JSON with question IDs as keys and selected option numbers as values
- **Auto-Submission Logging**: All auto-submissions are logged to console for monitoring

### Error Handling

All endpoints include comprehensive error handling:

- **Authentication errors**: 401 Unauthorized
- **Authorization errors**: 403 Forbidden
- **Not found errors**: 404 Not Found
- **Validation errors**: 400 Bad Request
- **Server errors**: 500 Internal Server Error

### Performance Considerations

- Contest queries include necessary relations only
- Indexes should be added on frequently queried fields
- Answer saving operations are optimized for frequent updates
- Auto-submission runs asynchronously to avoid blocking requests
