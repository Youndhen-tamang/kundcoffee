import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    // Top Customers by Sales Volume (Completed Orders)
    const topCustomersGroups = await prisma.order.groupBy({
      by: ["customerId"],
      _sum: {
        total: true,
      },
      where: {
        status: "COMPLETED", // Or based on Payment status? Let's use Order status for now or Payment link?
        // Using Order status COMPLETED or SERVED? usually COMPLETED.
        // Actually best to use Payment table but Payment links to Session order links to Customer.
        // Let's stick to Order total for simplicity as per request context.
        customerId: { not: null },
        isDeleted: false,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 5,
    });

    const customerIds = topCustomersGroups
      .map((g) => g.customerId)
      .filter((id): id is string => id !== null);

    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
      },
    });

    const topCustomers = topCustomersGroups.map((group) => {
      const customer = customers.find((c) => c.id === group.customerId);
      return {
        id: group.customerId,
        name: customer?.fullName || "Unknown",
        image: null, // Customer model has no image?
        totalSpent: group._sum.total || 0,
        orderCount: 0, // aggregate count if needed
      };
    });

    // Top Staff by Order Count or Volume
    const topStaffGroups = await prisma.order.groupBy({
      by: ["staffId"],
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
      where: {
        staffId: { not: null },
        isDeleted: false,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    });

    const staffIds = topStaffGroups
      .map((g) => g.staffId)
      .filter((id): id is string => id !== null);

    const staffMembers = await prisma.staff.findMany({
      where: {
        id: { in: staffIds },
      },
    });

    const topStaff = topStaffGroups.map((group) => {
      const staff = staffMembers.find((s) => s.id === group.staffId);
      return {
        id: group.staffId,
        name: staff?.name || "Unknown",
        role: staff?.role || "Staff",
        image: staff?.image,
        ordersHandled: group._count.id,
        totalSales: group._sum.total || 0,
      };
    });

    const response: ApiResponse = {
      success: true,
      data: {
        topCustomers,
        topStaff,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Top Performers API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
