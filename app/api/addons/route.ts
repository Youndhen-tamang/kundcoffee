import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const addons = await prisma.addOn.findMany({
      include: {
        price: true,
        stocks: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: addons });
  } catch (error) {
    console.error("Error fetching addons:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch addons" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      image,
      description,
      type,
      isAvailable,
      categoryId,
      price,
      stockConsumption,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    const existingAddon = await prisma.addOn.findFirst({
      where: {
        name,
        categoryId: categoryId || null,
      },
    });

    if (existingAddon) {
      return NextResponse.json(
        {
          success: false,
          message: `Add-on "${name}" already exists in this category`,
        },
        { status: 400 },
      );
    }

    const newAddon = await prisma.addOn.create({
      data: {
        name,
        image,
        description,
        type: type || "EXTRA",
        isAvailable: isAvailable ?? true,
        categoryId,
        price: {
          create: {
            actualPrice: parseFloat(price?.actualPrice || 0),
            discountPrice: parseFloat(price?.discountPrice || 0),
            listedPrice: parseFloat(price?.listedPrice || 0),
            cogs: parseFloat(price?.cogs || 0),
            grossProfit: parseFloat(price?.grossProfit || 0),
          },
        },
        stocks: {
          create:
            stockConsumption?.map((s: any) => ({
              stockId: s.stockId,
              quantity: parseFloat(s.quantity),
            })) || [],
        },
      },
      include: {
        price: true,
      },
    });

    return NextResponse.json({ success: true, data: newAddon });
  } catch (error) {
    console.error("Error creating addon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create addon" },
      { status: 500 },
    );
  }
}
