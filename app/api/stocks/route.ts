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

    const newStock = await prisma.stock.create({
      data: {
        name,
        unit,
        quantity: parseFloat(quantity),
        amount: parseFloat(amount),
      },
    });

    return NextResponse.json({ success: true, data: newStock });
  } catch (error) {
    console.error("Error creating stock:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create stock" },
      { status: 500 },
    );
  }
}
