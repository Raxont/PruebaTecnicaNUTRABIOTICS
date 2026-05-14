/*
  Warnings:

  - You are about to drop the column `specialization` on the `Doctor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[specialty]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Prescription` will be added. If there are existing duplicate values, this will fail.
  - The required column `code` was added to the `Prescription` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "Doctor_specialization_idx";

-- DropIndex
DROP INDEX "Prescription_createdAt_idx";

-- DropIndex
DROP INDEX "Prescription_status_idx";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "specialization",
ADD COLUMN     "specialty" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "birthDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "consumedAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ALTER COLUMN "patientId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_specialty_key" ON "Doctor"("specialty");

-- CreateIndex
CREATE INDEX "Doctor_specialty_idx" ON "Doctor"("specialty");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_code_key" ON "Prescription"("code");

-- CreateIndex
CREATE INDEX "Prescription_status_createdAt_idx" ON "Prescription"("status", "createdAt");
