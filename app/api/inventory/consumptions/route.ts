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

    const consumptions = await prisma.stockConsumption.findMany({
      where: {
        stock: { storeId: session.user.storeId },
      },
      include: {
        stock: {
          select: { name: true, unit: { select: { shortName: true } } },
        },
        dish: { select: { name: true } },
        addOn: { select: { name: true } },
        combo: { select: { name: true } },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ success: true, data: consumptions });
  } catch (error) {
    console.error("Stock Consumptions GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    const storeId = session.user.storeId;

    const { stockId, quantity, dishId, addOnId, comboId } = await req.json();

    if (!stockId || !quantity) {
      return NextResponse.json(
        { success: false, message: "Stock ID and quantity are required" },
        { status: 400 },
      );
    }

    // Use transaction to update stock and record consumption
    const result = await prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({
        where: { id: stockId, storeId },
      });

      if (!stock) throw new Error("Stock not found");
      if (stock.quantity < quantity) throw new Error("Insufficient stock");

      const consumption = await tx.stockConsumption.create({
        data: {
          stockId,
          quantity,
          dishId: dishId || undefined,
          addOnId: addOnId || undefined,
          comboId: comboId || undefined,
        },
      });

      await tx.stock.update({
        where: { id: stockId },
        data: { quantity: { decrement: quantity } },
      });

      return consumption;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Stock Consumptions POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
