'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface EligibilityCheckerWidgetProps {
    requiredState: string;
    requiredCaste: string[];
    incomeLimit: number;
    requiredLevel: string;
}

export default function EligibilityCheckerWidget({
    requiredState,
    requiredCaste,
    incomeLimit,
    requiredLevel
}: EligibilityCheckerWidgetProps) {
    const [caste, setCaste] = useState('');
    const [income, setIncome] = useState('');
    const [state, setState] = useState('');
    const [result, setResult] = useState<{ status: 'eligible' | 'ineligible' | null; message: string }>({
        status: null,
        message: ''
    });

    const checkEligibility = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Domicile State Check
        if (state && requiredState && requiredState.toLowerCase() !== 'all india') {
            if (state.toLowerCase() !== requiredState.toLowerCase()) {
                setResult({
                    status: 'ineligible',
                    message: `This scheme is restricted to permanent residents of ${requiredState}.`
                });
                return;
            }
        }

        // 2. Caste Category Check
        const cleanRequiredCaste = requiredCaste.map(c => c.toLowerCase());
        const isCasteRestricted = cleanRequiredCaste.length > 0 && !cleanRequiredCaste.some(c => 
            c === 'all' || c.includes('open to all') || c.includes('all categories')
        );

        if (caste && isCasteRestricted) {
            const matchesCaste = cleanRequiredCaste.some(c => {
                if (caste.toLowerCase() === 'pwd') {
                    return c.includes('pwd') || c.includes('disabilit');
                }
                return c.includes(caste.toLowerCase());
            });

            if (!matchesCaste) {
                setResult({
                    status: 'ineligible',
                    message: `This scheme is restricted to students belonging to: ${requiredCaste.join(', ')}.`
                });
                return;
            }
        }

        // 3. Family Income Check
        if (income && incomeLimit && incomeLimit > 0) {
            const userIncome = Number(income);
            if (!isNaN(userIncome) && userIncome > incomeLimit) {
                setResult({
                    status: 'ineligible',
                    message: `Your annual family income (₹${userIncome.toLocaleString('en-IN')}) exceeds the maximum limit of ₹${incomeLimit.toLocaleString('en-IN')}.`
                });
                return;
            }
        }

        // 4. Default Success
        setResult({
            status: 'eligible',
            message: 'You satisfy the core eligibility criteria for this scheme! Please double check educational marks in the guidelines below.'
        });
    };

    return (
        <div className="py-6 border-b border-gray-150">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-google-blue animate-pulse" />
                Instant Eligibility Checker
            </h3>
            
            <form onSubmit={checkEligibility} className="space-y-3.5">
                {/* Caste Category */}
                <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Your Category</label>
                    <select
                        value={caste}
                        onChange={(e) => setCaste(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-google-blue bg-white"
                        required
                    >
                        <option value="">Select Category</option>
                        <option value="General">General / EWS</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="Minority">Minority</option>
                        <option value="PWD">PWD (Disability)</option>
                    </select>
                </div>

                {/* State Domicile */}
                <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Domicile State</label>
                    <input
                        type="text"
                        placeholder="e.g. Odisha, Karnataka, Bihar..."
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-google-blue bg-white"
                        required
                    />
                </div>

                {/* Family Income */}
                {incomeLimit > 0 && (
                    <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Annual Family Income (₹)</label>
                        <input
                            type="number"
                            placeholder="e.g. 200000"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-google-blue bg-white"
                            required
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full py-3 bg-google-blue hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                    Check Match
                </button>
            </form>

            {/* Results Alert */}
            {result.status && (
                <div className={`mt-4 p-4 rounded-2xl border flex gap-3 text-xs leading-relaxed ${
                    result.status === 'eligible'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                        : 'bg-red-50 border-red-100 text-google-red'
                }`}>
                    {result.status === 'eligible' ? (
                        <CheckCircle2 className="h-5 w-5 text-google-green shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-google-red shrink-0 mt-0.5" />
                    )}
                    <div>
                        <p className="font-bold">{result.status === 'eligible' ? 'Pre-Qualification Match!' : 'Criteria Mismatch'}</p>
                        <p className="mt-1">{result.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
