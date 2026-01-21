import { prisma } from "@/lib/prisma";
import { Params } from "@/lib/types";
import { NextResponse } from "next/server";

export async function  GET(req:Request,context:{params:Params}) {
  try {
    const {id} = await context.params;
    if(!id) return NextResponse.json({
      success:false,message:"Stock not found"
    },{status:400});

    const stock = await prisma.stock.findUnique({
      where:{id}
    })

    if(!stock) return NextResponse.json({
      success:false,message:"Stock Item not found "
    },{status:400})

    return NextResponse.json({
      success:true,data:stock
    },{status:200})
  } catch (error) {
    console.log(error)
    return NextResponse.json({
      success:false,message:"Something went wrong"
    },{status:400})
  }
}



export async function PATCH(
  req: Request,
  context: { params: Params }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Stock not found" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, unit, quantity, amount } = body;

    const existingStock = await prisma.stock.findUnique({
      where: { id },
    });

    if (!existingStock) {
      return NextResponse.json(
        { success: false, message: "Stock item not found" },
        { status: 404 }
      );
    }

    const updatedStock = await prisma.stock.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(unit !== undefined && { unit }),
        ...(quantity !== undefined && { quantity }),
        ...(amount !== undefined && { amount }),
      },
    });

    return NextResponse.json(
      { success: true, message: "Stock updated", data: updatedStock },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
