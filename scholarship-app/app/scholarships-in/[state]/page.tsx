import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByState, getAllStates } from '@/lib/db';
import ScholarshipsList from '@/app/components/ScholarshipsList';
import { slugify, formatDeadlineDate } from '@/lib/utils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { getNewsForState } from '@/lib/news';
import { Bell } from 'lucide-react';
import { getPillarForState } from '@/lib/pillars';

const SUBPAGE_METRICS = {
    'eligibility': 'Eligibility',
    'income-limit': 'Income Limit',
    'documents-required': 'Documents',
    'last-date': 'Last Date',
    'selection-process': 'Selection',
    'apply-online': 'How to Apply',
    'renewal-process': 'Renewal'
};

// Generate static params for all states
export async function generateStaticParams() {
    const states = await getAllStates();
    return states.map((state: string) => ({
        state: slugify(state),
    }));
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
    try {
        const { state: stateSlug } = await params;
        const states = await getAllStates();
        const originalState = states.find((s: string) => slugify(s) === stateSlug) || stateSlug;
        const year = new Date().getFullYear();

        let titleStr = `${originalState} Scholarships - Complete List & Eligibility`;
        if (stateSlug === 'odisha') {
            titleStr = `Odisha Scholarships ${year}: 20+ Schemes | Post Matric, Krishi Vidya & Apply`;
        } else if (stateSlug === 'west-bengal') {
            titleStr = `West Bengal Scholarships ${year}: Nabanna, SVMCM, Aikyashree | Apply Online`;
        }

        return {
            title: titleStr,
            description: `Find all scholarships in ${originalState}. Complete list with eligibility criteria, amounts, deadlines, and application process for ${originalState} students.`,
            alternates: {
                canonical: `https://www.indiascholarships.in/scholarships-in/${stateSlug}`,
            }
        };

    } catch (error) {
        return { title: 'Scholarships - Not Found' };
    }
}

export default async function StateHubPage({ params }: { params: Promise<{ state: string }> }) {
    try {
        const { state: stateSlug } = await params;

        if (!stateSlug) return notFound();

        // Resolve original state name
        const states = await getAllStates();
        const stateName = states.find((s: string) => slugify(s) === stateSlug);

        if (!stateName) return redirect('/state-scholarships');

        // Get scholarships for this state
        const scholarships = await getScholarshipsByState(stateName);
        const stateNews = getNewsForState(stateName);
        const pillar = getPillarForState(stateName);

        if (scholarships.length === 0) {
            return redirect('/state-scholarships');
        }

        // Compute how many scholarships have a future (or unknown) deadline.
        // Used for the 'Open Now' stat card — more accurate than a hardcoded freshness badge.
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const openCount = scholarships.filter((s: any) => {
            if (!s.deadline) return true; // no deadline = assume open
            const d = new Date(s.deadline);
            return isNaN(d.getTime()) || d >= today; // unparseable = assume open
        }).length;

        return (
            <div className="min-h-screen bg-white">
                <Header />

                <main className="max-w-5xl mx-auto px-4 py-8">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                        <Link href="/" className="hover:text-google-blue">Home</Link>
                        <span>/</span>
                        <Link href="/state-scholarships" className="hover:text-google-blue">States</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{stateName}</span>
                    </nav>

                    {/* Mobile Navigation Tabs (sticky at top-0 on mobile) */}
                    <div id="overview" className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 overflow-x-auto scrollbar-none flex gap-2 border-b border-gray-200/80 shadow-xs mb-6 scroll-mt-20">
                        <a 
                            href="#overview"
                            className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-blue-600 text-white shadow-sm whitespace-nowrap"
                        >
                            📊 Overview
                        </a>
                        <a 
                            href="#scholarship-list"
                            className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 whitespace-nowrap transition-all"
                        >
                            🎓 All Schemes
                        </a>
                        <a 
                            href="#comparison-matrix"
                            className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 whitespace-nowrap transition-all"
                        >
                            📋 Comparison Table
                        </a>
                        <a 
                            href="#eligibility"
                            className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 whitespace-nowrap transition-all"
                        >
                            🎯 Eligibility
                        </a>
                        <a 
                            href="#documents"
                            className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 whitespace-nowrap transition-all"
                        >
                            📄 Documents
                        </a>
                        <a 
                            href="#deadlines"
                            className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 whitespace-nowrap transition-all"
                        >
                            📅 Deadlines
                        </a>
                        {stateNews.length > 0 && (
                            <a 
                                href="#state-news"
                                className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 whitespace-nowrap transition-all"
                            >
                                🔔 {stateName} News
                            </a>
                        )}
                    </div>

                    {/* Page Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            Scholarships in {stateName} 2026
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                            Find the latest and most comprehensive list of {stateName} state scholarships.
                            Currently, we have <a href="#scholarship-list" className="font-bold text-google-blue hover:underline">{scholarships.length} verified scholarships</a> available for
                            students from {stateName}.
                            {pillar && (
                                <>
                                    {' '}New to how {stateName}'s scholarship system works?{' '}
                                    <Link href={`/guides/${pillar.slug}`} className="font-bold text-google-blue hover:underline">
                                        Read our complete guide
                                    </Link>{' '}
                                    first.
                                </>
                            )}
                        </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                            <h3 className="text-google-blue font-bold mb-1">Total Available</h3>
                            <p className="text-3xl font-extrabold text-blue-900">{scholarships.length}</p>
                            <p className="text-xs text-blue-600 mt-2">Verified schemes</p>
                        </div>
                        <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100">
                            <h3 className="text-green-700 font-bold mb-1">Max Amount</h3>
                            <p className="text-3xl font-extrabold text-green-900">
                                ₹{Math.max(...scholarships.map((s: any) => s.amount_annual || 0)).toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600 mt-2">Per academic year</p>
                        </div>
                        <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
                            <h3 className="text-purple-700 font-bold mb-1">Open Now</h3>
                            <p className="text-3xl font-extrabold text-purple-900">{openCount}</p>
                            <p className="text-xs text-purple-600 mt-2">Active schemes</p>
                        </div>
                    </div>

                    {/* Scholarships List — moved above the comparison table/eligibility cards
                        so students reach the actual scholarships before a long detour through
                        supporting reference material. */}
                    <div id="scholarship-list" className="mb-20 scroll-mt-24">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Active {stateName} Scholarships</h2>
                        <ScholarshipsList scholarships={scholarships} showCategoryFilters={true} />
                    </div>

                    {/* Master Comparison Table Section */}
                    <div id="comparison-matrix" className="mb-16 scroll-mt-24">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                                    {stateName} Scholarships Comparison Matrix
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Side-by-side overview of amounts, eligibility caps, and application deadlines.</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <th className="p-4 pl-6">Scholarship Name</th>
                                            <th className="p-4">Level / Category</th>
                                            <th className="p-4">Income Cap</th>
                                            <th className="p-4">Annual Amount</th>
                                            <th className="p-4 pr-6">Deadline</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        {scholarships.map((s: any) => (
                                            <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="p-4 pl-6 font-bold text-gray-900 max-w-xs">
                                                    <Link href={`/scholarships/${s.slug}`} className="hover:text-google-blue transition-colors">
                                                        {s.title}
                                                    </Link>
                                                </td>
                                                <td className="p-4 text-xs font-medium text-gray-600">
                                                    {s.level || 'All Levels'} • {s.caste ? s.caste.join('/') : 'All Categories'}
                                                </td>
                                                <td className="p-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                                                    {s.income_limit ? `≤ ₹${(s.income_limit / 100000).toFixed(1)}L/yr` : 'No Income Bar'}
                                                </td>
                                                <td className="p-4 font-bold text-emerald-700 whitespace-nowrap">
                                                    {s.amount_annual > 0 ? `₹${s.amount_annual.toLocaleString()}` : 'Variable'}
                                                </td>
                                                <td className="p-4 pr-6 text-xs text-gray-500 whitespace-nowrap">
                                                    {formatDeadlineDate(s.deadline, { day: 'numeric', month: 'short' }, 'Open Now')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Section Anchors for Eligibility, Documents, Deadlines */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        <div id="eligibility" className="p-6 bg-blue-50/40 border border-blue-100 rounded-3xl scroll-mt-24">
                            <div id="income-limit" className="scroll-mt-24"></div>
                            <h3 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
                                🎯 Eligibility Rules & Income Caps
                            </h3>
                            <p className="text-xs text-blue-800 leading-relaxed">
                                Applicants must be permanent residents (domicile) of {stateName} enrolled in recognized institutions. Annual family income caps apply for reservation categories.
                            </p>
                        </div>
                        <div id="documents" className="p-6 bg-green-50/40 border border-green-100 rounded-3xl scroll-mt-24">
                            <div id="documents-required" className="scroll-mt-24"></div>
                            <h3 className="text-base font-bold text-green-900 mb-2 flex items-center gap-2">
                                📄 Required Documents
                            </h3>
                            <p className="text-xs text-green-800 leading-relaxed">
                                Aadhaar Card (linked to bank for DBT), {stateName} Domicile Certificate, Income Certificate issued by Tehsildar, Caste certificate & marksheets.
                            </p>
                        </div>
                        <div id="deadlines" className="p-6 bg-amber-50/40 border border-amber-100 rounded-3xl scroll-mt-24">
                            <div id="last-date" className="scroll-mt-24"></div>
                            <div id="apply-online" className="scroll-mt-24"></div>
                            <div id="selection-process" className="scroll-mt-24"></div>
                            <div id="renewal-process" className="scroll-mt-24"></div>
                            <h3 className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2">
                                📅 Application Timelines & Apply Guide
                            </h3>
                            <p className="text-xs text-amber-800 leading-relaxed">
                                Pre-Matric schemes generally close around August–September. Post-Matric and Degree schemes remain open through October–November.
                            </p>
                        </div>
                    </div>

                    {stateNews.length > 0 && (
                        <div id="state-news" className="mb-12 bg-red-50/40 border border-red-100 rounded-3xl p-6 scroll-mt-24">
                            <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Bell className="w-4.5 h-4.5 animate-pulse" />
                                <span>Recent {stateName} Updates & Alerts</span>
                            </h2>
                            <div className="space-y-4">
                                {stateNews.map((news: any) => (
                                    <Link
                                        key={news.slug}
                                        href={`/news/${news.slug}`}
                                        className="block p-4 bg-white rounded-2xl border border-gray-150 hover:border-red-400 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs"
                                    >
                                        <div>
                                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                                                {news.tag}
                                            </span>
                                            <h3 className="text-sm font-bold text-gray-900 mt-2 leading-snug">{news.title}</h3>
                                        </div>
                                        <span className="text-xs font-bold text-red-600 shrink-0 flex items-center gap-0.5 hover:underline">
                                            Read Update →
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FAQ Section */}
                    <div className="bg-gray-50 rounded-[2.5rem] p-10 mb-20 border border-gray-100">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Frequently Asked Questions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Who can apply for {stateName} state scholarships?</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Generally, these scholarships are for students who are permanent residents (domicile) of {stateName}.
                                    Some schemes may also require you to be studying within the state.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">What is the common deadline?</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Deadlines vary by scheme. Most government scholarships open between July and September.
                                    Always check the "Last Verified" date on our listing.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Which documents are mandatory?</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Mandatory documents usually include: 1. Aadhaar Card, 2. {stateName} Domicile Certificate,
                                    3. Income Certificate, and 4. Previous year marksheets.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">How to apply?</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Click on the scholarship to view the official portal link. Most {stateName} scholarships are applied through state portals or NSP.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Related Links */}
                    <div className="mt-16 pt-10 border-t border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Categories</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/state-scholarships" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-google-blue">
                                ← All States
                            </Link>
                            <Link href="/scholarships-by-category" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-google-blue text-center">
                                By Category →
                            </Link>
                            <Link href="/scholarships-by-education" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-google-blue text-center">
                                By Education →
                            </Link>
                            <Link href="/scholarships" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-google-blue text-center">
                                Search All →
                            </Link>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        );
    } catch (error) {
        return redirect('/state-scholarships');
    }
}
