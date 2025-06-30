export interface Notification {
  id: string
  type: "answer" | "comment" | "acceptance" | "mention"
  questionId: string
  questionTitle: string
  answerId?: string
  actorId: string
  actorName: string
  actorAvatar: string
  createdAt: Date
  isRead: boolean
}

// Generate a random ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Helper function to create dates in the past
function minutesAgo(minutes: number): Date {
  const date = new Date()
  date.setMinutes(date.getMinutes() - minutes)
  return date
}

function hoursAgo(hours: number): Date {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date
}

function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

// Mock notifications data
export const NOTIFICATIONS: Notification[] = [
  {
    id: generateId(),
    type: "answer",
    questionId: "q1",
    questionTitle: "How do I solve this differential equation?",
    answerId: "a1",
    actorId: "u2",
    actorName: "Jane Smith",
    actorAvatar: "/placeholder.svg?height=40&width=40",
    createdAt: minutesAgo(5),
    isRead: false,
  },
  {
    id: generateId(),
    type: "comment",
    questionId: "q2",
    questionTitle: "What's the best way to study for the physics exam?",
    actorId: "u3",
    actorName: "Alex Johnson",
    actorAvatar: "/placeholder.svg?height=40&width=40",
    createdAt: minutesAgo(30),
    isRead: false,
  },
  {
    id: generateId(),
    type: "acceptance",
    questionId: "q3",
    questionTitle: "Can someone explain quantum entanglement?",
    answerId: "a3",
    actorId: "u4",
    actorName: "Sam Wilson",
    actorAvatar: "/placeholder.svg?height=40&width=40",
    createdAt: hoursAgo(2),
    isRead: true,
  },
  {
    id: generateId(),
    type: "answer",
    questionId: "q4",
    questionTitle: "How do I balance this chemical equation?",
    answerId: "a4",
    actorId: "u5",
    actorName: "Emily Chen",
    actorAvatar: "/placeholder.svg?height=40&width=40",
    createdAt: hoursAgo(5),
    isRead: true,
  },
  {
    id: generateId(),
    type: "mention",
    questionId: "q5",
    questionTitle: "What's the formula for calculating momentum?",
    actorId: "u6",
    actorName: "Michael Brown",
    actorAvatar: "/placeholder.svg?height=40&width=40",
    createdAt: daysAgo(1),
    isRead: true,
  },
  {
    id: generateId(),
    type: "answer",
    questionId: "q6",
    questionTitle: "How do I solve systems of linear equations?",
    answerId: "a6",
    actorId: "u7",
    actorName: "Sarah Lee",
    actorAvatar: "/placeholder.svg?height=40&width=40",
    createdAt: daysAgo(2),
    isRead: true,
  },
  {
    id: generateId(),
    type: "comment",
    questionId: "q7",
    questionTitle: "What's the difference between DNA and RNA?",
    actorId: "u8",
    actorName: "David Kim",
    actorAvatar: "/placeholder.svg?height=40&width=40",
    createdAt: daysAgo(3),
    isRead: true,
  },
]

// Function to get unread notification count
export function getUnreadCount(): number {
  return NOTIFICATIONS.filter((notification) => !notification.isRead).length
}

// Function to mark a notification as read
export function markAsRead(notificationId: string): void {
  const notification = NOTIFICATIONS.find((n) => n.id === notificationId)
  if (notification) {
    notification.isRead = true
  }
}

// Function to mark all notifications as read
export function markAllAsRead(): void {
  NOTIFICATIONS.forEach((notification) => {
    notification.isRead = true
  })
}

// Function to get notification message based on type
export function getNotificationMessage(notification: Notification): string {
  switch (notification.type) {
    case "answer":
      return `${notification.actorName} answered your question "${notification.questionTitle}"`
    case "comment":
      return `${notification.actorName} commented on your question "${notification.questionTitle}"`
    case "acceptance":
      return `${notification.actorName} accepted your answer to "${notification.questionTitle}"`
    case "mention":
      return `${notification.actorName} mentioned you in "${notification.questionTitle}"`
    default:
      return `You have a new notification from ${notification.actorName}`
  }
}
