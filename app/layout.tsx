import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import AuthProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
