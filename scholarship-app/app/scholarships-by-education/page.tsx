import Link from 'next/link';
import { getEducationLevelCounts } from '@/lib/db';
import { CANONICAL_LEVELS } from '@/lib/utils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { GraduationCap, Sparkles, ArrowRight, BookOpen, Laptop, Stethoscope, Briefcase, Trophy, Globe } from 'lucide-react';

export const metadata = {
    title: 'Scholarships by Education Level 2026 - School, UG, PG, Diploma, PhD | IndiaScholarships',
    description: 'Find scholarships by academic qualification stage. Browse Pre-Matric school, Post-Matric 11-12, Diploma, Engineering, Medical, Masters, and PhD grants.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/scholarships-by-education',
    }
};

const STREAM_SHORTCUTS = [
    { label: 'Engineering / B.Tech', icon: '💻', href: '/scholarships-by-course/engineering' },
    { label: 'Medical / MBBS', icon: '🩺', href: '/scholarships-by-course/medical' },
    { label: 'Commerce & CA', icon: '📊', href: '/scholarships-by-course/commerce' },
    { label: 'Study Abroad (Global)', icon: '🌐', href: '/scholarships/international' },
    { label: 'Sports & Athletics', icon: '🏆', href: '/scholarships-for/sports' },
    { label: 'MBA / Management', icon: '💼', href: '/scholarships-for/mba' },
];

export default async function ScholarshipsByEducationPage() {
    const countsMap = await getEducationLevelCounts();
    const levels = Object.entries(CANONICAL_LEVELS);

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Header */}
            <section className="bg-gradient-to-b from-blue-50/50 via-white to-white py-12 px-4 border-b border-gray-150 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100/60 text-blue-800 text-xs font-bold mb-4 border border-blue-200/50">
                        <Sparkles className="h-3.5 w-3.5 text-blue-700 animate-pulse" />
                        Academic Stage Directory • School to Doctoral Level
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 font-serif leading-[1.1]">
                        Scholarships by Education Level <br className="hidden sm:inline" />
                        <span className="text-google-blue">Academic Stage Directory</span>
                    </h1>

                    <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
                        Discover verified pre-matric, post-matric, polytechnic diploma, undergraduate, and research fellowships matched to your current class or degree.
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-4 py-12">
                
                {/* Course Stream Quick Shortcuts */}
                <div className="mb-14 bg-gray-50/70 p-6 sm:p-8 rounded-3xl border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-google-blue" />
                        Featured Course & Professional Stream Shortcuts
                    </h2>
                    <p className="text-xs text-gray-500 mb-5">Browse specialized funding for professional degrees, technical diplomas, and international study.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {STREAM_SHORTCUTS.map((st, i) => (
                            <Link
                                key={i}
                                href={st.href}
                                className="p-3.5 bg-white border border-gray-200 hover:border-google-blue hover:shadow-xs rounded-2xl transition-all text-center flex flex-col items-center justify-between"
                            >
                                <span className="text-2xl mb-1">{st.icon}</span>
                                <span className="text-xs font-bold text-gray-800 leading-tight">{st.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Academic Levels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {levels.map(([slug, info]) => {
                        const count = countsMap[slug] || 0;
                        return (
                            <div
                                key={slug}
                                className="group p-6 bg-white border border-gray-200 rounded-3xl hover:border-google-blue hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-4xl">{info.icon}</span>
                                        <span className="px-3 py-1 bg-blue-50 text-google-blue text-xs font-black rounded-full border border-blue-100">
                                            {count > 0 ? `${count} Schemes` : 'Verified Schemes'}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-google-blue transition-colors mb-2 font-serif">
                                        {info.label}
                                    </h3>

                                    <p className="text-xs text-gray-600 leading-relaxed mb-6">
                                        {info.description}
                                    </p>
                                </div>

                                <Link
                                    href={`/scholarships-level/${slug}`}
                                    className="w-full py-2.5 bg-gray-50 hover:bg-google-blue hover:text-white border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                    <span>Browse {info.label} Grants</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        );
                    })}
                </div>

            </main>

            <Footer />
        </div>
    );
}
