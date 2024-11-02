/*
  Warnings:

  - The values [text,image,video,audio] on the enum `contentTypes` will be removed. If these variants are still used in the database, this will fail.
  - The values [email,apple,google,facebook] on the enum `loginMethod` will be removed. If these variants are still used in the database, this will fail.
  - The values [admin,editor,free_user,paid_user] on the enum `role` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,inactive,cancelled] on the enum `subscriptionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "contentTypes_new" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO');
ALTER TABLE "content" ALTER COLUMN "type" TYPE "contentTypes_new" USING ("type"::text::"contentTypes_new");
ALTER TABLE "task" ALTER COLUMN "type" TYPE "contentTypes_new" USING ("type"::text::"contentTypes_new");
ALTER TYPE "contentTypes" RENAME TO "contentTypes_old";
ALTER TYPE "contentTypes_new" RENAME TO "contentTypes";
DROP TYPE "contentTypes_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "loginMethod_new" AS ENUM ('EMAIL', 'APPLE', 'GOOGLE', 'FACEBOOK');
ALTER TABLE "user" ALTER COLUMN "loginMethod" TYPE "loginMethod_new" USING ("loginMethod"::text::"loginMethod_new");
ALTER TYPE "loginMethod" RENAME TO "loginMethod_old";
ALTER TYPE "loginMethod_new" RENAME TO "loginMethod";
DROP TYPE "loginMethod_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "role_new" AS ENUM ('ADMIN', 'EDITOR', 'FREE_USER', 'PAID_USER');
ALTER TABLE "user" ALTER COLUMN "userRole" TYPE "role_new" USING ("userRole"::text::"role_new");
ALTER TYPE "role" RENAME TO "role_old";
ALTER TYPE "role_new" RENAME TO "role";
DROP TYPE "role_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "subscriptionStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED');
ALTER TABLE "user" ALTER COLUMN "subscriptionStatus" TYPE "subscriptionStatus_new" USING ("subscriptionStatus"::text::"subscriptionStatus_new");
ALTER TYPE "subscriptionStatus" RENAME TO "subscriptionStatus_old";
ALTER TYPE "subscriptionStatus_new" RENAME TO "subscriptionStatus";
DROP TYPE "subscriptionStatus_old";
COMMIT;
