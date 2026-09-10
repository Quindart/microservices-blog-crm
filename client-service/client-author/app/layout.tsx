import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://authorstore.example.com"),
  applicationName: "Cửa hàng Author",
  authors: [{ name: "Author Studio" }],
  creator: "Author Studio",
  publisher: "Author Studio",
  keywords: [
    "cửa hàng trực tuyến",
    "landing page",
    "website gia công phần mềm",
    "thương mại điện tử",
    "thanh toán",
    "mẫu thiết kế cao cấp",
    "cửa hàng kỹ thuật số",
  ],
  title: {
    default: "Cửa hàng Author",
    template: "%s | Cửa hàng Author",
  },
  description:
    "Cửa hàng kỹ thuật số với landing page, sản phẩm số, giỏ hàng và trải nghiệm thanh toán hiện đại.",
  alternates: { canonical: "https://authorstore.example.com" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://authorstore.example.com",
    title: "Cửa hàng Author",
    description:
      "Khám phá các landing page và giải pháp website được xây dựng để giúp doanh nghiệp tăng trưởng.",
    siteName: "Cửa hàng Author",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cửa hàng Author",
    description:
      "Website giới thiệu các landing page và giải pháp gia công phần mềm cho doanh nghiệp.",
    creator: "@authorstudio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col">
          <Suspense fallback={<header className="h-20 border-b border-slate-200 bg-white" />}>
            <SiteHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Suspense fallback={<footer className="h-24 border-t border-slate-200 bg-white" />}>
            <SiteFooter />
          </Suspense>
        </div>
      </body>
    </html>
  );
}
