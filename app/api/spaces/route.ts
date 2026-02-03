import { prisma } from "@/lib/prisma";
import { NextRequest,NextResponse } from "next/server";

export async function GET() {
  try {
    const spaces = await prisma.space.findMany({ include: { tables: true } });
    return NextResponse.json({ success: true, data: spaces }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }

    const space = await prisma.space.create({
      data: {
        name: body.name,
        description: body.description,
      },
    });

    return NextResponse.json({ success: true, data: space }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}


export async function PATCH(req:NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      description
      } = body;
      if(!id) return NextResponse.json({
        success:false,message:"Item not found"
      },{status:400})
      if(!name || !description  )return  NextResponse.json({
        success:false,message:"Nothing to change"
      },{status:400})
  
      await prisma.space.update({
        where:{id},
        data:{
            name,
            description
          }
      })

      return NextResponse.json({success:true,message:"Updated Successfully"},{status:200})
  } catch (error) {
    console.log(error);
    return  NextResponse.json({
      success:false,message:"Something went wrong"
    },{status:500})
  }
}