import { Suspense } from 'react';
import { getClient, parseCasteField } from '@/lib/db';
import IncomeClient from './IncomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Family Income Calculator | IndiaScholarships',
    description: 'Check your family income eligibility for Indian scholarships using the IndiaScholarships Family Income Calculator.',
};

export default async function IncomeCalculatorPage() {
    const client = getClient();
    
    // Fetch all active scholarships
    const res = await client.execute(`
        SELECT id, slug, title, provider, provider_type, amount_annual, amount_min, caste, income_limit, deadline, level, state
        FROM scholarships
        WHERE status = 'Active'
        ORDER BY amount_annual DESC
    `);

    const scholarships = res.rows;

    const parsedScholarships = scholarships.map((s: any) => ({
        ...s,
        caste: parseCasteField(s.caste)
    }));

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading Income Calculator...</div>}>
            <IncomeClient scholarships={parsedScholarships} />
        </Suspense>
    );
}
