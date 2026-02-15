import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordCorrect) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          storeId: user.storeId || "",
          emailVerified: user.emailVerified,
          isSetupComplete: user.isSetupComplete,
          trialEndsAt: user.trialEndsAt,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.storeId = user.storeId;
        token.emailVerified = user.emailVerified;
        token.isSetupComplete = user.isSetupComplete;
        token.trialEndsAt = user.trialEndsAt;
      }

      // When frontend calls update(), re-fetch from DB This makes it impossible for a user to fake verification
  
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });

        if (dbUser) {
          token.emailVerified = dbUser.emailVerified;
          token.isSetupComplete = dbUser.isSetupComplete;
          token.role = dbUser.role;
          token.storeId = dbUser.storeId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.storeId = token.storeId as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.isSetupComplete = token.isSetupComplete as boolean;
        session.user.trialEndsAt = token.trialEndsAt as Date;
      }
      return session;
    },
  },
};