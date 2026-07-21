'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { 
    Coins, 
    CheckCircle2, 
    AlertCircle, 
    Share2, 
    ArrowRight, 
    FileText, 
    HelpCircle,
    Info,
    Check,
    Loader2,
    Building2,
    Landmark,
    Globe
} from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

type TabType = 'government' | 'private' | 'international' | 'all';

export default function IncomeClient({ scholarships }: Props) {
    const [income, setIncome] = useState<number>(200000);
    const [matches, setMatches] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);
    
    // Calculation action states
    const [calculating, setCalculating] = useState(false);
    const [hasCalculated, setHasCalculated] = useState(false);
    
    // Tabs state
    const [activeTab, setActiveTab] = useState<TabType>('government');
    
    const resultsRef = useRef<HTMLDivElement>(null);

    // Helper to dynamically categorize scholarships into Government, Private/Corporate, and International
    const getScholarshipCategory = (s: any): TabType => {
        const titleLower = s.title.toLowerCase();
        const providerLower = (s.provider || '').toLowerCase();
        const providerTypeLower = (s.provider_type || '').toLowerCase();
        const amt = s.amount_annual || s.amount_min || 0;

        // 1. Check International / Study Abroad (Amounts >= 5 Lakhs or specific titles/providers)
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

        // 2. Check Government (Central/State/Ministry/UT)
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

        // 3. Default to Private & Corporate
        return 'private';
    };

    useEffect(() => {
        // Filter: s.income_limit >= income OR s.income_limit = 0/null
        const filtered = scholarships.filter(s => {
            const limit = s.income_limit || 0;
            return limit === 0 || income <= limit;
        });
        setMatches(filtered);
    }, [income, scholarships]);

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        setCalculating(true);
        
        setTimeout(() => {
            setCalculating(false);
            setHasCalculated(true);
            
            // Smooth scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }, 800);
    };

    const handleCopyResults = () => {
        const text = `I checked my scholarship eligibility based on my family income of ₹${income.toLocaleString('en-IN')} on IndiaScholarships and found ${matches.length} matching schemes! Check yours at: https://www.indiascholarships.in/tools/income-calculator`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const presets = [150000, 250000, 450000, 600000, 800000];

    // Filter matches by current tab
    const tabFilteredMatches = matches.filter(s => {
        if (activeTab === 'all') return true;
        return getScholarshipCategory(s) === activeTab;
    });

    const getCountForTab = (tab: TabType) => {
        if (tab === 'all') return matches.length;
        return matches.filter(s => getScholarshipCategory(s) === tab).length;
    };

    // FAQ schema injection
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is the standard family income limit for Indian scholarships?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The income limit varies widely by provider. Centrally sponsored government schemes (like Post-Matric SC/OBC) typically have a family income cap of ₹2.5 Lakhs per year. However, private foundation scholarships and corporate schemes often set higher limits, sometimes up to ₹6 Lakhs or ₹8 Lakhs per year."
                }
            },
            {
                "@type": "Question",
                "name": "Whose income should be included in the annual family income calculation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Annual family income includes the gross income of both parents (salary, agricultural income, business, or other professions) and any unmarried siblings living in the same household. It must match the details specified on your official Income Certificate."
                }
            },
            {
                "@type": "Question",
                "name": "Is an Income Certificate mandatory for applying to these scholarships?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. For almost all income-based scholarships (both government and private), a valid Income Certificate issued by a competent state authority (such as a Tehsildar, Revenue Officer, or Sub-Divisional Magistrate) is mandatory during document verification."
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
                        <span className="text-[10px] uppercase font-bold text-google-blue tracking-wider block mb-1">Financial Eligibility Tool</span>
                        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 font-serif tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
                            Family Income Calculator
                        </h1>
                        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Use the IndiaScholarships Family Income Calculator to check if your family income matches the limits for government and private scholarships.
                        </p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Breadcrumbs */}
                    <div className="text-sm text-gray-500 mb-8">
                        <Link href="/tools" className="hover:text-google-blue font-medium">Tools</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">Family Income Calculator</span>
                    </div>

                    {/* Interactive Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
                        
                        {/* Slider and presets card */}
                        <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Coins className="w-5 h-5 text-amber-500" />
                                <span>Select Your Family Income</span>
                            </h2>
                            <p className="text-gray-500 text-xs leading-relaxed mb-6">
                                Move the slider to select your family's annual income, then click the button.
                            </p>

                            <form onSubmit={handleCalculate} className="space-y-6">
                                {/* Income slider */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Annual Family Income</span>
                                        <span className="text-2xl font-black text-amber-700">
                                            ₹{income.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50000"
                                        max="1000000"
                                        step="10000"
                                        value={income}
                                        onChange={(e) => {
                                            setIncome(Number(e.target.value));
                                            setHasCalculated(false); // Reset results state to require recalculation
                                        }}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-hidden"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 font-extrabold mt-2">
                                        <span>₹50K</span>
                                        <span>₹5L</span>
                                        <span>₹10L+</span>
                                    </div>
                                </div>

                                {/* Presets list */}
                                <div>
                                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">Quick Presets</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {presets.map((val) => (
                                            <button
                                                type="button"
                                                key={val}
                                                onClick={() => {
                                                    setIncome(val);
                                                    setHasCalculated(false);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    income === val
                                                        ? 'bg-amber-600 border border-amber-600 text-white shadow-xs'
                                                        : 'bg-white border border-gray-250 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                ₹{(val / 100000).toFixed(1)} Lakh
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <button
                                        type="submit"
                                        disabled={calculating}
                                        className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {calculating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Checking scholarships...</span>
                                            </>
                                        ) : (
                                            <span>Check Eligible Scholarships →</span>
                                        )}
                                    </button>

                                    {hasCalculated && (
                                        <div className="animate-fadeIn space-y-2">
                                            <button
                                                type="button"
                                                onClick={handleCopyResults}
                                                className="w-full py-2.5 bg-slate-50 border border-gray-250 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5 text-gray-500" />}
                                                <span>{copied ? 'Copied Results!' : 'Copy Summary Link'}</span>
                                            </button>
                                            <ShareButtons 
                                                title={`I checked my family income scholarship eligibility (₹${income.toLocaleString('en-IN')}) on IndiaScholarships and found ${matches.length} matching schemes! Check yours.`}
                                                url="https://www.indiascholarships.in/tools/income-calculator"
                                            />
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Database Recommendations Panel */}
                        <div className="lg:col-span-7 space-y-6" ref={resultsRef}>
                            <div className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs min-h-[380px] flex flex-col justify-between">
                                {!hasCalculated ? (
                                    <div className="flex flex-col items-center justify-center text-center py-16 flex-1">
                                        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                                            <Coins className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-extrabold text-lg text-gray-900 mb-1">Select income to see scholarships</h3>
                                        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                                            Choose your family income on the left and click the button.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="animate-fadeIn flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                                <div>
                                                    <h3 className="font-extrabold text-base text-gray-900">Your Scholarship Report</h3>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">Scholarships you can apply for with income of ₹{income.toLocaleString('en-IN')}</p>
                                                </div>
                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-extrabold rounded-full">
                                                    {matches.length} Total Matches
                                                </span>
                                            </div>

                                            {/* Category Tab Filters */}
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
                                                            onClick={() => setActiveTab(tab.id as TabType)}
                                                            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer border-b-2 ${
                                                                activeTab === tab.id
                                                                    ? 'border-amber-600 text-amber-700 bg-amber-50/50'
                                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <Icon className="w-3.5 h-3.5" />
                                                            <span>{tab.label}</span>
                                                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                                                activeTab === tab.id
                                                                    ? 'bg-amber-600 text-white font-extrabold'
                                                                    : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                {count}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {tabFilteredMatches.length > 0 ? (
                                                <div className="space-y-4">
                                                    {tabFilteredMatches.slice(0, 4).map((s) => {
                                                        const hasLimit = s.income_limit && s.income_limit > 0;
                                                        return (
                                                            <div key={s.id} className="border border-gray-150 hover:border-amber-400 rounded-xl p-5 transition-all bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
                                                                <div>
                                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                                        {hasLimit ? (
                                                                            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                                                                <span>Cap: ₹{(s.income_limit / 100000).toFixed(1)}L</span>
                                                                            </span>
                                                                        ) : (
                                                                            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded-full">
                                                                                No Income Limit
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[10px] text-gray-500 font-bold">{s.state || 'All India'}</span>
                                                                    </div>
                                                                    <h4 className="font-bold text-sm text-gray-900 mt-1 leading-snug">{s.title}</h4>
                                                                    <p className="text-xs text-gray-500 mt-1">Provider: {s.provider}</p>
                                                                </div>
                                                                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-150">
                                                                    <span className="text-sm font-black text-amber-700">
                                                                        {s.amount_annual >= 100000 
                                                                            ? `₹${(s.amount_annual / 100000).toFixed(1)}L` 
                                                                            : `₹${(s.amount_annual || s.amount_min || 0).toLocaleString('en-IN')}`
                                                                        }
                                                                    </span>
                                                                    <a 
                                                                        href={`/scholarships/${s.slug}`}
                                                                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 mt-1"
                                                                    >
                                                                        <span>Details</span>
                                                                        <ArrowRight className="w-3 h-3" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
                                                    <p className="text-gray-500 font-semibold mb-2">No matching scholarships in this category</p>
                                                    <p className="text-xs text-gray-400">Try checking the other tabs above.</p>
                                                </div>
                                            )}
                                        </div>

                                        {tabFilteredMatches.length > 4 && (
                                            <div className="text-center mt-6 pt-4 border-t border-gray-100">
                                                <Link 
                                                    href={`/eligibility-checker?income=${income}`}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors"
                                                >
                                                    <span>Search All {tabFilteredMatches.length} Matches</span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Educational / Content Sections (Traffic Magnets) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
                        
                        {/* Primary Content (Why & How) */}
                        <div className="lg:col-span-8 space-y-10">
                            
                            {/* Why it Matters (The Problem) */}
                            <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-indigo-600" />
                                    <span>Why Family Income Limits Matter for Scholarships</span>
                                </h3>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                                    <p>
                                        In India, most social welfare and merit-cum-means scholarship opportunities are designed to support students from economically weaker sections. To target this aid effectively, providers set strict <strong>Annual Family Income Limits</strong>.
                                    </p>
                                    <p>
                                        The primary challenge for students is that **these income caps are not standardized**. For example:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                        <li><strong>Centrally Sponsored Post-Matric Schemes (SC/OBC)</strong>: Typically set a cap of <strong>₹2.5 Lakhs</strong> per annum.</li>
                                        <li><strong>State-Specific Schemes</strong>: Some states allow limits up to <strong>₹6 Lakhs or ₹8 Lakhs</strong> (e.g. Rajarshi Chhatrapati Shahu Maharaj Fee Reimbursement in Maharashtra).</li>
                                        <li><strong>Private Corporate Foundations</strong>: Often have caps between <strong>₹4 Lakhs and ₹6 Lakhs</strong> (e.g. Tata Capital Pankh Scholarship).</li>
                                    </ul>
                                    <p>
                                        Applying for a scholarship when your family income exceeds the limit by even a small amount results in automatic rejection. Using our calculator helps you avoid wasting time on ineligible applications.
                                    </p>
                                </div>
                            </section>

                            {/* Practical Examples (Scenarios) */}
                            <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    <span>Real-World Eligibility Scenarios</span>
                                </h3>
                                
                                <div className="space-y-6">
                                    <div className="border-l-4 border-amber-500 pl-4 py-1">
                                        <h4 className="font-bold text-sm text-gray-900">Scenario 1: Household Income under ₹2.5 Lakhs (Ideal Category)</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            Students in this bracket qualify for almost all central and state government scholarships (NSP, SSP, UP Scholarships). This includes full tuition fee waivers and maintenance allowances for professional degrees (like engineering/medical).
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-indigo-500 pl-4 py-1">
                                        <h4 className="font-bold text-sm text-gray-900">Scenario 2: Household Income ₹2.5 Lakhs to ₹8 Lakhs (Middle Tier)</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            While you may be excluded from some SC/OBC centrally funded programs, you remain highly competitive for state-level general category schemes, EWS (Economically Weaker Section) quotas, and private corporate scholarships.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-slate-500 pl-4 py-1">
                                        <h4 className="font-bold text-sm text-gray-900">Scenario 3: Household Income above ₹8 Lakhs (Merit Only)</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            Most income-restricted schemes will categorize you as ineligible. Your best strategy is to target pure merit-based programs, national entrance exam scholarships (like NTSE/KVPY), or institutional waivers offered by specific private colleges.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* FAQ Section */}
                            <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-indigo-600" />
                                    <span>Frequently Asked Questions</span>
                                </h3>
                                
                                <div className="space-y-6 divide-y divide-gray-100">
                                    <div className="pt-0">
                                        <h4 className="font-bold text-sm text-gray-900">1. What is the standard family income limit for Indian scholarships?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            The income limit varies widely by provider. Centrally sponsored government schemes (like Post-Matric SC/OBC) typically have a family income cap of ₹2.5 Lakhs per year. However, private foundation scholarships and corporate schemes often set higher limits, sometimes up to ₹6 Lakhs or ₹8 Lakhs per year.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <h4 className="font-bold text-sm text-gray-900">2. Whose income should be included in the annual family income calculation?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            Annual family income includes the gross income of both parents (salary, agricultural income, business, or other professions) and any unmarried siblings living in the same household. It must match the details specified on your official Income Certificate.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <h4 className="font-bold text-sm text-gray-900">3. Is an Income Certificate mandatory for applying to these scholarships?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            Yes. For almost all income-based scholarships (both government and private), a valid Income Certificate issued by a competent state authority (such as a Tehsildar, Revenue Officer, or Sub-Divisional Magistrate) is mandatory during document verification.
                                        </p>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Sidebar Guidance */}
                        <div className="lg:col-span-4 space-y-6">
                            
                            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Coins className="w-24 h-24" />
                                </div>
                                <h4 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider mb-2">Need an Income Certificate?</h4>
                                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                    Learn how to apply for an official Income Certificate in your state, the list of required documents, and processing times.
                                </p>
                                <Link 
                                    href="/guides/documents"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-amber-400 transition-colors"
                                >
                                    <span>Read Document Guide</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs">
                                <h4 className="font-bold text-sm text-gray-900 mb-3">Other Utility Tools</h4>
                                <div className="space-y-3">
                                    <Link href="/tools/eligibility-checker" className="block text-xs font-semibold text-gray-600 hover:text-blue-700 transition-colors">
                                        → Scholarship Eligibility Checker
                                    </Link>
                                    <Link href="/tools/amount-calculator" className="block text-xs font-semibold text-gray-600 hover:text-blue-700 transition-colors">
                                        → Scholarship Benefit Estimator
                                    </Link>
                                    <Link href="/tools/study-cost-calculator" className="block text-xs font-semibold text-gray-600 hover:text-blue-700 transition-colors">
                                        → Study Cost Planner
                                    </Link>
                                    <Link href="/tools/loan-emi-calculator" className="block text-xs font-semibold text-gray-600 hover:text-blue-700 transition-colors">
                                        → Education Loan EMI Calculator
                                    </Link>
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
