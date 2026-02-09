import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

import { Params } from "@/lib/types";
export async function PATCH(
  req: NextRequest,
  context: { params: Params } // Next.js 15+ params are promises
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    
    // 1. EXTRACT sortOrder FROM BODY
    const {
      name,
      capacity,
      spaceId,
      tableTypeId,
      tableTypeName,
      spaceName,
      spaceDescription,
      sortOrder, // <--- ADD THIS
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Table ID is missing" },
        { status: 400 }
      );
    }

    const currentTable = await prisma.table.findUnique({ where: { id } });
    if (!currentTable) {
      return NextResponse.json(
        { success: false, message: "Table not found" },
        { status: 404 }
      );
    }

    // Start Transaction
    const updatedTable = await prisma.$transaction(async (tx) => {
      // --- Handle TableType ---
      let finalTableTypeId = tableTypeId ?? currentTable.tableTypeId;

      // Only look for/create type if name is provided and ID is not
      if (!tableTypeId && tableTypeName) {
        const existingType = await tx.tableType.findUnique({
          where: { name: tableTypeName },
        });

        if (existingType) {
          finalTableTypeId = existingType.id;
        } else {
          const newType = await tx.tableType.create({
            data: { name: tableTypeName },
          });
          finalTableTypeId = newType.id;
        }
      }

      // --- Handle Space ---
      let finalSpaceId = spaceId ?? currentTable.spaceId;

      // Only look for/create space if name is provided and ID is not
      if (!spaceId && spaceName) {
        const existingSpace = await tx.space.findFirst({
          where: { name: spaceName },
        });

        if (existingSpace) {
          finalSpaceId = existingSpace.id;
        } else {
          const newSpace = await tx.space.create({
            data: { name: spaceName, description: spaceDescription },
          });
          finalSpaceId = newSpace.id;
        }
      }

      // --- Check for Duplicate Name ---
      const tableNameToCheck = name ?? currentTable.name;
      const spaceIdToCheck = finalSpaceId ?? currentTable.spaceId; 

      if (tableNameToCheck && spaceIdToCheck) {
        const duplicateTable = await tx.table.findFirst({
          where: {
            name: tableNameToCheck,
            spaceId: spaceIdToCheck,
            id: { not: id },
          },
        });

        if (duplicateTable) {
          throw new Error(`DUPLICATE_TABLE:${tableNameToCheck}`);
        }
      }

      // 2. INCLUDE sortOrder IN UPDATE DATA
      const updateData: any = {
        name: name ?? currentTable.name,
        // If capacity is sent, parse it; otherwise keep current
        capacity: capacity !== undefined ? parseInt(capacity) : currentTable.capacity,
        spaceId: finalSpaceId,
        tableTypeId: finalTableTypeId,
        // If sortOrder is sent, parse it; otherwise keep current
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : currentTable.sortOrder, // <--- ADD THIS
      };

      const table = await tx.table.update({
        where: { id },
        data: updateData,
        include: {
          tableType: true,
          space: true,
        },
      });

      return table;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Table updated successfully",
        data: updatedTable,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Table Error:", error.message);

    if (error.message?.startsWith("DUPLICATE_TABLE:")) {
      const tableName = error.message.split(":")[1];
      return NextResponse.json(
        {
          success: false,
          message: `Table "${tableName}" already exists in this space`,
        },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
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


export async function DELETE(req:NextRequest,context:{
  params:Params
}) {
  try {
    const {id} =  await context.params;

    if(!id) return NextResponse.json({
      success:false,message:"Item not fount"
    },{status:400})

    await prisma.table.delete({
      where:{id}
    })

    return NextResponse.json(
      {
        success: true,
        message: "Deleted successfully",
      },
      { status: 200 },)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
