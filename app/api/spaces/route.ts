import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const spaces = await prisma.space.findMany({
      include: { tables: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: spaces }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, sortOrder } = body;

    // 1. Validation
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    // 2. Check for existence
    const findspace = await prisma.space.findFirst({
      where: { name },
    });

    if (findspace) {
      return NextResponse.json(
        {
          success: false,
          message: "Space already exists with the current name",
        },
        { status: 400 },
      );
    }

    // 3. Calculate the next sortOrder if not provided
    let finalSortOrder = parseInt(String(sortOrder));

    if (!finalSortOrder) {
      // We look for the space with the highest sortOrder
      const lastSpace = await prisma.space.findFirst({
        orderBy: {
          sortOrder: "desc",
        },
        select: {
          sortOrder: true,
        },
      });

      // If no spaces exist, start at 1. Otherwise, take the highest + 1.
      finalSortOrder = lastSpace ? lastSpace.sortOrder + 1 : 1;
    }

    // 4. Create the space with the calculated sortOrder
    const space = await prisma.space.create({
      data: {
        name: name,
        description: description,
        sortOrder: finalSortOrder,
      },
    });

    return NextResponse.json({ success: true, data: space }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
