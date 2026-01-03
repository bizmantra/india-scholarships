import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByState, getAllStates } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { slugify } from '@/lib/utils';

// Generate static params for all states
export function generateStaticParams() {
    const states = getAllStates();
    return states.map((state) => ({
        state: slugify(state),
    }));
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
    try {
        const resolvedParams = await params;
        const states = getAllStates();
        const originalState = states.find(s => slugify(s) === resolvedParams.state) || resolvedParams.state;

        return {
            title: `${originalState} Scholarships - Complete List & Eligibility`,
            description: `Find all scholarships in ${originalState}. Complete list with eligibility criteria, amounts, deadlines, and application process for ${originalState} students.`,
        };
    } catch (error) {
        return { title: 'Scholarships - Not Found' };
    }
}

export default async function StateHubPage({ params }: { params: Promise<{ state: string }> }) {
    try {
        const resolvedParams = await params;
        const stateSlug = resolvedParams?.state;

        if (!stateSlug) return null;

        // Resolve original state name
        const states = getAllStates();
        const stateName = states.find(s => slugify(s) === stateSlug) || stateSlug;

        // Get scholarships for this state
        const scholarships = getScholarshipsByState(stateName);

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
                        <Link href="/state-scholarships" className="hover:text-blue-700">States</Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium">{stateName}</span>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight font-serif">
                            Scholarships in {stateName} 2026
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
                            Find the latest and most comprehensive list of {stateName} state scholarships.
                            Currently, we have <span className="font-bold text-blue-700">{scholarships.length} verified opportunities</span> available for
                            students who organic from {stateName}.
                        </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h3 className="text-blue-700 font-bold mb-1">Total Available</h3>
                            <p className="text-3xl font-extrabold text-blue-900">{scholarships.length}</p>
                            <p className="text-xs text-blue-600 mt-2">Verified schemes</p>
                        </div>
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                            <h3 className="text-green-700 font-bold mb-1">Max Amount</h3>
                            <p className="text-3xl font-extrabold text-green-900">
                                ₹{Math.max(...scholarships.map((s: any) => s.amount_annual || 0)).toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600 mt-2">Per academic year</p>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                            <h3 className="text-purple-700 font-bold mb-1">Last Verified</h3>
                            <p className="text-xl font-extrabold text-purple-900">January 2026</p>
                            <p className="text-xs text-purple-600 mt-2">100% data freshness</p>
                        </div>
                    </div>

                    {/* Scholarships List */}
                    <div className="mb-16">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-black text-gray-900 font-serif tracking-tight">Active {stateName} Scholarships</h2>
                            <div className="text-sm font-medium text-gray-500">Showing {scholarships.length} results</div>
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

                    {/* FAQ Section */}
                    <div className="bg-gray-50 rounded-3xl p-8 mb-16 border">
                        <h2 className="text-3xl font-black text-gray-900 mb-8 font-serif tracking-tight">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Who can apply for {stateName} state scholarships?</h3>
                                <p className="text-gray-600 text-sm">
                                    Generally, these scholarships are for students who are permanent residents (domicile) of {stateName}.
                                    Some schemes may also require you to be studying within the state, while others allow out-of-state study if you have a {stateName} domicile.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">What is the common deadline for scholarships in {stateName}?</h3>
                                <p className="text-gray-600 text-sm">
                                    Deadlines vary by scheme. Most government scholarships open between July and September and close by October or November.
                                    Always check the "Last Verified" date on our listing and click through to the official portal for the exact current deadline.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Which documents are mandatory for {stateName} scholarships?</h3>
                                <p className="text-gray-600 text-sm">
                                    Mandatory documents usually include: 1. Aadhaar Card, 2. {stateName} Domicile Certificate,
                                    3. Income Certificate (dated within 1 year), 4. Caste Certificate (if applicable),
                                    5. Previous year marksheets, and 6. A bank account linked to your Aadhaar.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Related Links */}
                    <div className="border-t pt-12">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Explore More Scholarships</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link href="/state-scholarships" className="group p-4 border rounded-xl hover:border-blue-700 transition-colors">
                                <span className="text-blue-700 font-medium group-hover:underline">← All States</span>
                            </Link>
                            <Link href="/scholarships-by-category" className="group p-4 border rounded-xl hover:border-blue-700 transition-colors">
                                <span className="text-blue-700 font-medium group-hover:underline">By Category →</span>
                            </Link>
                            <Link href="/scholarships-by-education" className="group p-4 border rounded-xl hover:border-blue-700 transition-colors">
                                <span className="text-blue-700 font-medium group-hover:underline">By Education →</span>
                            </Link>
                            <Link href="/search" className="group p-4 border rounded-xl hover:border-blue-700 transition-colors">
                                <span className="text-blue-700 font-medium group-hover:underline">Search All →</span>
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t bg-gray-50 py-12">
                    <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                        <p>© 2025 IndiaScholarships. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        );
    } catch (error) {
        notFound();
    }
}
