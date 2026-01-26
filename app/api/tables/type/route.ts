import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }
    const tableType = await prisma.tableType.create({
      data: { name },
    });

    return NextResponse.json(
      { success: true, message: "Table type created", data: tableType },
      { status: 201 }
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
    const tableType = await prisma.tableType.findMany({include:{
      tables:true
    }})
    return NextResponse.json({success:true,tableType},{status:200})
  } catch (error) {
    console.log(error)
    return NextResponse.json({success:false,message:"Something went wrong"},{status:200})

  }
}