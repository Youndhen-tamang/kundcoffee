// app/api/analytics/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Sale } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start") || "2026-01-01";
  const endDate = searchParams.get("end") || new Date().toISOString().split("T")[0];

  try {
    const sales = await prisma.$queryRaw<Sale[]>`
      SELECT
        DATE("createdAt") AS date,
        SUM(amount) AS total
      FROM "Payment"
      WHERE status = 'PAID'
        AND "createdAt" BETWEEN ${startDate} AND ${endDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return NextResponse.json({ success: true, data: sales });
  } catch (error) {
    console.error("Sales chart error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
