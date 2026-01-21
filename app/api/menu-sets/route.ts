import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.menuSet.findMany({
      include: {
        subMenus: {
          include: {
            subMenu: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching menu sets:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch menu sets" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, service, subMenuIds } = body; // subMenuIds: string[]

    const newMenuSet = await prisma.menuSet.create({
      data: {
        name,
        service,
        subMenus: subMenuIds
          ? {
              create: subMenuIds.map((id: string) => ({
                subMenuId: id,
              })),
            }
          : undefined,
      },
      include: { subMenus: true },
    });

    return NextResponse.json({ success: true, data: newMenuSet });
  } catch (error) {
    console.error("Error creating menu set:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create menu set" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, service, subMenuIds } = body;

    if (!id)
      return NextResponse.json({ message: "ID is required" }, { status: 400 });

    await prisma.menuSet.update({
      where: { id },
      data: { name, service },
    });

    if (subMenuIds) {
      await prisma.menuSetSubMenu.deleteMany({ where: { menuSetId: id } });
      await prisma.menuSetSubMenu.createMany({
        data: subMenuIds.map((sid: string) => ({
          menuSetId: id,
          subMenuId: sid,
        })),
      });
    }

    const updated = await prisma.menuSet.findUnique({
      where: { id },
      include: {
        subMenus: { include: { subMenu: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating menu set:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update menu set" },
      { status: 500 },
    );
  }
}
