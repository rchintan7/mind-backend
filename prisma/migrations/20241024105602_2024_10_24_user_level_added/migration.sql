-- CreateTable
CREATE TABLE "levelRange" (
    "id" TEXT NOT NULL,
    "userLevel" INTEGER NOT NULL DEFAULT 0,
    "minXP" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levelRange_pkey" PRIMARY KEY ("id")
);
