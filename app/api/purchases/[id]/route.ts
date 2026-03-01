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

    const purchase = await prisma.purchase.findUnique({
      where: { id, storeId },
      include: {
        supplier: true,
        items: true,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { success: false, message: "Purchase not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: purchase });
  } catch (error: any) {
    console.error("GET /api/purchases/[id] error:", error);
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

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { id, storeId },
        include: { items: true },
      });

      if (!purchase || purchase.isDeleted) {
        throw new Error("Purchase not found or already deleted");
      }

      // 1. Revert Stock
      for (const item of purchase.items) {
        if (item.stockId) {
          await tx.stock.update({
            where: { id: item.stockId },
            data: {
              quantity: { decrement: item.quantity },
            },
          });
        }
      }

      // 2. Create Reversal Ledger Entry
      await tx.supplierLedger.create({
        data: {
          supplierId: purchase.supplierId,
          storeId,
          txnNo: `REV-${purchase.referenceNumber}`,
          type: "RETURN",
          amount: purchase.totalAmount,
          closingBalance: 0,
          referenceId: purchase.id,
          remarks: `Reversal of deleted purchase ${purchase.referenceNumber}`,
        },
      });

      // 3. Soft Delete
      return await tx.purchase.update({
        where: { id },
        data: { isDeleted: true },
      });
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Purchase deleted and stock reverted",
    });
  } catch (error: any) {
    console.error("DELETE /api/purchases/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
