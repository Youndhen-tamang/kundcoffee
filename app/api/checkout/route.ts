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
    if (!tableId || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
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

    // Fallback search by tableId
    if (!session && tableId) {
      session = await prisma.tableSession.findFirst({
        where: { tableId, isActive: true },
        include: { table: true },
      });
    }

    if (!session || !session.isActive) {
      return NextResponse.json(
        { success: false, message: "Active session not found for this table" },
        { status: 400 },
      );
    }

    // Ensure the session belongs to the authenticated store
    // Only if we have a logged in user with storeId.
    if (storeId && session.table.storeId !== storeId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to this table" },
        { status: 401 },
      );
    }

    // Use the storeId from the table if we didn't get it from session (rare fallback)
    const effectiveStoreId = storeId || session.table.storeId;

    const activeSessionId = session.id;

    // --- 2. BRANCHING LOGIC ---

    // === OPTION A: ESEWA GATEWAY (Only for actual ESEWA integration) ===
    if (paymentMethod === "ESEWA") {
      console.log(
        `[Checkout] Processing ESEWA for session: ${activeSessionId}`,
      );
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
        where: {
          sessionId: activeSessionId,
        },
        update: {
          method: "ESEWA",
          amount,
          status: "PENDING",
          transactionUuid,
          // In update, we can use the raw ID field
          storeId: effectiveStoreId, 
        },
        create: {
          method: "ESEWA",
          amount,
          status: "PENDING",
          transactionUuid,
          // Use 'connect' for the relations. 
          // DO NOT include 'storeId: effectiveStoreId' here.
          session: { connect: { id: activeSessionId } },
          store: { connect: { id: effectiveStoreId } },
        },
      });

      if (payment.status === "PAID" && payment.method !== "ESEWA") {
        return NextResponse.json(
          {
            success: false,
            message: "This order is already paid.",
          },
          { status: 400 },
        );
      }

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

    // === OPTION B: INSTANT PAYMENT (CASH / CARD / MANUAL QR / CREDIT) ===
    if (["CASH", "QR", "CARD", "CREDIT"].includes(paymentMethod)) {
      console.log(
        `[Checkout] Processing ${paymentMethod} payment for session: ${activeSessionId}`,
      );
      if (paymentMethod === "CREDIT" && !customerId) {
        return NextResponse.json(
          {
            success: false,
            message: "Customer is required for credit payments",
          },
          { status: 400 },
        );
      }

      // 3. Finalize Session (Payment logic moved inside for atomicity)
      const result = await finalizeSessionTransaction({
        sessionId: activeSessionId,
        tableId,
        amount,
        subtotal,
        tax,
        serviceCharge,
        discount,
        customerId,
        paymentMethod,
        complimentaryItems,
        extraFreeItems,
        storeId: effectiveStoreId, // Pass storeId
      });

      return NextResponse.json({
        success: true,
        message:
          paymentMethod === "CREDIT"
            ? "Saved as Credit"
            : "Payment completed and session closed",
      });
    }

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
