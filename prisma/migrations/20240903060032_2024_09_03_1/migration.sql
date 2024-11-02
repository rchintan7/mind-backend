/*
  Warnings:

  - You are about to drop the `Archivement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategoryParameter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserArchivement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoriesToContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoriesToTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ContentToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'editor', 'free_user', 'paid_user');

-- CreateEnum
CREATE TYPE "loginMethod" AS ENUM ('email', 'apple', 'google', 'facebook');

-- CreateEnum
CREATE TYPE "subscriptionStatus" AS ENUM ('active', 'inactive', 'cancelled');

-- CreateEnum
CREATE TYPE "contentTypes" AS ENUM ('text', 'image', 'video', 'audio');

-- DropForeignKey
ALTER TABLE "CategoryParameter" DROP CONSTRAINT "CategoryParameter_CategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_CreatedById_fkey";

-- DropForeignKey
ALTER TABLE "UserArchivement" DROP CONSTRAINT "UserArchivement_ArchivementId_fkey";

-- DropForeignKey
ALTER TABLE "UserArchivement" DROP CONSTRAINT "UserArchivement_UserId_fkey";

-- DropForeignKey
ALTER TABLE "UserCategory" DROP CONSTRAINT "UserCategory_CategoryId_fkey";

-- DropForeignKey
ALTER TABLE "UserCategory" DROP CONSTRAINT "UserCategory_UserId_fkey";

-- DropForeignKey
ALTER TABLE "_CategoriesToContent" DROP CONSTRAINT "_CategoriesToContent_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoriesToContent" DROP CONSTRAINT "_CategoriesToContent_B_fkey";

-- DropForeignKey
ALTER TABLE "_CategoriesToTag" DROP CONSTRAINT "_CategoriesToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoriesToTag" DROP CONSTRAINT "_CategoriesToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "_ContentToTag" DROP CONSTRAINT "_ContentToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContentToTag" DROP CONSTRAINT "_ContentToTag_B_fkey";

-- DropTable
DROP TABLE "Archivement";

-- DropTable
DROP TABLE "Categories";

-- DropTable
DROP TABLE "CategoryParameter";

-- DropTable
DROP TABLE "Content";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserArchivement";

-- DropTable
DROP TABLE "UserCategory";

-- DropTable
DROP TABLE "_CategoriesToContent";

-- DropTable
DROP TABLE "_CategoriesToTag";

-- DropTable
DROP TABLE "_ContentToTag";

-- DropEnum
DROP TYPE "ContentTypes";

-- DropEnum
DROP TYPE "LoginMethod";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "loginMethod" "loginMethod" NOT NULL,
    "appleToken" TEXT,
    "googleToken" TEXT,
    "facebookToken" TEXT,
    "profilePicture" TEXT,
    "experiencePoints" INTEGER NOT NULL DEFAULT 0,
    "userLevel" INTEGER NOT NULL DEFAULT 0,
    "lastLogin" TIMESTAMP(3),
    "subscriptionStatus" "subscriptionStatus" NOT NULL,
    "userRole" "role" NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageURL" TEXT,
    "neededExperiencePoints" INTEGER NOT NULL,
    "neededUserLevel" INTEGER NOT NULL,
    "neededCategoryLevel" INTEGER NOT NULL,

    CONSTRAINT "archivement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userArchivement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "archivementId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "userArchivement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userCategory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "userCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoryParameter" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "defaultValue" TEXT NOT NULL,
    "minValue" INTEGER NOT NULL,
    "maxValue" INTEGER NOT NULL,
    "step" INTEGER NOT NULL,

    CONSTRAINT "categoryParameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageURL" TEXT,
    "videoURL" TEXT,
    "audioURL" TEXT,
    "text" TEXT,
    "type" "contentTypes" NOT NULL,
    "userLevelRequirement" INTEGER NOT NULL,
    "experiencePointsRequirement" INTEGER NOT NULL,
    "categoryLevelRequirement" INTEGER NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageURL" TEXT,
    "videoURL" TEXT,
    "audioURL" TEXT,
    "text" TEXT,
    "type" "contentTypes" NOT NULL,
    "userLevelRequirement" INTEGER NOT NULL,
    "experiencePointsRequirement" INTEGER NOT NULL,
    "categoryLevelRequirement" INTEGER NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_categoriesTotag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_categoriesTocontent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_contentTotag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_categoriesTotag_AB_unique" ON "_categoriesTotag"("A", "B");

-- CreateIndex
CREATE INDEX "_categoriesTotag_B_index" ON "_categoriesTotag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_categoriesTocontent_AB_unique" ON "_categoriesTocontent"("A", "B");

-- CreateIndex
CREATE INDEX "_categoriesTocontent_B_index" ON "_categoriesTocontent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_contentTotag_AB_unique" ON "_contentTotag"("A", "B");

-- CreateIndex
CREATE INDEX "_contentTotag_B_index" ON "_contentTotag"("B");

-- AddForeignKey
ALTER TABLE "userArchivement" ADD CONSTRAINT "userArchivement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userArchivement" ADD CONSTRAINT "userArchivement_archivementId_fkey" FOREIGN KEY ("archivementId") REFERENCES "archivement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userCategory" ADD CONSTRAINT "userCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userCategory" ADD CONSTRAINT "userCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoryParameter" ADD CONSTRAINT "categoryParameter_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_categoriesTotag" ADD CONSTRAINT "_categoriesTotag_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_categoriesTotag" ADD CONSTRAINT "_categoriesTotag_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_categoriesTocontent" ADD CONSTRAINT "_categoriesTocontent_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_categoriesTocontent" ADD CONSTRAINT "_categoriesTocontent_B_fkey" FOREIGN KEY ("B") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_contentTotag" ADD CONSTRAINT "_contentTotag_A_fkey" FOREIGN KEY ("A") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_contentTotag" ADD CONSTRAINT "_contentTotag_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
