import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, phone, email } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 },
      );
    }

    const newStaff = await prisma.staff.create({
      data: {
        name,
        role: role || "Staff",
        phone,
        email,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: newStaff,
      message: "Staff created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Create Staff Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: "desc" },
    });

    const response: ApiResponse = {
      success: true,
      data: staff,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get Staff Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
