import { generateId } from "@/lib/mock-data"

export interface SavedItem {
  id: string
  userId: string
  itemId: string
  itemType: "question" | "note"
  savedAt: Date
}

// Mock saved items
export const SAVED_ITEMS: SavedItem[] = [
  // Initial saved items can be empty
]

// Function to save a question
export function saveQuestion(userId: string, questionId: string): SavedItem {
  // Check if already saved
  const existingSave = SAVED_ITEMS.find(
    (item) => item.userId === userId && item.itemId === questionId && item.itemType === "question",
  )

  if (existingSave) {
    return existingSave
  }

  const newSavedItem: SavedItem = {
    id: generateId(),
    userId,
    itemId: questionId,
    itemType: "question",
    savedAt: new Date(),
  }

  SAVED_ITEMS.push(newSavedItem)
  return newSavedItem
}

// Function to save a note
export function saveNote(userId: string, noteId: string): SavedItem {
  // Check if already saved
  const existingSave = SAVED_ITEMS.find(
    (item) => item.userId === userId && item.itemId === noteId && item.itemType === "note",
  )

  if (existingSave) {
    return existingSave
  }

  const newSavedItem: SavedItem = {
    id: generateId(),
    userId,
    itemId: noteId,
    itemType: "note",
    savedAt: new Date(),
  }

  SAVED_ITEMS.push(newSavedItem)
  return newSavedItem
}

// Function to unsave an item
export function unsaveItem(userId: string, itemId: string): void {
  const index = SAVED_ITEMS.findIndex((item) => item.userId === userId && item.itemId === itemId)

  if (index !== -1) {
    SAVED_ITEMS.splice(index, 1)
  }
}

// Function to check if an item is saved
export function isItemSaved(userId: string, itemId: string): boolean {
  return SAVED_ITEMS.some((item) => item.userId === userId && item.itemId === itemId)
}

// Function to get saved questions for a user
export function getSavedQuestions(userId: string): SavedItem[] {
  return SAVED_ITEMS.filter((item) => item.userId === userId && item.itemType === "question")
}

// Function to get saved notes for a user
export function getSavedNotes(userId: string): SavedItem[] {
  return SAVED_ITEMS.filter((item) => item.userId === userId && item.itemType === "note")
}
