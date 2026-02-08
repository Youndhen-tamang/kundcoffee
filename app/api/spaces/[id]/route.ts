import { prisma } from "@/lib/prisma";
import { Params } from "@/lib/types";
import { NextResponse, NextRequest } from "next/server";

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { name, description, sortOrder } = body;

    if (
      name === undefined &&
      description === undefined &&
      sortOrder === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 },
      );
    }

    const existingSpaceName = name
      ? await prisma.space.findFirst({
          where: { name, id: { not: id } },
        })
      : null;

    if (existingSpaceName)
      return NextResponse.json(
        { success: false, message: "Space already exists" },
        { status: 400 },
      );
    const updatedSpace = await prisma.space.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && {
          sortOrder: parseInt(String(sortOrder)) || 0,
        }),
      },
    });

    return NextResponse.json(
      { success: true, message: "Updated Successfully", data: updatedSpace },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update Error:", error.message);
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Space not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 },
      );
    }

    await prisma.space.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Deleted Successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Delete Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
