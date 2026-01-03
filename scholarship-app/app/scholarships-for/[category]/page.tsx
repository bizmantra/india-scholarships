import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByCategory, getAllCategories } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { slugify } from '@/lib/utils';

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
    const { category: categorySlug } = await params;

    // Resolve the original category names from the slug (could be multiple messy strings)
    const categories = getAllCategories();
    const matchingOriginalCategories = categories.filter(c => slugify(c) === categorySlug);

    if (matchingOriginalCategories.length === 0) {
        notFound();
    }

    // Use the first one for display mapping (they should all map to the same display name)
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
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white">
                <div className="container mx-auto flex h-14 items-center px-4">
                    <Link href="/" className="text-xl font-black text-blue-700 font-serif tracking-tight">
                        IndiaScholarships
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span className="text-gray-400">/</span>
                    <Link href="/scholarships-by-category" className="hover:text-blue-700">Categories</Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-medium">{displayName}</span>
                </nav>


                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight font-serif">
                        {displayName} Scholarships 2026
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                        Explore dedicated educational funding opportunities for <span className="font-semibold">{displayName}</span> students across India.
                        We've identified <span className="font-bold text-blue-700">{scholarships.length} scholarships</span> specifically tailored for your eligibility.
                    </p>
                </div>

                {/* Info Block */}
                <div className="bg-blue-50 rounded-3xl p-8 mb-12 border border-blue-100 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-blue-900 mb-3">Why {displayName} Scholarships?</h2>
                        <p className="text-blue-800/80 text-sm leading-relaxed">
                            These scholarships are designed to ensure equitable access to education for students from {displayName} backgrounds.
                            Most of these schemes are offered by the Ministry of Social Justice and Empowerment, Ministry of Tribal Affairs, or state-specific welfare departments.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 min-w-[200px] text-center">
                        <span className="text-sm text-gray-500 block mb-1">Total Impact</span>
                        <span className="text-4xl font-black text-blue-700">{scholarships.length}</span>
                        <span className="text-xs text-gray-400 block mt-1">Schemes Found</span>
                    </div>
                </div>

                {/* Scholarships List */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-black text-gray-900 font-serif tracking-tight">Top Recommendations</h2>
                        <div className="h-px flex-1 bg-gray-100 mx-6 hidden sm:block"></div>
                        <div className="text-sm font-medium text-gray-400 uppercase tracking-widest">{scholarships.length} Results</div>
                    </div>
                    <div className="space-y-4">
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
                <div className="border rounded-3xl p-8 mb-16 bg-white shadow-sm">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 font-serif tracking-tight">Scholarship FAQ for {displayName} Students</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Can I apply for multiple {displayName} scholarships?</h3>
                            <p className="text-gray-600 text-sm">
                                Usually, no. Students are typically allowed to avail only one government scholarship at a time.
                                However, you can often combine a government scholarship with a private or corporate scholarship if the rules allow.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">What is the income limit for {displayName} scholarships?</h3>
                            <p className="text-gray-600 text-sm">
                                Income limits vary. For many SC/ST post-matric schemes, it is around ₹2.5 Lakh per year.
                                For OBC and General (EWS) schemes, it often ranges from ₹1 Lakh to ₹8 Lakh. Always check the specific scheme details.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Which portal should I use?</h3>
                            <p className="text-gray-600 text-sm">
                                Central schemes (like Post-Matric scholarships for SC/OBC) are usually on the <Link href="/guides/nsp" className="text-blue-700 hover:underline">National Scholarship Portal (NSP)</Link>.
                                State-specific schemes are on state portals (like SSP for Karnataka or SAMS for Odisha).
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Is the Caste Certificate mandatory?</h3>
                            <p className="text-gray-600 text-sm">
                                Yes, for all category-based scholarships, a valid Caste Certificate issued by the competent authority (usually the Tahsildar) is mandatory.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Internal Linking */}
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Continue Your Search</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link href="/scholarships-by-category" className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-700 transition-all text-sm font-medium text-blue-700 text-center">
                            View All Categories
                        </Link>
                        <Link href="/state-scholarships" className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-700 transition-all text-sm font-medium text-blue-700 text-center">
                            Search by State
                        </Link>
                        <Link href="/scholarships-by-education" className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-700 transition-all text-sm font-medium text-blue-700 text-center">
                            Search by Level
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-gray-50 py-12 mt-12">
                <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                    <p>© 2025 IndiaScholarships. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
