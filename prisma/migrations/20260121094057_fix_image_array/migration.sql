/*
  Warnings:

  - The `image` column on the `ComboOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `image` column on the `Dish` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ComboOffer" DROP COLUMN "image",
ADD COLUMN     "image" TEXT[];

-- AlterTable
ALTER TABLE "Dish" DROP COLUMN "image",
ADD COLUMN     "image" TEXT[];

-- AlterTable
ALTER TABLE "Price" ALTER COLUMN "discountPrice" SET DEFAULT 0;
