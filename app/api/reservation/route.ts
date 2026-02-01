import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      phone,
      customerId,
      tableId,
      remarks,
      images,
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
