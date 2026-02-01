/*
  Warnings:

  - A unique constraint covering the columns `[transactionUuid]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "esewaRefId" TEXT,
ADD COLUMN     "transactionUuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionUuid_key" ON "Payment"("transactionUuid");
