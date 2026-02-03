import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";

// Soft delete or move to trash
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const updated = await prisma.payment.update({
      where: { id },
      data: { isDeleted: true },
    });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: "Transaction moved to trash successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Sales DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.payment.update({
      where: { id },
      data: body,
    });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: "Transaction updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Sales PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
