import { generateId } from "@/lib/mock-data"

export interface Vote {
  id: string
  userId: string
  itemId: string
  itemType: "question" | "answer"
  voteType: "up" | "down"
  votedAt: Date
}

// Mock votes
export const VOTES: Vote[] = [
  // Initial votes can be empty
]

// Function to vote on a question or answer
export function vote(userId: string, itemId: string, itemType: "question" | "answer", voteType: "up" | "down"): Vote {
  // Check if user already voted on this item
  const existingVoteIndex = VOTES.findIndex(
    (vote) => vote.userId === userId && vote.itemId === itemId && vote.itemType === itemType,
  )

  // If user already voted, update the vote
  if (existingVoteIndex !== -1) {
    const existingVote = VOTES[existingVoteIndex]

    // If same vote type, remove the vote (toggle off)
    if (existingVote.voteType === voteType) {
      VOTES.splice(existingVoteIndex, 1)
      return null
    }

    // If different vote type, update the vote
    existingVote.voteType = voteType
    existingVote.votedAt = new Date()
    return existingVote
  }

  // If no existing vote, create a new one
  const newVote: Vote = {
    id: generateId(),
    userId,
    itemId,
    itemType,
    voteType,
    votedAt: new Date(),
  }

  VOTES.push(newVote)
  return newVote
}

// Function to get vote count for an item
export function getVoteCount(itemId: string): number {
  const upvotes = VOTES.filter((vote) => vote.itemId === itemId && vote.voteType === "up").length

  const downvotes = VOTES.filter((vote) => vote.itemId === itemId && vote.voteType === "down").length

  return upvotes - downvotes
}

// Function to get user's vote on an item
export function getUserVote(userId: string, itemId: string): "up" | "down" | null {
  const userVote = VOTES.find((vote) => vote.userId === userId && vote.itemId === itemId)

  return userVote ? userVote.voteType : null
}
