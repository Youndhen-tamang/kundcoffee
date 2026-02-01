import { prisma } from "@/lib/prisma";
import { Params } from "@/lib/types";
import { OrderStatus } from "@prisma/client";
import { NextResponse,NextRequest} from "next/server";

export async function PATCH(req: NextRequest, context: { params: Params }) {
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

export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    if(!id){
      return NextResponse.json(
        { success: false, message: "Item ID is required" },
        { status: 400 },
      );
    }
    const deletedItem = await prisma.orderItem.delete({
      where: { id },
    });
    return NextResponse.json({
      success: true,
      data: deletedItem,
    });
  } catch (error:any ) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
