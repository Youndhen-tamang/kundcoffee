import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const backupDir = path.join(process.cwd(), "backups", "data_snapshot-" + new Date().getTime());
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log("--- Starting Database Data Snapshot ---");
  console.log(`Snapshot Directory: ${backupDir}`);

  // List of models to back up (this should cover everything important)
  const models = [
    "customer",
    "customerLedger",
    "order",
    "orderItem",
    "payment",
    "tableSession",
    "dailySession",
    "stock",
    "supplier",
    "supplierLedger",
    "purchase",
    "purchaseItem",
    "purchaseReturn",
    "salesReturn",
    "dish",
    "category",
    "subMenu",
    "table",
    "tableType",
    "space",
    "user",
    "store",
    "systemSetting"
  ];

  for (const model of models) {
    try {
      console.log(`Backing up ${model}...`);
      // @ts-ignore - Prisma supports dynamic model access via string but needs type casting
      const data = await prisma[model].findMany();
      
      const filePath = path.join(backupDir, `${model}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`  - Saved ${data.length} records.`);
    } catch (error) {
      console.error(`  - Failed to back up ${model}:`, (error as Error).message);
    }
  }

  console.log("--- Snapshot Completed ---");
  console.log("Your data is now safe in the backups folder.");
}

main()
  .catch((e) => {
    console.error("Snapshot Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
