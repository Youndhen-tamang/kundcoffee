// routes/api/customers/summary.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        CustomerLedger: true,
      },
    });

    let totalToReceive = 0;
    let totalToPay = 0;

    const summary = customers.map((c) => {
      const dueAmount =
        c.openingBalance +
        c.CustomerLedger.reduce((sum, l) => {
          if (
            l.type === "SALE" ||
            l.type === "ADJUSTMENT" ||
            l.type === "PAYMENT_OUT"
          )
            return sum + l.amount;
          if (l.type === "PAYMENT_IN" || l.type === "RETURN")
            return sum - l.amount;
          return sum;
        }, 0);

      if (dueAmount > 0) totalToReceive += dueAmount;
      else if (dueAmount < 0) totalToPay += Math.abs(dueAmount);

      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        dob: c.dob,
        loyaltyId: c.loyaltyId,
        dueAmount,
      };
    });

    return NextResponse.json({
      success: true,
      data: summary,
      metrics: {
        toReceive: totalToReceive,
        toPay: totalToPay,
        netToReceive: totalToReceive - totalToPay,
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer summary" },
      { status: 500 },
    );
  }
}
