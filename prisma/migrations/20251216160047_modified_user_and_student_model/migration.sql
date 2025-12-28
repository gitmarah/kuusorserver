-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "resumeId" TEXT,
ADD COLUMN     "resumeUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isNewUser" BOOLEAN NOT NULL DEFAULT true;
