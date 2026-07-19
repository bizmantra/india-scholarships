import { Suspense } from 'react';
import { getClient, parseCasteField } from '@/lib/db';
import CompareClient from './CompareClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scholarship Compare Tool | IndiaScholarships',
    description: 'Select and compare multiple Indian government & private scholarships side-by-side. Review eligibility, amounts, and deadines.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/tools/compare',
    }
};


export default async function ComparePage() {
    const client = getClient();
    
    // Fetch all active scholarships
    const res = await client.execute(`
        SELECT 
            id, slug, title, provider, amount_annual, amount_min, level, caste, state,
            income_limit, min_marks, application_mode, deadline, provider_type
        FROM scholarships
        WHERE status = 'Active'
        ORDER BY amount_annual DESC
    `);

    const scholarships = res.rows;

    // Map parsed caste fields
    const parsedScholarships = scholarships.map((s: any) => ({
        ...s,
        caste: parseCasteField(s.caste)
    }));

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading Compare Tool...</div>}>
            <CompareClient scholarships={parsedScholarships} />
        </Suspense>
    );
}
