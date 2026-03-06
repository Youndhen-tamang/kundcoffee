import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      email,
      legalName,
      taxNumber,
      address,
      openingBalance,
      openingBalanceType,
    } = body;

    if (!fullName) {
      return NextResponse.json(
        { success: false, message: "Full name is required" },
        { status: 400 },
      );
    }

    const supplier = await prisma.$transaction(
      async (tx) => {
        const newSupplier = await tx.supplier.create({
          data: {
            fullName,
            phone,
            email,
            legalName,
            taxNumber,
            address,
            openingBalance: parseFloat(openingBalance) || 0,
            openingBalanceType: openingBalanceType || "CREDIT",
            storeId,
          },
        });

        // Create opening balance ledger entry
        if (newSupplier.openingBalance !== 0) {
          const amount = newSupplier.openingBalance;
          const closingBalance =
            newSupplier.openingBalanceType === "CREDIT" ? amount : -amount;

          await tx.supplierLedger.create({
            data: {
              supplierId: newSupplier.id,
              storeId,
              txnNo: `OPB-${newSupplier.id.slice(0, 8).toUpperCase()}`,
              type: "OPENING_BALANCE",
              amount,
              closingBalance,
              remarks: "Opening Balance",
            },
          });
        }

        return newSupplier;
      },
      { timeout: 20000 },
    );

    return NextResponse.json({ success: true, data: supplier });
  } catch (error: any) {
    console.error("POST /api/suppliers error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    // 1. Fetch suppliers
    const suppliers = await prisma.supplier.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    // 2. Efficiently calculate metrics using aggregations
    // We group by type to sum up amounts for each type
    const ledgerAggregations = await prisma.supplierLedger.groupBy({
      by: ["type"],
      where: { storeId },
      _sum: {
        amount: true,
        closingBalance: true,
      },
    });

    let totalOutstanding = 0;
    ledgerAggregations.forEach((agg) => {
      const sumAmount = agg._sum.amount || 0;
      const sumClosing = agg._sum.closingBalance || 0;

      if (agg.type === "PURCHASE") totalOutstanding += sumAmount;
      else if (agg.type === "PAYMENT") totalOutstanding -= sumAmount;
      else if (agg.type === "RETURN") totalOutstanding -= sumAmount;
      else if (agg.type === "OPENING_BALANCE") totalOutstanding += sumClosing;
      else if (agg.type === "ADJUSTMENT") totalOutstanding += sumAmount;
    });

    return NextResponse.json({
      success: true,
      data: {
        suppliers,
        metrics: {
          totalSuppliers: suppliers.length,
          totalOutstanding,
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/suppliers error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
