import { Suspense } from 'react';
import { getDatabase } from '@/lib/db';
import CostClient from './CostClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Study Cost & Gap Calculator | IndiaScholarships',
    description: 'Calculate the total cost of your college education (tuition, hostel, books, living expenses) and analyze your scholarship funding gap.',
};

export default async function StudyCostCalculatorPage() {
    const db = getDatabase();
    
    // Fetch all active scholarships
    const scholarships = db.prepare(`
        SELECT id, slug, title, provider, provider_type, amount_annual, amount_min, level, caste, state
        FROM scholarships
        WHERE status = 'Active'
        ORDER BY amount_annual DESC
    `).all();

    db.close();

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading Cost Calculator...</div>}>
            <CostClient scholarships={scholarships} />
        </Suspense>
    );
}
