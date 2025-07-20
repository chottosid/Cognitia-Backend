// jobs/autoSubmitTests.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function autoSubmitExpiredTests() {
  const now = new Date();

  const expiredAttempts = await prisma.testAttempt.findMany({
    where: {
      status: "IN_PROGRESS",
      test: {
        timeLimit: { gt: 0 },
      },
    },
    include: {
      test: true,
    },
  });

  for (const attempt of expiredAttempts) {
    const expiryTime = new Date(
      attempt.startTime.getTime() + attempt.test.timeLimit * 60 * 1000
    );

    if (expiryTime <= now) {
      await prisma.testAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "COMPLETED",
          autoSubmitted: true,
          endTime: expiryTime,
          timeSpent: Math.floor(
            (expiryTime.getTime() - attempt.startTime.getTime()) / 1000
          ),
          updatedAt: new Date(),
        },
      });

      console.log(`Auto-submitted testAttempt: ${attempt.id}`);
    }
  }
}
