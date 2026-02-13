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
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.storeId = user.storeId;
        token.emailVerified = user.emailVerified;
        token.isSetupComplete = user.isSetupComplete;
        token.trialEndsAt = user.trialEndsAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.storeId = token.storeId;
        session.user.emailVerified = token.emailVerified;
        session.user.isSetupComplete = token.isSetupComplete;
        session.user.trialEndsAt = token.trialEndsAt;
      }
      return session;
    },
  },
};
