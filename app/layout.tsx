import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import AuthProvider from "@/components/providers/SessionProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Raj Biryani | Kathmandu",
  description: "POS System for Restaurants",
  icons: {
    icon: [
      {
        url: "/Logo.jpeg",
        href: "/Logo.jpeg",
      },
    ],
    shortcut: "/Logo.jpeg",
    apple: "/Logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-zinc-900`}
      >
        <AuthProvider>
          <SettingsProvider>
            {children}
            <Toaster position="top-right" richColors duration={2000} />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
