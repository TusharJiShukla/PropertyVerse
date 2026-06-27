import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "PropertyVerse - Premium Real Estate & Consultancy in Mumbai",
  description: "Find your dream home with PropertyVerse. We offer expert real estate brokerage, property sales, rentals, commercial redevelopment, and legal consultancy in Mumbai and Gujarat.",
  keywords: ["Real Estate Mumbai", "Property in Mumbai", "Buy Flats Mumbai", "Rent Apartments", "Commercial Redevelopment", "Property Consultants", "Real Estate Broker", "PropertyVerse"],
  authors: [{ name: "PropertyVerse Team" }],
  creator: "PropertyVerse",
  openGraph: {
    title: "PropertyVerse - Premium Real Estate & Consultancy",
    description: "Your trusted partner for buying, selling, and renting properties. Explore our AI-powered property match score and neighborhood insights.",
    url: "https://propertyverse.com",
    siteName: "PropertyVerse",
    images: [
      {
        url: "/about-banner.png",
        width: 1200,
        height: 630,
        alt: "PropertyVerse Real Estate",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PropertyVerse - Premium Real Estate & Consultancy",
    description: "Your trusted partner for buying, selling, and renting properties. Explore our AI-powered property match score.",
    images: ["/about-banner.png"],
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
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}