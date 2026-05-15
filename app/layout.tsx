import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";

import { ToastProvider } from "@/components/providers/toast-provider";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoteFlow",
  description: "Secure Online Election Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
