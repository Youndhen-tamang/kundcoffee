import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // const formData = await req.formData();
  const {email,password,storeName} = await req.json();
  // const email = formData.get("email") as string;
  // const password = formData.get("password") as string;
  // const storeName = formData.get("storeName") as string;

  if (!email || !password || !storeName) {
    return NextResponse.json(
      { success: false, message: "All fields are required" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: storeName,
          ownerId: "temp",
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          storeId: store.id,
          role: "ADMIN",
        },
      });

      await tx.store.update({
        where: { id: store.id },
        data: { ownerId: user.id },
      });
    });

    return NextResponse.json(
      { success: true, message: "Registered successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Registration failed. Email might be in use." },
      { status: 500 }
    );
  }
}
