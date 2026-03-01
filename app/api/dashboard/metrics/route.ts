import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "this_month";
    const date = searchParams.get("date");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let startDate = startOfMonth(new Date());
    let endDate = endOfMonth(new Date());

    if (date) {
      startDate = startOfDay(new Date(date));
      endDate = endOfDay(new Date(date));
    } else if (month && year) {
      const d = new Date(parseInt(year), parseInt(month) - 1);
      startDate = startOfMonth(d);
      endDate = endOfMonth(d);
    } else {
      const now = new Date();
      if (filter === "today") {
        startDate = startOfDay(now);
        endDate = endOfDay(now);
      } else if (filter === "yesterday") {
        const y = subDays(now, 1);
        startDate = startOfDay(y);
        endDate = endOfDay(y);
      } else if (filter === "this_month") {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      } else if (filter === "this_year") {
        startDate = startOfYear(now);
        endDate = endOfYear(now);
      }
    }

    const type = searchParams.get("type");
    if (type === "chart") {
      const payments = await prisma.payment.findMany({
        where: {
          storeId,
          status: "PAID",
          createdAt: { gte: startDate, lte: endDate },
          isDeleted: false,
        },
        select: {
          amount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const dailyMap = new Map<string, number>();

      payments.forEach((p) => {
        const day = new Date(p.createdAt).toLocaleDateString("en-CA");
        const current = dailyMap.get(day) || 0;
        dailyMap.set(day, current + p.amount);
      });

      const chartData = Array.from(dailyMap.entries()).map(([date, total]) => ({
        date,
        total,
      }));

      chartData.sort((a, b) => a.date.localeCompare(b.date));

      return NextResponse.json({
        success: true,
        data: chartData,
      });
    }

    const [sales, purchases, expenses, paymentIn, paymentOut, returns] =
      await Promise.all([
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            storeId,
            status: "PAID",
            createdAt: { gte: startDate, lte: endDate },
            isDeleted: false,
          },
        }),
        prisma.purchase.aggregate({
          _sum: { totalAmount: true },
          where: {
            storeId,
            txnDate: { gte: startDate, lte: endDate },
          },
        }),
        prisma.expense.aggregate({
          _sum: { amount: true },
          where: {
            storeId,
            date: { gte: startDate, lte: endDate },
          },
        }),
        prisma.customerLedger.aggregate({
          _sum: { amount: true },
          where: {
            customer: { storeId },
            type: "PAYMENT_IN",
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.customerLedger.aggregate({
          _sum: { amount: true },
          where: {
            customer: { storeId },
            type: "PAYMENT_OUT",
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.salesReturn.aggregate({
          _sum: { totalAmount: true },
          where: {
            storeId,
            txnDate: { gte: startDate, lte: endDate },
            isDeleted: false,
          },
        }),
      ]);

    const salesTotal = sales._sum.amount || 0;
    const purchasesTotal = purchases._sum.totalAmount || 0;
    const expensesTotal = expenses._sum.amount || 0;
    const paymentInTotal = paymentIn._sum.amount || 0;
    const paymentOutTotal = paymentOut._sum.amount || 0;
    const returnsTotal = returns._sum.totalAmount || 0;

    const response: ApiResponse = {
      success: true,
      data: {
        sales: salesTotal,
        purchases: purchasesTotal,
        income: salesTotal + paymentInTotal, // Aggregated inflow
        expenses: expensesTotal,
        paymentIn: paymentInTotal,
        paymentOut: paymentOutTotal,
        returns: returnsTotal,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard Metrics Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
