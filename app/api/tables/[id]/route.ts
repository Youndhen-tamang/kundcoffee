import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

import { Params } from "@/lib/types";

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const {
      name,
      capacity,
      spaceId,
      tableTypeId,
      tableTypeName,
      spaceName,
      spaceDescription,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Table ID is missing" },
        { status: 400 },
      );
    }

    const updatedTable = await prisma.$transaction(async (tx) => {
      // --- Handle TableType ---
      let finalTableTypeId = tableTypeId;

      if (!finalTableTypeId && tableTypeName) {
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

      if (!finalTableTypeId) {
        throw new Error("TABLE_TYPE_REQUIRED");
      }

      // --- Handle Space ---
      let finalSpaceId = spaceId;

      if (!finalSpaceId && spaceName) {
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

      if (!finalSpaceId) {
        throw new Error("SPACE_REQUIRED");
      }

      // --- Check for duplicate table name in the same space ---
      const duplicateTable = await tx.table.findFirst({
        where: {
          name,
          spaceId: finalSpaceId,
          NOT: { id }, // ignore the table being updated
        },
      });

      if (duplicateTable) {
        throw new Error(`DUPLICATE_TABLE:${name}`);
      }

      // --- Update the table ---
      const table = await tx.table.update({
        where: { id },
        data: {
          name,
          capacity: capacity !== undefined ? parseInt(capacity) : undefined,
          spaceId: finalSpaceId,
          tableTypeId: finalTableTypeId,
        },
        include: { tableType: true },
      });

      return table;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Table updated successfully",
        data: updatedTable,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update Table Error:", error.message);

    // --- Custom errors ---
    if (error.message?.startsWith("DUPLICATE_TABLE:")) {
      const tableName = error.message.split(":")[1];
      return NextResponse.json(
        {
          success: false,
          message: `Table "${tableName}" already exists in this space`,
        },
        { status: 400 },
      );
    }

    if (error.message === "TABLE_TYPE_REQUIRED") {
      return NextResponse.json(
        { success: false, message: "Table type is required" },
        { status: 400 },
      );
    }

    if (error.message === "SPACE_REQUIRED") {
      return NextResponse.json(
        { success: false, message: "Space is required" },
        { status: 400 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Table not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
