import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, image, categoryId } = await req.json();

    if (!name)
      return NextResponse.json(
        { success: false, message: "Sub-Name required" },
        { status: 400 },
      );

    const existingSubMenu = await prisma.subMenu.findFirst({
      where: {
        name,
        categoryId: categoryId || null,
      },
    });

    if (existingSubMenu) {
      return NextResponse.json(
        {
          success: false,
          message: `Sub-menu "${name}" already exists in this category`,
        },
        { status: 400 },
      );
    }

    const subMenu = await prisma.subMenu.create({
      data: {
        name,
        categoryId,
        ...(image && { image }),
      },
    });

    return NextResponse.json(
      { success: true, message: "Sub-menu Created", data: subMenu },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 400 },
    );
  }
}

export async function GET() {
  try {
    const submenu = await prisma.subMenu.findMany();
    if (!submenu)
      return NextResponse.json(
        {
          success: false,
          message: "No Sub-menu found",
        },
        { status: 400 },
      );

    return NextResponse.json(
      {
        success: true,
        data: submenu,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 400 },
    );
  }
}
