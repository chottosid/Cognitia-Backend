/*
  Warnings:

  - You are about to drop the column `questions` on the `model_tests` table. All the data in the column will be lost.
  - You are about to drop the `UserAvailability` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserAvailability" DROP CONSTRAINT "UserAvailability_userId_fkey";

-- AlterTable
ALTER TABLE "model_tests" DROP COLUMN "questions";

-- DropTable
DROP TABLE "UserAvailability";

-- CreateTable
CREATE TABLE "model_test_questions" (
    "id" TEXT NOT NULL,
    "modelTestId" TEXT NOT NULL,
    "testQuestionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_test_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "explanation" TEXT,
    "options" JSONB NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "points" INTEGER NOT NULL DEFAULT 5,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "model_test_questions_modelTestId_testQuestionId_key" ON "model_test_questions"("modelTestId", "testQuestionId");

-- AddForeignKey
ALTER TABLE "model_test_questions" ADD CONSTRAINT "model_test_questions_modelTestId_fkey" FOREIGN KEY ("modelTestId") REFERENCES "model_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_test_questions" ADD CONSTRAINT "model_test_questions_testQuestionId_fkey" FOREIGN KEY ("testQuestionId") REFERENCES "test_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
