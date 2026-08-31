import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowSpace | مساحتك للنمو",
  description: "منصة تساعد الطلاب على تنظيم حياتهم الأكاديمية واليومية.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
