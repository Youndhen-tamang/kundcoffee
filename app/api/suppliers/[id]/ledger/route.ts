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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const ledger = await prisma.supplierLedger.findMany({
      where: { supplierId: id, storeId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.supplierLedger.count({
      where: { supplierId: id, storeId },
    });

    return NextResponse.json({
      success: true,
      data: {
        ledger,
        total,
      },
    });
  } catch (error: any) {
    console.error("GET /api/suppliers/[id]/ledger error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
