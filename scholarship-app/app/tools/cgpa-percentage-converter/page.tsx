import { Suspense } from 'react';
import { getClient } from '@/lib/db';
import CgpaClient from './CgpaClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CGPA to Percentage Converter | IndiaScholarships',
    description: 'Convert your academic CGPA (out of 10 or 4) to percentage using standard CBSE, AICTE, and university conversion formulas with the IndiaScholarships CGPA to Percentage Converter.',
    alternates: {
        canonical: 'https://www.indiascholarships.in/tools/cgpa-percentage-converter',
    }
};


function parseCasteField(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [value];
        } catch {
            return [value];
        }
    }
    return [];
}

export default async function CgpaCalculatorPage() {
    const client = getClient();
    
    // Fetch scholarships with marks criteria to match dynamically
    const res = await client.execute(`
        SELECT id, slug, title, provider, provider_type, amount_annual, amount_min, caste, min_marks, deadline, level, state
        FROM scholarships
        WHERE status = 'Active' AND min_marks > 0
        ORDER BY min_marks DESC, amount_annual DESC
    `);

    const scholarships = res.rows;

    const parsedScholarships = scholarships.map((s: any) => ({
        ...s,
        caste: parseCasteField(s.caste)
    }));

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading CGPA Converter...</div>}>
            <CgpaClient scholarships={parsedScholarships} />
        </Suspense>
    );
}
