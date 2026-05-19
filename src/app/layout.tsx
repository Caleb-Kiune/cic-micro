import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { PwaRegistry } from "./PwaRegistry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CIC Micro Hub",
  description: "Offline microinsurance quoting tool",
  manifest: "/manifest.json", 
};

export const viewport: Viewport = {
  themeColor: "#ce1126", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen pt-16`}>
        <PwaRegistry />
        
        {/* --- GLOBAL NAVBAR --- */}
        <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40 h-16 flex items-center px-4 md:px-8">
          <div className="max-w-4xl mx-auto w-full">
            <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
              <img 
                src="/cic-logo.png" 
                alt="CIC Insurance Logo" 
                className="h-10 w-auto object-contain"
              />
              <span className="font-bold text-gray-900 text-lg tracking-tight hidden sm:block">
                Microinsurance Hub
              </span>
            </Link>
          </div>
        </header>

        {/* --- MAIN PAGE CONTENT --- */}
        <main>
          {children}
        </main>
        
      </body>
    </html>
  );
}