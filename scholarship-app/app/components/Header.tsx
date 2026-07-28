'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronDown, Menu, X, Search } from 'lucide-react';
import SearchModal from './SearchModal';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    const [showScholarshipsDropdown, setShowScholarshipsDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setSearchQuery(params.get('q') || '');
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/scholarships?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push(`/scholarships`);
        }
        setShowMobileMenu(false);
    };

    return (
        <header className="relative z-50 w-full border-b border-gray-100 bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                
                {/* Brand Logo & Text */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                        <Image
                            src="/logo/logo-is.png"
                            alt="IndiaScholarships"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <span className="text-xl font-black tracking-tight text-google-blue font-serif group-hover:text-brand-dark transition-colors">
                        IndiaScholarships
                    </span>
                </Link>

                {/* Centered Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search scholarships, courses, states..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-5 pr-12 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-google-blue focus:ring-1 focus:ring-google-blue bg-surface-gray hover:bg-white transition-all"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1 bottom-1 px-4 bg-brand hover:bg-brand-dark text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </form>
                </div>

                {/* Right side navigation Actions */}
                <div className="flex items-center gap-4">
                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-gray-700">
                        {/* Find Scholarships Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setShowScholarshipsDropdown(true)}
                            onMouseLeave={() => setShowScholarshipsDropdown(false)}
                        >
                            <button
                                className="flex items-center gap-1 transition-colors hover:text-google-blue"
                                onClick={() => setShowScholarshipsDropdown(!showScholarshipsDropdown)}
                            >
                                Find Scholarships
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            {showScholarshipsDropdown && (
                                <div className="absolute top-full -left-64 pt-2 w-[40rem] z-50">
                                    <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-6 grid grid-cols-3 gap-6">
                                        {/* Col 1: Eligibility Hubs */}
                                        <div>
                                            <span className="block text-[10px] font-black uppercase tracking-wider text-google-blue mb-3">Eligibility Hubs</span>
                                            <div className="flex flex-col gap-1">
                                                <Link href="/state-scholarships" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">By State Hubs</Link>
                                                <Link href="/guides" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">State Portal Guides</Link>
                                                <Link href="/scholarships-by-category" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">By Category / Caste</Link>
                                                <Link href="/scholarships-by-education" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">By Education Level</Link>
                                                <Link href="/scholarships-by-income" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">By Income Limit</Link>
                                                <Link href="/scholarships-by-university" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">By University</Link>
                                                <Link href="/scholarships-by-course" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">By Course</Link>
                                                <Link href="/scholarships/international" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">Study Abroad</Link>
                                                <Link href="/guides" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-brand hover:bg-brand-soft transition-colors">All Scholarship Guides →</Link>
                                            </div>
                                        </div>
                                        {/* Col 2: Popular Categories */}
                                        <div>
                                            <span className="block text-[10px] font-black uppercase tracking-wider text-google-green mb-3">Popular Segments</span>
                                            <div className="flex flex-col gap-1">
                                                <Link href="/scholarships-for/girls" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">Scholarships for Girls</Link>
                                                <Link href="/scholarships-for/sc-st" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">SC / ST Categories</Link>
                                                <Link href="/scholarships-for/minority" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">Minority Students</Link>
                                                <Link href="/scholarships-for/general" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">General / EWS Schemes</Link>
                                                <Link href="/scholarships-for/sports" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">Sports & Athletes</Link>
                                                <Link href="/scholarships-for/pwd" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">Persons with Disabilities</Link>
                                            </div>
                                        </div>
                                         {/* Col 3: Curated & Provider Hubs */}
                                        <div>
                                            <span className="block text-[10px] font-black uppercase tracking-wider text-google-red mb-3">Curated Collections</span>
                                            <div className="flex flex-col gap-1">
                                                <Link href="/scholarships/trending" className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-800 hover:bg-accent-soft hover:text-accent transition-colors flex items-center gap-1.5">
                                                    🔥 Trending Right Now
                                                </Link>
                                                <Link href="/scholarships/deadlines" className="px-3 py-1.5 rounded-xl text-xs font-bold text-google-red hover:bg-urgent-soft transition-colors flex items-center gap-1.5">
                                                    ⏰ Closing Soon
                                                </Link>
                                                <Link href="/scholarships/recently-added" className="px-3 py-1.5 rounded-xl text-xs font-bold text-google-blue hover:bg-brand-soft transition-colors flex items-center gap-1.5">
                                                    🕒 Newly Verified
                                                </Link>
                                                <Link href="/guides/india-scholarships-statistics-2025-2026" className="px-3 py-1.5 rounded-xl text-xs font-bold text-google-green hover:bg-success-soft transition-colors flex items-center gap-1.5">
                                                    📊 Stats Report (2025-26)
                                                </Link>
                                                <div className="my-1 border-t border-gray-100"></div>
                                                <Link href="/government-scholarships" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">Government Portals</Link>
                                                <Link href="/private-scholarships" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">Private Scholarships</Link>
                                                <Link href="/corporate-scholarships" className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-surface-gray hover:text-google-blue transition-colors">Corporate CSR Scholarships</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Link href="/scholarships/trending" className="transition-colors hover:text-google-blue">
                            Trending
                        </Link>
                        <Link href="/tools" className="transition-colors hover:text-google-blue">
                            Tools
                        </Link>
                        <Link href="/guides" className="transition-colors hover:text-google-blue">
                            Guides
                        </Link>
                        <Link href="/news" className="transition-colors hover:text-google-blue">
                            News
                        </Link>
                        <Link href="/about" className="transition-colors hover:text-google-blue">
                            About
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 text-gray-700 hover:text-google-blue transition-colors"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        aria-label="Toggle menu"
                    >
                        {showMobileMenu ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu Container */}
            {showMobileMenu && (
                <div className="lg:hidden border-b bg-white p-4 space-y-6 animate-in slide-in-from-top duration-200 shadow-xl max-h-[85vh] overflow-y-auto">
                    
                    {/* Mobile Search Input */}
                    <form onSubmit={handleSearch} className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search scholarships..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-google-blue bg-surface-gray"
                        />
                        <button type="submit" className="absolute right-3 top-2.5 text-google-blue">
                            <Search className="h-5 w-5" />
                        </button>
                    </form>

                    {/* 1. Quick Actions Grid */}
                    <div className="space-y-2">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Curated Collections</span>
                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                href="/scholarships/trending"
                                onClick={() => setShowMobileMenu(false)}
                                className="flex items-center justify-center gap-1.5 p-3 bg-accent-soft border border-transparent rounded-2xl text-xs font-bold text-accent hover:opacity-80 transition-opacity"
                            >
                                🔥 Trending
                            </Link>
                            <Link
                                href="/scholarships/deadlines"
                                onClick={() => setShowMobileMenu(false)}
                                className="flex items-center justify-center gap-1.5 p-3 bg-urgent-soft border border-transparent rounded-2xl text-xs font-bold text-urgent hover:opacity-80 transition-opacity"
                            >
                                ⏰ Deadlines
                            </Link>
                            <Link
                                href="/scholarships/recently-added"
                                onClick={() => setShowMobileMenu(false)}
                                className="flex items-center justify-center gap-1.5 p-3 bg-brand-soft border border-transparent rounded-2xl text-xs font-bold text-brand hover:opacity-80 transition-opacity"
                            >
                                🕒 New Arrivals
                            </Link>
                            <Link
                                href="/scholarships"
                                onClick={() => setShowMobileMenu(false)}
                                className="flex items-center justify-center gap-1.5 p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                🔍 All Schemes
                            </Link>
                        </div>
                    </div>

                        {/* 1b. Scholarship Guides */}
                        <Link
                            href="/guides"
                            onClick={() => setShowMobileMenu(false)}
                            className="flex items-center justify-between gap-3 p-3.5 bg-brand-soft border border-transparent rounded-2xl text-xs font-bold text-brand hover:opacity-80 transition-opacity"
                        >
                            <span>📘 Scholarship Guides — how state & category systems work</span>
                        </Link>

                        {/* 2. Browse Category Chips */}
                        <div className="space-y-2">
                            <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Popular Segments</span>
                            <div className="flex flex-wrap gap-1.5">
                                <Link
                                    href="/scholarships-for/girls"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
                                >
                                    👧 Girls
                                </Link>
                                <Link
                                    href="/scholarships-for/sc-st"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
                                >
                                    🌾 SC / ST
                                </Link>
                                <Link
                                    href="/scholarships-for/minority"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
                                >
                                    💼 OBC / Minority
                                </Link>
                                <Link
                                    href="/scholarships-for/general"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
                                >
                                    🎓 General / EWS
                                </Link>
                                <Link
                                    href="/scholarships-by-university"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
                                >
                                    🏫 By University
                                </Link>
                                <Link
                                    href="/scholarships-by-course"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
                                >
                                    📚 By Course
                                </Link>
                                <Link
                                    href="/scholarships-by-income"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
                                >
                                    💰 By Income
                                </Link>
                                <Link
                                    href="/scholarships/international"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
                                >
                                    ✈️ Study Abroad
                                </Link>
                                <Link
                                    href="/scholarships-for/sports"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
                                >
                                    🏅 Sports
                                </Link>
                                <Link
                                    href="/scholarships-for/pwd"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
                                >
                                    ♿ PWD
                                </Link>
                            </div>
                        </div>

                        {/* 3. Popular States */}
                        <div className="space-y-2">
                            <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Popular States</span>
                            <div className="flex flex-wrap gap-1.5">
                                <Link
                                    href="/scholarships-in/uttar-pradesh"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-brand-soft hover:opacity-80 text-brand border border-transparent rounded-full text-xs font-semibold transition-opacity"
                                >
                                    UP
                                </Link>
                                <Link
                                    href="/scholarships-in/west-bengal"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-brand-soft hover:opacity-80 text-brand border border-transparent rounded-full text-xs font-semibold transition-opacity"
                                >
                                    West Bengal
                                </Link>
                                <Link
                                    href="/scholarships-in/karnataka"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-brand-soft hover:opacity-80 text-brand border border-transparent rounded-full text-xs font-semibold transition-opacity"
                                >
                                    Karnataka
                                </Link>
                                <Link
                                    href="/scholarships-in/maharashtra"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-brand-soft hover:opacity-80 text-brand border border-transparent rounded-full text-xs font-semibold transition-opacity"
                                >
                                    Maharashtra
                                </Link>
                                <Link
                                    href="/state-scholarships"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="px-3.5 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-full text-xs font-bold transition-colors"
                                >
                                    View All States →
                                </Link>
                            </div>
                        </div>

                        {/* 4. Help Center & Guides */}
                        <div className="space-y-2.5 pt-4 border-t border-gray-100">
                            <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Help Center & Guides</span>
                            <div className="flex flex-col gap-2.5">
                                <Link
                                    href="/guides/nsp"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="text-xs font-semibold text-gray-700 hover:text-google-blue transition-colors flex items-center gap-1.5"
                                >
                                    • National Scholarship Portal (NSP) Guide
                                </Link>
                                <Link
                                    href="/guides/ssp"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="text-xs font-semibold text-gray-700 hover:text-google-blue transition-colors flex items-center gap-1.5"
                                >
                                    • SSP Karnataka Portal Guide
                                </Link>
                                <Link
                                    href="/guides/tracking"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="text-xs font-semibold text-gray-700 hover:text-google-blue transition-colors flex items-center gap-1.5"
                                >
                                    • Track Application Payment Status Guide
                                </Link>
                                <Link
                                    href="/news"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="text-xs font-semibold text-gray-700 hover:text-google-blue transition-colors flex items-center gap-1.5"
                                >
                                    • Live Scholarship News & Updates
                                </Link>
                                <Link
                                    href="/guides"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="text-xs font-semibold text-gray-700 hover:text-google-blue transition-colors flex items-center gap-1.5"
                                >
                                    • Step-by-Step Help Guides
                                </Link>
                                <Link
                                    href="/about"
                                    onClick={() => setShowMobileMenu(false)}
                                    className="text-xs font-semibold text-gray-500 hover:text-google-blue transition-colors pt-2 border-t border-gray-50"
                                >
                                    About IndiaScholarships
                                </Link>
                            </div>
                        </div>
                </div>
            )}

            {/* Global Search Dialog Modal temporarily disabled (search rolled back) */}
            {/* <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} /> */}
        </header>
    );
}
