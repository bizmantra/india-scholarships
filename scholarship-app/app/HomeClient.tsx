'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, CheckCircle2, ArrowRight, MapPin, Users, GraduationCap, IndianRupee, Target, ChevronDown, Globe, ShieldCheck } from 'lucide-react';
import ScholarshipCard from './components/ScholarshipCard';
import ResultsHeader from './components/ResultsHeader';
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
}

interface HomeClientProps {
    scholarships: Scholarship[];
}

export default function HomeClient({ scholarships }: HomeClientProps) {
    const [sortBy, setSortBy] = useState('deadline');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Get featured/popular scholarships (limit to 9)
    const featuredScholarships = useMemo(() => {
        return scholarships
            .filter(s => s.is_popular === 1)
            .slice(0, 9);
    }, [scholarships]);

    // Sort featured scholarships
    const sortedFeatured = useMemo(() => {
        const sorted = [...featuredScholarships];

        switch (sortBy) {
            case 'deadline':
                return sorted.sort((a, b) => {
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                });
            case 'amount':
                return sorted.sort((a, b) => b.amount_annual - a.amount_annual);
            case 'recent':
                return sorted.sort((a, b) =>
                    new Date(b.last_verified).getTime() - new Date(a.last_verified).getTime()
                );
            default:
                return sorted;
        }
    }, [featuredScholarships, sortBy]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalAmount = scholarships.reduce((sum, s) => sum + (s.amount_annual || 0), 0);
        const uniqueStates = new Set(scholarships.map(s => s.state).filter(Boolean));

        return {
            totalScholarships: scholarships.length,
            totalStates: uniqueStates.size,
            totalFunding: totalAmount,
        };
    }, [scholarships]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Hero Section */}
            <section className="relative bg-white border-b overflow-hidden">
                <div className="container mx-auto px-4 py-20 lg:py-32 flex flex-col items-center text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-700 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-700"></span>
                        </span>
                        {stats.totalScholarships}+ Verified Scholarships Live
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-gray-900 tracking-tight mb-8 max-w-5xl font-serif leading-[1.1]">
                        Don't just find scholarships. <br />
                        <span className="text-blue-700 italic">Win them.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
                        India's first AI-powered scholarship decision engine that tells you exactly which ones to apply for and how to maximize your chances.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mb-12">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search (e.g. SC Engineering Karnataka)"
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700/20 transition-all text-sm"
                            />
                        </div>
                        <button className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
                            Search <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left w-full max-w-5xl">
                        {[
                            { title: `${stats.totalScholarships}+ Verified`, desc: 'Dated stamps & multi-source verified' },
                            { title: 'Smart Matching', desc: 'Based on income, caste, and grades' },
                            { title: 'Actionable Guides', desc: 'Step-by-step application support' }
                        ].map((feature, i) => (
                            <div key={i} className="flex gap-4 group p-4 hover:bg-gray-50 rounded-2xl transition-all">
                                <div className="bg-green-100 p-2.5 rounded-xl h-fit shrink-0 group-hover:bg-green-200 transition-colors">
                                    <CheckCircle2 className="h-5 w-5 text-green-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute top-0 right-0 -z-0 opacity-10">
                    <div className="w-[500px] h-[500px] bg-blue-700 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                </div>
            </section>

            {/* Quick Browse Tiles */}
            <section className="py-20 container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black mb-3 font-serif tracking-tight text-gray-900">Browse Scholarships</h2>
                    <p className="text-gray-500 text-sm font-medium">Find opportunities that match your profile</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {[
                        {
                            icon: MapPin,
                            title: 'By State',
                            description: 'Find scholarships in your state',
                            href: '/state-scholarships',
                            color: 'blue',
                            count: stats.totalStates
                        },
                        {
                            icon: Globe,
                            title: 'Government Scholarships',
                            description: 'State & National level schemes',
                            href: '/government-scholarships',
                            color: 'emerald',
                            count: null
                        },
                        {
                            icon: Users,
                            title: 'By Category',
                            description: 'SC, ST, OBC, General & more',
                            href: '/scholarships-by-category',
                            color: 'purple',
                            count: null
                        },
                        {
                            icon: ShieldCheck,
                            title: 'Private Scholarships',
                            description: 'Foundation & NGO programs',
                            href: '/private-scholarships',
                            color: 'indigo',
                            count: null
                        },
                        {
                            icon: GraduationCap,
                            title: 'By Education Level',
                            description: 'School, UG, PG, PhD',
                            href: '/scholarships-by-education',
                            color: 'green',
                            count: null
                        },
                        {
                            icon: IndianRupee,
                            title: 'By Income',
                            description: 'Based on family income',
                            href: '/scholarships-by-income',
                            color: 'orange',
                            count: null
                        }
                    ].map((tile, i) => {
                        const Icon = tile.icon;
                        const colorClasses = {
                            blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100',
                            emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100',
                            purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100',
                            indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100',
                            green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-100',
                            orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100'
                        };

                        return (
                            <Link
                                key={i}
                                href={tile.href}
                                className={`group p-8 border-2 rounded-3xl transition-all hover:-translate-y-1 hover:shadow-xl ${colorClasses[tile.color as keyof typeof colorClasses]}`}
                            >
                                <div className="flex flex-col h-full">
                                    <Icon className="h-10 w-10 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">{tile.title}</h3>
                                    <p className="text-sm opacity-80 mb-4 flex-grow">{tile.description}</p>
                                    {tile.count && (
                                        <p className="text-xs font-bold opacity-60">{tile.count} states covered</p>
                                    )}
                                    <ArrowRight className="h-5 w-5 mt-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Eligibility Checker CTA */}
            <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
                            <Target className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 font-serif">
                            Not sure which scholarships you qualify for?
                        </h2>
                        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                            Take our 2-minute eligibility quiz and get a personalized list of scholarships matched to your profile.
                        </p>
                        <Link
                            href="/eligibility-checker"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all transform hover:-translate-y-1 shadow-xl"
                        >
                            Check My Eligibility <ArrowRight className="h-5 w-5" />
                        </Link>
                        <p className="text-xs text-blue-200 mt-4">
                            Based on 12 criteria including income, caste, state, marks, and more
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Scholarships Section */}
            <section className="py-20 container mx-auto px-4 bg-white rounded-3xl">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-4xl font-black mb-3 font-serif tracking-tight text-gray-900">Featured Scholarships</h2>
                        <p className="text-gray-500 text-sm font-medium">Most searched and popular opportunities</p>
                    </div>
                </div>

                {/* Results Header */}
                <ResultsHeader
                    count={sortedFeatured.length}
                    sortBy={sortBy}
                    viewMode={viewMode}
                    onSortChange={setSortBy}
                    onViewChange={setViewMode}
                />

                {/* Scholarship Cards */}
                <div className={
                    viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'
                        : 'space-y-4 mb-12'
                }>
                    {sortedFeatured.map((scholarship) => (
                        <ScholarshipCard
                            key={scholarship.id}
                            scholarship={scholarship}
                            viewMode={viewMode}
                        />
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center">
                    <Link
                        href="/scholarships"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
                    >
                        View All {stats.totalScholarships} Scholarships <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { label: 'Verified Scholarships', value: `${stats.totalScholarships}+` },
                            { label: 'States Covered', value: stats.totalStates },
                            { label: 'Total Funding', value: `₹${Math.round(stats.totalFunding / 10000000)}Cr+` },
                            { label: 'Last Updated', value: 'Jan 2026' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
                                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
