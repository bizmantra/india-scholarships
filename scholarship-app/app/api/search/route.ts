import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
    try {
        const db = getDatabase();
        
        // Fetch only lightweight columns required for search matching and presentation in the autocomplete list
        const query = `
            SELECT 
                id, 
                title, 
                slug, 
                provider, 
                state, 
                level, 
                caste,
                amount_annual, 
                amount_min, 
                deadline
            FROM scholarships
            WHERE status = 'Active'
            ORDER BY title ASC
        `;
        
        const scholarships = db.prepare(query).all();
        db.close();

        // Safe JSON parsing for the caste field
        const parsedScholarships = scholarships.map((s: any) => {
            let casteArray: string[] = [];
            try {
                casteArray = JSON.parse(s.caste || '[]');
            } catch {
                casteArray = [];
            }
            return {
                ...s,
                caste: casteArray
            };
        });

        // Set Cache-Control headers to optimize performance and prevent redundant DB hits
        return NextResponse.json(parsedScholarships, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
            }
        });

    } catch (error) {
        console.error('Search index fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch search index', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
