import type { Metadata } from "next";
import { Providers } from "@/lib/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polymarket Terminal | Analytics Dashboard",
  description:
    "Bloomberg-style analytics dashboard for Polymarket prediction markets, powered by Envio HyperIndex.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 max-w-[1920px] mx-auto w-full px-4 py-4">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
