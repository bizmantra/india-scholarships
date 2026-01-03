import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { state, category, level, income, marks } = body;

        const db = getDatabase();

        // Build dynamic query based on filters
        let query = `
      SELECT 
        id, slug, title, provider, state, caste, amount_annual, amount_min,
        deadline, application_mode, level, last_verified, income_limit
      FROM scholarships
      WHERE status = 'Active'
    `;

        const params: any[] = [];

        // State filter (include "All India" scholarships)
        if (state && state !== 'All India') {
            query += ` AND (state = ? OR state = 'All India')`;
            params.push(state);
        }

        // Income filter
        if (income) {
            query += ` AND (income_limit IS NULL OR income_limit >= ?)`;
            params.push(parseInt(income));
        }

        // Marks filter
        if (marks) {
            query += ` AND (min_marks IS NULL OR min_marks <= ?)`;
            params.push(parseInt(marks));
        }

        // Education level filter
        if (level) {
            query += ` AND level = ?`;
            params.push(level);
        }

        query += ` ORDER BY amount_annual DESC`;

        const scholarships = db.prepare(query).all(...params);

        // Filter by category (caste) - needs JSON parsing
        let filteredScholarships = scholarships;
        if (category) {
            filteredScholarships = scholarships.filter((s: any) => {
                try {
                    const castes = JSON.parse(s.caste || '[]');
                    return castes.includes(category) || castes.includes('All');
                } catch {
                    return false;
                }
            });
        }

        // Parse caste JSON for response
        const parsedScholarships = filteredScholarships.map((s: any) => ({
            ...s,
            caste: JSON.parse(s.caste || '[]')
        }));

        db.close();

        return NextResponse.json({
            scholarships: parsedScholarships,
            count: parsedScholarships.length
        });

    } catch (error) {
        console.error('Eligibility check error:', error);
        return NextResponse.json(
            { error: 'Failed to check eligibility' },
            { status: 500 }
        );
    }
}
