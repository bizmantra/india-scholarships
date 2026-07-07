import { Suspense } from 'react';
import { getDatabase } from '@/lib/db';
import FinderWizardClient from './FinderWizardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scholarship Finder Wizard | IndiaScholarships',
    description: 'Guided step-by-step interactive questionnaire to build your student profile and find matching Indian scholarships.',
};

export default async function FinderWizardPage() {
    const db = getDatabase();
    
    // Fetch active scholarships
    const scholarships = db.prepare(`
        SELECT id, slug, title, provider, amount_annual, amount_min, caste, state, level, income_limit, min_marks
        FROM scholarships
        WHERE status = 'Active'
        ORDER BY amount_annual DESC
    `).all();

    db.close();

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading Finder Wizard...</div>}>
            <FinderWizardClient scholarships={scholarships} />
        </Suspense>
    );
}
