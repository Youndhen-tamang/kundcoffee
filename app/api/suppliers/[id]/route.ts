import { prisma } from "@/lib/prisma";
import { Params } from "@/lib/types";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id, storeId },
      include: {
        ledgers: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, message: "Supplier not found" },
        { status: 404 },
      );
    }

    // Calculate metrics for this specific supplier
    const ledgers = await prisma.supplierLedger.findMany({
      where: { supplierId: id, storeId },
    });

    let dueAmount = 0;
    let totalPurchases = 0;
    let totalReturns = 0;
    let totalPaymentsOut = 0;
    let totalPaymentsIn = 0;

    ledgers.forEach((l) => {
      if (l.type === "PURCHASE") {
        dueAmount += l.amount;
        totalPurchases += l.amount;
      } else if (l.type === "PAYMENT") {
        // PAYMENT to supplier is traditionally a debit (reduces payable)
        // If amount is positive, it's money OUT. If negative, it's money IN (refund).
        dueAmount -= l.amount;
        if (l.amount > 0) totalPaymentsOut += l.amount;
        else totalPaymentsIn += Math.abs(l.amount);
      } else if (l.type === "RETURN") {
        dueAmount -= l.amount;
        totalReturns += l.amount;
      } else if (l.type === "OPENING_BALANCE") {
        // We use closingBalance here as the initialized value with sign
        dueAmount += l.closingBalance;
      } else if (l.type === "ADJUSTMENT") {
        dueAmount += l.amount;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...supplier,
        dueAmount,
        metrics: {
          totalPurchases,
          totalReturns,
          totalPaymentsOut,
          totalPaymentsIn,
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/suppliers/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const updatedSupplier = await prisma.supplier.update({
      where: { id, storeId },
      data: body,
    });

    return NextResponse.json({ success: true, data: updatedSupplier });
  } catch (error: any) {
    console.error("PATCH /api/suppliers/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await prisma.supplier.delete({ where: { id, storeId } });

    return NextResponse.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/suppliers/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
