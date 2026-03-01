import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Verify staff belongs to the store
    const staff = await prisma.staff.findFirst({
      where: { id, storeId },
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Staff not found or access denied" },
        { status: 404 },
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        staffId: id,
        storeId,
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
