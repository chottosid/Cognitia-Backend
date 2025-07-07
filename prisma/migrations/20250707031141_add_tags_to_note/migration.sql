-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
