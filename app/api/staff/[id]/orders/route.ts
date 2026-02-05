import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const orders = await prisma.order.findMany({
      where: {
        staffId: id,
        isDeleted: false,
      },
      include: {
        table: true,
        items: {
          include: {
            dish: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const staff = await prisma.staff.findUnique({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        staff,
        orders: orders.map((order) => ({
          id: order.id,
          table: order.table?.name || "N/A",
          total: order.total,
          status: order.status,
          date: order.createdAt,
          itemCount: order.items.length,
        })),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Staff Orders API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
