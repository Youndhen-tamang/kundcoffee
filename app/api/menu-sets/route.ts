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

    const menuSets = await prisma.menuSet.findMany({
      where: { storeId },
      include: {
        subMenus: {
          include: {
            subMenu: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: menuSets });
  } catch (error) {
    console.error("Error fetching menu sets:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch menu sets" },
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

    const { name, service, isActive, subMenuIds, sortOrder } = await req.json();

    if (!name || !service) {
      return NextResponse.json(
        { success: false, message: "Name and Service are required" },
        { status: 400 },
      );
    }

    // Calculate next sortOrder if not provided
    let finalSortOrder = parseInt(String(sortOrder));
    if (!finalSortOrder) {
      const lastSet = await prisma.menuSet.findFirst({
        where: { storeId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      finalSortOrder = lastSet ? lastSet.sortOrder + 1 : 1;
    }

    const menuSet = await prisma.menuSet.create({
      data: {
        name,
        service,
        isActive: isActive ?? true,
        sortOrder: finalSortOrder,
        storeId,
        subMenus: {
          create:
            subMenuIds?.map((id: string) => ({
              subMenuId: id,
            })) || [],
        },
      },
      include: {
        subMenus: {
          include: { subMenu: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: menuSet });
  } catch (error) {
    console.error("Error creating menu set:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create menu set" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, service, isActive, subMenuIds } = await req.json();

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: "ID and Name are required" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update basic info
      await tx.menuSet.update({
        where: { id },
        data: {
          name,
          service,
          isActive,
        },
      });

      // 2. Update SubMenus Relations
      if (subMenuIds) {
        await tx.menuSetSubMenu.deleteMany({ where: { menuSetId: id } });
        if (subMenuIds.length > 0) {
          await tx.menuSetSubMenu.createMany({
            data: subMenuIds.map((sid: string) => ({
              menuSetId: id,
              subMenuId: sid,
            })),
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Menu Set updated successfully",
    });
  } catch (error) {
    console.error("Error updating menu set:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update menu set" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Required" },
        { status: 400 },
      );
    }

    await prisma.menuSet.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Menu Set deleted" });
  } catch (error) {
    console.error("Error deleting menu set:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete menu set" },
      { status: 500 },
    );
  }
}
