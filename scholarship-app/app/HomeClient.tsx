'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, MapPin, Globe, Users, ShieldCheck, GraduationCap, IndianRupee, Target, ArrowRight, Search, Sparkles, BookOpen, ChevronRight, Award, Zap } from 'lucide-react';
import ScholarshipCard from './components/ScholarshipCard';
import Header from './components/Header';
import Footer from './components/Footer';

interface Scholarship {
    id: number;
    slug: string;
    title: string;
    provider: string;
    state: string;
    caste: string[];
    amount_annual: number;
    amount_min?: number;
    deadline?: string;
    application_mode: string;
    level: string;
    last_verified: string;
    income_limit?: number;
    is_popular?: number;
    created_at?: string;
    thumbnail_url?: string;
}

interface FeaturedPillar {
    title: string;
    slug: string;
}

interface HomeClientProps {
    recentlyAdded: Scholarship[];
    closingSoon: Scholarship[];
    trending: Scholarship[];
    totalStates: number;
    totalScholarships: number;
    featuredPillars: FeaturedPillar[];
}

export default function HomeClient({
    recentlyAdded,
    closingSoon,
    trending,
    totalStates,
    totalScholarships,
    featuredPillars
}: HomeClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/scholarships?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push(`/scholarships`);
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#2E2C57] font-sans">
            <Header />

            <main>
                {/* LeapScholar High-Impact Hero Section */}
                <section className="relative bg-gradient-to-b from-[#F5F6FF] via-[#F8F9FE] to-white pt-10 pb-12 md:pt-20 md:pb-16 border-b border-[#E2E2E8] overflow-hidden text-center">
                    <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl">
                        
                        {/* Animated Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#4A47FF] text-xs font-extrabold mb-5 sm:mb-7 border border-[#E2E2E8] shadow-sm">
                            <Sparkles className="h-4 w-4 text-[#4A47FF] animate-pulse" />
                            <span>Over {totalScholarships} Verified Indian Schemes Tracked Daily</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#2E2C57] tracking-tight mb-5 md:mb-7 font-heading leading-[1.12]">
                            Find & Match Verified <br className="hidden sm:inline" />
                            <span className="text-[#4A47FF]">Scholarships in India</span>
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-[#56547A] mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                            Discover active government schemes, corporate CSR grants, and private trust funds for school, college, and university students. Filter dynamically by category, domicile state, and annual income.
                        </p>

                        {/* Centered Search Bar */}
                        <div className="max-w-xl mx-auto px-1 sm:px-2 mb-6 sm:mb-8">
                            <form onSubmit={handleSearch} className="relative w-full shadow-lg rounded-full border border-[#E2E2E8] focus-within:border-[#4A47FF] focus-within:ring-4 focus-within:ring-[#4A47FF]/15 bg-white transition-all overflow-hidden p-1.5">
                                <input
                                    type="text"
                                    placeholder="Search course, class, state (e.g. NSP, Post-Matric, Maharashtra)…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-6 pr-32 py-3.5 rounded-full text-sm font-medium focus:outline-none text-[#2E2C57] placeholder:text-[#56547A]/60"
                                />
                                <button
                                    type="submit"
                                    aria-label="Search"
                                    className="absolute right-2 top-2 bottom-2 px-6 bg-[#4A47FF] hover:bg-[#3834E0] text-white rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95"
                                >
                                    <Search className="h-4 w-4" />
                                    <span>Search</span>
                                </button>
                            </form>
                        </div>

                        {/* Social Proof Trust Avatars Strip */}
                        <div className="flex items-center justify-center gap-3 text-xs text-[#56547A] font-semibold">
                            <div className="flex -space-x-2 overflow-hidden">
                                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#4A47FF] text-white font-bold flex items-center justify-center text-[10px]">R</div>
                                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#10B981] text-white font-bold flex items-center justify-center text-[10px]">A</div>
                                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#F59E0B] text-white font-bold flex items-center justify-center text-[10px]">S</div>
                            </div>
                            <span>Joined by <strong className="text-[#2E2C57] font-bold">50,000+ Students</strong> Across India</span>
                        </div>
                    </div>
                </section>

                {/* Micro highlights strip */}
                <section className="py-4 md:py-6 bg-[#F8F9FE] border-b border-[#E2E2E8]">
                    <div className="container mx-auto px-4 md:px-6 relative">
                        <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-3 gap-3 md:gap-6 max-w-5xl mx-auto -mx-4 px-4 md:mx-auto md:px-0">
                            {[
                                { title: 'Verified for 2026', desc: 'Direct linkage to official portal forms.', color: 'text-[#10B981] bg-[#ECFDF5]' },
                                { title: 'Faceted Matching', desc: 'Target schemes by caste, income, state.', color: 'text-[#4A47FF] bg-[#F5F6FF]' },
                                { title: 'Structured Steps', desc: 'Step-by-step registration guides.', color: 'text-[#F59E0B] bg-[#FEF3C7]' }
                            ].map((feature, i) => (
                                <div key={i} className="snap-center shrink-0 w-[85%] xs:w-[240px] md:w-auto flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-[#E2E2E8] shadow-xs hover:shadow-md transition-shadow">
                                    <div className={`p-2.5 rounded-xl shrink-0 ${feature.color}`}>
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-[#2E2C57] text-xs md:text-sm truncate font-heading">{feature.title}</h3>
                                        <p className="text-[11px] md:text-xs text-[#56547A] leading-snug font-medium truncate">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Category Gateway Banners */}
                <section className="py-14 bg-white">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="text-center mb-10">
                            <span className="px-3 py-1 bg-[#F5F6FF] text-[#4A47FF] text-xs font-bold rounded-full border border-[#E2E2E8] uppercase tracking-wider">Quick Discovery</span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E2C57] font-heading tracking-tight mt-3 mb-2">Category Gateway</h2>
                            <p className="text-sm text-[#56547A] font-medium">Quick link grids directly into specific pre-filtered database views</p>
                        </div>

                        {/* 3 Grid blocks for State, Caste, and Level */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {/* Domicile States */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-[#56547A] uppercase tracking-widest border-b border-[#E2E2E8] pb-2 flex items-center gap-2 font-heading">
                                    <MapPin className="h-4 w-4 text-[#EF4444]" />
                                    By State Domicile
                                </h3>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {[
                                        { label: 'Odisha', href: '/scholarships-in/odisha' },
                                        { label: 'West Bengal', href: '/scholarships-in/west-bengal' },
                                        { label: 'Karnataka', href: '/scholarships-in/karnataka' },
                                        { label: 'Maharashtra', href: '/scholarships-in/maharashtra' }
                                    ].map((st, idx) => (
                                        <Link key={idx} href={st.href} className="px-4 py-3 bg-[#F8F9FE] hover:bg-[#F5F6FF] hover:text-[#4A47FF] border border-[#E2E2E8] hover:border-[#4A47FF]/40 rounded-2xl text-xs font-bold text-[#2E2C57] transition-all text-center">
                                            {st.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Caste & Category */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-[#56547A] uppercase tracking-widest border-b border-[#E2E2E8] pb-2 flex items-center gap-2 font-heading">
                                    <Users className="h-4 w-4 text-[#4A47FF]" />
                                    By Social Category
                                </h3>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {[
                                        { label: 'General / EWS', href: '/scholarships?caste=General' },
                                        { label: 'OBC', href: '/scholarships?caste=OBC' },
                                        { label: 'SC / ST', href: '/scholarships?caste=SC' },
                                        { label: 'Minority', href: '/scholarships?caste=Minority' }
                                    ].map((cat, idx) => (
                                        <Link key={idx} href={cat.href} className="px-4 py-3 bg-[#F8F9FE] hover:bg-[#F5F6FF] hover:text-[#4A47FF] border border-[#E2E2E8] hover:border-[#4A47FF]/40 rounded-2xl text-xs font-bold text-[#2E2C57] transition-all text-center">
                                            {cat.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Education Level */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-[#56547A] uppercase tracking-widest border-b border-[#E2E2E8] pb-2 flex items-center gap-2 font-heading">
                                    <GraduationCap className="h-4 w-4 text-[#10B981]" />
                                    By Education Level
                                </h3>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {[
                                        { label: 'Class 9-12', href: '/scholarships-by-education' },
                                        { label: 'Undergraduate', href: '/scholarships-level/ug' },
                                        { label: 'Postgraduate', href: '/scholarships-level/pg' },
                                        { label: 'Diploma / ITI', href: '/scholarships-level/diploma' }
                                    ].map((lvl, idx) => (
                                        <Link key={idx} href={lvl.href} className="px-4 py-3 bg-[#F8F9FE] hover:bg-[#F5F6FF] hover:text-[#4A47FF] border border-[#E2E2E8] hover:border-[#4A47FF]/40 rounded-2xl text-xs font-bold text-[#2E2C57] transition-all text-center">
                                            {lvl.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Scholarship Guides (Pillars) */}
                <section className="py-14 bg-[#F5F6FF] border-t border-b border-[#E2E2E8]">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                            <div>
                                <h2 className="text-2xl font-extrabold text-[#2E2C57] font-heading tracking-tight mb-1.5 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-[#4A47FF]" />
                                    Scholarship Guides
                                </h2>
                                <p className="text-sm text-[#56547A] font-medium">Not sure where to start? These explain how a whole system works, not just one scheme.</p>
                            </div>
                            <Link href="/guides" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#4A47FF] hover:bg-[#4A47FF] hover:text-white rounded-full text-xs font-bold border border-[#E2E2E8] transition-all shrink-0">
                                <span>All Guides</span>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featuredPillars.map((g) => (
                                <Link
                                    key={g.slug}
                                    href={`/guides/${g.slug}`}
                                    className="flex items-center justify-between gap-3 p-4 bg-white border border-[#E2E2E8] rounded-2xl text-sm font-bold text-[#2E2C57] hover:border-[#4A47FF] hover:text-[#4A47FF] hover:shadow-md transition-all font-heading"
                                >
                                    <span>{g.title}</span>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-[#4A47FF]" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Report Promo Callout Banner */}
                <section className="py-8 bg-white border-t border-[#E2E2E8]">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <Link 
                            href="/guides/india-scholarships-statistics-2025-2026"
                            className="flex flex-col md:flex-row items-center justify-between gap-5 p-6 bg-gradient-to-r from-[#F5F6FF] to-[#EEEDFF] border border-[#E2E2E8] rounded-3xl hover:border-[#4A47FF] hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-3.5 bg-white rounded-2xl border border-[#E2E2E8] shadow-sm text-2xl group-hover:scale-105 transition-transform shrink-0">
                                    📊
                                </div>
                                <div>
                                    <h4 className="text-base font-extrabold text-[#2E2C57] font-heading leading-snug">
                                        India Scholarships Statistics Report (2025-2026)
                                    </h4>
                                    <p className="text-xs text-[#56547A] mt-1 font-medium leading-relaxed">
                                        Explore official compiled statistics on central government budget outlays, private corporate CSR funding limits, and outbound international student mobility records.
                                    </p>
                                </div>
                            </div>
                            <span className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#4A47FF] text-white rounded-full text-xs font-bold group-hover:bg-[#3834E0] transition-colors shadow-sm">
                                Read Report <ArrowRight className="h-4 w-4" />
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Curated Scholarship Carousels */}
                <section className="py-16 bg-[#F8F9FE] border-t border-b border-[#E2E2E8] overflow-hidden">
                    <div className="container mx-auto px-6 max-w-5xl">
                        
                        {/* 1. Curated Carousel: Trending */}
                        <div className="mb-14">
                            <div className="flex justify-between items-end mb-6 border-b pb-3 border-[#E2E2E8]">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-extrabold font-heading text-[#2E2C57] flex items-center gap-2">
                                        🔥 Trending Right Now
                                    </h3>
                                    <p className="text-xs text-[#56547A] font-medium">Opportunities receiving high volumes of application traffic this week</p>
                                </div>
                                <Link href="/scholarships/trending" className="font-bold text-xs text-[#4A47FF] hover:underline flex items-center gap-1 transition-all">
                                    View All <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                            
                            <div className="flex overflow-x-auto gap-5 pb-6 pt-2 scrollbar-none snap-x snap-mandatory -mx-6 px-6">
                                {trending.slice(0, 6).map((scholarship) => (
                                    <div key={scholarship.id} className="snap-start shrink-0 w-[285px] sm:w-[310px] h-auto">
                                        <ScholarshipCard scholarship={scholarship} viewMode="grid" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Curated Carousel: Newly Verified */}
                        <div className="mb-14">
                            <div className="flex justify-between items-end mb-6 border-b pb-3 border-[#E2E2E8]">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-extrabold font-heading text-[#2E2C57] flex items-center gap-2">
                                        🕒 Newly Verified & Added
                                    </h3>
                                    <p className="text-xs text-[#56547A] font-medium">Fresh program listings vetted and active for the current application cycle</p>
                                </div>
                                <Link href="/scholarships/recently-added" className="font-bold text-xs text-[#4A47FF] hover:underline flex items-center gap-1 transition-all">
                                    View All <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                            
                            <div className="flex overflow-x-auto gap-5 pb-6 pt-2 scrollbar-none snap-x snap-mandatory -mx-6 px-6">
                                {recentlyAdded.slice(0, 6).map((scholarship) => (
                                    <div key={scholarship.id} className="snap-start shrink-0 w-[285px] sm:w-[310px] h-auto">
                                        <ScholarshipCard scholarship={scholarship} viewMode="grid" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Curated Carousel: Closing Soon */}
                        <div>
                            <div className="flex justify-between items-end mb-6 border-b pb-3 border-[#E2E2E8]">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-extrabold font-heading text-[#2E2C57] flex items-center gap-2">
                                        ⏰ Closing Soon (Deadlines)
                                    </h3>
                                    <p className="text-xs text-[#56547A] font-medium">Active deadlines ending shortly. File your portal submissions now</p>
                                </div>
                                <Link href="/scholarships/deadlines" className="font-bold text-xs text-[#EF4444] hover:underline flex items-center gap-1 transition-all">
                                    View All <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                            
                            <div className="flex overflow-x-auto gap-5 pb-6 pt-2 scrollbar-none snap-x snap-mandatory -mx-6 px-6">
                                {closingSoon.slice(0, 6).map((scholarship) => (
                                    <div key={scholarship.id} className="snap-start shrink-0 w-[285px] sm:w-[310px] h-auto">
                                        <ScholarshipCard scholarship={scholarship} viewMode="grid" />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>

                {/* Eligibility Checker Callout section */}
                <section className="py-20 bg-[#2E2C57] text-white relative overflow-hidden">
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <div className="max-w-2xl mx-auto">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4A47FF]/30 backdrop-blur-md rounded-2xl mb-6 border border-[#4A47FF]/50 shadow-lg">
                                <Target className="h-8 w-8 text-[#4A47FF]" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-heading tracking-tight">
                                Can't find matching scholarships?
                            </h2>
                            <p className="text-sm text-[#E2E2E8] mb-8 max-w-lg mx-auto leading-relaxed font-medium">
                                Take our profile matching checklist to quickly filter all schemes in India that fit your exact qualification, category, and domicile criteria.
                            </p>
                            <Link
                                href="/eligibility-checker"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-[#4A47FF] hover:bg-[#3834E0] text-white font-extrabold text-sm rounded-full transition-all shadow-xl active:scale-95 cursor-pointer font-heading"
                            >
                                Match Your Profile <ArrowRight className="h-4.5 w-4.5" />
                            </Link>
                        </div>
                    </div>
                    {/* Decorative radial glows */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#4A47FF] opacity-20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#4A47FF] opacity-20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
                </section>
            </main>

            <Footer />
        </div>
    );
}
