import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
  try {
    const session  =  await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if(!storeId){
      return NextResponse.json({success:false,message:"Unauthorized"},{status:401})
    }

    const data  = await prisma.stock.findMany({
      where:{storeId},
      orderBy:{name:"asc"},
    })

    return NextResponse.json({
      success:true,data
    },{status:200})
  } catch (error) {
    console.log("Error fetching measuring units",error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch measuring units" },
      { status: 500 },
    );  }
}

export async function POST(req:NextRequest){
try {
  const session  =  await getServerSession(authOptions);
  const storeId =  session?.user?.storeId;

  if(!storeId)return NextResponse.json({success:false,message:"Unauthorized"},{status:400});

  const body = await req.json();
  const {name,unitId,quantity,amount} = body;

  if(!name || !unitId || !quantity || !amount) return NextResponse.json(
    { success: false, message: "All the required fields should be filled" },
    { status: 400 },
  ); 


  const newStock = await prisma.stock.create({
    data:{
      name,
      unitId,
      quantity,
      amount,
      storeId
    }
  })

  return NextResponse.json({success:true,data:newStock},{status:200})

} catch (error :any ) {
  if (error.code === "P2002") {
    return NextResponse.json(
      { success: false, message: "Unit name or short name already exists" },
      { status: 409 },
    );
  }

  console.error("Error creating measuring unit:", error);
  return NextResponse.json(
    { success: false, message: "Failed to create measuring unit" },
    { status: 500 },
  );
}
}