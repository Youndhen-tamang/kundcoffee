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

    const supplier = await prisma.$transaction(async (tx) => {
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
    });

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

    const suppliers = await prisma.supplier.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate Global Metrics
    const totalSuppliers = suppliers.length;

    // For total outstanding payables, we need to sum up all ledger entries for all suppliers in this store
    const ledgers = await prisma.supplierLedger.findMany({
      where: { storeId },
    });

    let totalOutstanding = 0;
    ledgers.forEach((l) => {
      if (l.type === "PURCHASE") totalOutstanding += l.amount;
      else if (l.type === "PAYMENT") totalOutstanding -= l.amount;
      else if (l.type === "RETURN") totalOutstanding -= l.amount;
      else if (l.type === "OPENING_BALANCE") {
        totalOutstanding += l.closingBalance;
      } else if (l.type === "ADJUSTMENT") totalOutstanding += l.amount;
    });

    return NextResponse.json({
      success: true,
      data: {
        suppliers,
        metrics: {
          totalSuppliers,
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
