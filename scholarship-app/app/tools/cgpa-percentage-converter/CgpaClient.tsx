'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { Calculator, HelpCircle, GraduationCap, Percent, Share2 } from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

export default function CgpaClient({ scholarships }: Props) {
    const [cgpa, setCgpa] = useState<string>('8.0');
    const [scale, setScale] = useState<'10' | '4'>('10');
    const [formula, setFormula] = useState<'9.5' | '10' | 'us'>('9.5');
    const [percentage, setPercentage] = useState<number>(76);
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        const val = parseFloat(cgpa);
        if (isNaN(val) || val < 0) {
            setPercentage(0);
            return;
        }

        let pct = 0;
        if (scale === '10') {
            if (formula === '9.5') {
                pct = Math.min(100, val * 9.5);
            } else {
                pct = Math.min(100, val * 10);
            }
        } else {
            // 4.0 scale conversion
            // Standard linear conversion: (GPA / 4) * 100
            pct = Math.min(100, (val / 4) * 100);
        }
        setPercentage(parseFloat(pct.toFixed(2)));
    }, [cgpa, scale, formula]);

    useEffect(() => {
        // Filter scholarships where student's marks qualify
        const eligible = scholarships.filter(s => s.min_marks <= percentage);
        setMatches(eligible);
    }, [percentage, scholarships]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <div>
                <Header />
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Breadcrumbs */}
                    <div className="text-sm text-gray-500 mb-6">
                        <a href="/tools" className="hover:text-blue-700 font-medium">Tools</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">CGPA to Percentage Converter</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Calculator Card */}
                        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl mb-6">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                CGPA ↔ Percentage
                            </h1>
                            <p className="text-gray-600 text-sm mb-6">
                                Quick grade conversion tools for university score requirements.
                            </p>

                            <div className="space-y-6">
                                {/* Grading Scale */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                        Grading Scale
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => { setScale('10'); setCgpa('8.0'); }}
                                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                scale === '10'
                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            10.0 Scale
                                        </button>
                                        <button
                                            onClick={() => { setScale('4'); setCgpa('3.2'); }}
                                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                scale === '4'
                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            4.0 Scale
                                        </button>
                                    </div>
                                </div>

                                {/* CGPA Value */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                        Enter CGPA / GPA
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={cgpa}
                                            onChange={(e) => setCgpa(e.target.value)}
                                            step="0.01"
                                            min="0"
                                            max={scale}
                                            className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:outline-hidden font-semibold text-lg"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                                            / {scale}.0
                                        </span>
                                    </div>
                                </div>

                                {/* Conversion Formula */}
                                {scale === '10' && (
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                                            Conversion Formula
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setFormula('9.5')}
                                                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                    formula === '9.5'
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                CBSE / AICTE (× 9.5)
                                            </button>
                                            <button
                                                onClick={() => setFormula('10')}
                                                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                    formula === '10'
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Standard (× 10.0)
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Output Display */}
                                <div className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-6 text-center shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Percent className="w-20 h-20" />
                                    </div>
                                    <span className="text-xs uppercase tracking-wider font-extrabold opacity-95 block mb-1">Calculated Percentage</span>
                                    <span className="text-4xl font-black">{percentage}%</span>
                                    <p className="text-xs mt-3 text-emerald-100 font-medium">
                                        {scale === '10' 
                                            ? `Formula: CGPA (${cgpa}) × ${formula} multiplier` 
                                            : `Formula: (GPA ${cgpa} / 4) × 100`}
                                    </p>
                                </div>

                                <div className="pt-4 border-t">
                                    <ShareButtons 
                                        title={`I converted my CGPA of ${cgpa}/${scale} to ${percentage}% on IndiaScholarships! Check yours now.`}
                                        url="https://www.indiascholarships.in/tools/cgpa-calculator"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recommendation Panel */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Recommended Scholarships</h2>
                                        <p className="text-gray-500 text-xs mt-1">Based on minimum academic marks criteria of {percentage}%</p>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold rounded-full">
                                        {matches.length} Matches
                                    </span>
                                </div>

                                {matches.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {matches.slice(0, 4).map((s) => (
                                            <div key={s.id} className="border border-gray-100 rounded-xl p-4 hover:border-emerald-500 transition-all bg-slate-50/50 flex flex-col justify-between">
                                                <div>
                                                    <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">Requires ≥ {s.min_marks}% Marks</span>
                                                    <h4 className="font-bold text-sm text-gray-900 mt-1 line-clamp-2 leading-snug">{s.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-2">Amount: ₹{(s.amount_annual || s.amount_min || 0).toLocaleString('en-IN')}</p>
                                                </div>
                                                <a 
                                                    href={`/scholarships/${s.slug}`}
                                                    className="inline-block mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                                                >
                                                    View Details →
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                                        <p className="text-gray-500 font-semibold mb-2">No scholarships found requiring {percentage}% marks</p>
                                        <p className="text-xs text-gray-400">Try adjusting your score to see matching opportunities.</p>
                                    </div>
                                )}

                                {matches.length > 4 && (
                                    <div className="text-center mt-6">
                                        <a 
                                            href={`/eligibility-checker?marks=${percentage}`}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                                        >
                                            <span>View All {matches.length} Schemes</span>
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
