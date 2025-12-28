/*
  Warnings:

  - You are about to drop the column `industry` on the `Internship` table. All the data in the column will be lost.
  - Added the required column `responsibilities` to the `Internship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Internship" DROP COLUMN "industry",
ADD COLUMN     "benefits" TEXT,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "responsibilities" TEXT NOT NULL;
