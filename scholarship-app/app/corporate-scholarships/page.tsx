import Link from 'next/link';
import { getScholarshipsByType } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Corporate CSR Scholarships 2026 - TATA, LIC, HDFC Schemes',
    description: 'Find scholarships funded by corporate social responsibility (CSR) programs. Merit-cum-need based financial aid from top Indian companies.',
};

export default function CorporateScholarshipsPage() {
    const scholarships = getScholarshipsByType('Corporate');

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Corporate Scholarships</span>
                </nav>

                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Corporate CSR Scholarships 2026
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                        Scholarships funded by leading Indian corporations as part of their **Social Responsibility (CSR)**.
                        Currently, we have <span className="font-bold text-blue-700">{scholarships.length} industry-backed schemes</span>.
                    </p>
                </div>

                {/* Info Block */}
                <div className="bg-indigo-50 rounded-[2.5rem] p-10 mb-16 border border-indigo-100 flex flex-col md:flex-row gap-10 items-center">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-indigo-900">Why Corporate CSR?</h2>
                        <ul className="space-y-3 text-indigo-800 font-medium">
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                Focused on merit-cum-means eligibility
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                Support for professional & technical courses
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                Streamlined online application process
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100 min-w-[200px] text-center">
                        <span className="text-sm text-gray-500 font-medium block mb-1 uppercase tracking-tight">CSR Programs</span>
                        <span className="text-5xl font-extrabold text-indigo-700">{scholarships.length}</span>
                    </div>
                </div>

                {/* Scholarships List */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Industry-Backed Grants</h2>
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
                                No corporate scholarships found in our database yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Links */}
                <div className="mt-16 pt-10 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Explore More Funding</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Link href="/government-scholarships" className="group p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all border-b-4 border-blue-600">
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-700 mb-1">Government Schemes</h3>
                            <p className="text-sm text-gray-500">Central & State funding</p>
                        </Link>
                        <Link href="/private-scholarships" className="group p-6 bg-gray-50 rounded-3xl hover:bg-gray-100 transition-all border-b-4 border-emerald-600">
                            <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 mb-1">Private Foundations</h3>
                            <p className="text-sm text-gray-500">NGOs and Trusts</p>
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
