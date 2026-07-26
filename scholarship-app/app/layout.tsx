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
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-DE8V5ECQZX"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-DE8V5ECQZX');
            `
          }}
        />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-3403005071423697"}`}
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "xlf5htvtti");
            `
          }}
        />
      </body>
    </html>
  );
}
