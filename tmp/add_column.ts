import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Adding cashOnDrawer column to DailySession table...');
    await prisma.$executeRaw`ALTER TABLE "DailySession" ADD COLUMN IF NOT EXISTS "cashOnDrawer" DOUBLE PRECISION`;
    console.log('Successfully added cashOnDrawer column.');

    // Also check other things that might be missing and cause issues if possible
    // but the user only asked for cash on drawer fix.
    
  } catch (e) {
    console.error('Error adding column:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
