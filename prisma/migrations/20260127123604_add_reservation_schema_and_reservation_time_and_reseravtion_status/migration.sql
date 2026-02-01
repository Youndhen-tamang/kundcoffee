/*
  Warnings:

  - You are about to drop the column `date` on the `Reservation` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "date",
ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING';
