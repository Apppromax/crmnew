import { Inter } from "next/font/google";
import "./globals.css";
import { ClientThemeManager } from "@/components/ClientThemeManager";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata = {
  title: "SalesPush CRM — Chăm đúng khách, đúng lúc",
  description: "CRM thông minh cho sale bất động sản. Quản lý giỏ khách bằng Smart Card, tập trung chăm đúng khách vào đúng thời điểm.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SalesPush CRM",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0ea5e9",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <ClientThemeManager />
        {children}
      </body>
    </html>
  );
}
