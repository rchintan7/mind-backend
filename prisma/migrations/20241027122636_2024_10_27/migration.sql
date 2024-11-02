-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "actionType" ADD VALUE 'SEND_PUSH_NOTIFICATION';
ALTER TYPE "actionType" ADD VALUE 'TASKFLOW_BY_CATEGORY';
