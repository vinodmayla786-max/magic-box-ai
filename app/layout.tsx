import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers"; // <-- Ye nayi line

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Magic Box AI",
  description: "Your custom emotional companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Niche wali line mein Providers add kiya hai */}
        <Providers>{children}</Providers> 
      </body>
    </html>
  );
}