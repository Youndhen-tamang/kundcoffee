import { prisma } from "@/lib/prisma";
import { Params } from "@/lib/types";
import { NextResponse, NextRequest } from "next/server";

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 },
      );
    }

    const {
      name,
      image,
      description,
      type,
      isAvailable,
      categoryId,
      price,
      stockConsumption,
    } = await req.json();

    const currentAddon = await prisma.addOn.findUnique({ where: { id } });
    if (!currentAddon)
      return NextResponse.json(
        { success: false, message: "Addon not found" },
        { status: 404 },
      );

    if (name || categoryId) {
      const existingAddon = await prisma.addOn.findFirst({
        where: {
          name: name || currentAddon.name,
          categoryId: categoryId || currentAddon.categoryId,
          id: { not: id },
        },
      });

      if (existingAddon) {
        return NextResponse.json(
          {
            success: false,
            message: `Add-on "${name || currentAddon.name}" already exists in the target category`,
          },
          { status: 400 },
        );
      }
    }

    const updatedAddon = await prisma.$transaction(async (tx) => {
      // 1. Update basic info
      const addon = await tx.addOn.update({
        where: { id },
        data: {
          name,
          image,
          description,
          type,
          isAvailable,
          categoryId,
        },
      });

      // 2. Update Price
      if (price) {
        await tx.price.upsert({
          where: { addOnId: id },
          update: {
            actualPrice: parseFloat(price.actualPrice),
            discountPrice: parseFloat(price.discountPrice),
            listedPrice: parseFloat(price.listedPrice),
            cogs: parseFloat(price.cogs),
            grossProfit: parseFloat(price.grossProfit),
          },
          create: {
            addOnId: id,
            actualPrice: parseFloat(price.actualPrice),
            discountPrice: parseFloat(price.discountPrice),
            listedPrice: parseFloat(price.listedPrice),
            cogs: parseFloat(price.cogs),
            grossProfit: parseFloat(price.grossProfit),
          },
        });
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

      return addon;
    });

    return NextResponse.json(
      { success: true, message: "Updated Successfully", data: updatedAddon },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 },
      );
    }

    await prisma.addOn.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Deleted Successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Delete Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
