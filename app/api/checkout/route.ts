import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { finalizeSessionTransaction } from "@/lib/checkout-helper"; 

export async function POST(req: NextRequest) {
  try {
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

    const activeSessionId = session.id;


    // --- 2. BRANCHING LOGIC ---

    // === OPTION A: ESEWA GATEWAY (Only for actual ESEWA integration) ===
    // CHANGE 1: Removed `|| paymentMethod === "QR"` from here
    if (paymentMethod === "ESEWA") {
      const transactionUuid = `${Date.now()}-${uuidv4()}`;

      const payment = await prisma.payment.upsert({
        where: { 
          sessionId: activeSessionId 
        },
        update: {
          method: "ESEWA",
          amount,
          status: "PENDING",
          transactionUuid, 
        },
        create: {
          session: { connect: { id: activeSessionId } },
          method: "ESEWA",
          amount,
          status: "PENDING",
          transactionUuid,
        },
      });

      if (payment.status === "PAID" && payment.method !== "ESEWA") {
         return NextResponse.json({ 
             success: false, 
             message: "This order is already paid." 
         }, { status: 400 });
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
        }
      });
    }

    // === OPTION B: INSTANT PAYMENT (CASH / CARD / MANUAL QR) ===
    // CHANGE 2: Added `|| paymentMethod === "QR"` here
    if (paymentMethod === "CASH" || paymentMethod === "CARD" || paymentMethod === "QR") {

      const existingPayment = await prisma.payment.findUnique({
        where:{
          sessionId: activeSessionId
        }
      });

      let payment;
      if(existingPayment){
        
        if(existingPayment.status === "PAID"){
          return NextResponse.json({
            success:false,
            message:"Session is already paid."
          },{status:400});
        }

        // Update existing to PAID
        payment = await prisma.payment.update({
          where:{id: existingPayment.id},
          data:{
            method: paymentMethod, // Will save "QR", "CASH", or "CARD"
            amount,
            status: "PAID",
            transactionUuid: null,
            esewaRefId: null
          }
        })
      } else {
        // Create new PAID record
        payment = await prisma.payment.create({
          data:{
            session: { connect: { id: activeSessionId } },
            method: paymentMethod,
            amount,
            status: "PAID"
          }
        })
      }

      // 3. Finalize Session (Helper function)
      await finalizeSessionTransaction({
        sessionId: activeSessionId,
        tableId,
        amount,
        subtotal,
        tax,
        serviceCharge,
        discount,
        customerId,
        paymentId: payment.id
      });

      return NextResponse.json({
        success: true,
        data: payment,
        message: "Payment completed and session closed"
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid Payment Method" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Checkout Processing Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}