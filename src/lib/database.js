import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Database connection helper
export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log("✅ Database connected successfully")
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
  }
}

// Database disconnection helper
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    console.log("✅ Database disconnected successfully")
  } catch (error) {
    console.error("❌ Database disconnection failed:", error)
  }
}

// Health check
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: "healthy", timestamp: new Date().toISOString() }
  } catch (error) {
    return { status: "unhealthy", error: error.message, timestamp: new Date().toISOString() }
  }
}

export default prisma
