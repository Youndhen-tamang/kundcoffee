import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking database records...");

  const stores = await prisma.store.findMany();
  console.log(`Found ${stores.length} stores.`);

  for (const store of stores) {
    console.log(`\nStore: ${store.name} (${store.id})`);

    const payments = await prisma.payment.count({
      where: { storeId: store.id },
    });
    console.log(`- Payments: ${payments}`);

    const paidPayments = await prisma.payment.count({
      where: { storeId: store.id, status: "PAID" },
    });
    console.log(`- Paid Payments: ${paidPayments}`);

    const purchases = await prisma.purchase.count({
      where: { storeId: store.id },
    });
    console.log(`- Purchases: ${purchases}`);

    const expenses = await prisma.expense.count({
      where: { storeId: store.id },
    });
    console.log(`- Expenses: ${expenses}`);

    const salesReturns = await prisma.salesReturn.count({
      where: { storeId: store.id },
    });
    console.log(`- Sales Returns: ${salesReturns}`);

    // Check recent payments (this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const recentPayments = await prisma.payment.findMany({
      where: {
        storeId: store.id,
        status: "PAID",
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { amount: true, createdAt: true },
    });

    console.log(`- Paid Payments (This Month): ${recentPayments.length}`);
    const totalSales = recentPayments.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );
    console.log(`- Total Sales Amount (This Month): ${totalSales}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
