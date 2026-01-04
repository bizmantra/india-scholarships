import Link from 'next/link';
import { getScholarshipsByType } from '@/lib/db';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
    title: 'Government Scholarships 2026 - Central & State Schemes',
    description: 'Browse all government scholarships including central and state government schemes. Find eligibility, benefits, and application details for 2026-27.',
};

export default function GovernmentScholarshipsPage() {
    const scholarships = getScholarshipsByType('Government');

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-700">Home</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Government Scholarships</span>
                </nav>

                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Government Scholarships 2026
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                        Official financial aid schemes provided by the **Government of India** and various **State Governments**.
                        Currently, we have <span className="font-bold text-blue-700">{scholarships.length} verified government schemes</span> listed for students.
                    </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                        <h3 className="text-blue-700 font-bold mb-1">Total Schemes</h3>
                        <p className="text-3xl font-extrabold text-blue-900">{scholarships.length}</p>
                    </div>
                    <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100">
                        <h3 className="text-orange-700 font-bold mb-1">Provider Type</h3>
                        <p className="text-3xl font-extrabold text-orange-900">Govt</p>
                    </div>
                    <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100">
                        <h3 className="text-green-700 font-bold mb-1">Application</h3>
                        <p className="text-3xl font-extrabold text-green-900">Online</p>
                    </div>
                    <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
                        <h3 className="text-purple-700 font-bold mb-1">Verified</h3>
                        <p className="text-3xl font-extrabold text-purple-900">Jan '26</p>
                    </div>
                </div>

                {/* Scholarships List */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Active Government Schemes</h2>
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
                                No government scholarships found in our database yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Discovery Section (Links) */}
                <section className="bg-gray-50 rounded-[2.5rem] p-10 mb-20">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse Govt Scholarships By:</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/scholarships-by-category" className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-gray-100 hover:border-blue-600 hover:shadow-xl transition-all group">
                            <div className="text-4xl">👥</div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-700">Caste Category</h3>
                                <p className="text-sm text-gray-500">SC, ST, OBC, Minority schemes</p>
                            </div>
                        </Link>
                        <Link href="/state-scholarships" className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-gray-100 hover:border-blue-600 hover:shadow-xl transition-all group">
                            <div className="text-4xl">🗺️</div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-700">States of India</h3>
                                <p className="text-sm text-gray-500">Find schemes for your state</p>
                            </div>
                        </Link>
                        <Link href="/scholarships-by-education" className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-gray-100 hover:border-blue-600 hover:shadow-xl transition-all group">
                            <div className="text-4xl">🎓</div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-700">Education Level</h3>
                                <p className="text-sm text-gray-500">School, Graduation, PhD</p>
                            </div>
                        </Link>
                        <Link href="/scholarships-by-income" className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-gray-100 hover:border-blue-600 hover:shadow-xl transition-all group">
                            <div className="text-4xl">💰</div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-700">Income Range</h3>
                                <p className="text-sm text-gray-500">EWS and EBC specific scholarships</p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Important Note */}
                <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 flex gap-6 items-start">
                    <div className="text-3xl">⚠️</div>
                    <div>
                        <h3 className="font-bold text-amber-900 mb-2">Important Application Note</h3>
                        <p className="text-amber-800 text-sm leading-relaxed">
                            Government scholarships usually require **Aadhaar Seeded Bank Accounts** (Direct Benefit Transfer - DBT).
                            Ensure your bank account is linked to your Aadhaar at your bank branch before applying to any central or state government portal.
                        </p>
                    </div>
                </div>

                {/* Search CTA */}
                <div className="text-center py-16 mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Looking for Private or Corporate funding?
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/private-scholarships"
                            className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200"
                        >
                            View Private Scholarships
                        </Link>
                        <Link
                            href="/corporate-scholarships"
                            className="px-8 py-4 bg-blue-700 text-white font-bold rounded-2xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-200"
                        >
                            View Corporate CSR
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
