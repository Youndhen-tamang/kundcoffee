import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEsewaSignature } from "@/lib/esewa";
import { finalizeSessionTransaction } from "@/lib/checkout-helper";

export async function POST(req: NextRequest) {
  const { encodedData, paymentId } = await req.json();

  // 1. Verify Signature
  const info = verifyEsewaSignature(encodedData);
  if (!info || info.status !== "COMPLETE") {
    return NextResponse.json({ success: false });
  }

  // 2. Fetch Payment & Session Details to close the table
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { session: true },
  });

  if (!payment || payment.status === "PAID")
    return NextResponse.json({ success: true });
  if (!payment.sessionId || !payment.session) {
    return NextResponse.json(
      { success: false, message: "No session associated with this payment" },
      { status: 400 },
    );
  }

  // 3. Finalize Transaction (Close table, etc.)
  await finalizeSessionTransaction({
    sessionId: payment.sessionId,
    tableId: payment.session.tableId,
    amount: payment.amount,
    subtotal: payment.session.total, // Ensure these are stored/calculated correctly
    tax: payment.session.tax,
    serviceCharge: payment.session.serviceCharge,
    discount: payment.session.discount,
    paymentId: payment.id,
  });

  return NextResponse.json({ success: true });
}
