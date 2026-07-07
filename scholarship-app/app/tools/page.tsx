import { Suspense } from 'react';
import { getDatabase } from '@/lib/db';
import ToolsClient from './ToolsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Scholarship Calculators & Tools Hub | IndiaScholarships',
    description: 'Access free interactive tools for Indian scholarships: Eligibility Checker, CGPA to Percentage converter, Income matching calculator, Education loan EMI calculator, and side-by-side scholarship comparison.',
};

export default async function ToolsHubPage() {
    // Fetch count of active scholarships to display dynamic statistics
    const db = getDatabase();
    const stats = db.prepare(`
        SELECT COUNT(*) as total, SUM(amount_annual) as total_value 
        FROM scholarships 
        WHERE status = 'Active'
    `).get() as { total: number; total_value: number };

    db.close();

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading Tools Hub...</div>}>
            <ToolsClient 
                totalScholarships={stats?.total || 0} 
                totalValue={stats?.total_value || 0} 
            />
        </Suspense>
    );
}
