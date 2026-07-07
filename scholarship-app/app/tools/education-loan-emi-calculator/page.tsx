import { Suspense } from 'react';
import { getDatabase } from '@/lib/db';
import EmiClient from './EmiClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Education Loan EMI Calculator | IndiaScholarships',
    description: 'Calculate monthly EMI, interest accumulation, and amortization plans for Indian student study loans using the IndiaScholarships Education Loan EMI Calculator.',
};

export default async function LoanEmiCalculatorPage() {
    const db = getDatabase();
    
    // Fetch all active scholarships
    const scholarships = db.prepare(`
        SELECT id, slug, title, provider, amount_annual, amount_min, level, state
        FROM scholarships
        WHERE status = 'Active'
        ORDER BY amount_annual DESC
    `).all();

    db.close();

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading EMI Calculator...</div>}>
            <EmiClient scholarships={scholarships} />
        </Suspense>
    );
}
