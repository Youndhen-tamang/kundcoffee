import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function POST(req:Request) {
  try {
    const {name,image} = await req.json();

    if(!name) return NextResponse.json({success:false,message:"Sub-Name required"},{status:400});

    const subMenu =  await prisma.subMenu.create({
      data:{
        name,
        ...(image && {image})
      }
    });

    return NextResponse.json({success:true,message:"Sub-menu Created",data:subMenu},{status:200})
  } catch (error) {
    console.log(error)
    return NextResponse.json({success:false,message:"Something went wrong"},{status:400})

  }
}