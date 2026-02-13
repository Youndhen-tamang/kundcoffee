/*
  Warnings:

  - Added the required column `storeId` to the `SalesReturn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalesReturn" ADD COLUMN     "storeId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "SalesReturn_storeId_idx" ON "SalesReturn"("storeId");

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
