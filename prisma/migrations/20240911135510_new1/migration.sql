/*
  Warnings:

  - You are about to drop the column `neededCategoryLevel` on the `archivement` table. All the data in the column will be lost.
  - You are about to drop the column `neededUserLevel` on the `archivement` table. All the data in the column will be lost.
  - You are about to drop the column `categoryLevelRequirement` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `experiencePointsRequirement` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `userLevelRequirement` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `categoryLevelRequirement` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `experiencePointsRequirement` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `userLevelRequirement` on the `task` table. All the data in the column will be lost.
  - You are about to drop the `_categoriesTotag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_contentTotag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tag` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryPoints` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userExperiencePointsMax` to the `content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userExperiencePointsMin` to the `content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskType` to the `task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userExperiencePointsMax` to the `task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userExperiencePointsMin` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "taskType" AS ENUM ('QUESTION', 'CHALLENGE', 'ARTICLE', 'VIDEO', 'AUDIO', 'IMAGE', 'TEXT');

-- CreateEnum
CREATE TYPE "taskFlowType" AS ENUM ('TRAINING', 'QUIZ', 'SINGLE_TASK');

-- CreateEnum
CREATE TYPE "conditionField" AS ENUM ('MOOD', 'XP', 'CATEGORY_LEVEL');

-- CreateEnum
CREATE TYPE "conditionOperator" AS ENUM ('IS', 'GREATER_THAN', 'LESS_THAN');

-- CreateEnum
CREATE TYPE "actionType" AS ENUM ('SEND_MESSAGE', 'SHOW_CONTENT', 'TASKFLOW');

-- DropForeignKey
ALTER TABLE "_categoriesTotag" DROP CONSTRAINT "_categoriesTotag_A_fkey";

-- DropForeignKey
ALTER TABLE "_categoriesTotag" DROP CONSTRAINT "_categoriesTotag_B_fkey";

-- DropForeignKey
ALTER TABLE "_contentTotag" DROP CONSTRAINT "_contentTotag_A_fkey";

-- DropForeignKey
ALTER TABLE "_contentTotag" DROP CONSTRAINT "_contentTotag_B_fkey";

-- AlterTable
ALTER TABLE "archivement" DROP COLUMN "neededCategoryLevel",
DROP COLUMN "neededUserLevel";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "categoryPoints" INTEGER NOT NULL,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "content" DROP COLUMN "categoryLevelRequirement",
DROP COLUMN "experiencePointsRequirement",
DROP COLUMN "text",
DROP COLUMN "userLevelRequirement",
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "userExperiencePointsMax" INTEGER NOT NULL,
ADD COLUMN     "userExperiencePointsMin" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "task" DROP COLUMN "categoryLevelRequirement",
DROP COLUMN "experiencePointsRequirement",
DROP COLUMN "userLevelRequirement",
ADD COLUMN     "taskType" "taskType" NOT NULL,
ADD COLUMN     "userExperiencePointsMax" INTEGER NOT NULL,
ADD COLUMN     "userExperiencePointsMin" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_categoriesTotag";

-- DropTable
DROP TABLE "_contentTotag";

-- DropTable
DROP TABLE "tag";

-- CreateTable
CREATE TABLE "categoryParameterToEarn" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "valueToEarn" INTEGER NOT NULL,

    CONSTRAINT "categoryParameterToEarn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "imageURL" TEXT,
    "tags" TEXT[],

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taskCategoryRequirement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "taskId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "minLevel" INTEGER NOT NULL,
    "maxLevel" INTEGER NOT NULL,

    CONSTRAINT "taskCategoryRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivementCategoryRequirement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivementId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "minLevel" INTEGER NOT NULL,

    CONSTRAINT "archivementCategoryRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taskFlow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "taskFlowType" "taskFlowType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageURL" TEXT,
    "videoURL" TEXT,
    "audioURL" TEXT,
    "userExperiencePointsMin" INTEGER NOT NULL,
    "userExperiencePointsMax" INTEGER NOT NULL,
    "userExperiencePointsToEarn" INTEGER NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "taskFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businessRule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "businessRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condition" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "field" "conditionField" NOT NULL,
    "operator" "conditionOperator" NOT NULL,
    "value" TEXT NOT NULL,
    "businessRuleId" TEXT NOT NULL,

    CONSTRAINT "condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "actionType" NOT NULL,
    "value" TEXT NOT NULL,
    "businessRuleId" TEXT NOT NULL,
    "tagsId" TEXT,

    CONSTRAINT "action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_categoryParameterToEarnTotaskFlow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_contentTotaskCategoryRequirement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_taskTotaskFlow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_answerTotask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_taskCategoryRequirementTotaskFlow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "categoryParameterToEarn_categoryId_idx" ON "categoryParameterToEarn"("categoryId");

-- CreateIndex
CREATE INDEX "taskCategoryRequirement_categoryId_minLevel_maxLevel_idx" ON "taskCategoryRequirement"("categoryId", "minLevel", "maxLevel");

-- CreateIndex
CREATE INDEX "archivementCategoryRequirement_categoryId_minLevel_idx" ON "archivementCategoryRequirement"("categoryId", "minLevel");

-- CreateIndex
CREATE INDEX "taskFlow_taskFlowType_title_idx" ON "taskFlow"("taskFlowType", "title");

-- CreateIndex
CREATE UNIQUE INDEX "_categoryParameterToEarnTotaskFlow_AB_unique" ON "_categoryParameterToEarnTotaskFlow"("A", "B");

-- CreateIndex
CREATE INDEX "_categoryParameterToEarnTotaskFlow_B_index" ON "_categoryParameterToEarnTotaskFlow"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_contentTotaskCategoryRequirement_AB_unique" ON "_contentTotaskCategoryRequirement"("A", "B");

-- CreateIndex
CREATE INDEX "_contentTotaskCategoryRequirement_B_index" ON "_contentTotaskCategoryRequirement"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_taskTotaskFlow_AB_unique" ON "_taskTotaskFlow"("A", "B");

-- CreateIndex
CREATE INDEX "_taskTotaskFlow_B_index" ON "_taskTotaskFlow"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_answerTotask_AB_unique" ON "_answerTotask"("A", "B");

-- CreateIndex
CREATE INDEX "_answerTotask_B_index" ON "_answerTotask"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_taskCategoryRequirementTotaskFlow_AB_unique" ON "_taskCategoryRequirementTotaskFlow"("A", "B");

-- CreateIndex
CREATE INDEX "_taskCategoryRequirementTotaskFlow_B_index" ON "_taskCategoryRequirementTotaskFlow"("B");

-- CreateIndex
CREATE INDEX "archivement_neededExperiencePoints_idx" ON "archivement"("neededExperiencePoints");

-- CreateIndex
CREATE INDEX "categories_title_idx" ON "categories"("title");

-- CreateIndex
CREATE INDEX "categoryParameter_categoryId_idx" ON "categoryParameter"("categoryId");

-- CreateIndex
CREATE INDEX "content_title_idx" ON "content"("title");

-- CreateIndex
CREATE INDEX "task_userExperiencePointsMin_userExperiencePointsMax_idx" ON "task"("userExperiencePointsMin", "userExperiencePointsMax");

-- CreateIndex
CREATE INDEX "user_email_userLevel_idx" ON "user"("email", "userLevel");

-- CreateIndex
CREATE INDEX "userArchivement_userId_archivementId_idx" ON "userArchivement"("userId", "archivementId");

-- CreateIndex
CREATE INDEX "userCategory_userId_categoryId_idx" ON "userCategory"("userId", "categoryId");

-- AddForeignKey
ALTER TABLE "categoryParameterToEarn" ADD CONSTRAINT "categoryParameterToEarn_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskCategoryRequirement" ADD CONSTRAINT "taskCategoryRequirement_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taskCategoryRequirement" ADD CONSTRAINT "taskCategoryRequirement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivementCategoryRequirement" ADD CONSTRAINT "archivementCategoryRequirement_archivementId_fkey" FOREIGN KEY ("archivementId") REFERENCES "archivement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivementCategoryRequirement" ADD CONSTRAINT "archivementCategoryRequirement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition" ADD CONSTRAINT "condition_businessRuleId_fkey" FOREIGN KEY ("businessRuleId") REFERENCES "businessRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_tagsId_fkey" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_businessRuleId_fkey" FOREIGN KEY ("businessRuleId") REFERENCES "businessRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_categoryParameterToEarnTotaskFlow" ADD CONSTRAINT "_categoryParameterToEarnTotaskFlow_A_fkey" FOREIGN KEY ("A") REFERENCES "categoryParameterToEarn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_categoryParameterToEarnTotaskFlow" ADD CONSTRAINT "_categoryParameterToEarnTotaskFlow_B_fkey" FOREIGN KEY ("B") REFERENCES "taskFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_contentTotaskCategoryRequirement" ADD CONSTRAINT "_contentTotaskCategoryRequirement_A_fkey" FOREIGN KEY ("A") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_contentTotaskCategoryRequirement" ADD CONSTRAINT "_contentTotaskCategoryRequirement_B_fkey" FOREIGN KEY ("B") REFERENCES "taskCategoryRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_taskTotaskFlow" ADD CONSTRAINT "_taskTotaskFlow_A_fkey" FOREIGN KEY ("A") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_taskTotaskFlow" ADD CONSTRAINT "_taskTotaskFlow_B_fkey" FOREIGN KEY ("B") REFERENCES "taskFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_answerTotask" ADD CONSTRAINT "_answerTotask_A_fkey" FOREIGN KEY ("A") REFERENCES "answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_answerTotask" ADD CONSTRAINT "_answerTotask_B_fkey" FOREIGN KEY ("B") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_taskCategoryRequirementTotaskFlow" ADD CONSTRAINT "_taskCategoryRequirementTotaskFlow_A_fkey" FOREIGN KEY ("A") REFERENCES "taskCategoryRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_taskCategoryRequirementTotaskFlow" ADD CONSTRAINT "_taskCategoryRequirementTotaskFlow_B_fkey" FOREIGN KEY ("B") REFERENCES "taskFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
