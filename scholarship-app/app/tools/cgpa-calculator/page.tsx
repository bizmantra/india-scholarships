import { Suspense } from 'react';
import { getDatabase } from '@/lib/db';
import CgpaClient from './CgpaClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CGPA to Percentage Calculator | IndiaScholarships',
    description: 'Convert your academic CGPA (out of 10 or 4) to percentage using CBSE, AICTE, and University conversion formulas. View scholarships matching your marks.',
};

export default async function CgpaCalculatorPage() {
    const db = getDatabase();
    
    // Fetch scholarships with marks criteria to match dynamically
    const scholarships = db.prepare(`
        SELECT id, slug, title, provider, amount_annual, amount_min, min_marks, deadline, level, state
        FROM scholarships
        WHERE status = 'Active' AND min_marks > 0
        ORDER BY min_marks DESC, amount_annual DESC
    `).all();

    db.close();

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading CGPA Calculator...</div>}>
            <CgpaClient scholarships={scholarships} />
        </Suspense>
    );
}
