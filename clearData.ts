// clearData.ts
import { prisma } from "@/lib/prisma";

async function clearAllData() {
  try {
    // Clear tables in order to avoid foreign key issues
    await prisma.qRCode.deleteMany();
    await prisma.table.deleteMany();
    await prisma.tableType.deleteMany();
    await prisma.space.deleteMany();  
    await prisma.dish.deleteMany();
    await prisma.category.deleteMany();
    await prisma.subMenu.deleteMany();
    

    console.log("All table data cleared, tables remain intact.");
  } catch (error) {
    console.error("Failed to clear data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData();
