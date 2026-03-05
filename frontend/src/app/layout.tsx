import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Polymarket Explorer | Envio HyperIndex",
  description:
    "Bloomberg-style terminal for exploring Polymarket on-chain data. Powered by Envio HyperIndex.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-auto p-4">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
