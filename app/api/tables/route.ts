import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      capacity,
      status,
      spaceId,
      tableTypeId,
      tableTypeName,
      spaceName,
      spaceDescription
    } = body;

    if (!name || !capacity) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, and capacity are required",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let finalTableTypeId = tableTypeId;

      if (!tableTypeId && tableTypeName) {
        const existing = await tx.tableType.findUnique({
          where: {
            name: tableTypeName,
          },
        });

        if (existing) {
          finalTableTypeId = existing.id;
        } else {
          const newType = await tx.tableType.create({
            data: {
              name: tableTypeName,
            },
          });
          finalTableTypeId = newType.id;
        }
      }

      if (!finalTableTypeId) {
        return NextResponse.json({
          success: false,
          message: "Type is required",
        });
      }

      let finalSpaceId = spaceId;

      if (!spaceId && spaceName) {
        const existing = await tx.space.findFirst({
          where: {
            name: spaceName,
          },
        });
        if(existing){
          finalSpaceId = existing.id;
        }else{
          const newSpace =  await tx.space.create({
            data:{
              name:spaceName,
              description:spaceDescription
            }
          })
          finalSpaceId = newSpace.id
        }
      }
      

      const table = await tx.table.create({
        data: {
          name,
          tableTypeId: finalTableTypeId,
          capacity,
          status,
          spaceId:finalSpaceId,
        },
        include: {
          tableType: true,
        },
      });

      await tx.qRCode.create({
        data: {
          tableId: table.id,
          value: randomUUID(),
          assigned: true,
        },
      });

      return table;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Table created successfully",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: {
        tableType: true,
        space: true,
      },
    });
    return NextResponse.json({ success: true, data: tables });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
