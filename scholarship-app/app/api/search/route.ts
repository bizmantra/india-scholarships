import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        // Explicitly check for the database file at runtime to force Next.js file-tracing
        const dbFile = path.join(process.cwd(), 'data', 'scholarships.db');
        if (fs.existsSync(dbFile)) {
            // Keep dummy reference to avoid compiler optimizations discarding the statement
            const _size = fs.statSync(dbFile).size;
        }

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
        
        // Return diagnostics in the error details to see candidate paths at runtime
        const diagnostics = {
            message: error instanceof Error ? error.message : 'Unknown error',
            cwd: process.cwd(),
            candidatesExist: {
                cwd_data: fs.existsSync(path.join(process.cwd(), 'data', 'scholarships.db')),
                cwd_next_server: fs.existsSync(path.join(process.cwd(), '.next', 'server', 'data', 'scholarships.db')),
                var_task_data: fs.existsSync(path.join('/var/task', 'data', 'scholarships.db')),
                var_task_sub_data: fs.existsSync(path.join('/var/task', 'scholarship-app', 'data', 'scholarships.db')),
            }
        };

        return NextResponse.json(
            { error: 'Failed to fetch search index', details: diagnostics },
            { status: 500 }
        );
    }
}
