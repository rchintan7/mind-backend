/*
  Warnings:

  - The values [SINGLE_ANSWER_QUIZ,MULTI_ANSWER_QUIZ,FREE_TEXT_ANSWER_QUIZ] on the enum `taskType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `questionId` on the `answer` table. All the data in the column will be lost.
  - You are about to drop the `_questionTotask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `question` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "taskType_new" AS ENUM ('SINGLE_CHOICE_QUESTION', 'MULTIPLE_CHOICE_QUESTION', 'FREE_TEXT_QUESTION', 'INTERMEDIATE_SCREEN', 'CHALLENGE', 'ARTICLE', 'VIDEO', 'AUDIO', 'IMAGE', 'TEXT');
ALTER TABLE "task" ALTER COLUMN "taskType" TYPE "taskType_new" USING ("taskType"::text::"taskType_new");
ALTER TYPE "taskType" RENAME TO "taskType_old";
ALTER TYPE "taskType_new" RENAME TO "taskType";
DROP TYPE "taskType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "_questionTotask" DROP CONSTRAINT "_questionTotask_A_fkey";

-- DropForeignKey
ALTER TABLE "_questionTotask" DROP CONSTRAINT "_questionTotask_B_fkey";

-- DropForeignKey
ALTER TABLE "answer" DROP CONSTRAINT "answer_questionId_fkey";

-- AlterTable
ALTER TABLE "answer" DROP COLUMN "questionId",
ADD COLUMN     "affirmationsToEarn" TEXT[],
ADD COLUMN     "matchingParameters" JSONB,
ADD COLUMN     "nextTaskFlowId" TEXT,
ADD COLUMN     "nextTaskId" TEXT;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "socialBatteryValue" INTEGER;

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "affirmations" TEXT[],
ADD COLUMN     "matchingParameters" JSONB;

-- AlterTable
ALTER TABLE "taskFlow" ADD COLUMN     "matchingParameters" JSONB,
ADD COLUMN     "requiredTimeForTaskFlow" TEXT,
ADD COLUMN     "results" JSONB;

-- DropTable
DROP TABLE "_questionTotask";

-- DropTable
DROP TABLE "question";

-- CreateTable
CREATE TABLE "_answerTotask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_answerTotask_AB_unique" ON "_answerTotask"("A", "B");

-- CreateIndex
CREATE INDEX "_answerTotask_B_index" ON "_answerTotask"("B");

-- AddForeignKey
ALTER TABLE "_answerTotask" ADD CONSTRAINT "_answerTotask_A_fkey" FOREIGN KEY ("A") REFERENCES "answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_answerTotask" ADD CONSTRAINT "_answerTotask_B_fkey" FOREIGN KEY ("B") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
