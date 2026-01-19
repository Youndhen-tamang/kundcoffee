import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function POST(req:Request) {
  try {
    const {name,description,image} = await  req.json();
    if(!name){
      return NextResponse.json({
        message:"Category name is required"
      },{status:400})
    }
  
      const category = await prisma.category.create({
        data:{
          name,
          description,
          ...(image && {image})
        }
      })
      return NextResponse.json({
        success:true,message:"Category Created",data:category
      })
  } catch (error) {
    console.log(error);
    return 
  }

}


export async function GET() {
    try {
      const category = await prisma.category.findMany({
        include:{
          dishes:true,
          combos:true
        }
      })
      if(!category) return NextResponse.json({success:false,message:"No Category Found"},{status:400})
      return NextResponse.json({success:true,data:category})
    } catch (error) {
      console.log(error);
      return NextResponse.json({
        success:false,message:"Something went wrong"
      })
    }
}



export async function DELETE() {
  try {
    const dishCount = await prisma.dish.count();

    if (dishCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete categories while dishes exist"
        },
        { status: 409 }
      );
    }

    await prisma.category.deleteMany();

    return NextResponse.json(
      {
        success: true,
        message: "All categories deleted successfully"
      },
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
