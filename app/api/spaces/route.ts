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
    const { name } = body;
    if (!body.name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }
    const findspace = await prisma.space.findFirst({
      where: {
        name,
      },
    });

    if (findspace)
      return NextResponse.json(
        {
          success: false,
          message: "Space already exist with the current name",
        },
        { status: 400 },
      );

    const space = await prisma.space.create({
      data: {
        name: body.name,
        description: body.description,
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
