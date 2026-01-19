import { prisma } from "@/lib/prisma";
import { Params } from "@/lib/types";
import { NextResponse } from "next/server";


export async function GET(req:Request,context:{params:Params}) {
  try {
    const {id} = await context.params;
    if(!id) return NextResponse.json({
      success:false,message:"Dish not found"
    })

    const dish = await prisma.dish.findUnique({
        where:{id},
        include:{
          price:true,
          subMenu:true,
          category:true,
        }
      })
      if (!dish) {
        return NextResponse.json(
          { success: false, message: "Dish not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { success: true, data: dish },
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


export async function PATCH(req:Request,context:{params:Params}) {
  try {
    const {id} = await context.params;
    if(!id) return NextResponse.json({
      success:false,message:"Dish not found"
    })

  } catch (error) {
    
  }
}



export async function DELETE(req:Request,context:{params:Params}) {
  try {
    const {id} = await context.params;
    if(!id) return NextResponse.json({
      success:false,message:"Dish not found"
    });

    const dish = await prisma.dish.findUnique({
      where:{id}
    })
    if (!dish) {
      return NextResponse.json(
        { success: false, message: "Dish not found" },
        { status: 404 }
      );
    }

    await prisma.dish.delete({
        where:{id}
    })

    return NextResponse.json(
      { success: true, message: "Deleted successfully" },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}