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
  paymentId?: string; // paymentId is now optional here as we might create/update it inside
  paymentMethod: string;
  complimentaryItems?: Record<string, number> | null;
  extraFreeItems?:
    | { dishId?: string; name: string; unitPrice: number; quantity: number }[]
    | null;
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
  } = data;

  const complimentaryItems = data.complimentaryItems || {};
  const extraFreeItems = data.extraFreeItems || [];

  return await prisma.$transaction(async (tx) => {
    // 0. Update or Create Payment inside the transaction
    const existingPayment = await tx.payment.findUnique({
      where: { sessionId: sessionId },
    });

    let payment;
    if (existingPayment) {
      payment = await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          method: paymentMethod as any,
          amount,
          status: paymentMethod === "CREDIT" ? "CREDIT" : "PAID",
          transactionUuid: null,
          esewaRefId: null,
        },
      });
    } else {
      payment = await tx.payment.create({
        data: {
          session: { connect: { id: sessionId } },
          method: paymentMethod as any,
          amount,
          status: paymentMethod === "CREDIT" ? "CREDIT" : "PAID",
        },
      });
    }

    const finalPaymentId = payment.id;

    // 1. Update all orders in this session to COMPLETED and link them to the payment
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
            data: {
              complimentaryQuantity: compQty,
              // We could also adjust totalPrice here if needed, but usually it's better to keep raw prices
            },
          });
        }
      }
    }

    // Handle extra free items - create a special "Complimentary" order for them
    if (extraFreeItems.length > 0) {
      await tx.order.create({
        data: {
          sessionId,
          tableId,
          type: "DINE_IN",
          status: "COMPLETED",
          customerId: customerId || null,
          paymentId: finalPaymentId,
          total: 0,
          items: {
            create: extraFreeItems.map((item) => ({
              dishId: item.dishId || null,
              remarks: item.name, // Store name in remarks since name field doesn't exist in OrderItem
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

    // 2. Also handle any stray orders on the table not linked to session (legacy or manual)
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

    // 5. Handle Customer Ledger and Loyalty
    if (customerId) {
      const pointsEarned = Math.floor(amount / 100);
      await tx.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: pointsEarned } },
      });

      // Fetch last ledger to get balance
      const lastLedger = await tx.customerLedger.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });

      const currentBalance = lastLedger ? lastLedger.closingBalance : 0;
      // If it's CREDIT, the closing balance increases (dueAmount increases)
      // Actually, let's look at the formula in Customer detail:
      // dueAmount = openingBalance + (totalSales + paymentOut) - (paymentIn + salesReturn)

      // So SALE increases the balance. PAYMENT_IN decreases it.
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

      // If it's NOT a credit payment, we immediately create a PAYMENT_IN entry too
      if (paymentMethod !== "CREDIT") {
        await tx.customerLedger.create({
          data: {
            customerId,
            txnNo: `PAY-${Date.now()}-${sessionId.substring(0, 4)}`,
            type: "PAYMENT_IN",
            amount: amount,
            closingBalance: newBalance - amount, // Back to previous or zeroed if no other sales
            referenceId: finalPaymentId,
            remarks: `Payment for Table Checkout (${paymentMethod})`,
          },
        });
      }
    }

    return { success: true };
  });
}
