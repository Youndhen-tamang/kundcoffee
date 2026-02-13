/*
  Warnings:

  - A unique constraint covering the columns `[name,storeId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,storeId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,storeId]` on the table `SubMenu` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,storeId]` on the table `TableType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `AddOn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `ComboOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Dish` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `MenuSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Space` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `SubMenu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `TableType` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Stock_name_key";

-- DropIndex
DROP INDEX "SubMenu_name_key";

-- DropIndex
DROP INDEX "TableType_name_key";

-- AlterTable
ALTER TABLE "AddOn" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ComboOffer" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MenuSet" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SubMenu" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TableType" ADD COLUMN     "storeId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "AddOn_storeId_idx" ON "AddOn"("storeId");

-- CreateIndex
CREATE INDEX "Category_storeId_idx" ON "Category"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_storeId_key" ON "Category"("name", "storeId");

-- CreateIndex
CREATE INDEX "ComboOffer_storeId_idx" ON "ComboOffer"("storeId");

-- CreateIndex
CREATE INDEX "Dish_storeId_idx" ON "Dish"("storeId");

-- CreateIndex
CREATE INDEX "Expense_storeId_idx" ON "Expense"("storeId");

-- CreateIndex
CREATE INDEX "MenuSet_storeId_idx" ON "MenuSet"("storeId");

-- CreateIndex
CREATE INDEX "Payment_storeId_idx" ON "Payment"("storeId");

-- CreateIndex
CREATE INDEX "Purchase_storeId_idx" ON "Purchase"("storeId");

-- CreateIndex
CREATE INDEX "Space_storeId_idx" ON "Space"("storeId");

-- CreateIndex
CREATE INDEX "Staff_storeId_idx" ON "Staff"("storeId");

-- CreateIndex
CREATE INDEX "Stock_storeId_idx" ON "Stock"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_name_storeId_key" ON "Stock"("name", "storeId");

-- CreateIndex
CREATE INDEX "SubMenu_storeId_idx" ON "SubMenu"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "SubMenu_name_storeId_key" ON "SubMenu"("name", "storeId");

-- CreateIndex
CREATE INDEX "Table_storeId_idx" ON "Table"("storeId");

-- CreateIndex
CREATE INDEX "TableType_storeId_idx" ON "TableType"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "TableType_name_storeId_key" ON "TableType"("name", "storeId");

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableType" ADD CONSTRAINT "TableType_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubMenu" ADD CONSTRAINT "SubMenu_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddOn" ADD CONSTRAINT "AddOn_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuSet" ADD CONSTRAINT "MenuSet_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboOffer" ADD CONSTRAINT "ComboOffer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
