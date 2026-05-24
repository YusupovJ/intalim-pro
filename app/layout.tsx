import type { Metadata, Viewport } from "next";
import QueryProvider from "@/components/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intalim Pro — Билеты ПДД",
  description: "Тренировка билетов ПДД Узбекистан",
  applicationName: "Intalim Pro",
  appleWebApp: {
    capable: true,
    title: "Intalim Pro",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-slate-200">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
