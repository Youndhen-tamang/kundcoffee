import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = {
      isDeleted: false,
    };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    } else if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    } else if (filter) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      if (filter === "today") {
        where.createdAt = { gte: start, lte: end };
      } else if (filter === "yesterday") {
        const yesterdayStart = new Date(start);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(end);
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        where.createdAt = { gte: yesterdayStart, lte: yesterdayEnd };
      } else if (filter === "this_month") {
        start.setDate(1);
        where.createdAt = { gte: start, lte: end };
      } else if (filter === "this_year") {
        start.setMonth(0, 1);
        where.createdAt = { gte: start, lte: end };
      }
    }

    if (status) {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        orders: {
          include: {
            customer: true,
            items: {
              include: {
                dish: true,
              },
            },
          },
        },
        session: {
          include: {
            table: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Metrics calculation
    const totalSales = payments.reduce((acc, p) => acc + p.amount, 0);
    const totalOrders = new Set(
      payments.map((p) => p.orders?.[0]?.id || p.sessionId).filter(Boolean),
    ).size;

    const methodCounts: Record<string, number> = {};
    payments.forEach((p) => {
      methodCounts[p.method] = (methodCounts[p.method] || 0) + 1;
    });

    let leadingPayment = "N/A";
    let maxCount = 0;
    for (const [method, count] of Object.entries(methodCounts)) {
      if (count > maxCount) {
        maxCount = count;
        leadingPayment = method;
      }
    }

    const response: ApiResponse = {
      success: true,
      data: {
        metrics: {
          totalOrders,
          totalSales,
          leadingPayment,
        },
        transactions: payments.map((p) => {
          const order = p.orders?.[0];
          return {
            id: p.id,
            orderId: order?.id,
            sessionId: p.sessionId,
            orderType: order?.type || "DINE_IN", // Fallback for sessions
            amount: p.amount,
            mode: p.method,
            status: p.status,
            date: p.createdAt,
            billedBy: "Admin", // Placeholder as User model is not present
            customer: order?.customer?.fullName || "Guest",
            items:
              order?.items.map((it: any) => ({
                dishName: it.dish?.name || "Unknown Item",
                quantity: it.quantity,
                amount: it.totalPrice,
              })) || [],
          };
        }),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Sales API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
