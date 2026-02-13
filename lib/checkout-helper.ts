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
  paymentMethod: string;
  complimentaryItems?: Record<string, number> | null;
  extraFreeItems?:
    | { dishId?: string; name: string; unitPrice: number; quantity: number }[]
    | null;
  storeId?: string;
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
    paymentMethod,
    storeId,
  } = data;

  const complimentaryItems = data.complimentaryItems || {};
  const extraFreeItems = data.extraFreeItems || [];

  return await prisma.$transaction(async (tx) => {
    // 0. Resolve the mandatory Store ID
    // If not passed from the frontend, we must fetch it from the Table
    let finalStoreId = storeId;
    if (!finalStoreId) {
      const table = await tx.table.findUnique({
        where: { id: tableId },
        select: { storeId: true },
      });
      if (!table || !table.storeId) {
        throw new Error("Store identification failed for this table");
      }
      finalStoreId = table.storeId;
    }

    // 1. Update or Create Payment inside the transaction
    const existingPayment = await tx.payment.findUnique({
      where: { sessionId: sessionId },
    });

    let payment;
    const paymentStatus = (paymentMethod === "CREDIT" ? "CREDIT" : "PAID") as any;

    if (existingPayment) {
      payment = await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          method: paymentMethod as any,
          amount,
          status: paymentStatus,
          transactionUuid: null,
          esewaRefId: null,
          storeId: finalStoreId, // Ensure Store Isolation
        },
      });
    } else {
      payment = await tx.payment.create({
        data: {
          amount,
          method: paymentMethod as any,
          status: paymentStatus,
          // FIX: Use scalar fields (sessionId/storeId) to avoid "Mixed Types" error
          sessionId: sessionId, 
          storeId: finalStoreId,
        },
      });
    }

    const finalPaymentId = payment.id;

    // 2. Update all orders in this session to COMPLETED
    const orders = await tx.order.findMany({
      where: { sessionId },
      include: { items: true },
    });

    for (const order of orders) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "COMPLETED",
          customerId: customerId || null,
          paymentId: finalPaymentId,
        },
      });

      // Update OrderItems with manual complimentary quantities
      for (const item of order.items) {
        const compQty = complimentaryItems[item.id] || 0;
        if (compQty > 0) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: { complimentaryQuantity: compQty },
          });
        }
      }
    }

    // 3. Handle extra free items - Create a special "Complimentary" order
    if (extraFreeItems.length > 0) {
      await tx.order.create({
        data: {
          sessionId,
          tableId,
          storeId: finalStoreId, // MANDATORY: Orders now require storeId
          type: "DINE_IN",
          status: "COMPLETED",
          customerId: customerId || null,
          paymentId: finalPaymentId,
          total: 0,
          items: {
            create: extraFreeItems.map((item) => ({
              dishId: item.dishId || null,
              remarks: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: 0,
              status: "SERVED",
              complimentaryQuantity: item.quantity,
            })),
          },
        },
      });
    }

    // 4. Handle stray orders on the table (not yet linked to session)
    await tx.order.updateMany({
      where: {
        tableId,
        status: { in: ["PENDING", "PREPARING", "READYTOPICK", "SERVED"] },
        sessionId: null,
      },
      data: {
        status: "COMPLETED",
        customerId: customerId || null,
        paymentId: finalPaymentId,
        sessionId: sessionId,
        storeId: finalStoreId,
      },
    });

    // 5. Close the TableSession
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

    // 6. Reset Table status to ACTIVE
    await tx.table.update({
      where: { id: tableId },
      data: { status: "ACTIVE" },
    });

    // 7. Handle Customer Ledger and Loyalty
    if (customerId) {
      const pointsEarned = Math.floor(amount / 100);
      await tx.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: pointsEarned } },
      });

      const lastLedger = await tx.customerLedger.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });

      const currentBalance = lastLedger ? lastLedger.closingBalance : 0;
      const newBalance = currentBalance + amount;

      await tx.customerLedger.create({
        data: {
          customerId,
          txnNo: `SALE-${Date.now()}-${sessionId.substring(0, 4)}`,
          type: "SALE",
          amount: amount,
          closingBalance: newBalance,
          referenceId: sessionId,
          remarks: `Table Checkout - ${tableId} (${paymentMethod})`,
        },
      });

      if (paymentMethod !== "CREDIT") {
        await tx.customerLedger.create({
          data: {
            customerId,
            txnNo: `PAY-${Date.now()}-${sessionId.substring(0, 4)}`,
            type: "PAYMENT_IN",
            amount: amount,
            closingBalance: newBalance - amount,
            referenceId: finalPaymentId,
            remarks: `Payment for Table Checkout (${paymentMethod})`,
          },
        });
      }
    }

    return { success: true };
  });
}