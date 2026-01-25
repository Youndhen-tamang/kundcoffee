/*
  Warnings:

  - A unique constraint covering the columns `[loyaltyId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('SALE', 'PAYMENT_IN', 'PAYMENT_OUT', 'RETURN', 'ADJUSTMENT', 'OPENING_BALANCE');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "loyaltyId" TEXT;

-- CreateTable
CREATE TABLE "CustomerLedger" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "txnNo" TEXT NOT NULL,
    "type" "LedgerType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "closingBalance" DOUBLE PRECISION NOT NULL,
    "referenceId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerLedger_txnNo_key" ON "CustomerLedger"("txnNo");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_loyaltyId_key" ON "Customer"("loyaltyId");

-- AddForeignKey
ALTER TABLE "CustomerLedger" ADD CONSTRAINT "CustomerLedger_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
