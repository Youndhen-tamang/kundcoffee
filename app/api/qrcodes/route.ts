import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function GET() {
  try {
    const qr =  await prisma.qRCode.findMany()
    return NextResponse.json({
      success:true,qr
    })
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}