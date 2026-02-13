import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
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

    const {
      name,
      phone,
      customerId,
      tableId,
      remarks,
      guests,
      startTime,
      endTime,
    } = await req.json();
    if (!name || !tableId || !guests || !startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          message: "All the requred fields are required",
        },
        { status: 400 },
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateonly = new Date(start);
    dateonly.setHours(0, 0, 0, 0);
    const date = dateonly.getDate();
    console.log("date,start,end,dateonly", date, start, end, dateonly);
    /* 
    const reservation = await prisma.reservation.findMany({
      where:{
        dateSelected:{
          some: {
            startTime: start
          }
        },
        table: {
            storeId: storeId // Ensure table belongs to store
        }
      }
    })
    */
    return NextResponse.json({
      success: true,
      message: "Reservation logic placeholder",
    });
  } catch (error) {}
}
