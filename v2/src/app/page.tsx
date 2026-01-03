import { ArrowRight, Search, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import ScholarshipCard from "@/components/ScholarshipCard";
import { MOCK_SCHOLARSHIPS } from "@/data/mock-scholarships";

export default function Home() {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full bg-white border-b overflow-hidden relative">
                <div className="container mx-auto px-4 py-20 lg:py-32 flex flex-col items-center text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 animate-fade-in text-[10px] sm:text-xs">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Phase 1 & 2 Live: Odisha & Karnataka
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6 font-outfit max-w-4xl">
                        Don't just find scholarships. <br />
                        <span className="text-primary">Win them.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
                        India's first AI-powered scholarship decision engine that tells you exactly which ones to apply for and how to maximize your chances.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mb-12">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search (e.g. SC Engineering Karnataka)"
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                            />
                        </div>
                        <button className="btn-primary flex items-center justify-center gap-2 px-8 py-3 h-auto whitespace-nowrap">
                            Search <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left w-full max-w-4xl">
                        <div className="flex gap-3 text-sm">
                            <div className="bg-success/10 p-2 rounded-lg h-fit shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <h3 className="font-bold">1,000+ Verified</h3>
                                <p className="text-xs text-muted-foreground">Dated stamps & multi-source verified</p>
                            </div>
                        </div>
                        <div className="flex gap-3 text-sm">
                            <div className="bg-success/10 p-2 rounded-lg h-fit shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <h3 className="font-bold">Smart Matching</h3>
                                <p className="text-xs text-muted-foreground">Based on income, caste, and grades</p>
                            </div>
                        </div>
                        <div className="flex gap-3 text-sm">
                            <div className="bg-success/10 p-2 rounded-lg h-fit shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <h3 className="font-bold">Actionable Guides</h3>
                                <p className="text-xs text-muted-foreground">Step-by-step application support</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 -z-0 opacity-10">
                    <div className="w-[500px] h-[500px] bg-primary rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                </div>
            </section>

            {/* Featured Scholarships Preview */}
            <section className="py-20 container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold font-outfit mb-2">Featured Scholarships</h2>
                        <p className="text-muted-foreground text-sm">Recently verified opportunities in Odisha and Karnataka</p>
                    </div>
                    <Link href="/scholarships" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                        View all <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_SCHOLARSHIPS.map((sc) => (
                        <ScholarshipCard key={sc.sc_id} scholarship={sc} />
                    ))}
                    {/* Skeleton cards for empty spots */}
                    {[1, 2].map(i => (
                        <div key={i} className="scholarship-card p-6 opacity-40 grayscale pointer-events-none border-dashed bg-muted/20 rounded-xl overflow-hidden min-h-[300px]">
                            <div className="bg-muted px-2 py-1 rounded h-4 w-24 mb-3" />
                            <div className="bg-muted h-6 w-full mb-2 rounded" />
                            <div className="bg-muted h-8 w-32 mb-4 rounded" />
                            <div className="flex gap-2 mb-6">
                                <div className="bg-muted h-5 w-16 rounded-full" />
                                <div className="bg-muted h-5 w-16 rounded-full" />
                            </div>
                            <div className="bg-muted h-10 w-full rounded" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
