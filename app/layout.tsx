import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";
import ThemeProvider from "@/components/ThemeProvider";
import PWARegister from "@/components/PWARegister";

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
  metadataBase: new URL("https://foforatiyatro.com"),
  title: "Fofora Tiyatro | Sahne Senin",
  description: "Üsküdar’da çocuk, genç ve yetişkinler için tiyatro eğitimleri; Fofora oyunları, öğrenci gösterileri ve sahneden haberler.",
  keywords: ["tiyatro", "drama", "oyunculuk", "tiyatro eğitimi", "drama atölyesi", "çocuk tiyatrosu", "İstanbul", "Üsküdar", "sahne sanatları", "fofora tiyatro"],
  authors: [{ name: "Fofora Tiyatro" }],
  robots: "index, follow",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Fofora Yönetim", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://foforatiyatro.com",
    siteName: "Fofora Tiyatro",
    title: "Fofora Tiyatro | Sahne Senin",
    description: "Tiyatro eğitimleri, oyunlar, öğrenci gösterileri ve sahneden haberler.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fofora Tiyatro | Sahne Senin",
    description: "Tiyatro eğitimleri, oyunlar, öğrenci gösterileri ve sahneden haberler.",
  },
};

export const viewport = {
  themeColor: "#681d2a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${gotham.variable} font-gotham antialiased`}>
        <PWARegister />
        <ThemeProvider />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
