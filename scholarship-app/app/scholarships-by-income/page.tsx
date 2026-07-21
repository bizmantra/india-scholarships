import Link from 'next/link';
import { getIncomeRanges } from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Sparkles, IndianRupee, FileCheck, CheckCircle2, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const metadata = {
    title: 'Scholarships by Income Limit 2026 - EWS, BPL & Income Caps | IndiaScholarships',
    description: 'Browse scholarships by annual family income limits. Find EWS schemes (< ₹1L, ₹2.5L, ₹6L, and Merit No Income Bar) with income certificate guidelines.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/scholarships-by-income',
    }
};

export default async function ScholarshipsByIncomePage() {
    const incomeRanges = await getIncomeRanges();

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Header */}
            <section className="bg-gradient-to-b from-blue-50/50 via-white to-white py-12 px-4 border-b border-gray-150 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100/60 text-blue-800 text-xs font-bold mb-4 border border-blue-200/50">
                        <Sparkles className="h-3.5 w-3.5 text-blue-700 animate-pulse" />
                        Income Threshold Directory • Financial Need & EWS Schemes
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4 font-serif leading-[1.1]">
                        Scholarships by Income Limit 2026 <br className="hidden sm:inline" />
                        <span className="text-google-blue">Find Grants Matched to Family Income</span>
                    </h1>

                    <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
                        Many government and private trust funds reserve major tuition fee waivers for students below specific annual income caps.
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-4 py-12">
                
                {/* Income Ranges Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {incomeRanges.map((range) => (
                        <div
                            key={range.slug}
                            className="group p-6 bg-white border border-gray-200 rounded-3xl hover:border-google-blue hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-4xl">💰</span>
                                    <span className="px-3 py-1 bg-green-50 text-google-green text-xs font-black rounded-full border border-green-100">
                                        {range.count} Active Schemes
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-google-blue transition-colors mb-2 font-serif">
                                    {range.label}
                                </h2>

                                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                                    Offers post-matric fee reimbursements, hostel allowances, and financial aid for families earning within {range.label.toLowerCase()}.
                                </p>
                            </div>

                            <Link
                                href={`/scholarships-income/${range.slug}`}
                                className="w-full py-2.5 bg-gray-50 hover:bg-google-blue hover:text-white border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                            >
                                <span>Browse {range.label} Schemes</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Verification Guidance */}
                <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 mb-14">
                    <div className="flex items-center gap-2 mb-4">
                        <FileCheck className="h-5 w-5 text-google-blue" />
                        <h3 className="text-xl font-bold text-gray-900 font-serif">Income Certificate Rules & Mandatory Guidelines</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-gray-700 leading-relaxed">
                        <div className="p-4 bg-white rounded-2xl border border-blue-100/70">
                            <span className="font-bold text-gray-900 block mb-1">📜 Issuing Authority</span>
                            Must be issued by a competent Revenue Officer (Tehsildar, Block Development Officer, or Sub-Divisional Officer). Salary slips or employer letters are not accepted for government schemes.
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-blue-100/70">
                            <span className="font-bold text-gray-900 block mb-1">📅 Validity Period</span>
                            Income certificates are valid for 1 financial year (April 1 to March 31). Ensure your certificate is dated for the current FY 2026-27.
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-blue-100/70">
                            <span className="font-bold text-gray-900 block mb-1">👨‍👩‍👧 Family Definition</span>
                            Includes gross annual income from all sources (salaries, agriculture, business, profession) of parents/guardian for the preceding financial year.
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
