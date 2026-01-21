import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, description, image } = await req.json();
    if (!name) {
      return NextResponse.json(
        {
          message: "Category name is required",
        },
        { status: 400 },
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        ...(image && { image }),
      },
    });
    return NextResponse.json({
      success: true,
      message: "Category Created",
      data: category,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const category = await prisma.category.findMany({
      include: {
        dishes: true,
        combos: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, image, description } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: "ID and Name are required" },
        { status: 400 },
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        image,
        description,
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Single Delete
      const category = await prisma.category.findUnique({
        where: { id },
        include: { dishes: true },
      });

      if (category && category.dishes.length > 0) {
        return NextResponse.json(
          { success: false, message: "Cannot delete category with dishes" },
          { status: 409 },
        );
      }

      await prisma.category.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Category deleted" });
    }

    // Bulk Delete (Legacy logic kept but might be dangerous without ID)
    const dishCount = await prisma.dish.count();

    if (dishCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete categories while dishes exist",
        },
        { status: 409 },
      );
    }

    await prisma.category.deleteMany();

    return NextResponse.json(
      {
        success: true,
        message: "All categories deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
