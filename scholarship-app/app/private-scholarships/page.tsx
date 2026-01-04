import Link from 'next/link';
import { getScholarshipsByType } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Private Scholarships 2026 - Foundations & NGO Schemes',
    description: 'Explore private scholarships from foundations, NGOs, and trusts. Find merit-based and need-based financial aid for Indian students.',
};

export default function PrivateScholarshipsPage() {
    const scholarships = getScholarshipsByType('Private');

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Private Scholarships</span>
                </nav>

                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Private Scholarships 2026
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                        Educational funding from private sector foundations, non-profits, and trusts.
                        These scholarships often prioritize **academic merit** and **innovative fields of study**.
                    </p>
                </div>

                {/* Info Block */}
                <div className="bg-emerald-50 rounded-[2.5rem] p-10 mb-16 border border-emerald-100 flex flex-col md:flex-row gap-10 items-center">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-emerald-900">Why Private Funding?</h2>
                        <ul className="space-y-3 text-emerald-800 font-medium">
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                Higher fellowship amounts (often ₹50k - ₹2L+)
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                Can often be combined with Govt scholarships
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                Mentorship and internship opportunities
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 min-w-[200px] text-center">
                        <span className="text-sm text-gray-500 font-medium block mb-1 uppercase tracking-tight">Active Fellows</span>
                        <span className="text-5xl font-extrabold text-emerald-700">{scholarships.length}</span>
                    </div>
                </div>

                {/* Scholarships List */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Curated Private Schemes</h2>
                        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{scholarships.length} results</div>
                    </div>
                    <div className="space-y-6">
                        {scholarships.length > 0 ? (
                            scholarships.map((scholarship: any) => (
                                <ScholarshipCard
                                    key={scholarship.id}
                                    scholarship={scholarship}
                                    viewMode="list"
                                />
                            ))
                        ) : (
                            <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed text-gray-500 font-medium">
                                No private scholarships found in this section yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Links */}
                <div className="mt-16 pt-10 border-t border-gray-100 px-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Explore Alternative Funding</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Link href="/government-scholarships" className="group p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all border-b-4 border-blue-600">
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-700 mb-1">Government Schemes</h3>
                            <p className="text-sm text-gray-500">Central & State funding</p>
                        </Link>
                        <Link href="/corporate-scholarships" className="group p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all border-b-4 border-purple-600">
                            <h3 className="font-bold text-gray-900 group-hover:text-purple-700 mb-1">Corporate CSR</h3>
                            <p className="text-sm text-gray-500">Industry backed grants</p>
                        </Link>
                        <Link href="/scholarships-by-income" className="group p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all border-b-4 border-green-600">
                            <h3 className="font-bold text-gray-900 group-hover:text-green-700 mb-1">Needs Based</h3>
                            <p className="text-sm text-gray-500">Filter by family income</p>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
