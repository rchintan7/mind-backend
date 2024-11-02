/*
  Warnings:

  - You are about to drop the column `activityValue` on the `condition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "condition" DROP COLUMN "activityValue",
ADD COLUMN     "activityValues" TEXT[];
