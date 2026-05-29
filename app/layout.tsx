import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "BetterBlue | Personal Meal Randomizer",
  description: "BetterBlue ช่วยคุณตัดสินใจว่ามื้อนี้กินอะไร และติดตามค่าใช้จ่ายอาหารประจำวัน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className="bg-slate-50 text-slate-900 min-h-screen antialiased"
        style={{ fontFamily: "'Segoe UI', 'Noto Sans Thai', sans-serif" }}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
