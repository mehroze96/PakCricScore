import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "PakScore — Live Pakistan Cricket",
  description: "Real-time Pakistan cricket match scores, live updates, and fixtures.",
  keywords: ["Pakistan cricket", "live scores", "cricket scorecard", "PAK cricket"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PakScore",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050b14" },
    { media: "(prefers-color-scheme: light)", color: "#f1f5f9" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
