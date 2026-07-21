'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import { 
    Calculator, 
    Percent, 
    Sparkles, 
    ShieldCheck, 
    HelpCircle, 
    Coins, 
    Landmark, 
    Building2, 
    Globe, 
    GraduationCap, 
    CheckCircle2 
} from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

type TabType = 'government' | 'private' | 'international' | 'all';

export default function CgpaClient({ scholarships }: Props) {
    const [cgpa, setCgpa] = useState<string>('8.0');
    const [scale, setScale] = useState<'10' | '4'>('10');
    const [formula, setFormula] = useState<'9.5' | '10'>('9.5');
    const [percentage, setPercentage] = useState<number>(76);
    const [matches, setMatches] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('government');
    const [hasCalculated, setHasCalculated] = useState<boolean>(false);
    const [calculating, setCalculating] = useState<boolean>(false);
    const resultsRef = useRef<HTMLDivElement>(null);

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
            pct = Math.min(100, (val / 4) * 100);
        }
        setPercentage(parseFloat(pct.toFixed(2)));
    }, [cgpa, scale, formula]);

    useEffect(() => {
        // Reset calculation state when inputs change
        setHasCalculated(false);
    }, [cgpa, scale, formula]);

    useEffect(() => {
        // Filter scholarships where student's marks qualify
        const eligible = scholarships.filter(s => s.min_marks <= percentage);
        setMatches(eligible);
    }, [percentage, scholarships]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCalculating(true);
        setTimeout(() => {
            setCalculating(false);
            setHasCalculated(true);
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }, 600);
    };

    // Helper to dynamically categorize scholarships
    const getScholarshipCategory = (s: any): TabType => {
        const titleLower = s.title.toLowerCase();
        const providerLower = (s.provider || '').toLowerCase();
        const providerTypeLower = (s.provider_type || '').toLowerCase();
        const amt = s.amount_annual || s.amount_min || 0;

        if (
            amt >= 500000 || 
            titleLower.includes('uk') || 
            titleLower.includes('us') || 
            titleLower.includes('cambridge') || 
            titleLower.includes('fulbright') || 
            titleLower.includes('commonwealth') || 
            titleLower.includes('abroad') || 
            titleLower.includes('foreign') ||
            providerLower.includes('foreign') ||
            providerLower.includes('embassy') ||
            providerTypeLower.includes('international')
        ) {
            return 'international';
        }

        if (
            providerTypeLower.includes('government') || 
            providerTypeLower.includes('central') || 
            providerTypeLower.includes('state') || 
            providerTypeLower.includes('ut') ||
            providerTypeLower.includes('ministry') ||
            providerTypeLower.includes('department') ||
            providerTypeLower.includes('implementing')
        ) {
            return 'government';
        }

        return 'private';
    };

    // Filter results by tab
    const tabFilteredMatches = matches.filter(s => {
        if (activeTab === 'all') return true;
        return getScholarshipCategory(s) === activeTab;
    });

    const getCountForTab = (tab: TabType) => {
        if (tab === 'all') return matches.length;
        return matches.filter(s => getScholarshipCategory(s) === tab).length;
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Why do scholarship applications require percentage instead of CGPA?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Most national and state scholarship portals (such as National Scholarship Portal - NSP, and SSP Karnataka) use standardized percentage cutoffs to evaluate academic merit uniformly across different boards and universities. Converting your CGPA ensures fair ranking."
                }
            },
            {
                "@type": "Question",
                "name": "How is CGPA converted to percentage under the CBSE/AICTE guidelines?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Under CBSE and AICTE guidelines, CGPA is converted to percentage by multiplying the CGPA score by 9.5. For example, a CGPA of 8.0 translates to 8.0 × 9.5 = 76.0%."
                }
            },
            {
                "@type": "Question",
                "name": "Can I use this tool for a 4.0 scale GPA conversion?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. This converter supports the standard 4.0 scale (common in US universities and select Indian private colleges) by calculating the ratio (GPA / 4) × 100 to yield the corresponding percentage."
                }
            }
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
            {/* SEO Schema Injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div>
                <Header />

                {/* Hero Section */}
                <section className="relative overflow-hidden bg-white border-b border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <span className="text-[10px] uppercase font-bold text-google-blue tracking-wider block mb-1">Grade Converter Tool</span>
                        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 font-serif tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
                            CGPA to Percentage Converter
                        </h1>
                        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Convert your academic grades to percentages and instantly check qualifying government and private schemes.
                        </p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Breadcrumbs */}
                    <div className="text-sm text-gray-500 mb-8">
                        <Link href="/tools" className="hover:text-google-blue font-medium">Tools</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">CGPA to Percentage Converter</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
                        
                        {/* Calculator Card */}
                        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Percent className="w-5 h-5 text-google-blue" />
                                <span>Input Your Scores</span>
                            </h2>
                            <p className="text-gray-500 text-xs leading-relaxed mb-6">
                                Choose your scale, type your current CGPA, and select the formula multiplier.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Grading Scale */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                                        Grading Scale
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setScale('10'); setCgpa('8.0'); }}
                                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                scale === '10'
                                                    ? 'bg-google-blue border-google-blue text-white shadow-md shadow-blue-500/20'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            10.0 Scale (Indian Univ/Boards)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setScale('4'); setCgpa('3.2'); }}
                                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                scale === '4'
                                                    ? 'bg-google-blue border-google-blue text-white shadow-md shadow-blue-500/20'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            4.0 Scale (US / Abroad)
                                        </button>
                                    </div>
                                </div>

                                {/* CGPA Value */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
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
                                            className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-google-blue focus:border-transparent focus:outline-hidden font-semibold text-lg"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                                            / {scale}.0
                                        </span>
                                    </div>
                                </div>

                                {/* Conversion Formula */}
                                {scale === '10' && (
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                                            Formula Multiplier
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormula('9.5')}
                                                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                    formula === '9.5'
                                                        ? 'bg-blue-50 border-google-blue text-google-blue font-extrabold'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                CBSE / AICTE (× 9.5)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormula('10')}
                                                className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                                    formula === '10'
                                                        ? 'bg-blue-50 border-google-blue text-google-blue font-extrabold'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Standard (× 10.0)
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {!hasCalculated && !calculating && (
                                    <button
                                        type="submit"
                                        className="w-full bg-google-blue hover:bg-blue-600 text-white rounded-xl py-3.5 text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                                    >
                                        <span>Convert CGPA to Percentage →</span>
                                    </button>
                                )}

                                {calculating && (
                                    <button
                                        disabled
                                        className="w-full bg-google-blue/80 text-white rounded-xl py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-wait mt-4"
                                    >
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Converting Grade Profile...</span>
                                    </button>
                                )}

                                {/* Output Display */}
                                {hasCalculated && (
                                    <div className="space-y-6">
                                        <div className="mt-8 bg-blue-50 border border-blue-100/50 rounded-2xl p-6 text-center relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                <Percent className="w-20 h-20 text-google-blue" />
                                            </div>
                                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 block mb-1">Calculated Percentage</span>
                                            <span className="text-4xl font-black text-google-blue">{percentage}%</span>
                                            <p className="text-xs mt-3 text-gray-500 font-medium">
                                                {scale === '10' 
                                                    ? `Formula: CGPA (${cgpa}) × ${formula} multiplier` 
                                                    : `Formula: (GPA ${cgpa} / 4) × 100`}
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-2.5 border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 font-bold rounded-xl text-xs bg-gray-50 hover:bg-gray-100 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                            <span>Recalculate Percentage →</span>
                                        </button>

                                        <div className="pt-4 border-t border-gray-100">
                                            <ShareButtons 
                                                title={`I converted my CGPA of ${cgpa}/${scale} to ${percentage}% on IndiaScholarships! Check yours.`}
                                                url="https://www.indiascholarships.in/tools/cgpa-percentage-converter"
                                            />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Recommendation Panel */}
                        <div className="lg:col-span-7 space-y-6" ref={resultsRef}>
                            {hasCalculated ? (
                                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 font-serif">Recommended Scholarships</h2>
                                            <p className="text-gray-500 text-xs mt-1">Matched schemes requiring a score of ≤ {percentage}%</p>
                                        </div>
                                        <span className="self-start sm:self-center px-3 py-1 bg-blue-50 text-google-blue border border-blue-100 text-xs font-bold rounded-full">
                                            {matches.length} Matches Found
                                        </span>
                                    </div>

                                    {/* Category Tabs */}
                                    <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto pb-1">
                                        {[
                                            { id: 'government', label: 'Government', icon: Landmark },
                                            { id: 'private', label: 'Private & Corporate', icon: Building2 },
                                            { id: 'international', label: 'Study Abroad', icon: Globe },
                                            { id: 'all', label: 'Show All', icon: Coins }
                                        ].map((tab) => {
                                            const Icon = tab.icon;
                                            const count = getCountForTab(tab.id as TabType);
                                            return (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={() => setActiveTab(tab.id as TabType)}
                                                    className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
                                                        activeTab === tab.id
                                                            ? 'border-google-blue text-google-blue bg-blue-50/50'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    <span>{tab.label}</span>
                                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                                        activeTab === tab.id
                                                            ? 'bg-google-blue text-white font-extrabold'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {tabFilteredMatches.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tabFilteredMatches.slice(0, 6).map((s) => (
                                                <ScholarshipCard
                                                    key={s.id}
                                                    scholarship={s}
                                                    viewMode="grid"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                                            <p className="text-gray-500 font-semibold mb-2">No matching scholarships in this category</p>
                                            <p className="text-xs text-gray-400">Try selecting standard multipliers or checking other tabs.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs text-center py-16 flex flex-col items-center justify-center">
                                    <GraduationCap className="w-16 h-16 text-gray-300 mb-4 animate-pulse" />
                                    <h3 className="text-lg font-bold text-gray-900 font-serif mb-2">Find Matching Scholarships</h3>
                                    <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed">
                                        Enter your CGPA and click "Convert CGPA to Percentage" to instantly scan and display qualifying government and private scholarships.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Educational / Content Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-16">
                        
                        {/* Why This Matters */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-gray-900 font-serif">Why This Converter Matters</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Most state and central government scholarship portals in India (such as the National Scholarship Portal - NSP, and State SSP portals) request academic marks strictly in percentages during registration. 
                            </p>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                However, most universities and high schools grade students using Cumulative Grade Point Average (CGPA). Not converting your grades correctly or entering the wrong percentage can result in your application being rejected during document verification by nodal officers.
                            </p>
                        </div>

                        {/* How it Helps & Examples */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-gray-900 font-serif">How to Calculate: Real Examples</h3>
                            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                                <div className="border-b pb-3">
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Scenario A: CBSE Board Class 10/12</span>
                                    <p className="text-gray-700 font-semibold text-sm">CGPA: 8.4</p>
                                    <p className="text-gray-500 text-xs mt-1">Calculation: 8.4 × 9.5 = <strong className="text-gray-800">79.8%</strong></p>
                                </div>
                                <div className="border-b pb-3">
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Scenario B: University AICTE Standard</span>
                                    <p className="text-gray-700 font-semibold text-sm">CGPA: 7.5</p>
                                    <p className="text-gray-500 text-xs mt-1">Calculation: 7.5 × 10 = <strong className="text-gray-800">75.0%</strong></p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Scenario C: International GPA Scale</span>
                                    <p className="text-gray-700 font-semibold text-sm">GPA: 3.6 / 4.0</p>
                                    <p className="text-gray-500 text-xs mt-1">Calculation: (3.6 / 4) × 100 = <strong className="text-gray-800">90.0%</strong></p>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
