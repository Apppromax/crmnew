import { Geist } from "next/font/google";
import "./globals.css";
import { ClientThemeManager } from "@/components/ClientThemeManager";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "SalesPush CRM — Chăm đúng khách, đúng lúc",
  description: "CRM thông minh cho sale bất động sản. Quản lý giỏ khách bằng Smart Card, tập trung chăm đúng khách vào đúng thời điểm.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <ClientThemeManager />
        {children}
      </body>
    </html>
  );
}
