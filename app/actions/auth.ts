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
import { resend } from "@/lib/resend";

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
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpires,
        role: "ADMIN",
      },
    });

    // Log code for DEV/Testing
    console.log(`[Auth] Verification Code for ${email}: ${verificationCode}`);

    // SEND EMAIL
    const { error } = await resend.emails.send({
      from: "Kund Coffee <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your email",
      html: `
      <h1>Welcome to Kund Coffee</h1>
      <p>Your verification code is: <strong>${verificationCode}</strong></p>
      <p>This code expires in 15 minutes</p>`,
    });

    if (error) {
      console.error("[Auth] Resend Error (Non-blocking):", error);
      // Return success anyway so user can proceed with the console-logged code
      return {
        success: true,
        message:
          "Account created! (Check server console for code if email didn't arrive)",
      };
    }

    return { success: true, message: "Account created! Check your email." };
  } catch (error) {
    console.error("Register Error:", error);
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

export async function resendCodeAction(email: string) {
  try {
    console.log(`[Auth] Resending code for ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, message: "User not found" };
    if (user.emailVerified)
      return { success: false, message: "Account already verified" };

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { verificationCode, verificationCodeExpires },
    });

    console.log(
      `[Auth] NEW Verification Code for ${email}: ${verificationCode}`,
    );

    // Send email
    const { data, error } = await resend.emails.send({
      from: "Kund Coffee <onboarding@resend.dev>",
      to: [email],
      subject: "Your new verification code",
      html: `
      <h1>New Verification Code</h1>
      <p>Your new code is: <strong>${verificationCode}</strong></p>
      <p>This code expires in 15 minutes.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>`,
    });

    if (error) {
      console.error("[Auth] Resend Email Error (Non-blocking):", error);
      return {
        success: true,
        message:
          "New code generated! (Check server console if email didn't arrive)",
      };
    }

    console.log(`[Auth] Code sent to ${email}. ID: ${data?.id}`);
    return { success: true, message: "New code sent!" };
  } catch (error) {
    console.error("[Auth] Resend System Error:", error);
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
