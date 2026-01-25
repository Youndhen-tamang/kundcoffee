-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';
