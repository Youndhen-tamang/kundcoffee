import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { success } from "zod";



export async function POST(req:NextRequest){
try {
  const session = await getServerSession(authOptions);
  const  storeId= session?.user?.storeId
  
  if(!storeId) return NextResponse.json({success:false,message:"Unauthorized"},{status:401});
  const body =  await req.json();
  const {image} = body;

  if(!image) return NextResponse.json({success:false,message:"Missing required fields"},{status:400})

} catch (error) {
  
}
}