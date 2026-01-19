import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const {
      name,
      categoryId,
      type,
      kotType,
      preparationTime,
      subMenuId,
      hscode,
      description,
      image,
      actualPrice,
      discountPrice = 0,
      cogs = 0,
      addOnId,
    } = await req.json();

    if (!name || !categoryId || actualPrice === undefined || !type) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields: name, categoryId, actualPrice, type",
        },
        { status: 400 }
      );
    }

    const dish = await prisma.dish.create({
      data: {
        name,
        description,
        ...(image && { image }),
        categoryId,
        type,
        ...(hscode && { hscode }),
        ...(kotType && { kotType }),
        ...(preparationTime && { preparationTime }),
        ...(subMenuId && { subMenuId }),
        ...(addOnId && { addOnId }),
        price: {
          create: {
            actualPrice,
            listedPrice: actualPrice - discountPrice,
            cogs,
            grossProfit: actualPrice - cogs - discountPrice,
          },
        },
      },
      include: {
        subMenu: true,
        category: true,
        price: true,
      },
    });

    return NextResponse.json(
      { success: true, message: "Dish Created", data: dish },
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



export async function GET() {
  try {
    const dishes = await prisma.dish.findMany({
      include:{
        price:true,
        category:true,
        subMenu:true
      }
    })
    if(!dishes){
      return NextResponse.json({
        success:false,message:"No items found"
      },{status:400})
    }
    return NextResponse.json({
      success:true,data:dishes
    },{status:200})
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success:false,message:"Something went wrong"
    },{status:400})
  }
}