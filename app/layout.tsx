import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";
import ThemeProvider from "@/components/ThemeProvider";

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
  metadataBase: new URL("https://www.foforatiyatro.com"),
  title: "Fofora Tiyatro | Sahnenin Büyüsüyle Kendini Yeniden Keşfet",
  description: "Fofora Tiyatro - İstanbul Üsküdar merkezli tiyatro eğitimi, drama atölyeleri ve oyunculuk kursları. 4 yaşından yetişkinlere kadar tiyatro eğitimi.",
  keywords: ["tiyatro", "drama", "oyunculuk", "tiyatro eğitimi", "drama atölyesi", "çocuk tiyatrosu", "İstanbul", "Üsküdar", "sahne sanatları", "fofora tiyatro"],
  authors: [{ name: "Fofora Tiyatro" }],
  robots: "index, follow",
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
    url: "https://www.foforatiyatro.com",
    siteName: "Fofora Tiyatro",
    title: "Fofora Tiyatro | Sahnenin Büyüsüyle Kendini Yeniden Keşfet",
    description: "İstanbul Üsküdar merkezli tiyatro eğitimi, drama atölyeleri ve oyunculuk kursları. 4 yaşından yetişkinlere kadar tiyatro eğitimi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fofora Tiyatro | Sahnenin Büyüsüyle Kendini Yeniden Keşfet",
    description: "İstanbul Üsküdar merkezli tiyatro eğitimi, drama atölyeleri ve oyunculuk kursları.",
  },
};

export const viewport = {
  themeColor: "#1e3a5f",
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
        <ThemeProvider />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
