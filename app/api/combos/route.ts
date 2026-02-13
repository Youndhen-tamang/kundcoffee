import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Params } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const combos = await prisma.comboOffer.findMany({
      where: { storeId },
      include: {
        category: true,
        subMenu: true,
        items: {
          include: { dish: true },
        },
        price: true,
        stocks: true,
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: combos });
  } catch (error) {
    console.error("Error fetching combos:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch combos" },
      { status: 500 },
    );
  }
}

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
      name,
      image,
      hscode,
      preparationTime,
      description,
      categoryId,
      subMenuId,
      kotType,
      items, // Array of { dishId, quantity, unitPrice }
      price,
      stockConsumption,
      sortOrder,
    } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Name and Category are required" },
        { status: 400 },
      );
    }

    const existingCombo = await prisma.comboOffer.findFirst({
      where: {
        name,
        categoryId,
        storeId,
      },
    });

    if (existingCombo) {
      return NextResponse.json(
        {
          success: false,
          message: `Combo "${name}" already exists in this category`,
        },
        { status: 400 },
      );
    }

    // Calculate next sortOrder if not provided
    let finalSortOrder = parseInt(String(sortOrder));
    if (!finalSortOrder) {
      const lastCombo = await prisma.comboOffer.findFirst({
        where: { categoryId, storeId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      finalSortOrder = lastCombo ? lastCombo.sortOrder + 1 : 1;
    }

    const combo = await prisma.comboOffer.create({
      data: {
        name,
        image: image || [],
        hscode,
        preparationTime: preparationTime || 0,
        description,
        categoryId,
        subMenuId: subMenuId || null,
        kotType: kotType || "KITCHEN",
        isAvailable: true,
        sortOrder: finalSortOrder,
        storeId,
        price: {
          create: {
            actualPrice: parseFloat(price?.actualPrice || 0),
            discountPrice: parseFloat(price?.discountPrice || 0),
            listedPrice: parseFloat(price?.listedPrice || 0),
            cogs: parseFloat(price?.cogs || 0),
            grossProfit: parseFloat(price?.grossProfit || 0),
          },
        },
        items: {
          create:
            items?.map((i: any) => ({
              dishId: i.dishId,
              quantity: parseInt(i.quantity) || 1,
              unitPrice: parseFloat(i.unitPrice) || 0,
            })) || [],
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
        items: true,
        price: true,
      },
    });

    return NextResponse.json({ success: true, data: combo });
  } catch (error) {
    console.error("Error creating combo:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create combo" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      image,
      hscode,
      preparationTime,
      description,
      categoryId,
      subMenuId,
      kotType,
      items,
      price,
      stockConsumption,
    } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: "ID and Name are required" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update basic info
      await tx.comboOffer.update({
        where: { id },
        data: {
          name,
          image,
          hscode,
          preparationTime,
          description,
          categoryId,
          subMenuId,
          kotType,
        },
      });

      // 2. Update Price
      if (price) {
        const existingPrice = await tx.price.findFirst({
          where: { comboId: id },
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
              comboId: id,
              actualPrice: parseFloat(price.actualPrice),
              discountPrice: parseFloat(price.discountPrice),
              listedPrice: parseFloat(price.listedPrice),
              cogs: parseFloat(price.cogs),
              grossProfit: parseFloat(price.grossProfit),
            },
          });
        }
      }

      // 3. Update Combo Items: Delete and Recreate
      if (items) {
        await tx.comboItem.deleteMany({ where: { comboId: id } });
        if (items.length > 0) {
          await tx.comboItem.createMany({
            data: items.map((i: any) => ({
              comboId: id,
              dishId: i.dishId,
              quantity: parseInt(i.quantity) || 1,
              unitPrice: parseFloat(i.unitPrice) || 0,
            })),
          });
        }
      }

      // 4. Update Stocks
      if (stockConsumption) {
        await tx.stockConsumption.deleteMany({ where: { comboId: id } });
        if (stockConsumption.length > 0) {
          await tx.stockConsumption.createMany({
            data: stockConsumption.map((s: any) => ({
              comboId: id,
              stockId: s.stockId,
              quantity: parseFloat(s.quantity),
            })),
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Combo updated successfully",
    });
  } catch (error) {
    console.error("Error updating combo:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update combo" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Required" },
        { status: 400 },
      );
    }

    await prisma.comboOffer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Combo deleted" });
  } catch (error) {
    console.error("Error deleting combo:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete combo" },
      { status: 500 },
    );
  }
}
