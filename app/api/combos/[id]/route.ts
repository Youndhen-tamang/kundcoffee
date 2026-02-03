import { NextRequest, NextResponse } from "next/server"
import { Params } from "@/lib/types"
import { prisma } from "@/lib/prisma";

export async function PATCH(req:NextRequest,context:{params:Params}) {
  try {
    const {id} = await context.params;
    if(!id){
      return NextResponse.json({
        success:false,message:"Item not Found"
      },{status:400})
    }

    const body = await req.json();
    const {image,name,actualPrice,items} = await body;
    
    const comboItem =  await prisma.comboOffer.findUnique({
      where:{
        id 
      }
    })
    if(!comboItem) return NextResponse.json({
      success:false,message:"Item not found"
    },{status:400})

    await prisma.comboOffer.update({
      where:{id},
      data:{
        image,
        name,
        price:{
          update:{
            actualPrice,
            listedPrice :actualPrice
          }
        },
        items
      }
    })

    return NextResponse.json({
      success:true,message:"Successfully updated"
    },{status:200})
  } catch (error:any) {
    console.log(error.message);
    return NextResponse.json({
      success:false,message:"Something went wrong"
    },{status:500})
  }
}