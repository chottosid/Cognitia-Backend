# Authentication API Documentation

This document provides details about the endpoints in the `auth.js` file. These endpoints manage user authentication, including registration with avatar upload, OTP verification, and login.

---

## **1. User Registration**
### **POST** `/api/auth/register`
Registers a new user with optional avatar upload and sends OTP for verification.

#### Request Structure
- **Headers**: 
  - `Content-Type`: `multipart/form-data`
- **Body** (Form Data):
  - `name`: string (required) - 2-100 characters
  - `email`: string (required) - valid email address
  - `password`: string (required) - minimum 8 characters with uppercase, lowercase, number, special character
  - `role`: string (optional) - "STUDENT" (default) or "TEACHER"
  - `bio`: string (optional)
  - `institution`: string (optional)
  - `avatar`: file (optional) - image file stored as binary data

#### Response Structure
```json
{
  "message": "OTP sent to email. Please verify to complete registration."
}
```

#### Error Responses
```json
{
  "error": "User already exists with this email" | "Registration failed"
}
```

---

## **2. OTP Verification**
### **POST** `/api/auth/verify-otp`
Verifies the OTP sent to user's email to complete registration.

#### Request Structure
- **Headers**: 
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "email": "string",
  "otp": "string"
}
```

#### Response Structure
```json
{
  "message": "Registration complete. You can now log in."
}
```

#### Error Responses
```json
{
  "error": "No OTP found for this user" | "Invalid OTP" | "OTP expired" | "OTP verification failed"
}
```

---

## **3. User Login**
### **POST** `/api/auth/login`
Authenticates a user and returns a JWT token.

#### Request Structure
- **Headers**: 
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

#### Response Structure
```json
{
  "message": "Login successful",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "STUDENT",
    "avatar": "bytes|null",
    "bio": "string",
    "institution": "string",
    "graduationYear": "number|null",
    "major": "string|null",
    "grade": "string|null",
    "location": "string|null",
    "website": "string|null",
    "verified": true,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "token": "string"
}
```

#### Error Responses
```json
{
  "error": "Invalid credentials" | "User not verified. Please check your email for OTP." | "Login failed"
}
```

---

## **Authentication Flow**

1. **Registration**: User submits registration form with optional avatar
2. **OTP Generation**: System generates 6-digit OTP valid for 10 minutes
3. **Email Sending**: OTP is sent to user's email address
4. **OTP Verification**: User submits OTP to verify email
5. **Account Activation**: User account is marked as verified
6. **Login**: User can now login with email and password

---

## **Avatar Handling Notes**

- **Avatar Storage**: Avatar images are stored directly in the database as binary data (Bytes)
- **Avatar Types**: Any image file type is supported
- **Avatar Size**: Limited by server configuration (currently 50MB)
- **Avatar Optional**: Avatar upload is optional during registration
- **Avatar Access**: Avatar can be accessed through the dashboard API endpoints

---

## **Security Notes**

- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **OTP Expiry**: OTP expires after 10 minutes
- **JWT Token**: Token contains user ID and role for authorization
- **Rate Limiting**: Consider implementing rate limiting for registration and login attempts
- **Email Verification**: Users must verify email before they can login
