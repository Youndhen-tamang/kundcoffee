import { prisma } from "@/lib/prisma";
import { Params } from "@/lib/types";
import { NextResponse, NextRequest } from "next/server";

// CORRECTED FUNCTION SIGNATURE: Access the parameters by argument name
export async function PATCH(
  req:NextRequest,context:{params:Params}
) {
  try {
    const {id} = await context.params; 

    const body = await req.json(); // Use 'request' instead of 'req'
    const { name, capacity, spaceId, tableTypeId } = body;

    // 3. Validation: Ensure ID exists
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Table ID is missing" },
        { status: 400 }
      );
    }

    // 4. Update the table
    const updatedTable = await prisma.table.update({
      where: { id: id },
      data: {
        name,
        // The ternary operator in the original was causing TypeScript issues due to string vs number. 
        // A standard check and conversion is safer.
        capacity: capacity !== undefined ? parseInt(capacity) : undefined, 
        spaceId,
        tableTypeId,
      },
    });

    return NextResponse.json(
      { success: true, message: "Successfully Updated", data: updatedTable },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Error:", error.message);
    
    // Handle case where ID doesn't exist
    if (error.code === 'P2025') {
        return NextResponse.json(
            { success: false, message: "Table not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}