import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const client = getClient();
        
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
        
        const res = await client.execute(query);
        const scholarships = res.rows;

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

        return NextResponse.json(parsedScholarships, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
            }
        });

    } catch (error) {
        console.error('Search index fetch error:', error);
        
        const diagnostics = {
            message: error instanceof Error ? error.message : 'Unknown error',
            cwd: process.cwd()
        };

        return NextResponse.json(
            { error: 'Failed to fetch search index', details: diagnostics },
            { status: 500 }
        );
    }
}
