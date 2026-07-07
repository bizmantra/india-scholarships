import { Suspense } from 'react';
import { getDatabase } from '@/lib/db';
import AmountClient from './AmountClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scholarship Amount Calculator | IndiaScholarships',
    description: 'Calculate and estimate your prospective scholarship disbursement using the IndiaScholarships Scholarship Amount Calculator.',
};

export default async function AmountCalculatorPage() {
    const db = getDatabase();
    
    // Fetch all active scholarships
    const scholarships = db.prepare(`
        SELECT id, slug, title, provider, provider_type, amount_annual, amount_min, level, caste, course_stream, state
        FROM scholarships
        WHERE status = 'Active'
        ORDER BY amount_annual DESC
    `).all();

    db.close();

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading Amount Calculator...</div>}>
            <AmountClient scholarships={scholarships} />
        </Suspense>
    );
}
