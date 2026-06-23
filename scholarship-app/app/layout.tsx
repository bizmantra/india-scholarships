import { Inter, Lora } from "next/font/google";
import type { Metadata } from "next";
import Script from "next/script";
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
      <body
        className={`${inter.variable} ${lora.variable} font-sans antialiased`}
      >
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
      </body>
    </html>
  );
}
