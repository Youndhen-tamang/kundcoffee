/*
  Warnings:

  - You are about to drop the column `endTime` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Reservation` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "endTime",
DROP COLUMN "startTime";

-- CreateTable
CREATE TABLE "ReservationTime" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationTime_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReservationTime" ADD CONSTRAINT "ReservationTime_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
