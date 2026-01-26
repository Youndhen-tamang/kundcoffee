import { prisma } from "@/lib/prisma";
import { Params } from "@/lib/types";
import { NextResponse,NextRequest} from "next/server";

export async function GET(req:NextRequest,context:{params:Params}) {
  try {
    const {id} = await context.params;
    if(!id)return NextResponse.json({
      success:false,message:"Submenu is required"
    },{status:400});

    const submenu = await prisma.subMenu.findUnique({
      where:{id}
    })
    if(!submenu) return NextResponse.json({success:false,message:"Submenu not found"},{status:400})
    
      return NextResponse.json({
        success:true,data:submenu
      },{status:200})
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success:false,message:"Something went wrong"
    },{status:400})
  }
}

export async function PATCH(req: NextRequest, context: { params:Params}) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ success: false, message: "Submenu Id is required" }, { status: 400 });
    }

    const submenu = await prisma.subMenu.findUnique({ where: { id } });
    if (!submenu) {
      return NextResponse.json({ success: false, message: "Submenu does not exist" }, { status: 404 });
    }

    const { name, image } = await req.json();
    if (!name ) {
      return NextResponse.json({ success: false, message: "Nothing to update" }, { status: 400 });
    }

    const updatedSubmenu = await prisma.subMenu.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(image && { image }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Submenu updated successfully",
      data: updatedSubmenu,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}



export async function DELETE(req:NextRequest,context:{params:Params}) {
  try {
    const {id} = await context.params;

    if(!id) return NextResponse.json({
      success:false,message:"Item not found"
    },{status:400});
    
    const dishCount = await prisma.dish.count({
      where: { subMenuId: id }
    });
    if (dishCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Sub-Menu has dishes. Remove them first."
        },
        { status: 409 }
      );
    }
        await prisma.subMenu.delete({
      where:{id}
    })

    return NextResponse.json({
      success:true,message:"Deleted successfully"
    },{status:200})
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}