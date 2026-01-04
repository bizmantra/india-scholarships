import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByCategory, getAllCategories } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { slugify } from '@/lib/utils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// Generate static params for all categories
export async function generateStaticParams() {
    const categories = getAllCategories();
    return categories.map((category) => ({
        category: slugify(category),
    }));
}

// Custom mapping for clean display names
const CATEGORY_NAME_MAP: Record<string, string> = {
    'all categories (sc/st/obc/minority/general) - must possess valid unique disability id (udid) card issued by department for empowerment of persons with disabilities': 'Students with Disabilities',
    'general category - economically weaker section (ews). includes: children of defense personnel (sc/st parents in army/navy/airforce': 'General (EWS)',
    'government of india.': 'Central Government Schemes',
    'jco/or/lower ranks - children of unorganized workers (auto drivers)': 'Defense & Unorganized Workers',
    'semi-nomadic tribes - caste must be in obc list notified by government of india or state government.': 'Semi-Nomadic Tribes',
    'students with disabilities (persons with disabilities - pwd) with valid udid': 'Students with Disabilities',
    'etc.). general category students with low income. brahmin community students (separate scheme under brahmin development board - verify).': 'General (Brahmin)',
    'minority communities: muslim': 'Minority Communities: Muslim',
    'sc': 'Scheduled Caste (SC)',
    'st': 'Scheduled Tribe (ST)',
    'obc': 'Other Backward Classes (OBC)',
    'ebc': 'Economically Backward Classes (EBC)',
    'minority': 'Minority Communities',
};

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
    try {
        const { category: categorySlug } = await params;
        const categories = getAllCategories();
        const firstMatch = categories.find(c => slugify(c) === categorySlug) || categorySlug;
        const displayName = CATEGORY_NAME_MAP[firstMatch.toLowerCase()] || firstMatch;

        return {
            title: `${displayName} Scholarships - Complete List & Eligibility`,
            description: `Browse all scholarships for ${displayName} category in India. Find eligibility criteria, scholarship amounts, and application deadlines for 2026.`,
        };
    } catch (error) {
        return { title: 'Scholarships - Not Found' };
    }
}

export default async function CategoryHubPage({ params }: { params: Promise<{ category: string }> }) {
    try {
        const { category: categorySlug } = await params;

        // Resolve the original category names from the slug (could be multiple messy strings)
        const categories = getAllCategories();
        const matchingOriginalCategories = categories.filter(c => slugify(c) === categorySlug);

        if (matchingOriginalCategories.length === 0) {
            notFound();
        }

        // Use the first one for display mapping
        const firstMatch = matchingOriginalCategories[0];
        const displayName = CATEGORY_NAME_MAP[firstMatch.toLowerCase()] || firstMatch;

        // Get scholarships for all matching original category strings
        const allScholarshipsFound = matchingOriginalCategories.flatMap(category =>
            getScholarshipsByCategory(category)
        );

        // Deduplicate scholarships by ID
        const scholarships = Array.from(new Map(allScholarshipsFound.map(s => [s.id, s])).values());

        if (scholarships.length === 0) {
            notFound();
        }

        return (
            <div className="min-h-screen bg-white">
                <Header />

                <main className="max-w-5xl mx-auto px-4 py-8">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                        <Link href="/" className="hover:text-blue-700">Home</Link>
                        <span>/</span>
                        <Link href="/scholarships-by-category" className="hover:text-blue-700">Categories</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{displayName}</span>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            {displayName} Scholarships 2026
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                            Explore dedicated educational funding opportunities for <span className="font-semibold text-blue-700">{displayName}</span> students across India.
                            Currently, we have <span className="font-bold text-blue-700">{scholarships.length} verified schemes</span> tailored for your eligibility.
                        </p>
                    </div>

                    {/* Info Block */}
                    <div className="bg-blue-50/50 rounded-[2rem] p-10 mb-16 border border-blue-100 flex flex-col md:flex-row gap-10 items-center">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why {displayName} Scholarships?</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                These scholarships are designed to ensure equitable access to education for students from {displayName} backgrounds.
                                Most of these schemes are offered by the Ministry of Social Justice and Empowerment or state welfare departments.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <span className="text-sm font-medium text-gray-600">Verified for 2026-27</span>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-blue-100 min-w-[180px] text-center">
                            <span className="text-sm text-gray-500 font-medium block mb-1 uppercase tracking-tight">Active Schemes</span>
                            <span className="text-5xl font-extrabold text-blue-700">{scholarships.length}</span>
                        </div>
                    </div>

                    {/* Scholarships List */}
                    <div className="mb-20">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Active {displayName} Scholarships</h2>
                            <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{scholarships.length} results</div>
                        </div>
                        <div className="space-y-6">
                            {scholarships.map((scholarship: any) => (
                                <ScholarshipCard
                                    key={scholarship.id}
                                    scholarship={scholarship}
                                    viewMode="list"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Category-Specific FAQ */}
                    <div className="bg-gray-50 rounded-[2.5rem] p-10 mb-20 border border-gray-100">
                        <h2 className="text-3xl font-bold text-gray-900 mb- aggregation px-08 tracking-tight mb-8">Frequently Asked Questions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Can I apply for multiple scholarships?</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Usually, students are allowed to avail only one government scholarship at a time.
                                    However, you can often combine a government scholarship with a private or corporate one.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">What is the income limit?</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Income limits vary. For many post-matric schemes, it is around ₹2.5 Lakh per year.
                                    OBC and General (EWS) schemes often range from ₹1 Lakh to ₹8 Lakh.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Which portal should I use?</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Central schemes are usually on the National Scholarship Portal (NSP).
                                    State-specific schemes are on state portals like SSP or SAMS.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Is a Caste Certificate mandatory?</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Yes, for all category-based scholarships, a valid Caste Certificate issued by the competent authority is mandatory.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Internal Linking */}
                    <div className="mt-16 pt-10 border-t border-gray-100 px-0">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Categories</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/scholarships-by-category" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700">
                                ← All Categories
                            </Link>
                            <Link href="/state-scholarships" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700 text-center">
                                By State →
                            </Link>
                            <Link href="/scholarships-by-education" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700 text-center">
                                By Education →
                            </Link>
                            <Link href="/search" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700 text-center">
                                Search All →
                            </Link>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        );
    } catch (error) {
        notFound();
    }
}
