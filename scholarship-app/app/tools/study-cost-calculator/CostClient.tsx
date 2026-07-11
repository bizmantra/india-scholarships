'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { 
    BookOpen, 
    AlertCircle, 
    ArrowRight, 
    Share2, 
    HelpCircle,
    Info,
    Check,
    Loader2,
    CheckCircle2,
    Coins,
    Building2,
    Globe,
    Landmark,
    FileText
} from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

type TabType = 'government' | 'private' | 'international' | 'all';

export default function CostClient({ scholarships }: Props) {
    const [level, setLevel] = useState<string>('UG');
    const [category, setCategory] = useState<string>('General');
    
    // Expenses
    const [tuition, setTuition] = useState<number>(80000);
    const [accommodation, setAccommodation] = useState<number>(5000); // monthly
    const [food, setFood] = useState<number>(3000); // monthly
    const [books, setBooks] = useState<number>(10000); // annual
    
    // Secured funding
    const [securedScholarship, setSecuredScholarship] = useState<number>(0);
    
    // Outputs
    const [totalAnnual, setTotalAnnual] = useState<number>(0);
    const [fundingGap, setFundingGap] = useState<number>(0);
    const [coveragePercent, setCoveragePercent] = useState<number>(0);
    
    // Calculation action states
    const [calculating, setCalculating] = useState(false);
    const [hasCalculated, setHasCalculated] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // Result tabs
    const [activeTab, setActiveTab] = useState<TabType>('government');
    
    const [matches, setMatches] = useState<any[]>([]);
    const resultsRef = useRef<HTMLDivElement>(null);

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
            providerTypeLower.includes('status') ||
            providerTypeLower.includes('ministry') ||
            providerTypeLower.includes('department') ||
            providerTypeLower.includes('implementing')
        ) {
            return 'government';
        }

        return 'private';
    };

    useEffect(() => {
        const annualAccommodation = accommodation * 12;
        const annualFood = food * 12;
        const total = tuition + annualAccommodation + annualFood + books;
        setTotalAnnual(total);

        // Gap is total cost minus whatever scholarship they already have
        const gap = Math.max(0, total - securedScholarship);
        setFundingGap(gap);

        // Coverage percentage
        const pct = total > 0 ? Math.min(100, Math.round((securedScholarship / total) * 100)) : 0;
        setCoveragePercent(pct);
    }, [tuition, accommodation, food, books, securedScholarship]);

    useEffect(() => {
        // Filter database matches based on academic level and category/caste
        const filtered = scholarships.filter(s => {
            // 1. Level match
            const sLevel = s.level || '';
            const matchesLevel = sLevel.toLowerCase().includes(level.toLowerCase()) || 
                                (level === 'UG' && sLevel.includes('Undergraduate')) ||
                                (level === 'PG' && sLevel.includes('Postgraduate')) ||
                                (level === 'Class 9-12' && (sLevel.includes('11') || sLevel.includes('12') || sLevel.includes('9-12'))) ||
                                (level === 'Pre-Matric' && (sLevel.includes('Class 1') || sLevel.includes('Pre-Matric')));
            
            // 2. Category/Caste match
            let castes: string[] = [];
            try {
                const parsed = s.caste ? JSON.parse(s.caste) : null;
                castes = Array.isArray(parsed) ? parsed : (s.caste ? [s.caste] : []);
            } catch {
                castes = s.caste ? [s.caste] : [];
            }
            castes = (castes || []).filter(c => c && c !== 'null');
            const matchesCaste = castes.includes(category) || castes.includes('All') || castes.length === 0;

            return matchesLevel && matchesCaste;
        });

        setMatches(filtered);
    }, [level, category, scholarships]);

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
        const text = `My estimated college cost is ₹${totalAnnual.toLocaleString('en-IN')}/year and my funding gap is ₹${fundingGap.toLocaleString('en-IN')}/year. Checked via IndiaScholarships College Expense Planner! Plan yours: https://www.indiascholarships.in/tools/study-cost-calculator`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Filter matches by current tab
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
                "name": "What is a college funding gap?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A college funding gap is the difference between the total cost of your college education (fees, room, food, books) and the money you have available (scholarships, family savings). If your expenses are ₹1.5 Lakhs and you have ₹50,000 in scholarships, your funding gap is ₹1 Lakh."
                }
            },
            {
                "@type": "Question",
                "name": "How can I cover my college expense gap?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can cover your college gap by: (1) Applying for state-specific tuition fee waivers, (2) Applying for private or corporate foundation scholarships that pay stipends directly to you, (3) Applying for central government minority or merit-cum-means schemes, or (4) Securing a low-interest student education loan from public banks."
                }
            },
            {
                "@type": "Question",
                "name": "Should I include hostel fees in my scholarship planning?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. College tuition fee is only one part of the cost. Living expenses (hostel rent, food, transport, books) often equal or exceed tuition fees, especially if you move to a metro city. Always calculate the total cost of attendance when planning your funding."
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
                <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-indigo-950 text-white py-16 px-4 sm:px-6 lg:px-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.1),transparent)] pointer-events-none" />
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-4">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Check College Expenses & Gap</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
                            Study Cost Calculator
                        </h1>
                        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            Use the IndiaScholarships Study Cost Calculator to plan your college budget, calculate fees and hostel expenses, and estimate your remaining funding gap.
                        </p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Breadcrumbs */}
                    <div className="text-sm text-gray-500 mb-8">
                        <Link href="/tools" className="hover:text-blue-700 font-medium">Tools</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">College Expense Planner</span>
                    </div>

                    {/* Interactive Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
                        
                        {/* Control Panel */}
                        <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Coins className="w-5 h-5 text-cyan-500" />
                                <span>Enter Your College Costs</span>
                            </h2>
                            <p className="text-gray-500 text-xs leading-relaxed mb-6">
                                Enter your expected fees and hostel costs below to calculate your total expenses and check for scholarship matches.
                            </p>

                            <form onSubmit={handleCalculate} className="space-y-6">
                                {/* Academic Profile */}
                                <div className="p-4 bg-slate-50 border border-gray-150 rounded-xl space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Academic Profile (For Scholarship Matches)</h3>
                                    
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Education Level</label>
                                        <select 
                                            value={level} 
                                            onChange={(e) => {
                                                setLevel(e.target.value);
                                                setHasCalculated(false);
                                            }}
                                            className="w-full text-xs font-semibold bg-white border border-gray-250 p-2.5 rounded-lg focus:outline-hidden focus:border-cyan-500"
                                        >
                                            <option value="UG">Undergraduate (UG)</option>
                                            <option value="PG">Postgraduate (PG)</option>
                                            <option value="Class 9-12">Class 9 - 12</option>
                                            <option value="Pre-Matric">Class 1 - 10</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Category / Caste</label>
                                        <select 
                                            value={category} 
                                            onChange={(e) => {
                                                setCategory(e.target.value);
                                                setHasCalculated(false);
                                            }}
                                            className="w-full text-xs font-semibold bg-white border border-gray-250 p-2.5 rounded-lg focus:outline-hidden focus:border-cyan-500"
                                        >
                                            <option value="General">General</option>
                                            <option value="OBC">OBC</option>
                                            <option value="SC">SC</option>
                                            <option value="ST">ST</option>
                                            <option value="EWS">EWS</option>
                                            <option value="Minority">Minority</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Annual Tuition Fee */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Annual College Fee</span>
                                        <span className="text-sm font-black text-gray-800">₹{tuition.toLocaleString('en-IN')}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5000"
                                        max="500000"
                                        step="5000"
                                        value={tuition}
                                        onChange={(e) => {
                                            setTuition(Number(e.target.value));
                                            setHasCalculated(false);
                                        }}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-hidden"
                                    />
                                    <div className="flex justify-between text-[9px] text-gray-400 font-extrabold mt-1">
                                        <span>₹5,000</span>
                                        <span>₹2.5L</span>
                                        <span>₹5L+</span>
                                    </div>
                                </div>

                                {/* Accommodation rent */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Hostel or Rent (Monthly)</span>
                                        <span className="text-sm font-black text-gray-800">₹{accommodation.toLocaleString('en-IN')}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="20000"
                                        step="500"
                                        value={accommodation}
                                        onChange={(e) => {
                                            setAccommodation(Number(e.target.value));
                                            setHasCalculated(false);
                                        }}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-hidden"
                                    />
                                    <div className="flex justify-between text-[9px] text-gray-400 font-extrabold mt-1">
                                        <span>₹0 (Home)</span>
                                        <span>₹10,000</span>
                                        <span>₹20,000</span>
                                    </div>
                                </div>

                                {/* Food */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Food, Books & Travel (Monthly)</span>
                                        <span className="text-sm font-black text-gray-800">₹{food.toLocaleString('en-IN')}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1000"
                                        max="15000"
                                        step="500"
                                        value={food}
                                        onChange={(e) => {
                                            setFood(Number(e.target.value));
                                            setHasCalculated(false);
                                        }}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-hidden"
                                    />
                                    <div className="flex justify-between text-[9px] text-gray-400 font-extrabold mt-1">
                                        <span>₹1,000</span>
                                        <span>₹8,000</span>
                                        <span>₹15,000</span>
                                    </div>
                                </div>

                                {/* Secured funding */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Scholarship Money You Already Have (Annual)</span>
                                        <span className="text-sm font-black text-emerald-700">₹{securedScholarship.toLocaleString('en-IN')}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="300000"
                                        step="5000"
                                        value={securedScholarship}
                                        onChange={(e) => {
                                            setSecuredScholarship(Number(e.target.value));
                                            setHasCalculated(false);
                                        }}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-hidden"
                                    />
                                    <div className="flex justify-between text-[9px] text-gray-400 font-extrabold mt-1">
                                        <span>₹0</span>
                                        <span>₹1.5L</span>
                                        <span>₹3L</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <button
                                        type="submit"
                                        disabled={calculating}
                                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {calculating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Calculating Costs...</span>
                                            </>
                                        ) : (
                                            <span>Calculate College Expenses →</span>
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
                                                title={`My college expenses total ₹${totalAnnual.toLocaleString('en-IN')}/year and my scholarship funding gap is ₹${fundingGap.toLocaleString('en-IN')}/year. Check yours.`}
                                                url="https://www.indiascholarships.in/tools/study-cost-calculator"
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
                                        <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center mb-4">
                                            <Coins className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-extrabold text-lg text-gray-900 mb-1">Enter details to see college cost report</h3>
                                        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                                            Input your college fees on the left and click the button to see your total cost and funding gap report.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="animate-fadeIn flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                                <div>
                                                    <h3 className="font-extrabold text-base text-gray-900">Your College Budget Report</h3>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">Calculated for {level} • {category} category</p>
                                                </div>
                                                <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 text-xs font-extrabold rounded-full">
                                                    Annual Budget
                                                </span>
                                            </div>

                                            {/* Cost Summary Cards */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                                <div className="bg-slate-50 border border-gray-150 rounded-xl p-4 text-center">
                                                    <span className="text-[9px] font-extrabold uppercase text-gray-400 tracking-wider">Total College Cost</span>
                                                    <span className="text-lg font-black text-gray-800 block mt-0.5">
                                                        ₹{totalAnnual.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-bold block">per year</span>
                                                </div>
                                                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-center">
                                                    <span className="text-[9px] font-extrabold uppercase opacity-90 tracking-wider">Scholarship Money</span>
                                                    <span className="text-lg font-black block mt-0.5">
                                                        - ₹{securedScholarship.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-[9px] opacity-90 block">per year</span>
                                                </div>
                                                <div className="bg-cyan-600 text-white rounded-xl p-4 text-center shadow-md shadow-cyan-500/10">
                                                    <span className="text-[9px] font-extrabold uppercase opacity-90 tracking-wider">Your Funding Gap</span>
                                                    <span className="text-lg font-black block mt-0.5">
                                                        ₹{fundingGap.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-[9px] opacity-90 block">needed per year</span>
                                                </div>
                                            </div>

                                            {/* Progress Bar of Coverage */}
                                            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-gray-150">
                                                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                                                    <span>Scholarship Coverage</span>
                                                    <span>{coveragePercent}% Covered</span>
                                                </div>
                                                <div className="w-full h-2.5 bg-gray-250 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500" 
                                                        style={{ width: `${coveragePercent}%` }}
                                                    />
                                                </div>
                                                {fundingGap > 0 ? (
                                                    <p className="text-[10px] text-cyan-700 font-bold mt-2 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5 text-cyan-600" />
                                                        <span>You need to find ₹{fundingGap.toLocaleString('en-IN')} more to pay for your studies. Check scholarship matches below!</span>
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] text-emerald-700 font-bold mt-2 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>100% of your college costs are covered by your scholarship money!</span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="border-t pt-4">
                                                <h4 className="font-extrabold text-xs text-gray-900 mb-3 uppercase tracking-wider">Recommended Scholarships To Fill Your Gap</h4>
                                                
                                                {/* Category Tab Filters */}
                                                <div className="flex border-b border-gray-200 mb-4 gap-1 overflow-x-auto pb-1">
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
                                                                        ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                <Icon className="w-3.5 h-3.5" />
                                                                <span>{tab.label}</span>
                                                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                                                    activeTab === tab.id
                                                                        ? 'bg-cyan-600 text-white font-extrabold'
                                                                        : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                    {count}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Matching list */}
                                                {tabFilteredMatches.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {tabFilteredMatches.slice(0, 3).map((s) => (
                                                            <div key={s.id} className="border border-gray-150 hover:border-cyan-400 rounded-xl p-4 transition-all bg-slate-50/30 flex justify-between items-center gap-4 animate-fadeIn">
                                                                <div>
                                                                    <span className="text-[10px] text-gray-500 font-bold block">{s.provider}</span>
                                                                    <h5 className="font-bold text-xs text-gray-900 mt-0.5 leading-snug line-clamp-1">{s.title}</h5>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs font-black text-cyan-700 whitespace-nowrap">
                                                                        {s.amount_annual >= 100000 
                                                                            ? `₹${(s.amount_annual / 100000).toFixed(1)}L` 
                                                                            : `₹${(s.amount_annual || s.amount_min || 0).toLocaleString('en-IN')}`
                                                                        }
                                                                    </span>
                                                                    <a 
                                                                        href={`/scholarships/${s.slug}`}
                                                                        className="p-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-md transition-colors"
                                                                    >
                                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                                                        <p className="text-gray-500 font-semibold mb-2">No matching scholarships in this category</p>
                                                        <p className="text-xs text-gray-400">Try checking the other tabs above.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {tabFilteredMatches.length > 3 && (
                                            <div className="text-center mt-6 pt-4 border-t border-gray-100">
                                                <Link 
                                                    href={`/eligibility-checker?level=${level}&caste=${category}`}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-50 text-cyan-700 border border-cyan-100 text-xs font-bold rounded-xl hover:bg-cyan-100 transition-colors"
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
                                    <Info className="w-5 h-5 text-cyan-600" />
                                    <span>What is a College Funding Gap?</span>
                                </h3>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                                    <p>
                                        A college funding gap is the difference between the total cost of your college education (fees, room, food, books) and the money you have available (scholarships, family savings).
                                    </p>
                                    <p>
                                        For example, if your total college costs (fees plus living expenses) are ₹1.5 Lakhs and you have ₹50,000 in scholarships, your funding gap is ₹1 Lakh.
                                    </p>
                                    <p>
                                        It is very important to check your college cost and funding gap *before* the academic year starts so you can arrange for student loans, part-time jobs, or apply for additional corporate foundation scholarships to cover the remaining costs.
                                    </p>
                                </div>
                            </section>

                            {/* How to Reduce Your Funding Gap */}
                            <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-cyan-600" />
                                    <span>How to Reduce Your College Gap</span>
                                </h3>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                        <li><strong>Apply for Government Fee Waivers</strong>: Look for state-specific tuition fee waivers (like SSP in Karnataka or EBC in Maharashtra) that pay tuition fees directly to the college.</li>
                                        <li><strong>Secure Corporate Scholarships</strong>: Apply for corporate scholarships (like Tata Capital, HDFC Badhte Kadam, Reliance) that provide fixed stipends paid directly to your bank account to cover living and accommodation costs.</li>
                                        <li><strong>Consider Low-Interest Student Loans</strong>: If your gap is still large, public sector banks in India offer education loans with flexible repayment terms that only start after you complete your degree and find a job.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* FAQ Section */}
                            <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-cyan-600" />
                                    <span>Frequently Asked Questions</span>
                                </h3>
                                
                                <div className="space-y-6 divide-y divide-gray-100">
                                    <div className="pt-0">
                                        <h4 className="font-bold text-sm text-gray-900">1. What is a college funding gap?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            A college funding gap is the difference between the total cost of your college education (fees, room, food, books) and the money you have available (scholarships, family savings). If your expenses are ₹1.5 Lakhs and you have ₹50,000 in scholarships, your funding gap is ₹1 Lakh.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <h4 className="font-bold text-sm text-gray-900">2. How can I cover my college expense gap?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            You can cover your college gap by: (1) Applying for state-specific tuition fee waivers, (2) Applying for private or corporate foundation scholarships that pay stipends directly to you, (3) Applying for central government minority or merit-cum-means schemes, or (4) Securing a low-interest student education loan from public banks.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <h4 className="font-bold text-sm text-gray-900">3. Should I include hostel fees in my scholarship planning?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            Yes. College tuition fee is only one part of the cost. Living expenses (hostel rent, food, transport, books) often equal or exceed tuition fees, especially if you move to a metro city. Always calculate the total cost of attendance when planning your funding.
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
                                <h4 className="font-extrabold text-sm text-cyan-400 uppercase tracking-wider mb-2">Check Education Loans</h4>
                                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                    Calculate your monthly EMI, compare interest rates across major public banks, and plan loan repayments.
                                </p>
                                <Link 
                                    href="/tools/loan-emi-calculator"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-cyan-400 transition-colors"
                                >
                                    <span>Open EMI Calculator</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs">
                                <h4 className="font-bold text-sm text-gray-900 mb-3">Other Utility Tools</h4>
                                <div className="space-y-3">
                                    <Link href="/tools/amount-calculator" className="block text-xs font-semibold text-gray-600 hover:text-blue-700 transition-colors">
                                        → Scholarship Amount Calculator
                                    </Link>
                                    <Link href="/tools/income-calculator" className="block text-xs font-semibold text-gray-600 hover:text-blue-700 transition-colors">
                                        → Family Income Cap Calculator
                                    </Link>
                                    <Link href="/tools/eligibility-checker" className="block text-xs font-semibold text-gray-600 hover:text-blue-700 transition-colors">
                                        → Scholarship Eligibility Checker
                                    </Link>
                                    <Link href="/tools/cgpa-calculator" className="block text-xs font-semibold text-gray-600 hover:text-blue-700 transition-colors">
                                        → CGPA to Percentage Converter
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
