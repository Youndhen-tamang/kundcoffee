"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { signIn } from "next-auth/react";
import {
  registerSchema,
  loginSchema,
  verifyCodeSchema,
  storeSetupSchema,
  type RegisterInput,
  type StoreSetupInput,
} from "@/lib/validations/auth";
import { addDays } from "date-fns";

// --- HELPER: Generate 6-digit code ---
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- ACTION: REGISTER ---
export async function registerAction(data: RegisterInput) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return { success: false, message: result.error.issues[0].message };
  }

  const { email, password } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: "Email already in use" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpires,
        role: "ADMIN", // First user is admin
      },
    });

    // TODO: Send email with `verificationCode` using Resend/SendGrid/SMTP
    console.log(`[DEV] Verification Code for ${email}: ${verificationCode}`);

    return {
      success: true,
      message: "Account created! Check your email for the code.",
    };
  } catch (error) {
    console.error("Registration Error:", error);
    return {
      success: false,
      message: "Something went wrong during registration",
    };
  }
}

// --- ACTION: VERIFY EMAIL ---
export async function verifyEmailAction(email: string, code: string) {
  const result = verifyCodeSchema.safeParse({ email, code });
  if (!result.success) {
    return { success: false, message: "Invalid input" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return { success: false, message: "User not found" };
    if (user.emailVerified)
      return { success: true, message: "Already verified" };

    if (!user.verificationCode || user.verificationCode !== code) {
      return { success: false, message: "Invalid verification code" };
    }

    if (
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return {
        success: false,
        message: "Verification code expired. Please resend.",
      };
    }

    // Activate Trial
    const trialEndsAt = addDays(new Date(), 7);

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationCodeExpires: null,
        trialEndsAt,
      },
    });

    return {
      success: true,
      message: "Email verified! You have 7 days to setup your store.",
    };
  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false, message: "Verification failed" };
  }
}

// --- ACTION: RESEND CODE ---
export async function resendCodeAction(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: "User not found" };
    if (user.emailVerified)
      return { success: false, message: "Account already verified" };

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { email },
      data: { verificationCode, verificationCodeExpires },
    });

    console.log(`[DEV] NEW Code for ${email}: ${verificationCode}`);
    return { success: true, message: "New code sent!" };
  } catch (error) {
    return { success: false, message: "Failed to resend code" };
  }
}

// --- ACTION: SETUP STORE ---
export async function setupStoreAction(email: string, data: StoreSetupInput) {
  const result = storeSetupSchema.safeParse(data);
  if (!result.success) {
    return { success: false, message: result.error.issues[0].message };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: "User not found" };

    // Check if trial is valid (simple check, middleware handles strictness)
    if (user.trialEndsAt && user.trialEndsAt < new Date()) {
      return {
        success: false,
        message: "Trial expired. Please contact support.",
      };
    }

    await prisma.$transaction(async (tx) => {
      // Create Store
      const store = await tx.store.create({
        data: {
          name: result.data.name,
          ownerId: user.id,
          // currency: result.data.currency - TODO: Add currency to Store model if needed or SystemSetting
        },
      });

      // Link Store to User and mark setup complete
      await tx.user.update({
        where: { id: user.id },
        data: {
          storeId: store.id,
          isSetupComplete: true,
        },
      });

      // Save currency setting
      await tx.systemSetting.upsert({
        where: { key: "currency" },
        update: { value: result.data.currency },
        create: { key: "currency", value: result.data.currency },
      });
    });

    return { success: true, message: "Store setup complete!" };
  } catch (error) {
    console.error("Store Setup Error:", error);
    return { success: false, message: "Failed to create store" };
  }
}
