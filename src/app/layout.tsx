import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Navbar } from "@/components/custom/navbar";

export const metadata: Metadata = {
  title: "Graville Operations | Construction Platform",
  description: "Full-stack construction operations management for East Africa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
     
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}