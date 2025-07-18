# Q&A API Documentation

This document provides details about the endpoints in the `qa.js` file. These endpoints manage questions, answers, voting, and tag functionality for the Q&A system.

---

## **1. Get Questions**
### **GET** `/api/qa/questions`
Fetches a paginated list of questions with filtering and sorting options.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Query Parameters**:
  - `page`: number (default: 1) - Page number for pagination
  - `limit`: number (default: 10) - Number of questions per page
  - `search`: string (optional) - Search term for title and content
  - `tags`: string or array (optional) - Filter by tags (comma-separated or array)
  - `sortBy`: string (default: "createdAt") - Sort field (createdAt, updatedAt, title, views)
  - `sortOrder`: string (default: "DESC") - Sort order (ASC, DESC)
  - `userId`: string (optional) - Filter questions by specific user
  - `status`: string (default: "all") - Filter by status (all, resolved, unresolved)

#### Response Structure
```json
{
  "questions": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "subject": "string",
      "tags": ["string"],
      "author": {
        "id": "string",
        "name": "string",
        "avatar": "bytes|null"
      },
      "createdAt": "datetime",
      "updatedAt": "datetime",
      "views": 0,
      "upvotes": 5,
      "downvotes": 1,
      "answerCount": 3,
      "isAnswered": true,
      "isFeatured": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## **2. Get Single Question**
### **GET** `/api/qa/questions/:id`
Fetches a specific question by ID with detailed information and increments view count.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Parameters**:
  - `id`: string - Question ID

#### Response Structure
```json
{
  "question": {
    "id": "string",
    "title": "string",
    "content": "string",
    "subject": "string",
    "tags": ["string"],
    "author": {
      "id": "string",
      "name": "string",
      "avatar": "bytes|null"
    },
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "views": 15,
    "upvotes": 8,
    "downvotes": 2,
    "answerCount": 4,
    "isAnswered": true,
    "isFeatured": false
  }
}
```

---

## **3. Get Question Answers**
### **GET** `/api/qa/questions/:id/answers`
Fetches all answers for a specific question, ordered by creation date.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Parameters**:
  - `id`: string - Question ID

#### Response Structure
```json
{
  "answers": [
    {
      "id": "string",
      "content": "string",
      "author": {
        "id": "string",
        "name": "string",
        "avatar": "bytes|null"
      },
      "createdAt": "datetime",
      "upvotes": 3,
      "downvotes": 0
    }
  ]
}
```

---

## **4. Create Question**
### **POST** `/api/qa/questions`
Creates a new question for the authenticated user.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "title": "string",
  "content": "string",
  "tags": ["string"],
  "subject": "string"
}
```

#### Response Structure
```json
{
  "message": "Question created successfully",
  "question": {
    "id": "string",
    "title": "string",
    "body": "string",
    "tags": ["string"],
    "subject": "string",
    "authorId": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "views": 0,
    "author": {
      "id": "string",
      "name": "string",
      "avatar": "bytes|null"
    }
  }
}
```

---

## **5. Create Answer**
### **POST** `/api/qa/questions/:id/answers`
Creates a new answer for a specific question.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
  - `Content-Type`: `application/json`
- **Parameters**:
  - `id`: string - Question ID
- **Body**:
```json
{
  "content": "string"
}
```

#### Validation
- Content must be at least 10 characters long
- Question must exist
- User must be authenticated

#### Response Structure
```json
{
  "message": "Answer created successfully",
  "answer": {
    "id": "string",
    "content": "string",
    "questionId": "string",
    "authorId": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "author": {
      "id": "string",
      "name": "string",
      "avatar": "bytes|null"
    }
  }
}
```

---

## **6. Vote on Question or Answer**
### **POST** `/api/qa/vote`
Allows users to upvote or downvote questions and answers.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "targetType": "question" | "answer",
  "targetId": "string",
  "voteType": "UP" | "DOWN"
}
```

#### Validation
- Users cannot vote on their own questions/answers
- Target must exist
- Vote type must be UP or DOWN
- Target type must be question or answer

#### Voting Logic
- **First Vote**: Creates new vote record
- **Same Vote**: Removes existing vote (toggle off)
- **Different Vote**: Updates existing vote to new type

#### Response Structure
```json
{
  "message": "Vote updated successfully",
  "voteCount": 5,
  "upVotes": 8,
  "downVotes": 3
}
```

---

## **7. Get Trending Tags**
### **GET** `/api/qa/tags/trending`
Fetches the most popular tags from questions created in the last 30 days.

#### Request Structure
- **Headers**: 
  - `Authorization`: Bearer token
- **Body**: None

#### Response Structure
```json
{
  "tags": [
    {
      "tag": "javascript",
      "count": 15
    },
    {
      "tag": "python",
      "count": 12
    },
    {
      "tag": "react",
      "count": 8
    }
  ]
}
```

---

## **Error Responses**

All endpoints may return the following error responses:

### **400 Bad Request**
```json
{
  "error": "Validation error message"
}
```

### **401 Unauthorized**
```json
{
  "error": "Authentication required"
}
```

### **403 Forbidden**
```json
{
  "error": "Permission denied"
}
```

### **404 Not Found**
```json
{
  "error": "Resource not found"
}
```

### **500 Internal Server Error**
```json
{
  "error": "Server error message",
  "details": "Detailed error information"
}
```

---

## **Features Overview**

### **Search & Filtering**
- **Full-text search**: Search in question titles and content
- **Tag filtering**: Filter by one or multiple tags
- **User filtering**: View questions from specific users
- **Status filtering**: Filter by answered/unanswered questions

### **Sorting Options**
- **By Date**: createdAt, updatedAt
- **By Activity**: views
- **By Title**: Alphabetical sorting
- **Order**: Ascending or descending

### **Voting System**
- **Democratic voting**: Users can upvote or downvote content
- **Self-vote prevention**: Users cannot vote on their own content
- **Vote toggling**: Same vote removes the vote, different vote updates it
- **Real-time counts**: Vote counts are calculated dynamically

### **Content Management**
- **Rich content**: Support for detailed questions and answers
- **Tagging system**: Categorize questions with multiple tags
- **Subject classification**: Organize by academic subjects
- **View tracking**: Track question popularity through view counts

### **User Experience**
- **Pagination**: Efficient loading of large question sets
- **Author information**: Display author details with avatars
- **Trending tags**: Discover popular topics
- **Real-time updates**: Live vote counts and answer counts

---

## **Usage Examples**

### **Get Questions with Filters**
```bash
GET /api/qa/questions?search=javascript&tags=frontend,react&sortBy=views&sortOrder=desc&page=1&limit=5
```

### **Create a Question**
```bash
POST /api/qa/questions
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "How to implement React hooks?",
  "content": "I'm learning React and want to understand how to use hooks effectively...",
  "tags": ["react", "javascript", "hooks"],
  "subject": "Web Development"
}
```

### **Vote on Content**
```bash
POST /api/qa/vote
Content-Type: application/json
Authorization: Bearer <token>

{
  "targetType": "question",
  "targetId": "cuid123",
  "voteType": "UP"
}
```
