/*
  Warnings:

  - Added the required column `baseCategory` to the `taskHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "taskHistory" ADD COLUMN     "baseCategory" "baseCategory" NOT NULL,
ADD COLUMN     "userLevel" INTEGER DEFAULT 0;
