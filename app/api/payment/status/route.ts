import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false });

  const payment = await prisma.payment.findUnique({
    where: { id },
    select: { status: true }
  });

  return NextResponse.json({ success: true, status: payment?.status });
}