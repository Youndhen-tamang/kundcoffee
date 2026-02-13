import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MANAGER" | "CASHIER";
      storeId?: string | null; 
      emailVerified?: Date | null;
      isSetupComplete?: boolean;
      trialEndsAt?: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "MANAGER" | "CASHIER";
    storeId?: string | null; 
    emailVerified?: Date | null;
    isSetupComplete?: boolean;
    trialEndsAt?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "MANAGER" | "CASHIER";
    storeId?: string | null; 
    emailVerified?: Date | null;
    isSetupComplete?: boolean;
    trialEndsAt?: Date | null;
  }
}