import { Suspense } from 'react';
import { getDatabase } from '@/lib/db';
import IncomeClient from './IncomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Family Income Eligibility Calculator | IndiaScholarships',
    description: 'Check your family income eligibility for Indian scholarships. Filter schemes based on your household income caps (e.g. ₹1 lakh, ₹2.5 lakhs, ₹8 lakhs limit).',
};

export default async function IncomeCalculatorPage() {
    const db = getDatabase();
    
    // Fetch all active scholarships
    const scholarships = db.prepare(`
        SELECT id, slug, title, provider, provider_type, amount_annual, amount_min, income_limit, deadline, level, state
        FROM scholarships
        WHERE status = 'Active'
        ORDER BY amount_annual DESC
    `).all();

    db.close();

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading Income Calculator...</div>}>
            <IncomeClient scholarships={scholarships} />
        </Suspense>
    );
}
