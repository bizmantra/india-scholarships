import Link from 'next/link';
import { getFeaturedScholarships, getScholarshipStats, getAllStates, getAllCategories, CANONICAL_LEVELS } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { MapPin, GraduationCap, Users, ArrowRight, ShieldCheck, Zap, BookOpen } from 'lucide-react';
import { slugify } from '@/lib/utils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Scholarships in India 2026 - Find, Filter & Apply | IndiaScholarships',
    description: 'Explore verified scholarships in India for 2026. Filter by state, category, education level, and income to find the best scholarships for you.',
};

export default function ScholarshipsPillarPage() {
    const featured = getFeaturedScholarships(6);
    const stats = getScholarshipStats();

    // Get top discovery items
    const states = getAllStates().slice(0, 6);
    const categories = ['Minority', 'SC', 'ST', 'OBC', 'General (EWS)', 'Students with Disabilities'];
    const levels = Object.entries(CANONICAL_LEVELS).slice(0, 6);

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="bg-blue-700 py-16 md:py-24 text-white">
                    <div className="container mx-auto px-4 max-w-5xl text-center md:text-left">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                            Scholarships in <span className="text-blue-200">India 2026</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl leading-relaxed mx-auto md:mx-0">
                            We've verified over <span className="font-bold text-white">{stats.total}</span> scholarship schemes worth crores.
                            Find the one that's right for you in minutes, not days.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                                <span className="text-4xl font-extrabold block mb-1">{stats.total}</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Verified Schemes</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                                <span className="text-4xl font-extrabold block mb-1">{stats.stateCount}</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">States Covered</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                                <span className="text-4xl font-extrabold block mb-1">{stats.govCount}</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Gov. Schemes</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                                <span className="text-4xl font-extrabold block mb-1">{stats.privateCount}</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Private/CSR</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Discovery Centers */}
                <section className="py-24 container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* States Hub */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3 text-blue-700 mb-8">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <MapPin className="h-7 w-7" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">By State</h2>
                            </div>
                            <div className="flex flex-col gap-3 flex-1">
                                {states.map(state => (
                                    <Link key={state} href={`/scholarships-in/${slugify(state)}`} className="px-5 py-4 bg-gray-50 rounded-2xl font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100">
                                        Scholarships in {state}
                                    </Link>
                                ))}
                                <Link href="/state-scholarships" className="mt-4 px-5 py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-between group hover:border-blue-300 transition-all">
                                    <span className="font-bold text-gray-900">View All 36 States</span>
                                    <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Category Hub */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3 text-blue-700 mb-8">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <Users className="h-7 w-7" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">By Category</h2>
                            </div>
                            <div className="flex flex-col gap-3 flex-1">
                                {categories.map(cat => (
                                    <Link key={cat} href={`/scholarships-for/${slugify(cat)}`} className="px-5 py-4 bg-gray-50 rounded-2xl font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100">
                                        For {cat} Students
                                    </Link>
                                ))}
                                <Link href="/scholarships-by-category" className="mt-4 px-5 py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-between group hover:border-blue-300 transition-all">
                                    <span className="font-bold text-gray-900">All Categories</span>
                                    <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Level Hub */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3 text-blue-700 mb-8">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <GraduationCap className="h-7 w-7" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">By Level</h2>
                            </div>
                            <div className="flex flex-col gap-3 flex-1">
                                {levels.map(([slug, info]) => (
                                    <Link key={slug} href={`/scholarships-level/${slug}`} className="px-5 py-4 bg-gray-50 rounded-2xl font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100 flex items-center gap-3">
                                        <span>{info.icon}</span>
                                        {info.label}
                                    </Link>
                                ))}
                                <Link href="/scholarships-by-education" className="mt-4 px-5 py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-between group hover:border-blue-300 transition-all">
                                    <span className="font-bold text-gray-900">Top-to-Bottom Levels</span>
                                    <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Section */}
                <section className="py-24 bg-gray-50">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">High Impact Scholarships</h2>
                            <p className="text-xl text-gray-600">Selected based on amount, accessibility, and reliability.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featured.map(s => (
                                <ScholarshipCard key={s.id} scholarship={s} viewMode="grid" />
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link href="/eligibility-checker" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-700 text-white font-bold rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-100">
                                Find More Scholarships <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-24 container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div className="text-center">
                            <div className="bg-blue-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                <ShieldCheck className="h-10 w-10 text-blue-700" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">100% Verified</h3>
                            <p className="text-gray-600 leading-relaxed">No AI automated links. Every scheme is checked by our research team against official government gazettes.</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                <Zap className="h-10 w-10 text-blue-700" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Zero Junk</h3>
                            <p className="text-gray-600 leading-relaxed">Smart filters exclude predatory ads and expired links. You see only active, relevant funding opportunities.</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                                <BookOpen className="h-10 w-10 text-blue-700" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Deep Guides</h3>
                            <p className="text-gray-600 leading-relaxed">From NSP login steps to document checklists, we provide the full context needed for a successful application.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
