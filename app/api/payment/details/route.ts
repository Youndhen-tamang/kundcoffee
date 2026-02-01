import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEsewaSignature } from "@/lib/esewa";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ success: false });

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { session: true }
  });

  if (!payment || payment.status === "PAID") {
    return NextResponse.json({ success: false, message: "Invalid or Paid" });
  }

  // Re-generate config for the specific payment amount/uuid
  const config = generateEsewaSignature(payment.amount, payment.transactionUuid!);

  return NextResponse.json({
    success: true,
    esewaConfig: {
      ...config,
      amount: payment.amount,
      transaction_uuid: payment.transactionUuid,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?pid=${payment.id}`,
      failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
    }
  });
}