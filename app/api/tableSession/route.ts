import { prisma } from "@/lib/prisma";
import { table } from "console";
import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;

    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.tableSession.findMany({
      where: {
        isActive: true,
        storeId,
      },
      include: {
        table: true,
      },
    });
    if (!sessions)
      return NextResponse.json(
        { success: false, message: "No table session currently" },
        { status: 400 },
      );

    return NextResponse.json(
      { success: true, data: sessions },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json(
      { success: false, message: "something went wrong" },
      { status: 400 },
    );
  }
}
