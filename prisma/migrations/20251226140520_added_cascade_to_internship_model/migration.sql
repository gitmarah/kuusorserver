-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_internshipId_fkey";

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
