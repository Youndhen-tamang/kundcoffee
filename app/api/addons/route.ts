import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.addOn.findMany({
      include: {
        price: true,
        stocks: { include: { stock: true } },
        usedIn: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching addons:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch addons" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      image,
      description,
      type,
      price, 
      stockConsumption, // [{ stockId, quantity }]
    } = body;

    const newAddOn = await prisma.addOn.create({
      data: {
        name,
        image,
        description,
        type: type || "EXTRA",
        price: price
          ? {
              create: price,
            }
          : undefined,
        stocks: stockConsumption
          ? {
              create: stockConsumption.map((s: any) => ({
                stockId: s.stockId,
                quantity: parseFloat(s.quantity),
              })),
            }
          : undefined,
      },
      include: {
        price: true,
      },
    });

    return NextResponse.json({ success: true, data: newAddOn });
  } catch (error) {
    console.error("Error creating addon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create addon" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, image, description, type, price, stockConsumption } =
      body;

    if (!id)
      return NextResponse.json({ message: "ID is required" }, { status: 400 });

    // Update basic fields
    await prisma.addOn.update({
      where: { id },
      data: { name, image, description, type },
    });

    // Update Price
    if (price) {
      const existingPrice = await prisma.price.findUnique({
        where: { addOnId: id },
      });
      if (existingPrice) {
        await prisma.price.update({ where: { addOnId: id }, data: price });
      } else {
        await prisma.price.create({ data: { ...price, addOnId: id } });
      }
    }

    // Update Stocks
    if (stockConsumption) {
      await prisma.stockConsumption.deleteMany({ where: { addOnId: id } });
      await prisma.stockConsumption.createMany({
        data: stockConsumption.map((s: any) => ({
          stockId: s.stockId,
          quantity: parseFloat(s.quantity),
          addOnId: id,
        })),
      });
    }

    const updated = await prisma.addOn.findUnique({
      where: { id },
      include: {
        price: true,
        stocks: { include: { stock: true } },
        usedIn: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating addon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update addon" },
      { status: 500 },
    );
  }
}
