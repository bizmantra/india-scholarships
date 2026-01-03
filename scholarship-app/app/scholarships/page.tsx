import Link from 'next/link';
import { getFeaturedScholarships, getScholarshipStats, getAllStates, getAllCategories, getAllLevels } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { Search, MapPin, GraduationCap, Users, ArrowRight, ShieldCheck, Zap, BookOpen } from 'lucide-react';
import { slugify } from '@/lib/utils';

export const metadata = {
    title: 'Scholarships in India 2026 - Find, Filter & Apply | IndiaScholarships',
    description: 'Explore 130+ verified scholarships in India for 2026. Filter by state, category, education level, and income to find the best scholarships for you.',
};

export default function ScholarshipsPillarPage() {
    const featured = getFeaturedScholarships(6);
    const stats = getScholarshipStats();
    const states = getAllStates().slice(0, 6); // Just show top few for shortcut
    const categories = getAllCategories().slice(0, 6);
    const levels = getAllLevels().slice(0, 6);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="text-2xl font-bold text-blue-700">
                        IndiaScholarships
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link href="/scholarships" className="text-blue-700">Find Scholarships</Link>
                        <Link href="/eligibility-checker" className="hover:text-blue-700">Check Eligibility</Link>
                        <Link href="/state-scholarships" className="hover:text-blue-700">States</Link>
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="bg-blue-700 py-16 text-white">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                            Scholarships in India 2026
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-3xl leading-relaxed">
                            We've verified over <span className="font-bold text-white">{stats.total}</span> scholarship schemes worth crores.
                            Find the one that's right for you in minutes, not days.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur p-4 rounded-xl">
                                <span className="text-3xl font-bold block">{stats.total}</span>
                                <span className="text-sm text-blue-100">Verified Schemes</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur p-4 rounded-xl">
                                <span className="text-3xl font-bold block">{stats.stateCount}</span>
                                <span className="text-sm text-blue-100">States Covered</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur p-4 rounded-xl">
                                <span className="text-3xl font-bold block">{stats.govCount}</span>
                                <span className="text-sm text-blue-100">Gov. Schemes</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur p-4 rounded-xl">
                                <span className="text-3xl font-bold block">{stats.privateCount}</span>
                                <span className="text-sm text-blue-100">Private/CSR</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Discovery Hubs */}
                <section className="py-16 container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* States Hub */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-blue-700">
                                <MapPin className="h-6 w-6" />
                                <h2 className="text-xl font-bold">Scholarships by State</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {states.map(state => (
                                    <Link key={state} href={`/scholarships-in/${slugify(state)}`} className="text-gray-600 hover:text-blue-700 hover:underline">
                                        Scholarships in {state}
                                    </Link>
                                ))}
                                <Link href="/state-scholarships" className="text-blue-700 font-semibold flex items-center gap-1 pt-2">
                                    All 36 States/UTs <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Category Hub */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-blue-700">
                                <Users className="h-6 w-6" />
                                <h2 className="text-xl font-bold">Scholarships by Category</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {categories.map(cat => (
                                    <Link key={cat} href={`/scholarships-for/${slugify(cat)}`} className="text-gray-600 hover:text-blue-700 hover:underline">
                                        Scholarships for {cat}
                                    </Link>
                                ))}
                                <Link href="/scholarships-by-category" className="text-blue-700 font-semibold flex items-center gap-1 pt-2">
                                    All Categories <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Level Hub */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-blue-700">
                                <GraduationCap className="h-6 w-6" />
                                <h2 className="text-xl font-bold">Scholarships by Level</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {levels.map(level => {
                                    const slug = slugify(level);
                                    return (
                                        <Link key={level} href={`/scholarships-level/${slug}`} className="text-gray-600 hover:text-blue-700 hover:underline">
                                            Scholarships for {level}
                                        </Link>
                                    );
                                })}
                                <Link href="/scholarships-by-education" className="text-blue-700 font-semibold flex items-center gap-1 pt-2">
                                    All Education Levels <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Section */}
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">High Impact Scholarships</h2>
                                <p className="text-gray-600">Selected based on amount, accessibility, and reliability.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featured.map(s => (
                                <ScholarshipCard key={s.id} scholarship={s} viewMode="grid" />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Us / Trust Section */}
                <section className="py-20 container mx-auto px-4 max-w-5xl">
                    <h2 className="text-3xl font-bold text-center mb-16 underline decoration-blue-700 underline-offset-8">
                        Why IndiaScholarships?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="h-8 w-8 text-blue-700" />
                            </div>
                            <h3 className="text-xl font-bold">100% Human Verified</h3>
                            <p className="text-gray-600">No AI-hallucinations. Every scheme is checked by our research team against official portals.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Zap className="h-8 w-8 text-blue-700" />
                            </div>
                            <h3 className="text-xl font-bold">Zero-Noise Discovery</h3>
                            <p className="text-gray-600">Smart filters remove the clutter. See only the scholarships you actually qualify for.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="h-8 w-8 text-blue-700" />
                            </div>
                            <h3 className="text-xl font-bold">Complete Guidance</h3>
                            <p className="text-gray-600">From document checklists to portal login guides, we walk you through the entire process.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t bg-gray-50 py-12">
                <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                    <p>© 2025 IndiaScholarships. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
