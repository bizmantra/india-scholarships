import { getDatabase } from '@/lib/db';
import EligibilityCheckerClient from './EligibilityClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scholarship Eligibility Checker | IndiaScholarships',
    description: 'Check your eligibility for scholarships in India. Find scholarships based on your state, category, income, and education level.',
};

export default async function EligibilityCheckerPage() {
    // Fetch all active scholarships at build time
    const db = getDatabase();
    const scholarships = db.prepare(`
        SELECT 
            id, slug, title, provider, state, caste, amount_annual, amount_min,
            deadline, application_mode, level, last_verified, income_limit, min_marks
        FROM scholarships
        WHERE status = 'Active'
        ORDER BY amount_annual DESC
    `).all();

    // Parse caste JSON for each scholarship
    const parsedScholarships = scholarships.map((s: any) => ({
        ...s,
        caste: JSON.parse(s.caste || '[]')
    }));

    // Pass scholarships to client component
    return <EligibilityCheckerClient scholarships={parsedScholarships} />;
}
