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
  applicationName: "Author Storefront",
  authors: [{ name: "Author Studio" }],
  creator: "Author Studio",
  publisher: "Author Studio",
  keywords: [
    "storefront",
    "landing pages",
    "digital products",
    "ecommerce",
    "checkout",
    "premium templates",
    "Next.js storefront",
    "Author Storefront",
  ],
  title: {
    default: "Author Storefront",
    template: "%s | Author Storefront",
  },
  description:
    "Premium whiteframe storefront for landing pages, digital products, cart flow, and checkout experiences built for modern brands.",
  alternates: {
    canonical: "https://authorstore.example.com",
    languages: {
      "en-US": "https://authorstore.example.com/?lang=en",
      "vi-VN": "https://authorstore.example.com/?lang=vi",
      "sv-SE": "https://authorstore.example.com/?lang=sv",
    },
  },
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
    locale: "en_US",
    url: "https://authorstore.example.com",
    title: "Author Storefront",
    description:
      "Discover premium landing page templates, curated products, and smooth checkout experiences in a modern whiteframe storefront.",
    siteName: "Author Storefront",
  },
  twitter: {
    card: "summary_large_image",
    title: "Author Storefront",
    description:
      "Modern storefront for premium landing pages, products, and conversion-focused checkout experiences.",
    creator: "@authorstudio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
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
