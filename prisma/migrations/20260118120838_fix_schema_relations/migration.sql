-- CreateEnum
CREATE TYPE "DishType" AS ENUM ('VEG', 'NON_VEG', 'SNACK', 'DRINK');

-- CreateEnum
CREATE TYPE "KOTType" AS ENUM ('KITCHEN', 'BAR');

-- CreateEnum
CREATE TYPE "AddOnType" AS ENUM ('EXTRA', 'ADDON');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubMenu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "actualPrice" DOUBLE PRECISION NOT NULL,
    "discountPrice" DOUBLE PRECISION,
    "listedPrice" DOUBLE PRECISION NOT NULL,
    "cogs" DOUBLE PRECISION NOT NULL,
    "grossProfit" DOUBLE PRECISION NOT NULL,
    "dishId" TEXT,
    "addOnId" TEXT,
    "comboId" TEXT,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockConsumption" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "dishId" TEXT,
    "addOnId" TEXT,
    "comboId" TEXT,

    CONSTRAINT "StockConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dish" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hscode" TEXT,
    "image" TEXT,
    "preparationTime" INTEGER NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "subMenuId" TEXT,
    "type" "DishType" NOT NULL,
    "kotType" "KOTType" NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddOn" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "type" "AddOnType" NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AddOn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DishAddOn" (
    "id" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "addOnId" TEXT NOT NULL,

    CONSTRAINT "DishAddOn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuSetSubMenu" (
    "id" TEXT NOT NULL,
    "menuSetId" TEXT NOT NULL,
    "subMenuId" TEXT NOT NULL,

    CONSTRAINT "MenuSetSubMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboOffer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "hscode" TEXT,
    "preparationTime" INTEGER NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "subMenuId" TEXT,
    "kotType" "KOTType" NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComboOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboItem" (
    "id" TEXT NOT NULL,
    "comboId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ComboItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubMenu_name_key" ON "SubMenu"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Price_dishId_key" ON "Price"("dishId");

-- CreateIndex
CREATE UNIQUE INDEX "Price_addOnId_key" ON "Price"("addOnId");

-- CreateIndex
CREATE UNIQUE INDEX "Price_comboId_key" ON "Price"("comboId");

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES "AddOn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "ComboOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockConsumption" ADD CONSTRAINT "StockConsumption_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockConsumption" ADD CONSTRAINT "StockConsumption_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockConsumption" ADD CONSTRAINT "StockConsumption_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES "AddOn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockConsumption" ADD CONSTRAINT "StockConsumption_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "ComboOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dish" ADD CONSTRAINT "Dish_subMenuId_fkey" FOREIGN KEY ("subMenuId") REFERENCES "SubMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DishAddOn" ADD CONSTRAINT "DishAddOn_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DishAddOn" ADD CONSTRAINT "DishAddOn_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES "AddOn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuSetSubMenu" ADD CONSTRAINT "MenuSetSubMenu_menuSetId_fkey" FOREIGN KEY ("menuSetId") REFERENCES "MenuSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuSetSubMenu" ADD CONSTRAINT "MenuSetSubMenu_subMenuId_fkey" FOREIGN KEY ("subMenuId") REFERENCES "SubMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboOffer" ADD CONSTRAINT "ComboOffer_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboOffer" ADD CONSTRAINT "ComboOffer_subMenuId_fkey" FOREIGN KEY ("subMenuId") REFERENCES "SubMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "ComboOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
