# Implement notification system requirements

---

**User**

I want to implement notification. check what needs to be done. notifications will be given for :

1. uploaded new note.
2. A task is out of date/time. a task just started, a session just started. when a task is completed. when a new task is added. new session is added. less than or equal to 30 minutes and 5 minutes left before a tasks deadline.
3. Contest is registered, unregistered. Upcoming contest before 30 minutes of starting for registered contest. Contest started from ongoing registered contest. Conetest ended, view ranking for registered contest.
4. someone upvote(not downvote) my question or my answer. If I asked a question notify questions is posted. Notify is someone replied to my question.
5. when login in, give a notification. after changing password, notify password was successfull changed

---

**Cursor**

To implement a notification system for your app, you’ll need to address both backend and frontend. Here’s a breakdown of what needs to be done, tailored to your requirements and your current codebase structure.

---

## 1. **Notification System Overview**

- **Backend**: Generate, store, and deliver notifications (real-time and/or on request).
- **Frontend**: Display notifications, mark as read, and possibly show a notification badge/dropdown.

---

## 2. **Notification Triggers (per your requirements)**

### Notes

- When a new note is uploaded.

### Tasks & Sessions

- Task is out of date/time (overdue).
- Task just started.
- Session just started.
- Task completed.
- New task added.
- New session added.
- 30 minutes and 5 minutes before a task’s deadline.

### Contests

- Contest registered/unregistered.
- 30 minutes before a registered contest starts.
- Contest started (for registered users).
- Contest ended (for registered users, with ranking view prompt).

### Q&A

- Someone upvotes your question/answer.
- You posted a question (confirmation).
- Someone replied to your question.

### Account

- On login.
- After password change.

---

## 3. **What Needs to be Done**

### **A. Backend**

1. **Notification Model**

   - Add a `Notification` table/model in your database (Prisma schema).
   - Fields: id, userId, type, message, data (JSON), read (bool), createdAt, etc.
2. **Notification Service/Utils**

   - Functions to create notifications for each event.
   - Optionally, a job/cron for time-based triggers (e.g., 30/5 min before deadlines).
3. **API Endpoints**

   - Get notifications for a user.
   - Mark as read.
   - (Optional) Real-time: WebSocket or Server-Sent Events for instant delivery.
4. **Trigger Points**

   - Add notification creation logic in relevant routes/services:
     - Notes: after upload.
     - Tasks: on create, complete, start, overdue, deadline approaching.
     - Contests: on register/unregister, start, end, reminder.
     - Q&A: on upvote, reply, post.
     - Account: on login, password change.

### **B. Frontend**

1. **Notification UI**

   - Notification dropdown/bell (see `notification-dropdown.tsx`).
   - List of notifications (read/unread).
   - Badge for unread count.
2. **API Integration**

   - Fetch notifications from backend.
   - Mark as read.
   - (Optional) Listen for real-time updates.
3. **Trigger Points**

   - Show notification on relevant events (login, password change, etc.).

---

## 4. **Codebase-Specific Notes**

- You already have a `notification-dropdown.tsx` component in `Cognitia_Frontend/components/`.
- There is a `notification-data.ts` in `lib/` (likely mock data).
- No backend notification model or API is visible yet.

---

## 5. **Suggested Next Steps**

1. **Backend**

   - [ ] Add `Notification` model to Prisma schema.
   - [ ] Create notification service/utils.
   - [ ] Add notification logic to relevant backend routes/services.
   - [ ] Create notification API endpoints.
   - [ ] (Optional) Add real-time notification delivery.
2. **Frontend**

   - [ ] Connect notification UI to backend API.
   - [ ] Display notifications and unread badge.
   - [ ] Mark notifications as read.
   - [ ] (Optional) Add real-time updates.

---

## 6. **Example: Notification Model (Prisma)**

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String
  message   String
  data      Json?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 7. **Would you like to start with the backend model and API, or the frontend integration?**

Or do you want a detailed step-by-step plan for both?

```plaintext
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String
  message   String
  data      Json?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```
