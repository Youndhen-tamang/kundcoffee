// lib/checkout-helper.ts
import { prisma } from "@/lib/prisma";

export async function finalizeSessionTransaction(data: {
  sessionId: string;
  tableId: string;
  amount: number;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  customerId?: string;
  paymentId: string; // We pass the ID of the payment record
}) {
  const {
    sessionId,
    tableId,
    amount,
    subtotal,
    tax,
    serviceCharge,
    discount,
    customerId,
    paymentId,
  } = data;

  // We wrap this in a transaction to ensure data integrity
  return await prisma.$transaction(async (tx) => {
    // 1. Ensure Payment is marked as PAID
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: "PAID" },
    });

    // 2. Update all active orders for this table to COMPLETED
    await tx.order.updateMany({
      where: {
        tableId,
        status: { in: ["PENDING", "PREPARING", "READYTOPICK", "SERVED"] },
      },
      data: {
        status: "COMPLETED",
        customerId: customerId || null,
      },
    });

    // 3. Close the TableSession
    await tx.tableSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        endedAt: new Date(),
        total: subtotal || 0,
        discount: discount || 0,
        serviceCharge: serviceCharge || 0,
        tax: tax || 0,
        grandTotal: amount,
      },
    });

    // 4. Reset Table status to ACTIVE
    await tx.table.update({
      where: { id: tableId },
      data: { status: "ACTIVE" },
    });

    // 5. Handle Customer Loyalty (Optional)
    if (customerId) {
      const pointsEarned = Math.floor(amount / 100);
      await tx.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: pointsEarned } },
      });

      // Add to Customer Ledger
      await tx.customerLedger.create({
        data: {
          customerId,
          txnNo: `SALE-${Date.now()}`,
          type: "SALE",
          amount: amount,
          closingBalance: 0, 
          referenceId: sessionId,
          remarks: `Table Checkout - ${tableId}`,
        },
      });
    }

    return { success: true };
  });
}