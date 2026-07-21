'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { 
    GraduationCap, 
    Landmark, 
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
    FileText,
    BookOpen
} from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

type TabType = 'government' | 'private' | 'international' | 'all';

export default function AmountClient({ scholarships }: Props) {
    const [level, setLevel] = useState<string>('UG');
    const [category, setCategory] = useState<string>('General');
    const [stream, setStream] = useState<string>('Engineering');
    
    // Calculation action states
    const [calculating, setCalculating] = useState(false);
    const [hasCalculated, setHasCalculated] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // Result tabs
    const [activeTab, setActiveTab] = useState<TabType>('government');
    
    const [stats, setStats] = useState({
        min: 0,
        max: 0,
        avg: 0,
        count: 0
    });
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
        // Filter based on selected criteria (Level, Category/Caste, Stream)
        const filtered = scholarships.filter(s => {
            // 1. Level match
            const sLevel = s.level || '';
            const matchesLevel = sLevel.toLowerCase().includes(level.toLowerCase()) || 
                                (level === 'UG' && sLevel.includes('Undergraduate')) ||
                                (level === 'PG' && sLevel.includes('Postgraduate')) ||
                                (level === 'Class 9-12' && (sLevel.includes('11') || sLevel.includes('12') || sLevel.includes('9-12'))) ||
                                (level === 'Pre-Matric' && (sLevel.includes('Class 1') || sLevel.includes('Pre-Matric')));
            
            let castes: any[] = [];
            try {
                const parsed = JSON.parse(s.caste);
                castes = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
            } catch {
                castes = s.caste ? [s.caste] : [];
            }
            if (!castes || !Array.isArray(castes)) {
                castes = [];
            }
            const matchesCaste = castes.includes(category) || castes.includes('All') || castes.length === 0;

            // 3. Stream match
            const sStream = (s.course_stream || '').toLowerCase();
            const matchesStream = sStream.includes('all') || 
                                  sStream.includes('general') || 
                                  sStream.length === 0 ||
                                  (stream === 'Engineering' && (sStream.includes('engineer') || sStream.includes('b.tech') || sStream.includes('b.e'))) ||
                                  (stream === 'Medical' && (sStream.includes('medic') || sStream.includes('mbbs') || sStream.includes('nursing'))) ||
                                  (stream === 'Diploma' && (sStream.includes('diploma') || sStream.includes('iti') || sStream.includes('polytechnic'))) ||
                                  (stream === 'Professional' && (sStream.includes('professional') || sStream.includes('mba') || sStream.includes('law')));

            return matchesLevel && matchesCaste && matchesStream;
        });

        // Compute statistics
        if (filtered.length > 0) {
            const amounts = filtered.map(s => s.amount_annual || s.amount_min || 0).filter(a => a > 0);
            if (amounts.length > 0) {
                const minVal = Math.min(...amounts);
                const maxVal = Math.max(...amounts);
                const sum = amounts.reduce((a, b) => a + b, 0);
                const avgVal = Math.round(sum / amounts.length);

                setStats({
                    min: minVal,
                    max: maxVal,
                    avg: avgVal,
                    count: filtered.length
                });
            } else {
                setStats({ min: 0, max: 0, avg: 0, count: filtered.length });
            }
        } else {
            setStats({ min: 0, max: 0, avg: 0, count: 0 });
        }

        setMatches(filtered);
    }, [level, category, stream, scholarships]);

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
        const text = `I calculated my scholarship benefits for ${level} (${stream}) on IndiaScholarships. Estimated Average Payout: ₹${stats.avg.toLocaleString('en-IN')}/year! Calculate yours: https://www.indiascholarships.in/tools/scholarship-amount-calculator`;
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
                "name": "How is a scholarship disbursement amount calculated in India?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Scholarship amounts are determined by education level, course stream, and type of funding. Government scholarships typically offer tuition fee reimbursement up to a capped amount, plus a monthly maintenance allowance. Private corporate scholarships usually offer fixed annual stipends ranging from ₹10,000 up to ₹2,000,000 for professional degrees."
                }
            },
            {
                "@type": "Question",
                "name": "Can I receive multiple scholarships at the same time?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Generally, you cannot receive two government scholarships concurrently. However, most scholarship providers permit combining a government tuition fee waiver with a private corporate foundation stipend (like Tata or Reliance) that covers non-academic personal costs (hostel, books, devices), unless explicitly forbidden by the terms."
                }
            },
            {
                "@type": "Question",
                "name": "What is the typical amount for undergraduate engineering scholarships?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "For engineering courses, government scholarships typically cover ₹25,000 to ₹50,000 per year (or full tuition fee reimbursement depending on category). Private/corporate scholarships frequently range from ₹30,000 to ₹1,00,000 per year."
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
                        <span className="text-[10px] uppercase font-bold text-google-blue tracking-wider block mb-1">Scholarship Grant Planner</span>
                        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 font-serif tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
                            Scholarship Amount Calculator
                        </h1>
                        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Use the IndiaScholarships Scholarship Amount Calculator to find out how much money you can get in scholarships based on your class, category, and stream.
                        </p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Breadcrumbs */}
                    <div className="text-sm text-gray-500 mb-8">
                        <Link href="/tools" className="hover:text-google-blue font-medium">Tools</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">Scholarship Amount Calculator</span>
                    </div>

                    {/* Interactive Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
                        
                        {/* Control Panel */}
                        <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Coins className="w-5 h-5 text-violet-500" />
                                <span>Enter Your Details</span>
                            </h2>
                            <p className="text-gray-500 text-xs leading-relaxed mb-6">
                                Select your education level, caste category, and stream to see matching scholarship amounts.
                            </p>

                            <form onSubmit={handleCalculate} className="space-y-6">
                                {/* Level of Education */}
                                <div>
                                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">What is your Education Level?</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'UG', label: 'Undergraduate (UG)' },
                                            { id: 'PG', label: 'Postgraduate (PG)' },
                                            { id: 'Class 9-12', label: 'Class 9 - 12' },
                                            { id: 'Pre-Matric', label: 'Class 1 - 10' }
                                        ].map((opt) => (
                                            <button
                                                type="button"
                                                key={opt.id}
                                                onClick={() => {
                                                    setLevel(opt.id);
                                                    setHasCalculated(false);
                                                }}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                                    level === opt.id
                                                        ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
                                                        : 'bg-white border-gray-250 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Selection */}
                                <div>
                                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">What is your Category / Caste?</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['General', 'OBC', 'SC', 'ST', 'Minority', 'EWS'].map((cat) => (
                                            <button
                                                type="button"
                                                key={cat}
                                                onClick={() => {
                                                    setCategory(cat);
                                                    setHasCalculated(false);
                                                }}
                                                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                                    category === cat
                                                        ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
                                                        : 'bg-white border-gray-250 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Course Stream */}
                                <div>
                                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">What is your Course Stream?</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'Engineering', label: 'Engineering / Tech' },
                                            { id: 'Medical', label: 'Medical / MBBS / Nursing' },
                                            { id: 'General Academic', label: 'BA / BSc / BCom' },
                                            { id: 'Professional', label: 'Professional / MBA / Law' },
                                            { id: 'Diploma', label: 'Diploma / ITI' }
                                        ].map((opt) => (
                                            <button
                                                type="button"
                                                key={opt.id}
                                                onClick={() => {
                                                    setStream(opt.id);
                                                    setHasCalculated(false);
                                                }}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                                    stream === opt.id
                                                        ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
                                                        : 'bg-white border-gray-250 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <button
                                        type="submit"
                                        disabled={calculating}
                                        className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {calculating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Checking amounts...</span>
                                            </>
                                        ) : (
                                            <span>Check Scholarship Amount →</span>
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
                                                title={`I estimated my scholarship payout on IndiaScholarships and found average payouts of ₹${stats.avg.toLocaleString('en-IN')}/yr for ${level} (${stream}). Check yours.`}
                                                url="https://www.indiascholarships.in/tools/amount-calculator"
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
                                        <div className="w-16 h-16 rounded-full bg-violet-50 text-violet-500 flex items-center justify-center mb-4">
                                            <Coins className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-extrabold text-lg text-gray-900 mb-1">Enter details to see scholarship money</h3>
                                        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                                            Select your options on the left and click the button to see how much money you can get.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="animate-fadeIn flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                                <div>
                                                    <h3 className="font-extrabold text-base text-gray-900">How Much Money You Can Get</h3>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">Estimated amount for {level} • {stream} • {category}</p>
                                                </div>
                                                <span className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-extrabold rounded-full">
                                                    {matches.length} Total Matches
                                                </span>
                                            </div>

                                            {/* Stat Cards */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                                <div className="bg-slate-50 border border-gray-150 rounded-xl p-4 text-center">
                                                    <span className="text-[9px] font-extrabold uppercase text-gray-400 tracking-wider">Minimum Amount</span>
                                                    <span className="text-xl font-black text-gray-800 block mt-0.5">
                                                        ₹{stats.min >= 100000 ? `${(stats.min / 100000).toFixed(1)}L` : stats.min.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-bold block">per year</span>
                                                </div>
                                                <div className="bg-violet-600 text-white rounded-xl p-4 text-center shadow-md shadow-violet-500/10">
                                                    <span className="text-[9px] font-extrabold uppercase opacity-90 tracking-wider">Average Amount</span>
                                                    <span className="text-xl font-black block mt-0.5">
                                                        ₹{stats.avg >= 100000 ? `${(stats.avg / 100000).toFixed(1)}L` : stats.avg.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-[9px] opacity-90 block">per year</span>
                                                </div>
                                                <div className="bg-slate-50 border border-gray-150 rounded-xl p-4 text-center">
                                                    <span className="text-[9px] font-extrabold uppercase text-gray-400 tracking-wider">Maximum Amount</span>
                                                    <span className="text-xl font-black text-gray-800 block mt-0.5">
                                                        ₹{stats.max >= 100000 ? `${(stats.max / 100000).toFixed(1)}L` : stats.max.toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-bold block">per year</span>
                                                </div>
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
                                                                    ? 'border-violet-600 text-violet-700 bg-violet-50/50'
                                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <Icon className="w-3.5 h-3.5" />
                                                            <span>{tab.label}</span>
                                                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                                                                activeTab === tab.id
                                                                    ? 'bg-violet-600 text-white font-extrabold'
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
                                                <div className="space-y-4">
                                                    {tabFilteredMatches.slice(0, 4).map((s) => (
                                                        <div key={s.id} className="border border-gray-150 hover:border-violet-400 rounded-xl p-5 transition-all bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
                                                            <div>
                                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-violet-100 text-violet-800 rounded-full">
                                                                        {s.state || 'All India'}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-500 font-bold">{s.provider}</span>
                                                                </div>
                                                                <h4 className="font-bold text-sm text-gray-900 mt-1 leading-snug">{s.title}</h4>
                                                            </div>
                                                            <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-150">
                                                                <span className="text-sm font-black text-violet-700">
                                                                    {s.amount_annual >= 100000 
                                                                        ? `₹${(s.amount_annual / 100000).toFixed(1)}L` 
                                                                        : `₹${(s.amount_annual || s.amount_min || 0).toLocaleString('en-IN')}`
                                                                    }
                                                                </span>
                                                                <a 
                                                                    href={`/scholarships/${s.slug}`}
                                                                    className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700 mt-1"
                                                                >
                                                                    <span>Details</span>
                                                                    <ArrowRight className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
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
                                                    href={`/eligibility-checker?level=${level}&caste=${category}`}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-50 text-violet-700 border border-violet-100 text-xs font-bold rounded-xl hover:bg-violet-100 transition-colors"
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
                                    <Info className="w-5 h-5 text-violet-600" />
                                    <span>How Do Scholarship Payments Work?</span>
                                </h3>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                                    <p>
                                        Scholarships do not all pay the same way. Different scholarships pay for different things:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                        <li><strong>College Fee Waivers</strong>: The government often pays your college fees directly to your college. You do not get cash in hand, but your college fees are reduced.</li>
                                        <li><strong>Pocket Money Allowance</strong>: The government may also send ₹500 to ₹1,500 monthly directly to your bank account for daily expenses.</li>
                                        <li><strong>Private / Company Scholarships</strong>: Companies and foundations (like Tata or Reliance) send money (like ₹30,000 or ₹50,000 per year) directly to your bank account. You can spend this on hostel, books, or a laptop.</li>
                                    </ul>
                                    <p>
                                        Knowing this helps you plan how much money you need to arrange yourself before college starts.
                                    </p>
                                </div>
                            </section>

                            {/* Payout Scenarios (Case Studies) */}
                            <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-violet-600" />
                                    <span>Real-Life Examples</span>
                                </h3>
                                
                                <div className="space-y-6">
                                    <div className="border-l-4 border-violet-500 pl-4 py-1">
                                        <h4 className="font-bold text-sm text-gray-900">Example 1: Getting both Government Fee Waiver and Company Money</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            Amit is an engineering student. The Maharashtra government pays half of his college fees directly to his college. At the same time, he gets ₹40,000 per year from the Tata Capital Pankh Scholarship in his bank account, which he uses to buy a laptop and pay for his hostel.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-emerald-500 pl-4 py-1">
                                        <h4 className="font-bold text-sm text-gray-900">Example 2: 100% Fees Paid by Government</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            Priya is studying BA. Under the government's Post-Matric SC Scheme, her entire college fee of ₹12,000 is paid by the government, and she gets ₹1,200 every month in her bank account for books and food.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-amber-500 pl-4 py-1">
                                        <h4 className="font-bold text-sm text-gray-900">Example 3: Studying Abroad with Full Funding</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            Vikram got a fellowship to study in the USA. The scholarship pays his complete college fees, flight tickets, visa charges, and sends him monthly pocket money for living there.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* FAQ Section */}
                            <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-violet-600" />
                                    <span>Frequently Asked Questions</span>
                                </h3>
                                
                                <div className="space-y-6 divide-y divide-gray-100">
                                    <div className="pt-0">
                                        <h4 className="font-bold text-sm text-gray-900">1. How is a scholarship disbursement amount calculated in India?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            Scholarship amounts are determined by education level, course stream, and type of funding. Government scholarships typically offer tuition fee reimbursement up to a capped amount, plus a monthly maintenance allowance. Private corporate scholarships usually offer fixed annual stipends ranging from ₹10,000 up to ₹2,000,000 for professional degrees.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <h4 className="font-bold text-sm text-gray-900">2. Can I receive multiple scholarships at the same time?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            Generally, you cannot receive two government scholarships concurrently. However, most scholarship providers permit combining a government tuition fee waiver with a private corporate foundation stipend (like Tata or Reliance) that covers non-academic personal costs (hostel, books, devices), unless explicitly forbidden by the terms.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <h4 className="font-bold text-sm text-gray-900">3. What is the typical amount for undergraduate engineering scholarships?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            For engineering courses, government scholarships typically cover ₹25,000 to ₹50,000 per year (or full tuition fee reimbursement depending on category). Private/corporate scholarships frequently range from ₹30,000 to ₹1,00,000 per year.
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
                                <h4 className="font-extrabold text-sm text-violet-400 uppercase tracking-wider mb-2">Plan Your Education Costs</h4>
                                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                    Use our interactive Study Cost Planner to calculate tuition, hostel, and miscellaneous fees and estimate your financial gap.
                                </p>
                                <Link 
                                    href="/tools/study-cost-calculator"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-violet-400 transition-colors"
                                >
                                    <span>Open Cost Planner</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs">
                                <h4 className="font-bold text-sm text-gray-900 mb-3">Other Utility Tools</h4>
                                <div className="space-y-3">
                                    <Link href="/tools/income-calculator" className="block text-xs font-semibold text-gray-600 hover:text-blue-700 transition-colors">
                                        → Family Income Cap Calculator
                                    </Link>
                                    <Link href="/tools/eligibility-checker" className="block text-xs font-semibold text-gray-600 hover:text-blue-700 transition-colors">
                                        → Scholarship Eligibility Checker
                                    </Link>
                                    <Link href="/tools/loan-emi-calculator" className="block text-xs font-semibold text-gray-600 hover:text-blue-700 transition-colors">
                                        → Education Loan EMI Calculator
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
