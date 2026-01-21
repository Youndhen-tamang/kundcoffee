import { NextResponse } from "next/server";
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      image,
      description,
      type,
      isAvailable,
      price,
      stockConsumption,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
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

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      image,
      description,
      type,
      isAvailable,
      price,
      stockConsumption,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Required" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update basic info
      await tx.addOn.update({
        where: { id },
        data: {
          name,
          image,
          description,
          type,
          isAvailable,
        },
      });

      // 2. Update Price
      if (price) {
        const existingPrice = await tx.price.findFirst({
          where: { addOnId: id },
        });
        if (existingPrice) {
          await tx.price.update({
            where: { id: existingPrice.id },
            data: {
              actualPrice: parseFloat(price.actualPrice),
              discountPrice: parseFloat(price.discountPrice),
              listedPrice: parseFloat(price.listedPrice),
              cogs: parseFloat(price.cogs),
              grossProfit: parseFloat(price.grossProfit),
            },
          });
        } else {
          await tx.price.create({
            data: {
              addOnId: id,
              actualPrice: parseFloat(price.actualPrice),
              discountPrice: parseFloat(price.discountPrice),
              listedPrice: parseFloat(price.listedPrice),
              cogs: parseFloat(price.cogs),
              grossProfit: parseFloat(price.grossProfit),
            },
          });
        }
      }

      // 3. Update Stocks
      if (stockConsumption) {
        await tx.stockConsumption.deleteMany({ where: { addOnId: id } });
        if (stockConsumption.length > 0) {
          await tx.stockConsumption.createMany({
            data: stockConsumption.map((s: any) => ({
              addOnId: id,
              stockId: s.stockId,
              quantity: parseFloat(s.quantity),
            })),
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Addon updated successfully",
    });
  } catch (error) {
    console.error("Error updating addon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update addon" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Required" },
        { status: 400 },
      );
    }

    await prisma.addOn.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Addon deleted" });
  } catch (error) {
    console.error("Error deleting addon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete addon" },
      { status: 500 },
    );
  }
}
