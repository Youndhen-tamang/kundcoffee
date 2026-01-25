import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      phone,
      email,
      dob,
      loyaltyId,
      openingBalance,
      creditLimit,
      creditTermDays,
      loyaltyDiscount,
      legalName,
      taxNumber,
      address,
      notes,
    } = body;

    if (!fullName) {
      return NextResponse.json(
        { success: false, message: "Full name is required" },
        { status: 400 },
      );
    }

    if (phone) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { phone },
      });

      if (existingCustomer) {
        return NextResponse.json(
          {
            success: false,
            message: "Customer with this phone number already exists",
          },
          { status: 409 },
        );
      }
    }

    const customer = await prisma.$transaction(async (tx) => {
      const newCustomer = await tx.customer.create({
        data: {
          fullName,
          phone,
          email,
          dob: dob ? new Date(dob) : null,
          loyaltyId,
          openingBalance: parseFloat(openingBalance) || 0,
          creditLimit: parseFloat(creditLimit) || 0,
          creditTermDays: parseInt(creditTermDays) || 0,
          loyaltyDiscount: parseFloat(loyaltyDiscount) || 0,
          legalName,
          taxNumber,
          address,
          notes,
        },
      });

      if (!newCustomer.loyaltyId) {
        return await tx.customer.update({
          where: { id: newCustomer.id },
          data: {
            loyaltyId: `LOY-${newCustomer.id.slice(0, 8).toUpperCase()}`,
          },
        });
      }

      return newCustomer;
    });

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    console.error("POST /api/customer error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (!customers)
      return NextResponse.json(
        { suucess: false, message: "No Customers Created" },
        { status: 400 },
      );

    return NextResponse.json(
      {
        success: true,
        data: customers,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to create customer" },
      { status: 500 },
    );
  }
}
