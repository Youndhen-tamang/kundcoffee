import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");

    if (active === "true") {
      const activeSession = await prisma.dailySession.findFirst({
        where: {
          storeId,
          status: "OPEN",
        },
        include: {
          openedBy: {
            select: { name: true, email: true }
          },
          payments: {
            where: { status: { in: ["PAID", "CREDIT"] } },
            select: { amount: true, method: true }
          },
          purchases: {
            where: { paymentMode: "CASH", isDeleted: false },
            select: { totalAmount: true }
          }
        }
      });

      if (activeSession) {
        // Broaden payment statuses for comprehensive revenue reporting
        const relevantPayments = activeSession.payments.map(p => ({
          ...p,
          amount: parseFloat(p.amount.toString()) // Ensure it's a number
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
        const totalDigitalSales = Object.entries(salesByMethod)
          .filter(([method]) => method !== "CASH" && method !== "CREDIT")
          .reduce((sum, [_, amount]) => sum + amount, 0);
        
        const creditSales = salesByMethod.CREDIT || 0;
        const totalRevenue = cashSales + totalDigitalSales + creditSales;

        // Calculate cash outflows from purchases
        const totalCashOutflow = activeSession.purchases.reduce((sum, p) => sum + p.totalAmount, 0);

        const currentExpectedBalance = activeSession.openingBalance + cashSales - totalCashOutflow;

        return NextResponse.json({ 
          success: true, 
          data: { 
            ...activeSession, 
            currentExpectedBalance,
            currentCashSales: cashSales,
            currentDigitalSales: totalDigitalSales,
            currentCreditSales: creditSales,
            currentCashOutflow: totalCashOutflow,
            netCash: cashSales - totalCashOutflow,
            salesByMethod,
            totalRevenue
          } 
        });
      }

      return NextResponse.json({ success: true, data: null });
    }

    const sessions = await prisma.dailySession.findMany({
      where: { storeId },
      orderBy: { openedAt: "desc" },
      include: {
        openedBy: { select: { name: true } },
        closedBy: { select: { name: true } },
      }
    });

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error("Daily Session GET Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;
    const userId = session?.user?.id;

    if (!storeId || !userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { openingBalance, notes } = body;

    // Check if there's already an active session
    const existingActive = await prisma.dailySession.findFirst({
      where: {
        storeId,
        status: "OPEN",
      }
    });

    if (existingActive) {
      return NextResponse.json({ success: false, message: "A session is already active" }, { status: 400 });
    }

    const newSession = await prisma.dailySession.create({
      data: {
        storeId,
        openedById: userId,
        openingBalance: parseFloat(openingBalance) || 0,
        notes,
        status: "OPEN",
      }
    });

    return NextResponse.json({ success: true, data: newSession });
  } catch (error) {
    console.error("Daily Session POST Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
