/*
  Warnings:

  - You are about to drop the column `amount` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `item` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `vendor` on the `Purchase` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Stock` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referenceNumber]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referenceNumber` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierId` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxableAmount` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BalanceType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "SupplierLedgerType" AS ENUM ('PURCHASE', 'PAYMENT', 'RETURN', 'ADJUSTMENT', 'OPENING_BALANCE');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'CARD';

-- AlterTable
ALTER TABLE "CustomerLedger" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "amount",
DROP COLUMN "date",
DROP COLUMN "item",
DROP COLUMN "quantity",
DROP COLUMN "vendor",
ADD COLUMN     "attachment" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentMode" "PaymentMethod",
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "referenceNumber" TEXT NOT NULL,
ADD COLUMN     "remark" TEXT,
ADD COLUMN     "roundOff" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "supplierId" TEXT NOT NULL,
ADD COLUMN     "taxableAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "txnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "unit",
ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "unitId" TEXT;

-- AlterTable
ALTER TABLE "TableSession" ADD COLUMN     "storeId" TEXT;

-- DropEnum
DROP TYPE "MeasuringUnit";

-- CreateTable
CREATE TABLE "StockGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasuringUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "description" TEXT,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeasuringUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "legalName" TEXT,
    "taxNumber" TEXT,
    "address" TEXT,
    "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "openingBalanceType" "BalanceType" NOT NULL DEFAULT 'CREDIT',
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierLedger" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "txnNo" TEXT NOT NULL,
    "type" "SupplierLedgerType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "closingBalance" DOUBLE PRECISION NOT NULL,
    "referenceId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "stockId" TEXT,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReturn" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "txnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchaseReference" TEXT,
    "taxableAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roundOff" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" "ReturnPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "paymentMode" "PaymentMethod",
    "remark" TEXT,
    "attachment" TEXT,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PurchaseReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReturnItem" (
    "id" TEXT NOT NULL,
    "purchaseReturnId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "stockId" TEXT,

    CONSTRAINT "PurchaseReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrPaymet" (
    "id" TEXT NOT NULL,
    "image" TEXT[],
    "storeId" TEXT NOT NULL,

    CONSTRAINT "QrPaymet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockGroup_storeId_idx" ON "StockGroup"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "StockGroup_name_storeId_key" ON "StockGroup"("name", "storeId");

-- CreateIndex
CREATE INDEX "MeasuringUnit_storeId_idx" ON "MeasuringUnit"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "MeasuringUnit_name_storeId_key" ON "MeasuringUnit"("name", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "MeasuringUnit_shortName_storeId_key" ON "MeasuringUnit"("shortName", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_phone_key" ON "Supplier"("phone");

-- CreateIndex
CREATE INDEX "Supplier_storeId_idx" ON "Supplier"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierLedger_txnNo_key" ON "SupplierLedger"("txnNo");

-- CreateIndex
CREATE INDEX "SupplierLedger_supplierId_idx" ON "SupplierLedger"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierLedger_storeId_idx" ON "SupplierLedger"("storeId");

-- CreateIndex
CREATE INDEX "PurchaseItem_purchaseId_idx" ON "PurchaseItem"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseItem_stockId_idx" ON "PurchaseItem"("stockId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseReturn_referenceNumber_key" ON "PurchaseReturn"("referenceNumber");

-- CreateIndex
CREATE INDEX "PurchaseReturn_supplierId_idx" ON "PurchaseReturn"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseReturn_storeId_idx" ON "PurchaseReturn"("storeId");

-- CreateIndex
CREATE INDEX "PurchaseReturnItem_purchaseReturnId_idx" ON "PurchaseReturnItem"("purchaseReturnId");

-- CreateIndex
CREATE INDEX "PurchaseReturnItem_stockId_idx" ON "PurchaseReturnItem"("stockId");

-- CreateIndex
CREATE INDEX "CustomerLedger_storeId_idx" ON "CustomerLedger"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_referenceNumber_key" ON "Purchase"("referenceNumber");

-- CreateIndex
CREATE INDEX "Purchase_supplierId_idx" ON "Purchase"("supplierId");

-- CreateIndex
CREATE INDEX "Stock_unitId_idx" ON "Stock"("unitId");

-- CreateIndex
CREATE INDEX "Stock_groupId_idx" ON "Stock"("groupId");

-- CreateIndex
CREATE INDEX "TableSession_storeId_idx" ON "TableSession"("storeId");

-- AddForeignKey
ALTER TABLE "TableSession" ADD CONSTRAINT "TableSession_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MeasuringUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StockGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockGroup" ADD CONSTRAINT "StockGroup_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasuringUnit" ADD CONSTRAINT "MeasuringUnit_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerLedger" ADD CONSTRAINT "CustomerLedger_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierLedger" ADD CONSTRAINT "SupplierLedger_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierLedger" ADD CONSTRAINT "SupplierLedger_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItem" ADD CONSTRAINT "PurchaseReturnItem_purchaseReturnId_fkey" FOREIGN KEY ("purchaseReturnId") REFERENCES "PurchaseReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItem" ADD CONSTRAINT "PurchaseReturnItem_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrPaymet" ADD CONSTRAINT "QrPaymet_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
