-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'FREE_USER', 'PAID_USER');

-- CreateEnum
CREATE TYPE "LoginMethod" AS ENUM ('EMAIL', 'APPLE', 'GOOGLE', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContentTypes" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO');

-- CreateTable
CREATE TABLE "User" (
    "Id" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Firstname" TEXT,
    "Lastname" TEXT,
    "LoginMethod" "LoginMethod" NOT NULL,
    "AppleToken" TEXT,
    "GoogleToken" TEXT,
    "FacebookToken" TEXT,
    "ProfilePicture" TEXT,
    "ExperiencePoints" INTEGER NOT NULL DEFAULT 0,
    "UserLevel" INTEGER NOT NULL DEFAULT 0,
    "LastLogin" TIMESTAMP(3),
    "SubscriptioinStatus" "SubscriptionStatus" NOT NULL,
    "UserRole" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Archivement" (
    "Id" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "ImageURL" TEXT,
    "NeededExperiencePoints" INTEGER NOT NULL,
    "NeededUserLevel" INTEGER NOT NULL,
    "NeededCategoryLevel" INTEGER NOT NULL,

    CONSTRAINT "Archivement_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserArchivement" (
    "Id" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "UserId" TEXT NOT NULL,
    "ArchivementId" TEXT NOT NULL,
    "CompletedAt" TIMESTAMP(3),

    CONSTRAINT "UserArchivement_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "Id" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserCategory" (
    "Id" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "UserId" TEXT NOT NULL,
    "CategoryId" TEXT NOT NULL,
    "Level" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserCategory_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "CategoryParameter" (
    "Id" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CategoryId" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "DefaultValue" TEXT NOT NULL,
    "MinValue" INTEGER NOT NULL,
    "MaxValue" INTEGER NOT NULL,
    "Step" INTEGER NOT NULL,

    CONSTRAINT "CategoryParameter_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "Id" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Content" (
    "Id" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedById" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "ImageURL" TEXT,
    "VideoURL" TEXT,
    "AudioURL" TEXT,
    "Text" TEXT,
    "Type" "ContentTypes" NOT NULL,
    "UserLevelRequirement" INTEGER NOT NULL,
    "ExperiencePointsRequirement" INTEGER NOT NULL,
    "CategoryLevelRequirement" INTEGER NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Task" (
    "Id" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "ImageURL" TEXT,
    "VideoURL" TEXT,
    "AudioURL" TEXT,
    "Text" TEXT,
    "Type" "ContentTypes" NOT NULL,
    "UserLevelRequirement" INTEGER NOT NULL,
    "ExperiencePointsRequirement" INTEGER NOT NULL,
    "CategoryLevelRequirement" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "_CategoriesToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CategoriesToContent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ContentToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoriesToTag_AB_unique" ON "_CategoriesToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoriesToTag_B_index" ON "_CategoriesToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoriesToContent_AB_unique" ON "_CategoriesToContent"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoriesToContent_B_index" ON "_CategoriesToContent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ContentToTag_AB_unique" ON "_ContentToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ContentToTag_B_index" ON "_ContentToTag"("B");

-- AddForeignKey
ALTER TABLE "UserArchivement" ADD CONSTRAINT "UserArchivement_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserArchivement" ADD CONSTRAINT "UserArchivement_ArchivementId_fkey" FOREIGN KEY ("ArchivementId") REFERENCES "Archivement"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCategory" ADD CONSTRAINT "UserCategory_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCategory" ADD CONSTRAINT "UserCategory_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "Categories"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryParameter" ADD CONSTRAINT "CategoryParameter_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "Categories"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_CreatedById_fkey" FOREIGN KEY ("CreatedById") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToTag" ADD CONSTRAINT "_CategoriesToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Categories"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToTag" ADD CONSTRAINT "_CategoriesToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToContent" ADD CONSTRAINT "_CategoriesToContent_A_fkey" FOREIGN KEY ("A") REFERENCES "Categories"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoriesToContent" ADD CONSTRAINT "_CategoriesToContent_B_fkey" FOREIGN KEY ("B") REFERENCES "Content"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentToTag" ADD CONSTRAINT "_ContentToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Content"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentToTag" ADD CONSTRAINT "_ContentToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
