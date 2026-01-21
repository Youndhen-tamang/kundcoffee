/*
  Warnings:

  - The `unit` column on the `Stock` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MeasuringUnit" AS ENUM ('GRAM', 'KILOGRAM', 'POUND', 'LITRE', 'MILLILITRE', 'OUNCE', 'PIECE', 'PACKET');

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "unit",
ADD COLUMN     "unit" "MeasuringUnit";
