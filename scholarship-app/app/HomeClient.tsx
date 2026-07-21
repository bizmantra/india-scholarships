'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, MapPin, Globe, Users, ShieldCheck, GraduationCap, IndianRupee, Target, ArrowRight, Search, Sparkles } from 'lucide-react';
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

interface HomeClientProps {
    recentlyAdded: Scholarship[];
    closingSoon: Scholarship[];
    trending: Scholarship[];
    totalStates: number;
    totalScholarships: number;
}

export default function HomeClient({ 
    recentlyAdded, 
    closingSoon, 
    trending, 
    totalStates,
    totalScholarships 
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
        <div className="min-h-screen bg-white">
            <Header />

            <main>
                {/* Hero Section / Storefront Header */}
                <section className="relative bg-gradient-to-b from-blue-50/40 via-white to-white pt-6 pb-6 md:pt-12 md:pb-10 border-b border-gray-100 overflow-hidden text-center">
                    <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl">
                        
                        {/* Animated Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-google-blue text-[11px] sm:text-xs font-bold mb-4 sm:mb-6 border border-blue-100/50">
                            <Sparkles className="h-3.5 w-3.5 text-google-blue animate-pulse" />
                            Over {totalScholarships} Verified Schemes Tracked Daily
                        </div>

                        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-3 md:mb-4 font-serif leading-[1.15]">
                            Find & Match Verified <br className="hidden sm:inline" />
                            <span className="text-google-blue">Scholarships in India</span>
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-5 md:mb-8 max-w-2xl mx-auto leading-relaxed">
                            Discover active government schemes, corporate CSR grants, and private trust funds for school, college, and university students. Filter dynamically by category, domicile state, and annual income.
                        </p>

                        {/* Centered Search Bar */}
                        <div className="max-w-xl mx-auto px-1 sm:px-2 mb-2 sm:mb-4">
                            <form onSubmit={handleSearch} className="relative w-full shadow-md sm:shadow-lg rounded-full border border-gray-200/80 focus-within:border-google-blue focus-within:ring-1 focus-within:ring-google-blue bg-white transition-all overflow-hidden">
                                <input
                                    type="text"
                                    placeholder="Enter your course, class, state, or keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 sm:pl-6 pr-22 sm:pr-24 py-3 sm:py-4 rounded-full text-xs sm:text-sm focus:outline-none text-gray-800"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1 bottom-1 sm:right-1.5 sm:top-1.5 sm:bottom-1.5 px-4 sm:px-5 bg-google-blue hover:bg-blue-600 text-white rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Micro highlights strip */}
                <section className="py-3 md:py-6 bg-gray-50 border-b border-border-gray">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory md:grid md:grid-cols-3 gap-3 md:gap-6 max-w-5xl mx-auto -mx-4 px-4 md:mx-auto md:px-0">
                            {[
                                { title: 'Verified for 2026', desc: 'Direct linkage to official portal forms.', color: 'text-google-green bg-green-50' },
                                { title: 'Faceted Matching', desc: 'Target schemes by caste, income, state.', color: 'text-google-blue bg-blue-50' },
                                { title: 'Structured Steps', desc: 'Step-by-step registration guides.', color: 'text-google-yellow bg-yellow-50/50' }
                            ].map((feature, i) => (
                                <div key={i} className="snap-center shrink-0 w-[240px] md:w-auto flex items-center gap-3 p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-border-gray shadow-xs hover:shadow-sm transition-shadow">
                                    <div className="p-2 rounded-lg h-fit shrink-0 bg-surface-gray">
                                        <CheckCircle2 className="h-4.5 w-4.5 text-google-blue" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-900 text-xs md:text-sm truncate">{feature.title}</h3>
                                        <p className="text-[11px] md:text-xs text-gray-500 leading-snug font-medium truncate">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Category Gateway Banners (Direct landing filters) */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-6 max-w-5xl">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-black text-gray-900 font-serif tracking-tight mb-2">Category Gateway</h2>
                            <p className="text-sm text-gray-500 font-medium">Quick link grids directly into specific pre-filtered database views</p>
                        </div>

                        {/* 3 Grid blocks for State, Caste, and Level */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {/* Domicile States */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-google-red" />
                                    By State Domicile
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'Odisha', href: '/scholarships-in/odisha' },
                                        { label: 'West Bengal', href: '/scholarships-in/west-bengal' },
                                        { label: 'Karnataka', href: '/scholarships-in/karnataka' },
                                        { label: 'Maharashtra', href: '/scholarships-in/maharashtra' }
                                    ].map((st, idx) => (
                                        <Link key={idx} href={st.href} className="px-4 py-3 bg-surface-gray hover:bg-red-50/30 hover:text-google-red border border-border-gray hover:border-red-100 rounded-2xl text-xs font-bold text-gray-700 transition-all text-center">
                                            {st.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Caste & Category */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                                    <Users className="h-4 w-4 text-google-blue" />
                                    By Social Category
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'General / EWS', href: '/scholarships?caste=General' },
                                        { label: 'OBC', href: '/scholarships?caste=OBC' },
                                        { label: 'SC / ST', href: '/scholarships?caste=SC' },
                                        { label: 'Minority', href: '/scholarships?caste=Minority' }
                                    ].map((cat, idx) => (
                                        <Link key={idx} href={cat.href} className="px-4 py-3 bg-surface-gray hover:bg-blue-50/50 hover:text-google-blue border border-border-gray hover:border-blue-100 rounded-2xl text-xs font-bold text-gray-700 transition-all text-center">
                                            {cat.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Education Level */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                                    <GraduationCap className="h-4 w-4 text-google-green" />
                                    By Education Level
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: 'Class 9-12', href: '/scholarships-by-education' },
                                        { label: 'Undergraduate', href: '/scholarships-level/ug' },
                                        { label: 'Postgraduate', href: '/scholarships-level/pg' },
                                        { label: 'Diploma / ITI', href: '/scholarships-level/diploma' }
                                    ].map((lvl, idx) => (
                                        <Link key={idx} href={lvl.href} className="px-4 py-3 bg-surface-gray hover:bg-green-50/40 hover:text-google-green border border-border-gray hover:border-green-100 rounded-2xl text-xs font-bold text-gray-700 transition-all text-center">
                                            {lvl.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Horizontal Swipe Curated Carousels Section */}
                <section className="py-16 bg-gray-50/50 border-t border-b border-border-gray overflow-hidden">
                    <div className="container mx-auto px-6 max-w-5xl">
                        
                        {/* 1. Curated Carousel: Trending */}
                        <div className="mb-14">
                            <div className="flex justify-between items-end mb-6 border-b pb-3 border-border-gray">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black font-serif text-gray-900 flex items-center gap-2">
                                        🔥 Trending Right Now
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">Opportunities receiving high volumes of application traffic this week</p>
                                </div>
                                <Link href="/scholarships/trending" className="font-bold text-xs text-google-blue hover:underline flex items-center gap-0.5 transition-all">
                                    View All <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                            
                            {/* Horizontal scrolling row */}
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
                            <div className="flex justify-between items-end mb-6 border-b pb-3 border-border-gray">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black font-serif text-gray-900 flex items-center gap-2">
                                        🕒 Newly Verified & Added
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">Fresh program listings vetted and active for the current application cycle</p>
                                </div>
                                <Link href="/scholarships/recently-added" className="font-bold text-xs text-google-blue hover:underline flex items-center gap-0.5 transition-all">
                                    View All <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                            
                            {/* Horizontal scrolling row */}
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
                            <div className="flex justify-between items-end mb-6 border-b pb-3 border-border-gray">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black font-serif text-gray-900 flex items-center gap-2">
                                        ⏰ Closing Soon (Deadlines)
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">Active deadlines ending shortly. File your portal submissions now</p>
                                </div>
                                <Link href="/scholarships/deadlines" className="font-bold text-xs text-google-red hover:underline flex items-center gap-0.5 transition-all">
                                    View All <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                            
                            {/* Horizontal scrolling row */}
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
                <section className="py-20 bg-gradient-to-br from-blue-700 to-blue-900 text-white relative overflow-hidden">
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <div className="max-w-2xl mx-auto">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-6 border border-white/20">
                                <Target className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black mb-4 font-serif tracking-tight">
                                Can't find matching scholarships?
                            </h2>
                            <p className="text-sm text-blue-100 mb-8 max-w-lg mx-auto leading-relaxed">
                                Take our profile matching checklist to quickly filter all schemes in India that fit your exact qualification, category, and domicile criteria.
                            </p>
                            <Link
                                href="/eligibility-checker"
                                className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-blue-700 font-bold text-sm rounded-full hover:bg-blue-50 transition-all shadow-lg active:scale-95 cursor-pointer"
                            >
                                Match Your Profile <ArrowRight className="h-4.5 w-4.5" />
                            </Link>
                        </div>
                    </div>
                    {/* Decorative grids */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-[0.02] rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white opacity-[0.03] rounded-full translate-x-1/3 translate-y-1/3" />
                </section>
            </main>

            <Footer />
        </div>
    );
}
