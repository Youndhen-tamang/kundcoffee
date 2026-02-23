import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { finalizeSessionTransaction } from "@/lib/checkout-helper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getServerSession(authOptions);
    const storeId = sessionUser?.user?.storeId;

    if (!storeId) {
      // Ideally we should enforce storeId here, but for now let's at least try to get it
      // If this is a client-side call from a logged-in user, we have it.
      // Only "Guest" checkout might be tricky, but usually checkout is done by Staff/Cashier.
    }

    const body = await req.json();
    const {
      tableId,
      sessionId,
      paymentMethod,
      amount,
      customerId,
      subtotal,
      tax,
      serviceCharge,
      discount,
      complimentaryItems,
      extraFreeItems,
    } = body;

    // --- 1. VALIDATION ---
    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Missing payment method" },
        { status: 400 },
      );
    }

    let session;
    // Look up by Session ID
    if (sessionId) {
      session = await prisma.tableSession.findUnique({
        where: { id: sessionId },
        include: { table: true },
      });
    }

    // Fallback search by tableId (only if tableId exists)
    if (!session && tableId) {
      session = await prisma.tableSession.findFirst({
        where: { tableId, isActive: true },
        include: { table: true },
      });
    }

    // DINE_IN must have a session. TAKE_AWAY/DIRECT might not if we implement direct order creation,
    // but current flow seems to expect a session even for takeaway.
    if (!session || !session.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Active session not found. Please ensure an order exists.",
        },
        { status: 400 },
      );
    }

    // Ensure the session belongs to the authenticated store
    if (storeId && session.storeId && session.storeId !== storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to this session" },
        { status: 401 },
      );
    }

    const effectiveStoreId = storeId || session.storeId;

    if (!effectiveStoreId) {
      return NextResponse.json(
        { success: false, message: "Store identification failed." },
        { status: 400 },
      );
    }

    const activeSessionId = session.id;

    // --- 2. BRANCHING LOGIC ---

    // === OPTION A: ESEWA GATEWAY ===
    if (paymentMethod === "ESEWA") {
      const transactionUuid = `${Date.now()}-${uuidv4()}`;

      const existing = await prisma.payment.findUnique({
        where: { sessionId: activeSessionId },
      });

      if (existing?.status === "PAID") {
        return NextResponse.json(
          { success: false, message: "This session is already paid." },
          { status: 400 },
        );
      }

      const payment = await prisma.payment.upsert({
        where: { sessionId: activeSessionId },
        update: {
          method: paymentMethod,
          amount: parseFloat(amount),
          status: "PENDING",
          transactionUuid,
          storeId: effectiveStoreId as string,
        },
        create: {
          sessionId: activeSessionId,
          method: paymentMethod,
          amount: parseFloat(amount),
          status: "PENDING",
          transactionUuid,
          storeId: effectiveStoreId as string,
        },
      });

      return NextResponse.json({
        success: true,
        isPending: true,
        paymentId: payment.id,
        config: {
          amount,
          transaction_uuid: transactionUuid,
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?pid=${payment.id}`,
          failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failure`,
        },
      });
    }

    // === OPTION B: INSTANT PAYMENT ===
    if (
      ["CASH", "QR", "CARD", "CREDIT", "BANK_TRANSFER"].includes(paymentMethod)
    ) {
      if (paymentMethod === "CREDIT" && !customerId) {
        return NextResponse.json(
          {
            success: false,
            message: "Customer is required for credit payments",
          },
          { status: 400 },
        );
      }

      const result = await finalizeSessionTransaction({
        sessionId: activeSessionId,
        tableId: tableId || session.tableId || null,
        amount,
        subtotal,
        tax,
        serviceCharge,
        discount,
        customerId,
        paymentMethod,
        complimentaryItems,
        extraFreeItems,
        storeId: effectiveStoreId,
      });

      return NextResponse.json({
        success: true,
        message:
          paymentMethod === "CREDIT" ? "Saved as Credit" : "Payment completed",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid Payment Method" },
      { status: 400 },
    );

    return NextResponse.json(
      { success: false, message: "Invalid Payment Method" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Checkout Processing Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
