import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Params } from "@/lib/types";
export async function GET(req: NextRequest,context: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const dailySession = await prisma.dailySession.findFirst({
      where: { id: id, storeId },
      include: {
        openedBy: { select: { name: true } },
        closedBy: { select: { name: true } },
        payments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            method: true,
            amount: true,
            status: true,
            createdAt: true,
            staff: { select: { name: true } }
          }
        },
        purchases: {
          where: { isDeleted: false },
          include: {
            items: true,
            supplier: { select: { fullName: true } }
          }
        }
      }
    });

    if (!dailySession) {
      return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: dailySession });
  } catch (error) {
    console.error("Daily Session Detail GET Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const {id} = await context.params;
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;
    const userId = session?.user?.id;

    if (!storeId || !userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const dailySession = await prisma.dailySession.findFirst({
      where: { id: id, storeId },
      include: { 
        payments: true,
        purchases: {
          where: { paymentMode: "CASH", isDeleted: false }
        }
      }
    });

    if (!dailySession || dailySession.status !== "OPEN") {
      return NextResponse.json({ success: false, message: "Active session not found" }, { status: 404 });
    }

    const body = await req.json();
    const { actualClosingBalance, notes: userNotes } = body;

    // Broaden payment statuses for comprehensive revenue reporting
    const relevantPayments = dailySession.payments
      .filter(p => ["PAID", "CREDIT"].includes(p.status))
      .map(p => ({
        ...p,
        amount: parseFloat(p.amount.toString())
      }));

    // Calculate breakdown by method
    const salesByMethod: Record<string, number> = {
      CASH: 0,
      QR: 0,
      ESEWA: 0,
      CARD: 0,
      BANK_TRANSFER: 0,
      CREDIT: 0
    };

    relevantPayments.forEach(p => {
      if (salesByMethod[p.method] !== undefined) {
         salesByMethod[p.method] += p.amount;
      } else {
         salesByMethod[p.method] = p.amount;
      }
    });

    const cashSales = salesByMethod.CASH || 0;
    const digitalSales = Object.entries(salesByMethod)
      .filter(([method]) => method !== "CASH" && method !== "CREDIT")
      .reduce((sum, [_, amount]) => sum + amount, 0);
    
    const creditSales = salesByMethod.CREDIT || 0;
    const totalRevenue = cashSales + digitalSales + creditSales;
    // Cash outflows (Purchases)
    const totalCashOutflow = dailySession.purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const cashOnDrawer = cashSales - totalCashOutflow;
    const expectedClosingBalance = dailySession.openingBalance + cashSales - totalCashOutflow;
    const difference = (parseFloat(actualClosingBalance) || 0) - expectedClosingBalance;

    const breakdownNote = Object.entries(salesByMethod)
      .filter(([_, amount]) => amount > 0)
      .map(([method, amount]) => `- ${method}: ${amount.toFixed(2)}`)
      .join("\n");

    const purchaseNote = dailySession.purchases.length > 0 
      ? `\n\nCash Purchases (-):\n${dailySession.purchases.map(p => `- ${p.referenceNumber}: ${p.totalAmount.toFixed(2)}`).join("\n")}`
      : "";

    const updatedSession = await prisma.dailySession.update({
      where: { id: id },
      data: {
        closedAt: new Date(),
        closedById: userId,
        expectedClosingBalance,
        actualClosingBalance: parseFloat(actualClosingBalance) || 0,
        difference,
        cashOnDrawer,
        status: "CLOSED",
        notes: `${dailySession.notes || ""}\n\nSession Revenue Breakdown:\n${breakdownNote}\n- Total Revenue: ${totalRevenue.toFixed(2)}${purchaseNote}\n\nFinal Reconciliation:\n- Opening Cash: ${dailySession.openingBalance.toFixed(2)}\n- Cash Sales (+): ${cashSales.toFixed(2)}\n- Cash Purchases (-): ${totalCashOutflow.toFixed(2)}\n- Expected Cash: ${expectedClosingBalance.toFixed(2)}\n- Actual Cash in Drawer: ${actualClosingBalance}\n- Difference: ${difference.toFixed(2)}\n- User Notes: ${userNotes || "None"}`.trim()
      }
    });

    return NextResponse.json({ success: true, data: updatedSession });
  } catch (error) {
    console.error("Daily Session PATCH Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
