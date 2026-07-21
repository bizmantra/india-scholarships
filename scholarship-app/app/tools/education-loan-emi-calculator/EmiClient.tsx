'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { 
    Calculator, 
    ArrowRight, 
    HelpCircle, 
    CheckSquare,
    Building2,
    Globe,
    Landmark,
    Loader2,
    Sparkles,
    CheckCircle2,
    Info,
    ShieldAlert,
    Coins,
    Share2,
    Check
} from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

export default function EmiClient({ scholarships }: Props) {
    // Inputs
    const [caste, setCaste] = useState<string>('General');
    const [incomeRange, setIncomeRange] = useState<string>('above-4.5l');
    const [studyLocation, setStudyLocation] = useState<'india' | 'abroad'>('india');
    
    const [principal, setPrincipal] = useState<number>(1000000);
    const [rate, setRate] = useState<number>(9.5);
    const [tenure, setTenure] = useState<number>(7);
    const [hasMoratorium, setHasMoratorium] = useState<boolean>(true);
    const [moratoriumMonths, setMoratoriumMonths] = useState<number>(48);

    // Outputs
    const [emi, setEmi] = useState<number>(0);
    const [totalInterest, setTotalInterest] = useState<number>(0);
    const [totalPayable, setTotalPayable] = useState<number>(0);
    const [moratoriumInterest, setMoratoriumInterest] = useState<number>(0);
    
    // Actions
    const [calculating, setCalculating] = useState(false);
    const [hasCalculated, setHasCalculated] = useState(false);
    const [copied, setCopied] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Calculate CSIS eligibility
    // Central Sector Interest Subsidy (CSIS) is for EWS, OBC, SC, ST, Minorities with family income <= 4.5 Lakhs.
    const isCsisEligible = (caste !== 'General' || incomeRange === 'below-4.5l') && incomeRange === 'below-4.5l' && studyLocation === 'india';

    useEffect(() => {
        // Calculate moratorium interest (simple interest accumulated during study/grace period)
        let adjustedPrincipal = principal;
        let morInterest = 0;

        if (hasMoratorium) {
            // Simple interest = P * R * T / 100
            const tYears = moratoriumMonths / 12;
            morInterest = Math.round((principal * (rate / 100) * tYears));
            
            // If eligible for CSIS subsidy, the government pays the interest, so the student's adjusted principal is just the starting principal
            if (!isCsisEligible) {
                adjustedPrincipal = principal + morInterest;
            }
        }

        setMoratoriumInterest(morInterest);

        // EMI formula = [P x R x (1+R)^N]/[(1+R)^N-1]
        const monthlyRate = (rate / 12) / 100;
        const totalMonths = tenure * 12;

        if (monthlyRate === 0) {
            const calculatedEmi = adjustedPrincipal / totalMonths;
            setEmi(Math.round(calculatedEmi));
            setTotalInterest(0);
            setTotalPayable(Math.round(adjustedPrincipal));
            return;
        }

        const emiVal = adjustedPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        const payable = emiVal * totalMonths;
        const interest = payable - adjustedPrincipal;

        setEmi(Math.round(emiVal));
        
        if (isCsisEligible) {
            // Government pays moratorium interest, so total interest paid by student excludes it
            setTotalInterest(Math.round(interest));
            setTotalPayable(Math.round(payable));
        } else {
            setTotalInterest(Math.round(interest + morInterest));
            setTotalPayable(Math.round(payable));
        }
    }, [principal, rate, tenure, hasMoratorium, moratoriumMonths, isCsisEligible]);

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
        const text = `My estimated monthly education loan EMI is ₹${emi.toLocaleString('en-IN')}/mo on IndiaScholarships! Calculate yours: https://www.indiascholarships.in/tools/loan-emi-calculator`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is the moratorium period in an education loan?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The moratorium period is a grace period during which you do not have to pay EMIs. It typically covers your course duration plus 6 months or 1 year after graduation. However, interest continues to accumulate during this time unless you qualify for a government subsidy."
                }
            },
            {
                "@type": "Question",
                "name": "How does the CSIS Interest Subsidy Scheme work?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The Central Sector Interest Subsidy (CSIS) scheme pays 100% of the interest accumulated on your education loan during your college moratorium period. This is eligible for professional degree students in India with a family income of up to ₹4.5 Lakhs."
                }
            },
            {
                "@type": "Question",
                "name": "Can I get an education loan without collateral?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, many private banks and NBFC partners offer collateral-free education loans of up to ₹40-75 Lakhs for top domestic and international institutions, based on the academic profile and co-signer income."
                }
            }
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans">
            {/* SEO FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div>
                <Header />
                
                {/* Hero Header */}
                <section className="relative overflow-hidden bg-white border-b border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <span className="text-[10px] uppercase font-bold text-google-blue tracking-wider block mb-1">Financial Planning Tool</span>
                        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 font-serif tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
                            Education Loan EMI Calculator
                        </h1>
                        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                            Calculate monthly payments, see interest accumulated during college, and check government interest subsidy scheme (CSIS) eligibility.
                        </p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Breadcrumbs */}
                    <div className="text-sm text-gray-500 mb-8">
                        <Link href="/tools" className="hover:text-google-blue font-medium">Tools</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">Education Loan EMI Calculator</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                        
                        {/* Calculator Input Box */}
                        <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-rose-500" />
                                <span>Calculate Your Loan EMI</span>
                            </h2>

                            <form onSubmit={handleCalculate} className="space-y-5">
                                {/* Basic Profile for CSIS Checks */}
                                <div className="p-4 bg-slate-50 border border-gray-150 rounded-xl space-y-3">
                                    <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Subsidies & Loan Matching</span>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1">Caste Category</label>
                                            <select 
                                                value={caste}
                                                onChange={(e) => {
                                                    setCaste(e.target.value);
                                                    setHasCalculated(false);
                                                }}
                                                className="w-full text-xs font-semibold bg-white border border-gray-250 p-2 rounded-lg focus:outline-hidden"
                                            >
                                                <option value="General">General</option>
                                                <option value="OBC">OBC</option>
                                                <option value="SC">SC</option>
                                                <option value="ST">ST</option>
                                                <option value="EWS">EWS</option>
                                                <option value="Minority">Minority</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1">Family Income</label>
                                            <select 
                                                value={incomeRange}
                                                onChange={(e) => {
                                                    setIncomeRange(e.target.value);
                                                    setHasCalculated(false);
                                                }}
                                                className="w-full text-xs font-semibold bg-white border border-gray-250 p-2 rounded-lg focus:outline-hidden"
                                            >
                                                <option value="below-4.5l">Up to ₹4.5 Lakhs</option>
                                                <option value="above-4.5l">Above ₹4.5 Lakhs</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Where will you study?</label>
                                        <select 
                                            value={studyLocation}
                                            onChange={(e) => {
                                                setStudyLocation(e.target.value as 'india' | 'abroad');
                                                setHasCalculated(false);
                                            }}
                                            className="w-full text-xs font-semibold bg-white border border-gray-250 p-2.5 rounded-lg focus:outline-hidden"
                                        >
                                            <option value="india">In India</option>
                                            <option value="abroad">Abroad / Foreign</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Loan Amount */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">How much loan money do you need?</span>
                                        <span className="text-sm font-black text-gray-800">₹{principal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="100000"
                                        max="7500000"
                                        step="50000"
                                        value={principal}
                                        onChange={(e) => {
                                            setPrincipal(Number(e.target.value));
                                            setHasCalculated(false);
                                        }}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-hidden"
                                    />
                                    <div className="flex justify-between text-[9px] text-gray-400 font-extrabold mt-1">
                                        <span>₹1L</span>
                                        <span>₹35L</span>
                                        <span>₹75L+</span>
                                    </div>
                                </div>

                                {/* Interest Rate */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Bank Interest Rate (Annual %)</span>
                                        <span className="text-sm font-black text-gray-800">{rate}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="7.5"
                                        max="15"
                                        step="0.1"
                                        value={rate}
                                        onChange={(e) => {
                                            setRate(Number(e.target.value));
                                            setHasCalculated(false);
                                        }}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-hidden"
                                    />
                                    <div className="flex justify-between text-[9px] text-gray-400 font-extrabold mt-1">
                                        <span>7.5%</span>
                                        <span>11%</span>
                                        <span>15%</span>
                                    </div>
                                </div>

                                {/* Tenure */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Years to Repay (Tenure)</span>
                                        <span className="text-sm font-black text-gray-800">{tenure} Years</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="3"
                                        max="15"
                                        step="1"
                                        value={tenure}
                                        onChange={(e) => {
                                            setTenure(Number(e.target.value));
                                            setHasCalculated(false);
                                        }}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-hidden"
                                    />
                                    <div className="flex justify-between text-[9px] text-gray-400 font-extrabold mt-1">
                                        <span>3 Years</span>
                                        <span>9 Years</span>
                                        <span>15 Years</span>
                                    </div>
                                </div>

                                {/* Moratorium Grace Period */}
                                <div className="border-t pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={hasMoratorium}
                                            onChange={(e) => {
                                                setHasMoratorium(e.target.checked);
                                                setHasCalculated(false);
                                            }}
                                            className="w-4 h-4 rounded-sm accent-rose-600 focus:outline-hidden"
                                        />
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Include College Grace Period (Moratorium)</span>
                                    </label>
                                    
                                    {hasMoratorium && (
                                        <div className="mt-3 bg-rose-50/20 border border-rose-100/50 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-500 font-bold uppercase">College Duration + Grace Period</span>
                                                <span className="font-extrabold text-rose-800">{moratoriumMonths} Months ({(moratoriumMonths / 12).toFixed(1)} yrs)</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="12"
                                                max="60"
                                                step="6"
                                                value={moratoriumMonths}
                                                onChange={(e) => {
                                                    setMoratoriumMonths(Number(e.target.value));
                                                    setHasCalculated(false);
                                                }}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-hidden"
                                            />
                                            <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                                                <span>1 Year</span>
                                                <span>3 Years</span>
                                                <span>5 Years</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Calculate button */}
                                <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <button
                                        type="submit"
                                        disabled={calculating}
                                        className="w-full py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-450 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {calculating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Calculating EMI...</span>
                                            </>
                                        ) : (
                                            <span>Calculate Monthly Payment →</span>
                                        )}
                                    </button>

                                    {hasCalculated && (
                                        <div className="animate-fadeIn">
                                            <button
                                                type="button"
                                                onClick={handleCopyResults}
                                                className="w-full py-2.5 bg-slate-50 border border-gray-255 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5 text-gray-500" />}
                                                <span>{copied ? 'Copied Results!' : 'Share Loan Calculation Summary'}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Amortization and Output Display */}
                        <div className="lg:col-span-7 space-y-6" ref={resultsRef}>
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs min-h-[380px] flex flex-col justify-between">
                                {!hasCalculated ? (
                                    <div className="flex flex-col items-center justify-center text-center py-20 flex-1">
                                        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 animate-pulse">
                                            <Calculator className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-extrabold text-lg text-gray-900 mb-1">Check your monthly payments</h3>
                                        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                                            Adjust the loan amount and interest sliders on the left, then click the Calculate button to check your EMI and subsidy eligibility.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="animate-fadeIn flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-6 border-b pb-4">
                                                <div>
                                                    <h3 className="font-extrabold text-base text-gray-900">Your Monthly EMI Report</h3>
                                                    <p className="text-[11px] text-gray-500 mt-0.5">Calculated for {tenure} years repayment tenure</p>
                                                </div>
                                                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-extrabold rounded-full">
                                                    Payment Estimate
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                                <div className="bg-rose-600 text-white rounded-2xl p-6 text-center shadow-lg shadow-rose-500/10 col-span-2">
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90 block mb-1">Your Monthly EMI Payment</span>
                                                    <span className="text-3.5xl font-black">₹{emi.toLocaleString('en-IN')}</span>
                                                    <span className="text-xs block mt-1.5 opacity-90">Starts after your course finishes + grace period</span>
                                                </div>
                                                <div className="bg-slate-50 border border-gray-150 rounded-xl p-5 text-center">
                                                    <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Interest Charged by Bank</span>
                                                    <span className="text-lg font-black text-gray-800 block mt-1">₹{totalInterest.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="bg-slate-50 border border-gray-150 rounded-xl p-5 text-center">
                                                    <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Total Amount You Pay Back</span>
                                                    <span className="text-lg font-black text-gray-800 block mt-1">₹{totalPayable.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>

                                            {/* CSIS Subsidy Alert Indicator */}
                                            {isCsisEligible ? (
                                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-6 flex gap-3.5 items-start">
                                                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                        <Sparkles className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-sm text-emerald-900 leading-snug">🏆 Eligible for Government Interest Subsidy!</h4>
                                                        <p className="text-xs text-emerald-800 mt-1.5 leading-relaxed">
                                                            Under the Central Sector Interest Subsidy (CSIS) scheme, the government will pay the <strong>₹{moratoriumInterest.toLocaleString('en-IN')}</strong> in interest accumulated while you study. The bank will not add this to your loan!
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                hasMoratorium && moratoriumInterest > 0 && (
                                                    <div className="bg-amber-50/50 border border-amber-100 text-amber-900 rounded-xl p-5 mb-6 flex gap-3.5 items-start">
                                                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                                            <Info className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-extrabold text-sm text-amber-900 leading-snug">Interest Build-up Warning</h4>
                                                            <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">
                                                                During college ({moratoriumMonths} months), the bank accumulates <strong>₹{moratoriumInterest.toLocaleString('en-IN')}</strong> in simple interest. Unless paid off early, this is added to your starting principal, raising your total loan.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            <div className="border-t pt-5">
                                                <h3 className="font-extrabold text-sm text-gray-900 mb-4 uppercase tracking-wider">Top Scholarships to Cover Student Loan Debt</h3>
                                                <div className="space-y-3">
                                                    {scholarships.slice(0, 2).map((s) => (
                                                        <div key={s.id} className="border border-gray-150 hover:border-rose-300 rounded-xl p-4 flex justify-between items-center bg-slate-50/30 transition-all">
                                                            <div>
                                                                <span className="text-[10px] text-gray-500 font-bold block">{s.provider}</span>
                                                                <h4 className="font-bold text-xs text-gray-900 mt-0.5 leading-snug line-clamp-1">{s.title}</h4>
                                                            </div>
                                                            <a 
                                                                href={`/scholarships/${s.slug}`}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap"
                                                            >
                                                                <span>View Guide</span>
                                                                <ArrowRight className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Educational / Content Sections (Traffic Magnets) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
                        
                        {/* Primary Content (Why & How) */}
                        <div className="lg:col-span-8 space-y-10">
                            
                            {/* What is a Grace Period? */}
                            <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-rose-600" />
                                    <span>What is an Education Loan Moratorium?</span>
                                </h3>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                                    <p>
                                        An education loan moratorium is a grace period given by the bank during which you do not have to make any monthly EMI payments.
                                    </p>
                                    <p>
                                        This grace period usually covers your **entire course duration plus 6 months to 1 year** after graduation, so you have enough time to find a job before you start repaying.
                                    </p>
                                    <p>
                                        **Important note:** Even though you do not pay EMIs during this time, the bank still calculates interest on your loan. This is called *Accumulated Moratorium Interest*. If you do not pay this interest off during your studies, the bank will add it to your total loan amount once EMIs begin, which raises your monthly payment.
                                    </p>
                                </div>
                            </section>

                            {/* CSIS Subsidy Explained */}
                            <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                                    <span>Central Sector Interest Subsidy Scheme (CSIS)</span>
                                </h3>
                                <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                                    <p>
                                        To help poor and middle-class students, the Government of India runs the **Central Sector Interest Subsidy (CSIS)** scheme.
                                    </p>
                                    <p>
                                        If you belong to the **OBC, SC, ST, EWS, or Minority** category and your family's annual income is **less than ₹4.5 Lakhs**, you qualify for this scheme.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                        <li><strong>100% Interest Paid by Government</strong>: The government will pay all of the interest that builds up on your student loan while you are in college.</li>
                                        <li><strong>Only for Indian Universities</strong>: This scheme is only eligible if you are studying professional or technical courses in recognized colleges in India.</li>
                                        <li><strong>No Extra Fee</strong>: Your bank tags your account automatically. You can check your eligibility or apply via the official PM-Vidyalaxmi portal.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* FAQ Section */}
                            <section className="bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-rose-600" />
                                    <span>Frequently Asked Questions</span>
                                </h3>
                                
                                <div className="space-y-6 divide-y divide-gray-100">
                                    <div className="pt-0">
                                        <h4 className="font-bold text-sm text-gray-900">1. What is the moratorium period in an education loan?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            The moratorium period is a grace period during which you do not have to pay EMIs. It typically covers your course duration plus 6 months or 1 year after graduation. However, interest continues to accumulate during this time unless you qualify for a government subsidy.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <h4 className="font-bold text-sm text-gray-900">2. How does the CSIS Interest Subsidy Scheme work?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            The Central Sector Interest Subsidy (CSIS) scheme pays 100% of the interest accumulated on your education loan during your college moratorium period. This is eligible for professional degree students in India with a family income of up to ₹4.5 Lakhs.
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <h4 className="font-bold text-sm text-gray-900">3. Can I get an education loan without collateral?</h4>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            Yes, many private banks and NBFC partners offer collateral-free education loans of up to ₹40-75 Lakhs for top domestic and international institutions, based on the academic profile and co-signer income.
                                        </p>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Sidebar Guidance */}
                        <div className="lg:col-span-4 space-y-6">
                            
                            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs relative overflow-hidden">
                                <h4 className="font-extrabold text-sm text-cyan-400 uppercase tracking-wider mb-2">Need a Budget Plan?</h4>
                                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                                    Calculate your tuition fees, hostel rent, food, and books vs. your scholarship support to check your net funding gap.
                                </p>
                                <a 
                                    href="/tools/study-cost-calculator"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-cyan-400 transition-colors"
                                >
                                    <span>Open Expense Planner</span>
                                    <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>

                        </div>

                    </div>
                </main>
            </div>
            
            <Footer />
        </div>
    );
}
