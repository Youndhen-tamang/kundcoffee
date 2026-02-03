import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { items, ...returnData } = body;

    const updated = await prisma.$transaction(async (tx) => {
      if (items && Array.isArray(items)) {
        // Simple strategy: delete existing items and recreate
        await tx.salesReturnItem.deleteMany({
          where: { salesReturnId: id },
        });

        await tx.salesReturnItem.createMany({
          data: items.map((item: any) => ({
            salesReturnId: id,
            dishName: item.dishName,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        });
      }

      return await tx.salesReturn.update({
        where: { id },
        data: returnData,
        include: { items: true },
      });
    });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: "Sales return updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Sales Return PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const updated = await prisma.salesReturn.update({
      where: { id },
      data: { isDeleted: true },
    });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: "Sales return deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Sales Return DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
