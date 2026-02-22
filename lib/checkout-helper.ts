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
    let finalStoreId = storeId;
    if (!finalStoreId) {
      if (tableId) {
        const table = await tx.table.findUnique({
          where: { id: tableId },
          select: { storeId: true },
        });
        finalStoreId = table?.storeId || undefined;
      }

      if (!finalStoreId && sessionId) {
        // Try to get storeId from session
        const session = await tx.tableSession.findUnique({
          where: { id: sessionId },
          select: { storeId: true },
        });
        finalStoreId = session?.storeId || undefined;
      }

      if (!finalStoreId) {
        throw new Error("Store identification failed. storeId is required.");
      }
    }

    // 1. Update or Create Payment inside the transaction
    let payment;
    const paymentStatus = (
      paymentMethod === "CREDIT" ? "CREDIT" : "PAID"
    ) as any;

    const existingPayment = sessionId
      ? await tx.payment.findUnique({
          where: { sessionId: sessionId },
        })
      : null;

    if (existingPayment) {
      payment = await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          method: paymentMethod as any,
          amount,
          status: paymentStatus,
          transactionUuid: null,
          esewaRefId: null,
          storeId: finalStoreId,
        },
      });
    } else {
      payment = await tx.payment.create({
        data: {
          amount,
          method: paymentMethod as any,
          status: paymentStatus,
          sessionId: sessionId || null,
          storeId: finalStoreId,
        },
      });
    }

    const finalPaymentId = payment.id;

    // 2. Update all orders in this session to COMPLETED
    const orders = await tx.order.findMany({
      where: {
        sessionId: sessionId || undefined,
        storeId: finalStoreId,
        // If no sessionId, we might be finalizing a specific order if we had an orderId,
        // but this helper seems session-centric. For Take Away, API should pass sessionId.
      },
      include: { items: true },
    });

    for (const order of orders) {
      await tx.order.update({
        where: { id: order.id, storeId: finalStoreId },
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
          sessionId: sessionId || null,
          tableId: tableId || null,
          storeId: finalStoreId,
          type: tableId ? "DINE_IN" : "TAKE_AWAY",
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

    // 4. Handle stray orders on the table (not yet linked to session) - ONLY if tableId exists
    if (tableId) {
      await tx.order.updateMany({
        where: {
          tableId,
          storeId: finalStoreId,
          status: { in: ["PENDING", "PREPARING", "READYTOPICK", "SERVED"] },
          sessionId: null,
        },
        data: {
          status: "COMPLETED",
          customerId: customerId || null,
          paymentId: finalPaymentId,
          sessionId: sessionId || null,
        },
      });
    }

    // 5. Close the TableSession if exists
    if (sessionId) {
      const sessionExists = await tx.tableSession.findUnique({
        where: { id: sessionId, storeId: finalStoreId },
      });

      if (sessionExists) {
        await tx.tableSession.update({
          where: { id: sessionId, storeId: finalStoreId },
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
      }
    }

    // 6. Reset Table status to ACTIVE if exists
    if (tableId) {
      await tx.table.update({
        where: { id: tableId, storeId: finalStoreId },
        data: { status: "ACTIVE" },
      });
    }

    // 7. Handle Customer Ledger and Loyalty
    if (customerId) {
      const pointsEarned = Math.floor(amount / 100);
      await tx.customer.update({
        where: { id: customerId, storeId: finalStoreId },
        data: { loyaltyPoints: { increment: pointsEarned } },
      });

      const lastLedger = await tx.customerLedger.findFirst({
        where: { customerId, storeId: finalStoreId },
        orderBy: { createdAt: "desc" },
      });

      const currentBalance = lastLedger ? lastLedger.closingBalance : 0;
      const newBalance = currentBalance + amount;

      await tx.customerLedger.create({
        data: {
          customerId,
          storeId: finalStoreId,
          txnNo: `SALE-${Date.now()}-${(sessionId || "TA").substring(0, 4)}`,
          type: "SALE",
          amount: amount,
          closingBalance: newBalance,
          referenceId: sessionId || finalPaymentId,
          remarks: tableId
            ? `Table Checkout - ${tableId} (${paymentMethod})`
            : `Take Away Checkout (${paymentMethod})`,
        },
      });

      if (paymentMethod !== "CREDIT") {
        await tx.customerLedger.create({
          data: {
            customerId,
            storeId: finalStoreId,
            txnNo: `PAY-${Date.now()}-${(sessionId || "TA").substring(0, 4)}`,
            type: "PAYMENT_IN",
            amount: amount,
            closingBalance: newBalance - amount,
            referenceId: finalPaymentId,
            remarks: tableId
              ? `Payment for Table Checkout (${paymentMethod})`
              : `Payment for Take Away Checkout (${paymentMethod})`,
          },
        });
      }
    }

    return { success: true };
  });
}
