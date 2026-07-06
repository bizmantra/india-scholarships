import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ADMIN_DASHBOARD !== 'true') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const gscFolder = path.join(process.cwd(), 'data', 'gsc-june-2026');

    try {
        const chartPath = path.join(gscFolder, 'chart.json');
        const queriesPath = path.join(gscFolder, 'queries.json');

        let chartData = [];
        let queriesData = [];

        if (fs.existsSync(chartPath)) {
            chartData = JSON.parse(fs.readFileSync(chartPath, 'utf8'));
        }

        if (fs.existsSync(queriesPath)) {
            queriesData = JSON.parse(fs.readFileSync(queriesPath, 'utf8'));
        }

        // Return compiled arrays
        return NextResponse.json({
            chart: chartData,
            queries: queriesData.slice(0, 100) // return top 100 queries
        });

    } catch (error: any) {
        console.error('Error loading GSC performance data API:', error);
        return NextResponse.json({ error: 'Failed to read GSC files.', details: error.message }, { status: 500 });
    }
}
