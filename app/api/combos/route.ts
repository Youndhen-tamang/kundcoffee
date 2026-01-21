import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.comboOffer.findMany({
      include: {
        category: true,
        subMenu: true,
        price: true,
        items: { include: { dish: true } },
        stocks: { include: { stock: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching combos:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch combos" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      hscode,
      image,
      preparationTime,
      description,
      categoryId,
      subMenuId,
      kotType,
      price, // { actualPrice... }
      items, // [{ dishId, quantity, unitPrice }]
      stockConsumption,
    } = body;

    const newCombo = await prisma.comboOffer.create({
      data: {
        name,
        hscode,
        image,
        description,
        preparationTime: parseInt(preparationTime),
        categoryId,
        subMenuId,
        kotType,
        price: price ? { create: price } : undefined,
        items: items
          ? {
              create: items.map((i: any) => ({
                dishId: i.dishId,
                quantity: parseInt(i.quantity),
                unitPrice: parseFloat(i.unitPrice),
              })),
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
      include: { items: true, price: true },
    });

    return NextResponse.json({ success: true, data: newCombo });
  } catch (error) {
    console.error("Error creating combo:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create combo" },
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
      hscode,
      image,
      preparationTime,
      description,
      categoryId,
      subMenuId,
      kotType,
      price,
      items,
      stockConsumption,
    } = body;

    if (!id)
      return NextResponse.json({ message: "ID is required" }, { status: 400 });

    await prisma.comboOffer.update({
      where: { id },
      data: {
        name,
        hscode,
        image,
        description,
        preparationTime: parseInt(preparationTime),
        categoryId,
        subMenuId,
        kotType,
      },
    });

    if (price) {
      const existingPrice = await prisma.price.findUnique({
        where: { comboId: id },
      });
      if (existingPrice) {
        await prisma.price.update({ where: { comboId: id }, data: price });
      } else {
        await prisma.price.create({ data: { ...price, comboId: id } });
      }
    }

    if (items) {
      await prisma.comboItem.deleteMany({ where: { comboId: id } });
      await prisma.comboItem.createMany({
        data: items.map((i: any) => ({
          comboId: id,
          dishId: i.dishId,
          quantity: parseInt(i.quantity),
          unitPrice: parseFloat(i.unitPrice),
        })),
      });
    }

    if (stockConsumption) {
      await prisma.stockConsumption.deleteMany({ where: { comboId: id } });
      await prisma.stockConsumption.createMany({
        data: stockConsumption.map((s: any) => ({
          stockId: s.stockId,
          quantity: parseFloat(s.quantity),
          comboId: id,
        })),
      });
    }

    const updated = await prisma.comboOffer.findUnique({
      where: { id },
      include: {
        category: true,
        subMenu: true,
        price: true,
        items: { include: { dish: true } },
        stocks: { include: { stock: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating combo:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update combo" },
      { status: 500 },
    );
  }
}
