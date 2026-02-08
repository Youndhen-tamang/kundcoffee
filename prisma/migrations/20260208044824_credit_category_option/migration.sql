-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "staffId" TEXT;

-- AlterTable
ALTER TABLE "SalesReturn" ADD COLUMN     "staffId" TEXT;

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Staff',
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "vendor" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AddOn_categoryId_idx" ON "AddOn"("categoryId");

-- CreateIndex
CREATE INDEX "ComboItem_comboId_idx" ON "ComboItem"("comboId");

-- CreateIndex
CREATE INDEX "ComboItem_dishId_idx" ON "ComboItem"("dishId");

-- CreateIndex
CREATE INDEX "ComboOffer_categoryId_idx" ON "ComboOffer"("categoryId");

-- CreateIndex
CREATE INDEX "ComboOffer_subMenuId_idx" ON "ComboOffer"("subMenuId");

-- CreateIndex
CREATE INDEX "CustomerLedger_customerId_idx" ON "CustomerLedger"("customerId");

-- CreateIndex
CREATE INDEX "Dish_categoryId_idx" ON "Dish"("categoryId");

-- CreateIndex
CREATE INDEX "Dish_subMenuId_idx" ON "Dish"("subMenuId");

-- CreateIndex
CREATE INDEX "DishAddOn_dishId_idx" ON "DishAddOn"("dishId");

-- CreateIndex
CREATE INDEX "DishAddOn_addOnId_idx" ON "DishAddOn"("addOnId");

-- CreateIndex
CREATE INDEX "MenuSetSubMenu_menuSetId_idx" ON "MenuSetSubMenu"("menuSetId");

-- CreateIndex
CREATE INDEX "MenuSetSubMenu_subMenuId_idx" ON "MenuSetSubMenu"("subMenuId");

-- CreateIndex
CREATE INDEX "Order_tableId_idx" ON "Order"("tableId");

-- CreateIndex
CREATE INDEX "Order_sessionId_idx" ON "Order"("sessionId");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_paymentId_idx" ON "Order"("paymentId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_dishId_idx" ON "OrderItem"("dishId");

-- CreateIndex
CREATE INDEX "OrderItem_comboId_idx" ON "OrderItem"("comboId");

-- CreateIndex
CREATE INDEX "OrderItemAddOn_orderItemId_idx" ON "OrderItemAddOn"("orderItemId");

-- CreateIndex
CREATE INDEX "OrderItemAddOn_addOnId_idx" ON "OrderItemAddOn"("addOnId");

-- CreateIndex
CREATE INDEX "Payment_sessionId_idx" ON "Payment"("sessionId");

-- CreateIndex
CREATE INDEX "Price_dishId_idx" ON "Price"("dishId");

-- CreateIndex
CREATE INDEX "Price_addOnId_idx" ON "Price"("addOnId");

-- CreateIndex
CREATE INDEX "Price_comboId_idx" ON "Price"("comboId");

-- CreateIndex
CREATE INDEX "Reservation_customerId_idx" ON "Reservation"("customerId");

-- CreateIndex
CREATE INDEX "Reservation_tableId_idx" ON "Reservation"("tableId");

-- CreateIndex
CREATE INDEX "ReservationTime_reservationId_idx" ON "ReservationTime"("reservationId");

-- CreateIndex
CREATE INDEX "SalesReturn_customerId_idx" ON "SalesReturn"("customerId");

-- CreateIndex
CREATE INDEX "SalesReturnItem_salesReturnId_idx" ON "SalesReturnItem"("salesReturnId");

-- CreateIndex
CREATE INDEX "StockConsumption_stockId_idx" ON "StockConsumption"("stockId");

-- CreateIndex
CREATE INDEX "StockConsumption_dishId_idx" ON "StockConsumption"("dishId");

-- CreateIndex
CREATE INDEX "StockConsumption_addOnId_idx" ON "StockConsumption"("addOnId");

-- CreateIndex
CREATE INDEX "StockConsumption_comboId_idx" ON "StockConsumption"("comboId");

-- CreateIndex
CREATE INDEX "SubMenu_categoryId_idx" ON "SubMenu"("categoryId");

-- CreateIndex
CREATE INDEX "Table_spaceId_idx" ON "Table"("spaceId");

-- CreateIndex
CREATE INDEX "Table_tableTypeId_idx" ON "Table"("tableTypeId");

-- CreateIndex
CREATE INDEX "TableSession_tableId_idx" ON "TableSession"("tableId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
