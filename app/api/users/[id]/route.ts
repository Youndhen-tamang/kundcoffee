import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;
    const userRole = session?.user?.role;
    const { id } = await params;

    if (!session || !storeId || userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admins Only" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name, role, permissions } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id, storeId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found or unauthorized to edit" },
        { status: 404 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingUser.name,
        role: role !== undefined ? role : existingUser.role,
        permissions:
          permissions !== undefined ? permissions : existingUser.permissions,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;
    const userRole = session?.user?.role;
    const { id } = await params;

    if (!session || !storeId || userRole !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admins Only" },
        { status: 401 },
      );
    }

    // Prevent deleting oneself
    if (session.user.id === id) {
      return NextResponse.json(
        { success: false, message: "Cannot delete your own admin account" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id, storeId },
    });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found or unauthorized to delete" },
        { status: 404 },
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
