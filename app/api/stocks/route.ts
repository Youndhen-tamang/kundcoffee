import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.stock.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stocks" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, unit, quantity, amount } = body;

    if (!name || quantity === undefined || amount === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingStock = await prisma.stock.findUnique({
      where:{name} ,
    });

    if (existingStock) {
      return NextResponse.json(
        { success: false, message: "Stock item already exists" },
        { status: 409 } 
      );
    }

    const newStock = await prisma.stock.create({
      data: {
        name,
        unit,
        quantity: Number(quantity),
        amount: Number(amount),
      },
    });

    return NextResponse.json({ success: true, data: newStock });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Stock item already exists" },
        { status: 409 }
      );
    }

    console.error("Error creating stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create stock" },
      { status: 500 }
    );
  }
}

