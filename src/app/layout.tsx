import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { getSiteUrl, SITE } from "@/lib/seo";
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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "JK Express | Construction, Real Estate & Property Management",
    template: "%s | JK Express",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "JK Express",
    "JK Express Realtors",
    "construction Uganda",
    "real estate Kampala",
    "property management Uganda",
    "houses for sale Kampala",
    "apartments for rent Kampala",
    "construction company Entebbe",
    "Jinja real estate",
  ],
  authors: [{ name: SITE.legalName, url: getSiteUrl() }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  category: "real estate",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: getSiteUrl(),
    siteName: SITE.name,
    title: "JK Express | Construction, Real Estate & Property Management",
    description: SITE.description,
    images: [{ url: SITE.logo, alt: SITE.legalName }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JK Express | Construction, Real Estate & Property Management",
    description: SITE.description,
    images: [SITE.logo],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
