import { NextResponse } from 'next/server';
import { getSearchConsoleClient } from '@/lib/google-auth';

export async function GET() {

    const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    
    // If credentials are set, attempt live GSC query
    if (email && privateKey) {
        try {
            const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:indiascholarships.in';
            const gsc = getSearchConsoleClient();
            
            // Query for the last 30 days
            const endDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Yesterday
            const startDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago

            // 1. Fetch Chart Data (by date)
            const chartRes = await gsc.searchanalytics.query({
                siteUrl,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['date'],
                    rowLimit: 100
                }
            });

            // 2. Fetch Query Data (by query)
            const queryRes = await gsc.searchanalytics.query({
                siteUrl,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions: ['query'],
                    rowLimit: 100
                }
            });

            const chartData: string[][] = [
                ['Date', 'Clicks', 'Impressions', 'CTR', 'Position']
            ];
            if (chartRes.data.rows) {
                // Sort by date key ascending
                const sortedRows = [...chartRes.data.rows].sort((a, b) => {
                    const dateA = a.keys?.[0] || '';
                    const dateB = b.keys?.[0] || '';
                    return dateA.localeCompare(dateB);
                });
                sortedRows.forEach(row => {
                    const date = row.keys?.[0] || '';
                    const clicks = row.clicks || 0;
                    const impressions = row.impressions || 0;
                    const ctr = `${((row.ctr || 0) * 100).toFixed(2)}%`;
                    const position = (row.position || 0).toFixed(1);
                    chartData.push([date, String(clicks), String(impressions), ctr, String(position)]);
                });
            }

            const queriesData: string[][] = [
                ['Query', 'Clicks', 'Impressions', 'CTR', 'Position']
            ];
            if (queryRes.data.rows) {
                queryRes.data.rows.forEach(row => {
                    const query = row.keys?.[0] || '';
                    const clicks = row.clicks || 0;
                    const impressions = row.impressions || 0;
                    const ctr = `${((row.ctr || 0) * 100).toFixed(2)}%`;
                    const position = (row.position || 0).toFixed(1);
                    queriesData.push([query, String(clicks), String(impressions), ctr, String(position)]);
                });
            }

            return NextResponse.json({
                chart: chartData,
                queries: queriesData
            });

        } catch (e: any) {
            console.error('Search Console request failed:', e.message);
            return notConnected(`Search Console did not answer: ${e.message}. Check the service account's access to Search Console.`);
        }
    }

    // No made-up numbers: when the real source is unavailable, say so
    return notConnected('Search Console is not configured on this server (credentials missing).');
}

function notConnected(error: string) {
    return NextResponse.json({ error, connected: false }, { status: 503 });
}
