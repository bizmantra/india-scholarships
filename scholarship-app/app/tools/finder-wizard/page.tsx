import { Suspense } from 'react';
import { getClient } from '@/lib/db';
import FinderWizardClient from './FinderWizardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scholarship Finder Wizard | IndiaScholarships',
    description: 'Guided step-by-step interactive questionnaire to build your student profile and find matching Indian scholarships.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/tools/finder-wizard',
    }
};


export default async function FinderWizardPage() {
    const client = getClient();
    
    // Fetch active scholarships
    const res = await client.execute(`
        SELECT id, slug, title, provider, amount_annual, amount_min, caste, state, level, income_limit, min_marks
        FROM scholarships
        WHERE status = 'Active'
        ORDER BY amount_annual DESC
    `);

    const scholarships = res.rows;

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading Finder Wizard...</div>}>
            <FinderWizardClient scholarships={scholarships} />
        </Suspense>
    );
}
