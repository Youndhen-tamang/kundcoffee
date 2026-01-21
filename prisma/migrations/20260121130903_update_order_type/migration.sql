-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderType" ADD VALUE 'DELIVERY';
ALTER TYPE "OrderType" ADD VALUE 'RESERVATION';
ALTER TYPE "OrderType" ADD VALUE 'QUICK_BILLING';
ALTER TYPE "OrderType" ADD VALUE 'TAKE_AWAY';
