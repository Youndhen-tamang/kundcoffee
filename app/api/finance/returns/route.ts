import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");
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
      where.txnDate = { gte: start, lte: end };
    } else if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      where.txnDate = { gte: start, lte: end };
    } else if (filter) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      if (filter === "today") {
        where.txnDate = { gte: start, lte: end };
      } else if (filter === "yesterday") {
        const yesterdayStart = new Date(start);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(end);
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        where.txnDate = { gte: yesterdayStart, lte: yesterdayEnd };
      } else if (filter === "this_month") {
        start.setDate(1);
        where.txnDate = { gte: start, lte: end };
      } else if (filter === "this_year") {
        start.setMonth(0, 1);
        where.txnDate = { gte: start, lte: end };
      }
    }

    const returns = await prisma.salesReturn.findMany({
      where,
      include: {
        customer: true,
        items: true,
      },
      orderBy: {
        txnDate: "desc",
      },
    });

    // Metrics calculation
    const totalAmount = returns.reduce((acc, r) => acc + r.totalAmount, 0);
    const totalReturnCount = returns.length;

    // Most returned item logic
    const itemQuantities: Record<string, number> = {};
    returns.forEach((r) => {
      r.items.forEach((item) => {
        itemQuantities[item.dishName] =
          (itemQuantities[item.dishName] || 0) + item.quantity;
      });
    });

    let mostReturned = "N/A";
    let maxQty = 0;
    for (const [name, qty] of Object.entries(itemQuantities)) {
      if (qty > maxQty) {
        maxQty = qty;
        mostReturned = name;
      }
    }

    const response: ApiResponse = {
      success: true,
      data: {
        metrics: {
          totalReturnCount,
          totalAmount,
          mostReturned,
        },
        returns: returns.map((r) => ({
          sn: r.id.slice(0, 8),
          id: r.id,
          parties: r.customer?.fullName || "Guest",
          txnAmount: r.totalAmount,
          mode: r.paymentMode || "N/A",
          status: r.paymentStatus,
          txnDate: r.txnDate,
          billedBy: r.salesStaff || "Admin",
          items: r.items,
        })),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Sales Return GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId,
      txnDate,
      billReference,
      salesStaff,
      items,
      taxableAmount,
      totalAmount,
      roundOff,
      discount,
      attachment,
      remark,
      paymentStatus,
      paymentMode,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "No items provided" },
        { status: 400 },
      );
    }

    const referenceNumber = `SR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newReturn = await prisma.salesReturn.create({
      data: {
        referenceNumber,
        customerId: customerId || null,
        txnDate: txnDate ? new Date(txnDate) : new Date(),
        billReference,
        salesStaff,
        taxableAmount,
        totalAmount,
        roundOff: roundOff || 0,
        discount: discount || 0,
        attachment,
        remark,
        paymentStatus: paymentStatus || "UNPAID",
        paymentMode: paymentMode || null,
        items: {
          create: items.map((item: any) => ({
            dishName: item.dishName,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: newReturn,
      message: "Sales return created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Sales Return POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
