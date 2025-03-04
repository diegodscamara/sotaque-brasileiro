/*
  Warnings:

  - You are about to drop the column `motivationForLearning` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `preferredSchedule` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `professionalBackground` on the `Student` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ClassStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "motivationForLearning",
DROP COLUMN "preferredSchedule",
DROP COLUMN "professionalBackground";
