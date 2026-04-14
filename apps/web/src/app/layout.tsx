import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Providers } from "@/components/layout/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CricCall — Predict Cricket. Win Rewards.",
  description:
    "The world's first Shariah-compliant cricket prediction protocol on WireFluid. Free to play. Win real PKR prizes.",
  openGraph: {
    title: "CricCall — Predict Cricket. Win Rewards.",
    description: "Free to play. Shariah compliant. Win real PKR prizes from brand sponsors.",
    images: ["/logo.png"],
    siteName: "CricCall",
  },
  twitter: {
    card: "summary_large_image",
    title: "CricCall — Predict Cricket. Win Rewards.",
    description: "Free to play. Shariah compliant. Win real PKR prizes from brand sponsors.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <Providers>
          <Header />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
