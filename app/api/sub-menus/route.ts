import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subMenus = await prisma.subMenu.findMany({
      include: {
        _count: {
          select: { dishes: true, combos: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: subMenus });
  } catch (error) {
    console.error("Error fetching sub-menus:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sub-menus" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, image, isActive } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    const subMenu = await prisma.subMenu.create({
      data: {
        name,
        image,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, data: subMenu });
  } catch (error) {
    console.error("Error creating sub-menu:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create sub-menu" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, image, isActive } = await req.json();

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: "ID and Name are required" },
        { status: 400 },
      );
    }

    const subMenu = await prisma.subMenu.update({
      where: { id },
      data: {
        name,
        image,
        isActive,
      },
    });

    return NextResponse.json({ success: true, data: subMenu });
  } catch (error) {
    console.error("Error updating sub-menu:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update sub-menu" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Required" },
        { status: 400 },
      );
    }

    // Check if used in dishes or menu sets
    const subMenu = await prisma.subMenu.findUnique({
      where: { id },
      include: {
        _count: {
          select: { dishes: true, menuSet: true },
        },
      },
    });

    if (subMenu && (subMenu._count.dishes > 0 || subMenu._count.menuSet > 0)) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete sub-menu with associated dishes or menu sets",
        },
        { status: 409 },
      );
    }

    await prisma.subMenu.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Sub-menu deleted" });
  } catch (error) {
    console.error("Error deleting sub-menu:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete sub-menu" },
      { status: 500 },
    );
  }
}
