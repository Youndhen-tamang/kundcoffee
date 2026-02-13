import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export const storeSetupSchema = z.object({
  name: z.string().min(3, "Store name must be at least 3 characters"),
  location: z.string().min(3, "Location is required"),
  currency: z.string().min(1, "Currency is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type StoreSetupInput = z.infer<typeof storeSetupSchema>;
