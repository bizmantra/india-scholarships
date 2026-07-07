'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Calculator, ArrowRight, HelpCircle, CheckSquare } from 'lucide-react';
import ShareButtons from '@/app/components/ShareButtons';

interface Props {
    scholarships: any[];
}

export default function EmiClient({ scholarships }: Props) {
    const [principal, setPrincipal] = useState<number>(1000000);
    const [rate, setRate] = useState<number>(9.5);
    const [tenure, setTenure] = useState<number>(7);
    const [hasMoratorium, setHasMoratorium] = useState<boolean>(true);
    const [moratoriumMonths, setMoratoriumMonths] = useState<number>(48);

    const [emi, setEmi] = useState<number>(0);
    const [totalInterest, setTotalInterest] = useState<number>(0);
    const [totalPayable, setTotalPayable] = useState<number>(0);
    const [moratoriumInterest, setMoratoriumInterest] = useState<number>(0);

    useEffect(() => {
        // Calculate moratorium interest (simple interest accumulated during study/grace period)
        let adjustedPrincipal = principal;
        let morInterest = 0;

        if (hasMoratorium) {
            // Simple interest = P * R * T / 100
            const tYears = moratoriumMonths / 12;
            morInterest = Math.round((principal * (rate / 100) * tYears));
            adjustedPrincipal = principal + morInterest;
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
        setTotalInterest(Math.round(interest + morInterest));
        setTotalPayable(Math.round(payable + morInterest));
    }, [principal, rate, tenure, hasMoratorium, moratoriumMonths]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
            <div>
                <Header />
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-sm text-gray-500 mb-6">
                        <a href="/tools" className="hover:text-blue-700 font-medium">Tools</a>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-semibold">Education Loan EMI Calculator</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Control Box */}
                        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-50 text-rose-600 rounded-xl mb-6">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                Loan EMI Calculator
                            </h1>
                            <p className="text-gray-600 text-sm mb-6">
                                Calculate education loan EMIs with specialized moratorium period features.
                            </p>

                            <div className="space-y-5">
                                {/* Principal Loan Amount */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                            Loan Principal Amount
                                        </label>
                                        <span className="text-sm font-black text-gray-900">
                                            ₹{principal.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="100000"
                                        max="5000000"
                                        step="50000"
                                        value={principal}
                                        onChange={(e) => setPrincipal(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>

                                {/* Interest Rate */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                            Interest Rate (Annual)
                                        </label>
                                        <span className="text-sm font-black text-gray-900">
                                            {rate}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="18"
                                        step="0.1"
                                        value={rate}
                                        onChange={(e) => setRate(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>

                                {/* Tenure */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                                            Repayment Tenure (Years)
                                        </label>
                                        <span className="text-sm font-black text-gray-900">
                                            {tenure} Years
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="15"
                                        step="1"
                                        value={tenure}
                                        onChange={(e) => setTenure(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                </div>

                                {/* Moratorium */}
                                <div className="border-t pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={hasMoratorium}
                                            onChange={(e) => setHasMoratorium(e.target.checked)}
                                            className="w-4 h-4 rounded-sm accent-rose-600"
                                        />
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Include Moratorium Period</span>
                                    </label>
                                    {hasMoratorium && (
                                        <div className="mt-3 bg-rose-50/50 border border-rose-100 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-600 font-medium">Moratorium Duration</span>
                                                <span className="font-bold text-rose-800">{moratoriumMonths} Months ({(moratoriumMonths / 12).toFixed(1)} yrs)</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="12"
                                                max="60"
                                                step="6"
                                                value={moratoriumMonths}
                                                onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t">
                                    <ShareButtons 
                                        title={`Calculated my study loan EMI at ₹${emi.toLocaleString('en-IN')}/mo on IndiaScholarships. Calculate yours.`}
                                        url="https://www.indiascholarships.in/tools/loan-emi-calculator"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Amortization and Output Display */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">EMI Breakdown</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <div className="bg-rose-600 text-white rounded-2xl p-6 text-center shadow-lg shadow-rose-500/20 col-span-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-90 block mb-1">Monthly EMI payment</span>
                                        <span className="text-3xl sm:text-4xl font-black">₹{emi.toLocaleString('en-IN')}</span>
                                        <span className="text-xs block mt-1.5 opacity-90">Starts after moratorium course duration</span>
                                    </div>
                                    <div className="bg-slate-50 border rounded-xl p-5 text-center">
                                        <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Total Accumulated Interest</span>
                                        <span className="text-xl font-black text-gray-900 block mt-1">₹{totalInterest.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="bg-slate-50 border rounded-xl p-5 text-center">
                                        <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Total Loan Payment</span>
                                        <span className="text-xl font-black text-gray-900 block mt-1">₹{totalPayable.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                {hasMoratorium && moratoriumInterest > 0 && (
                                    <div className="bg-amber-50/50 border border-amber-100 text-amber-900 rounded-xl p-4 mb-8 text-xs font-medium leading-relaxed">
                                        💡 During the study/grace period of {moratoriumMonths} months, interest of <strong>₹{moratoriumInterest.toLocaleString('en-IN')}</strong> accumulates and is capitalized into your principal amount (adjusted principal: ₹{(principal + moratoriumInterest).toLocaleString('en-IN')}).
                                    </div>
                                )}

                                <h3 className="font-extrabold text-base text-gray-900 mb-4">Recommended Scholarships to Offset Debt</h3>
                                <div className="space-y-4">
                                    {scholarships.slice(0, 3).map((s) => (
                                        <div key={s.id} className="border border-gray-150 rounded-xl p-4 flex justify-between items-center bg-slate-50/30">
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900 leading-snug line-clamp-1">{s.title}</h4>
                                                <p className="text-xs text-gray-500 mt-1">Amount: ₹{(s.amount_annual || s.amount_min || 0).toLocaleString('en-IN')}/yr</p>
                                            </div>
                                            <a 
                                                href={`/scholarships/${s.slug}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap"
                                            >
                                                <span>Apply</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    ))}
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
