import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'DailySession' 
      AND column_name = 'cashOnDrawer'
    `;
    console.log('Column check result:', result);
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables in public schema:', JSON.stringify(tables, null, 2));

  } catch (e) {
    console.error('Error checking DB:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
