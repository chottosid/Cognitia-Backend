// Types for activity log
export interface ActivityLogEntry {
  id: string
  type:
    | "login"
    | "note_create"
    | "note_edit"
    | "question_post"
    | "answer_post"
    | "profile_update"
    | "settings_change"
    | "contest_participation"
  description: string
  timestamp: Date
  ipAddress: string
  device: string
  location?: string
}

// Types for support tickets
export interface SupportTicket {
  id: string
  subject: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: Date
  updatedAt: Date
  messages: SupportMessage[]
}

export interface SupportMessage {
  id: string
  ticketId: string
  sender: "user" | "support"
  content: string
  timestamp: Date
  attachments?: string[]
}

// Types for account settings
export interface AccountSettings {
  email: string
  username: string
  phoneNumber?: string
  twoFactorEnabled: boolean
  emailVerified: boolean
  phoneVerified: boolean
  lastPasswordChange: Date
  connectedAccounts: {
    google?: {
      connected: boolean
      email?: string
      lastUsed?: Date
    }
    github?: {
      connected: boolean
      username?: string
      lastUsed?: Date
    }
    facebook?: {
      connected: boolean
      name?: string
      lastUsed?: Date
    }
  }
}

// Mock data for activity log
export const ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: "1",
    type: "login",
    description: "Logged in successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    ipAddress: "192.168.1.1",
    device: "Chrome on Windows",
    location: "New York, USA",
  },
  {
    id: "2",
    type: "note_create",
    description: 'Created note "Quantum Physics Notes"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    ipAddress: "192.168.1.1",
    device: "Chrome on Windows",
    location: "New York, USA",
  },
  {
    id: "3",
    type: "question_post",
    description: 'Posted question "Understanding Calculus Integration Techniques"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    ipAddress: "192.168.1.1",
    device: "Chrome on Windows",
    location: "New York, USA",
  },
  {
    id: "4",
    type: "profile_update",
    description: "Updated profile information",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    ipAddress: "192.168.1.1",
    device: "Chrome on Windows",
    location: "New York, USA",
  },
  {
    id: "5",
    type: "settings_change",
    description: "Changed privacy settings",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    ipAddress: "192.168.1.1",
    device: "Chrome on Windows",
    location: "New York, USA",
  },
  {
    id: "6",
    type: "login",
    description: "Logged in successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    ipAddress: "192.168.1.2",
    device: "Safari on macOS",
    location: "Boston, USA",
  },
  {
    id: "7",
    type: "contest_participation",
    description: 'Participated in contest "Advanced Algorithms Challenge"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
    ipAddress: "192.168.1.1",
    device: "Chrome on Windows",
    location: "New York, USA",
  },
  {
    id: "8",
    type: "answer_post",
    description: 'Posted answer to "Recursion vs Iteration Efficiency"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    ipAddress: "192.168.1.1",
    device: "Chrome on Windows",
    location: "New York, USA",
  },
  {
    id: "9",
    type: "note_edit",
    description: 'Edited note "Data Structures"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
    ipAddress: "192.168.1.1",
    device: "Chrome on Windows",
    location: "New York, USA",
  },
  {
    id: "10",
    type: "login",
    description: "Logged in successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    ipAddress: "192.168.1.3",
    device: "Firefox on Linux",
    location: "Chicago, USA",
  },
]

// Mock data for support tickets
export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "1",
    subject: "Cannot access my notes",
    description: "I am unable to access my notes from yesterday. The page keeps loading indefinitely.",
    status: "in_progress",
    priority: "medium",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    messages: [
      {
        id: "1-1",
        ticketId: "1",
        sender: "user",
        content: "I am unable to access my notes from yesterday. The page keeps loading indefinitely.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        id: "1-2",
        ticketId: "1",
        sender: "support",
        content:
          "Thank you for reporting this issue. Could you please provide more details about which browser you are using and if you see any error messages?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5), // 1.5 days ago
      },
      {
        id: "1-3",
        ticketId: "1",
        sender: "user",
        content:
          "I am using Chrome version 96.0.4664.110 on Windows 10. I don't see any error messages, the loading spinner just keeps spinning.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        id: "1-4",
        ticketId: "1",
        sender: "support",
        content:
          "Thank you for the additional information. We are investigating the issue and will get back to you soon. In the meantime, could you try clearing your browser cache and cookies?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      },
    ],
  },
  {
    id: "2",
    subject: "Feature request: Dark mode",
    description:
      "I would like to request a dark mode feature for the platform. It would be easier on the eyes when studying at night.",
    status: "open",
    priority: "low",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    messages: [
      {
        id: "2-1",
        ticketId: "2",
        sender: "user",
        content:
          "I would like to request a dark mode feature for the platform. It would be easier on the eyes when studying at night.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      },
    ],
  },
  {
    id: "3",
    subject: "Billing issue with subscription",
    description: "I was charged twice for my monthly subscription. Please help resolve this issue.",
    status: "resolved",
    priority: "high",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 days ago
    messages: [
      {
        id: "3-1",
        ticketId: "3",
        sender: "user",
        content: "I was charged twice for my monthly subscription. Please help resolve this issue.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
      },
      {
        id: "3-2",
        ticketId: "3",
        sender: "support",
        content:
          "We apologize for the inconvenience. We will investigate this issue and get back to you as soon as possible.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9.5), // 9.5 days ago
      },
      {
        id: "3-3",
        ticketId: "3",
        sender: "support",
        content:
          "We have confirmed that there was a duplicate charge. We have refunded the extra amount, and it should appear in your account within 3-5 business days.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9), // 9 days ago
      },
      {
        id: "3-4",
        ticketId: "3",
        sender: "user",
        content: "Thank you for resolving this issue so quickly!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8.5), // 8.5 days ago
      },
      {
        id: "3-5",
        ticketId: "3",
        sender: "support",
        content: "You're welcome! We're glad we could help. Is there anything else you need assistance with?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 days ago
      },
    ],
  },
]

// Mock data for account settings
export const ACCOUNT_SETTINGS: AccountSettings = {
  email: "john.doe@example.com",
  username: "johndoe",
  phoneNumber: "+1 (555) 123-4567",
  twoFactorEnabled: false,
  emailVerified: true,
  phoneVerified: false,
  lastPasswordChange: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
  connectedAccounts: {
    google: {
      connected: true,
      email: "john.doe@gmail.com",
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    },
    github: {
      connected: false,
    },
    facebook: {
      connected: true,
      name: "John Doe",
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
    },
  },
}

// Function to format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Function to create a new support ticket
export function createSupportTicket(subject: string, description: string): SupportTicket {
  const newTicket: SupportTicket = {
    id: `${SUPPORT_TICKETS.length + 1}`,
    subject,
    description,
    status: "open",
    priority: "medium",
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [
      {
        id: `${SUPPORT_TICKETS.length + 1}-1`,
        ticketId: `${SUPPORT_TICKETS.length + 1}`,
        sender: "user",
        content: description,
        timestamp: new Date(),
      },
    ],
  }

  SUPPORT_TICKETS.unshift(newTicket)
  return newTicket
}

// Function to add a message to a support ticket
export function addMessageToTicket(
  ticketId: string,
  content: string,
  sender: "user" | "support",
): SupportMessage | null {
  const ticket = SUPPORT_TICKETS.find((t) => t.id === ticketId)
  if (!ticket) return null

  const newMessage: SupportMessage = {
    id: `${ticketId}-${ticket.messages.length + 1}`,
    ticketId,
    sender,
    content,
    timestamp: new Date(),
  }

  ticket.messages.push(newMessage)
  ticket.updatedAt = new Date()

  // If user responds to a resolved ticket, reopen it
  if (sender === "user" && ticket.status === "resolved") {
    ticket.status = "in_progress"
  }

  return newMessage
}

// Function to update ticket status
export function updateTicketStatus(ticketId: string, status: "open" | "in_progress" | "resolved" | "closed"): boolean {
  const ticket = SUPPORT_TICKETS.find((t) => t.id === ticketId)
  if (!ticket) return false

  ticket.status = status
  ticket.updatedAt = new Date()
  return true
}

// Function to get activity log with pagination
export function getActivityLog(
  page = 1,
  pageSize = 10,
): {
  entries: ActivityLogEntry[]
  totalPages: number
  currentPage: number
} {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const entries = ACTIVITY_LOG.slice(startIndex, endIndex)
  const totalPages = Math.ceil(ACTIVITY_LOG.length / pageSize)

  return {
    entries,
    totalPages,
    currentPage: page,
  }
}

// Function to update account settings
export function updateAccountSettings(updates: Partial<AccountSettings>): AccountSettings {
  Object.assign(ACCOUNT_SETTINGS, updates)
  return ACCOUNT_SETTINGS
}
