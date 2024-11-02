-- CreateEnum
CREATE TYPE "subscriptionType" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "subscriptionPurchaseDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "subscriptionType" "subscriptionType" NOT NULL DEFAULT 'MONTHLY',
ALTER COLUMN "subscriptionStatus" SET DEFAULT 'INACTIVE';
