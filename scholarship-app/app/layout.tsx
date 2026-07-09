import { Inter, Lora } from "next/font/google";
import type { Metadata } from "next";
import Script from "next/script";
import EzoicRouteHandler from "@/app/components/EzoicRouteHandler";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IndiaScholarships - Find Scholarships for Indian Students",
  description: "Discover government and private scholarships for Indian students. Search by state, category, income level, and education level. Updated for 2026.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.indiascholarships.in",
    siteName: "IndiaScholarships.in",
    title: "IndiaScholarships - Find Scholarships for Indian Students",
    description: "Discover government and private scholarships for Indian students. Search by state, category, income level, and education level.",
  },
  twitter: {
    card: "summary_large_image",
    title: "IndiaScholarships - Find Scholarships for Indian Students",
    description: "Discover government and private scholarships for Indian students.",
    creator: "@IndiaScholarships",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Ezoic Privacy Policy (CMP) scripts */}
        <Script
          id="ezoic-cmp"
          src="https://cmp.gatekeeperconsent.com/min.js"
          strategy="beforeInteractive"
          data-cfasync="false"
        />
        <Script
          id="ezoic-cmp-2"
          src="https://the.gatekeeperconsent.com/cmp.min.js"
          strategy="beforeInteractive"
          data-cfasync="false"
        />
      </head>
      <body
        className={`${inter.variable} ${lora.variable} font-sans antialiased`}
      >
        <EzoicRouteHandler />
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DE8V5ECQZX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DE8V5ECQZX');
          `}
        </Script>
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-3403005071423697"}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Ezoic standalone script */}
        <Script
          id="ezoic-sa"
          src="//www.ezojs.com/ezoic/sa.min.js"
          strategy="afterInteractive"
        />
        <Script id="ezoic-init" strategy="afterInteractive">
          {`
            window.ezstandalone = window.ezstandalone || {};
            window.ezstandalone.cmd = window.ezstandalone.cmd || [];
          `}
        </Script>
        <Script
          id="ezoic-analytics"
          src="//ezoicanalytics.com/analytics.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
