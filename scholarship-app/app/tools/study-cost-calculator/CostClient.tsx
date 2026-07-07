'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { BookOpen, AlertCircle, TrendingDown, ArrowUpRight } from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

export default function CostClient({ scholarships }: Props) {
    const [tuition, setTuition] = useState<number>(80000);
    const [accommodation, setAccommodation] = useState<number>(5000);
    const [food, setFood] = useState<number>(3000);
    const [books, setBooks] = useState<number>(10000);
    
    const [totalAnnual, setTotalAnnual] = useState<number>(0);
    const [bestScholarship, setBestScholarship] = useState<any>(null);
    const [coveragePercent, setCoveragePercent] = useState<number>(0);
    const [fundingGap, setFundingGap] = useState<number>(0);

    useEffect(() => {
        const annualAccommodation = accommodation * 12;
        const annualFood = food * 12;
        const total = tuition + annualAccommodation + annualFood + books;
        setTotalAnnual(total);
    }, [tuition, accommodation, food, books]);

    useEffect(() => {
        // Find maximum active scholarship amount
        if (scholarships.length > 0) {
            const best = scholarships[0]; // Ordered by amount_annual DESC
            setBestScholarship(best);
            
            const scholarshipAmt = best.amount_annual || best.amount_min || 0;
            const pct = Math.min(100, Math.round((scholarshipAmt / totalAnnual) * 100));
            setCoveragePercent(pct);
            setFundingGap(Math.max(0, totalAnnual - scholarshipAmt));
        }
    }, [totalAnnual, scholarships]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <div>
                <Header />
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-sm text-gray-500 mb-6">
                        <a href="/tools" className="hover:text-blue-700 font-medium">Tools</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">Study Cost & Gap Calculator</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cost Input Box */}
                        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-50 text-cyan-600 rounded-xl mb-6">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                Cost & Budget Planner
                            </h1>
                            <p className="text-gray-600 text-sm mb-6">
                                Calculate your college expenses and analyze your scholarship support.
                            </p>

                            <div className="space-y-6">
                                {/* Tuition fees */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                            Annual Tuition Fee
                                        </label>
                                        <span className="text-sm font-black text-gray-900">
                                            ₹{tuition.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10000"
                                        max="500000"
                                        step="5000"
                                        value={tuition}
                                        onChange={(e) => setTuition(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                </div>

                                {/* Hostel rent */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                            Hostel/Rent (Monthly)
                                        </label>
                                        <span className="text-sm font-black text-gray-900">
                                            ₹{accommodation.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="30000"
                                        step="500"
                                        value={accommodation}
                                        onChange={(e) => setAccommodation(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                </div>

                                {/* Food */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                            Food & Lifestyle (Monthly)
                                        </label>
                                        <span className="text-sm font-black text-gray-900">
                                            ₹{food.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="500"
                                        max="20000"
                                        step="500"
                                        value={food}
                                        onChange={(e) => setFood(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                </div>

                                {/* Books */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                            Books & Supplies (Annual)
                                        </label>
                                        <span className="text-sm font-black text-gray-900">
                                            ₹{books.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1000"
                                        max="50000"
                                        step="1000"
                                        value={books}
                                        onChange={(e) => setBooks(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <ShareButtons 
                                        title={`My college expenses total ₹${totalAnnual.toLocaleString('en-IN')}/yr on IndiaScholarships! Analyze your gap.`}
                                        url="https://www.indiascholarships.in/tools/study-cost-calculator"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Breakdown Panel */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Funding Gap Analysis</h2>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">Total Annual Expense</span>
                                        <span className="text-base font-black text-gray-900">₹{totalAnnual.toLocaleString('en-IN')}</span>
                                    </div>
                                    {bestScholarship && (
                                        <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                                            <span className="text-sm text-gray-600 flex items-center gap-1.5">
                                                Max Scholarship Support
                                                <span className="text-[10px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full font-bold">Best Scheme</span>
                                            </span>
                                            <span className="text-base font-black text-emerald-700">
                                                - ₹{(bestScholarship.amount_annual || bestScholarship.amount_min || 0).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 bg-cyan-50/30 px-3 rounded-lg">
                                        <span className="text-sm font-extrabold text-cyan-900">Net Out-of-Pocket Gap</span>
                                        <span className="text-lg font-black text-cyan-800">
                                            ₹{fundingGap.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar of Coverage */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                        <span>Scholarship Coverage Ratio</span>
                                        <span>{coveragePercent}% Covered</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500" 
                                            style={{ width: `${coveragePercent}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-bold mt-2">
                                        * Calculated based on the maximum financial benefit from top active scholarships in our database.
                                    </p>
                                </div>

                                {bestScholarship && (
                                    <div className="bg-slate-50 border rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase text-cyan-700 tracking-wider">Top Recommended Scheme</span>
                                            <h4 className="font-bold text-sm text-gray-900 mt-1 leading-snug">{bestScholarship.title}</h4>
                                        </div>
                                        <a 
                                            href={`/scholarships/${bestScholarship.slug}`}
                                            className="inline-flex items-center gap-1 px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700 transition-colors whitespace-nowrap"
                                        >
                                            <span>Read Guide</span>
                                            <ArrowUpRight className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
