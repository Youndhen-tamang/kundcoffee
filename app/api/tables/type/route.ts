import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    // Check for duplicate within the store
    const existingTableType = await prisma.tableType.findFirst({
      where: { name, storeId },
    });

    if (existingTableType) {
      return NextResponse.json(
        { success: false, message: "Table type already exists" },
        { status: 400 },
      );
    }

    const tableType = await prisma.tableType.create({
      data: { name, storeId },
    });

    return NextResponse.json(
      { success: true, message: "Table type created", data: tableType },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const tableType = await prisma.tableType.findMany({
      where: { storeId },
      include: {
        tables: true,
      },
    });
    return NextResponse.json({ success: true, tableType }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
