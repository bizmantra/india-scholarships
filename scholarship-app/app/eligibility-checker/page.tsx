import { Suspense } from 'react';
import { getClient, parseCasteField } from '@/lib/db';
import EligibilityCheckerClient from '../tools/scholarship-eligibility-checker/EligibilityClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scholarship Eligibility Checker | IndiaScholarships',
    description: 'Check your eligibility for scholarships in India. Find scholarships based on your state, category, income, and education level.',
};

export default async function EligibilityCheckerPage() {
    const client = getClient();
    const res = await client.execute(`
        SELECT 
            id, slug, title, provider, state, caste, amount_annual, amount_min,
            deadline, application_mode, level, last_verified, income_limit, min_marks
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
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading Checker...</div>}>
            <EligibilityCheckerClient scholarships={parsedScholarships} />
        </Suspense>
    );
}
