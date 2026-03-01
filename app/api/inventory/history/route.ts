import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    const storeId = session.user.storeId;

    const { searchParams } = new URL(req.url);
    const stockId = searchParams.get("stockId");

    // Fetch purchases
    const purchases = await prisma.purchaseItem.findMany({
      where: {
        purchase: { storeId },
        ...(stockId ? { stockId } : {}),
      },
      include: {
        purchase: {
          select: {
            id: true,
            txnDate: true,
            referenceNumber: true,
            supplier: { select: { fullName: true } },
          },
        },
        stock: {
          select: { name: true, unit: { select: { shortName: true } } },
        },
      },
      orderBy: { purchase: { txnDate: "desc" } },
    });

    // Fetch consumptions
    const consumptions = await prisma.stockConsumption.findMany({
      where: {
        stock: { storeId },
        ...(stockId ? { stockId } : {}),
      },
      include: {
        stock: {
          select: { name: true, unit: { select: { shortName: true } } },
        },
        dish: { select: { name: true } },
        addOn: { select: { name: true } },
        combo: { select: { name: true } },
      },
      orderBy: { id: "desc" }, // No createdAt in StockConsumption, using id assuming UUID order or just list
    });

    // Merge and format
    const history = [
      ...purchases.map((p) => ({
        id: p.id,
        type: "PURCHASE",
        date: p.purchase.txnDate,
        stockName: p.stock?.name || p.itemName,
        quantity: p.quantity,
        unit: p.stock?.unit?.shortName || "",
        reference: p.purchase.referenceNumber,
        entity: p.purchase.supplier.fullName,
      })),
      ...consumptions.map((c) => ({
        id: c.id,
        type: "CONSUMPTION",
        date: new Date(), // Using current date as placeholder since StockConsumption lacks it
        stockName: c.stock.name,
        quantity: -c.quantity,
        unit: c.stock.unit?.shortName || "",
        reference:
          c.dish?.name || c.addOn?.name || c.combo?.name || "Manual/Other",
        entity: "System",
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("Stock History GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
