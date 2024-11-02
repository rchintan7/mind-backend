-- AlterEnum
ALTER TYPE "taskType" ADD VALUE 'CONFIRMATION';

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "confirmationAmount" INTEGER,
ADD COLUMN     "confirmationType" TEXT;
