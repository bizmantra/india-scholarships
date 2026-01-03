import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "Scholarly | India's AI-Powered Scholarship Decision Engine",
    description: "Find and win the scholarships you deserve. Personalized matching, verified data, and step-by-step guidance.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="font-inter antialiased">
                <Header />
                <main className="min-h-screen bg-background text-foreground">
                    {children}
                </main>
                <footer className="border-t bg-muted/50 py-12">
                    <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                        <p>© 2025 Scholarly. All rights reserved.</p>
                    </div>
                </footer>
            </body>
        </html>
    );
}
