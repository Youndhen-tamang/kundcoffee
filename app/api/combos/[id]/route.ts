import { NextRequest, NextResponse } from "next/server";
import { Params } from "@/lib/types";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    
    const { 
      name, image, hscode, preparationTime, description, 
      categoryId, subMenuId, kotType, items, price, sortOrder 
    } = body;

    const current = await prisma.comboOffer.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ success: false, message: "Combo not found" }, { status: 404 });

    if (name || categoryId) {
      const duplicate = await prisma.comboOffer.findFirst({
        where: {
          name: name || current.name,
          categoryId: categoryId || current.categoryId,
          id: { not: id }
        }
      });
      if (duplicate) {
        return NextResponse.json({ success: false, message: "Combo name already exists in this category" }, { status: 400 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedCombo = await tx.comboOffer.update({
        where: { id },
        data: {
          name: name ?? undefined,
          hscode: hscode ?? undefined,
          preparationTime: preparationTime !== undefined ? Number(preparationTime) : undefined,
          description: description ?? undefined,
          categoryId: categoryId ?? undefined,
          subMenuId: subMenuId === "" ? null : (subMenuId ?? undefined),
          kotType: kotType ?? undefined,
          sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined, // Now this will work
          image: image ?? undefined,
        },
      });

      // 2. Update Items
      if (items && Array.isArray(items)) {
        await tx.comboItem.deleteMany({ where: { comboId: id } });
        await tx.comboItem.createMany({
          data: items.map((i: any) => ({
            comboId: id,
            dishId: i.dishId,
            quantity: Number(i.quantity) || 1,
            unitPrice: Number(i.unitPrice) || 0,
          })),
        });
      }

      // 3. Update Price
      if (price) {
        await tx.price.upsert({
          where: { comboId: id },
          update: {
            actualPrice: Number(price.actualPrice) || 0,
            discountPrice: Number(price.discountPrice) || 0,
            listedPrice: Number(price.listedPrice) || 0,
            cogs: Number(price.cogs) || 0,
            grossProfit: Number(price.grossProfit) || 0,
          },
          create: {
            comboId: id,
            actualPrice: Number(price.actualPrice) || 0,
            discountPrice: Number(price.discountPrice) || 0,
            listedPrice: Number(price.listedPrice) || 0,
            cogs: Number(price.cogs) || 0,
            grossProfit: Number(price.grossProfit) || 0,
          },
        });
      }
      return updatedCombo;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    await prisma.comboOffer.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Combo deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}