import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getScholarshipsByState, getAllStates } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { slugify } from '@/lib/utils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

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
        const { state: stateSlug } = await params;
        const states = getAllStates();
        const originalState = states.find(s => slugify(s) === stateSlug) || stateSlug;

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
        const { state: stateSlug } = await params;

        if (!stateSlug) return notFound();

        // Resolve original state name
        const states = getAllStates();
        const stateName = states.find(s => slugify(s) === stateSlug);

        if (!stateName) return notFound();

        // Get scholarships for this state
        const scholarships = getScholarshipsByState(stateName);

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
                        <Link href="/state-scholarships" className="hover:text-blue-700">States</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{stateName}</span>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            Scholarships in {stateName} 2026
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                            Find the latest and most comprehensive list of {stateName} state scholarships.
                            Currently, we have <span className="font-bold text-blue-700">{scholarships.length} verified opportunities</span> available for
                            students from {stateName}.
                        </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                            <h3 className="text-blue-700 font-bold mb-1">Total Available</h3>
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
                            <h3 className="text-purple-700 font-bold mb-1">Data Freshness</h3>
                            <p className="text-3xl font-extrabold text-purple-900">100%</p>
                            <p className="text-xs text-purple-600 mt-2">Verified Jan 2026</p>
                        </div>
                    </div>

                    {/* Scholarships List */}
                    <div className="mb-20">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Active {stateName} Scholarships</h2>
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
                            <Link href="/state-scholarships" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700">
                                ← All States
                            </Link>
                            <Link href="/scholarships-by-category" className="flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors font-medium text-blue-700 text-center">
                                By Category →
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
