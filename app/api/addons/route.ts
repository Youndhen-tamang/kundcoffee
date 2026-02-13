import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const addons = await prisma.addOn.findMany({
      where: { storeId },
      include: {
        price: true,
        stocks: true,
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: addons });
  } catch (error) {
    console.error("Error fetching addons:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch addons" },
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
      description,
      type,
      isAvailable,
      categoryId,
      price,
      stockConsumption,
      sortOrder, // <--- ADD THIS
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    const existingAddon = await prisma.addOn.findFirst({
      where: {
        name,
        storeId,
        categoryId: categoryId || null,
      },
    });

    if (existingAddon) {
      return NextResponse.json(
        {
          success: false,
          message: `Add-on "${name}" already exists in this category`,
        },
        { status: 400 },
      );
    }

    // Calculate next sortOrder if not provided
    let finalSortOrder = parseInt(String(sortOrder));
    if (!finalSortOrder) {
      const lastAddon = await prisma.addOn.findFirst({
        where: { storeId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      finalSortOrder = lastAddon ? lastAddon.sortOrder + 1 : 1;
    }

    const newAddon = await prisma.addOn.create({
      data: {
        name,
        image,
        description,
        type: type || "EXTRA",
        isAvailable: isAvailable ?? true,
        categoryId,
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
        stocks: {
          create:
            stockConsumption?.map((s: any) => ({
              stockId: s.stockId,
              quantity: parseFloat(s.quantity),
            })) || [],
        },
        // stocks logic remains same...
      },
      include: {
        price: true,
      },
    });

    return NextResponse.json({ success: true, data: newAddon });
  } catch (error) {
    console.error("Error creating addon:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create addon" },
      { status: 500 },
    );
  }
}
