import { prisma } from "@/lib/prisma";
import { Params } from "@/lib/types";
import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const status = body.status as OrderStatus;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 },
      );
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id },
      data: { status },
      include: {
        dish: true,
        selectedAddOns: {
          include: { addOn: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
