import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";

const gotham = localFont({
  src: [
    {
      path: "../public/assets/gotham font/Gotham-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/assets/gotham font/Gotham-Book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/gotham font/Gotham-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/assets/gotham font/Gotham-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gotham",
});

export const metadata: Metadata = {
  title: "Mürekkep Hukuk Bürosu | Profesyonel Hukuki Danışmanlık",
  description: "Mürekkep Hukuk Bürosu - İstanbul merkezli profesyonel hukuki danışmanlık ve avukatlık hizmetleri",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${gotham.variable} font-gotham antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
