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

    const { name, description } = await req.json();

    const existingSpaceName =  await prisma.space.findFirst({
      where:{name}
    })

    if(existingSpaceName) return NextResponse.json({
      success:false,message:"Space alreay exists"
    },{status:400})
    const updatedSpace = await prisma.space.update({
      where: { id },
      data: {
        name,
        description,
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
