import { NextResponse } from 'next/server';
import { getAdSenseClient } from '@/lib/google-auth';

export async function GET() {

    const clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADSENSE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_ADSENSE_REFRESH_TOKEN;
    const accountId = process.env.GOOGLE_ADSENSE_ACCOUNT_ID;

    // Check if live AdSense credentials are configured
    if (clientId && clientSecret && refreshToken && accountId) {
        try {
            const adsense = getAdSenseClient();
            const account = `accounts/${accountId}`;

            // Helper to generate custom metrics report
            const getMetricsForRange = async (dateRange: 'TODAY' | 'YESTERDAY' | 'MONTH_TO_DATE' | 'LAST_30_DAYS') => {
                const res = await adsense.accounts.reports.generate({
                    account,
                    dateRange,
                    metrics: ['ESTIMATED_EARNINGS', 'IMPRESSIONS', 'CLICKS', 'PAGE_VIEWS']
                });
                const row = res.data.rows?.[0] || { cells: [] };
                return {
                    earnings: parseFloat(row.cells?.[0]?.value || '0') || 0,
                    impressions: parseInt(row.cells?.[1]?.value || '0') || 0,
                    clicks: parseInt(row.cells?.[2]?.value || '0') || 0,
                    views: parseInt(row.cells?.[3]?.value || '0') || 0
                };
            };

            // 1. Fetch estimated earnings for today, yesterday, and month-to-date
            const todayStats = await getMetricsForRange('TODAY');
            const yesterdayStats = await getMetricsForRange('YESTERDAY');
            const monthStats = await getMetricsForRange('MONTH_TO_DATE');
            const last30DaysStats = await getMetricsForRange('LAST_30_DAYS');

            // 2. Fetch daily breakdown for the last 30 days
            const dailyRes = await adsense.accounts.reports.generate({
                account,
                dateRange: 'LAST_30_DAYS',
                metrics: ['ESTIMATED_EARNINGS', 'IMPRESSIONS', 'CLICKS', 'PAGE_VIEWS'],
                dimensions: ['DATE']
            });

            const dailyTrend = (dailyRes.data.rows || []).map(row => {
                const date = row.cells?.[0]?.value || '';
                return {
                    date,
                    earnings: parseFloat(row.cells?.[1]?.value || '0') || 0,
                    impressions: parseInt(row.cells?.[2]?.value || '0') || 0,
                    clicks: parseInt(row.cells?.[3]?.value || '0') || 0,
                    views: parseInt(row.cells?.[4]?.value || '0') || 0
                };
            }).sort((a, b) => a.date.localeCompare(b.date));

            // 3. Fetch earnings by URL channels/page paths if configured, otherwise group by ad unit
            const adUnitRes = await adsense.accounts.reports.generate({
                account,
                dateRange: 'LAST_30_DAYS',
                metrics: ['ESTIMATED_EARNINGS', 'IMPRESSIONS', 'CLICKS'],
                dimensions: ['AD_UNIT_NAME'],
                limit: 10
            });

            const topAdUnits = (adUnitRes.data.rows || []).map(row => ({
                name: row.cells?.[0]?.value || 'Responsive Banner',
                earnings: parseFloat(row.cells?.[1]?.value || '0') || 0,
                impressions: parseInt(row.cells?.[2]?.value || '0') || 0,
                clicks: parseInt(row.cells?.[3]?.value || '0') || 0
            }));

            // Compute overall averages
            const totalViews = last30DaysStats.views;
            const pageRpm = totalViews > 0 ? (last30DaysStats.earnings / totalViews) * 1000 : 0;
            const averageCtr = last30DaysStats.impressions > 0 ? (last30DaysStats.clicks / last30DaysStats.impressions) * 100 : 0;

            return NextResponse.json({
                liveMode: true,
                summary: {
                    today: todayStats.earnings,
                    yesterday: yesterdayStats.earnings,
                    thisMonth: monthStats.earnings,
                    last30Days: last30DaysStats.earnings,
                    impressions: last30DaysStats.impressions,
                    clicks: last30DaysStats.clicks,
                    views: totalViews,
                    ctr: averageCtr.toFixed(2),
                    rpm: pageRpm.toFixed(2)
                },
                daily: dailyTrend,
                units: topAdUnits
            });

        } catch (e: any) {
            console.error('AdSense request failed:', e.message);
            return notConnected(`AdSense did not answer: ${e.message}. If it says invalid_grant, the saved AdSense sign-in has expired: sign in again and update GOOGLE_ADSENSE_REFRESH_TOKEN.`);
        }
    }

    // No made-up numbers: when the real source is unavailable, say so
    return notConnected('AdSense is not configured on this server (credentials missing).');
}

function notConnected(error: string) {
    return NextResponse.json({ error, connected: false }, { status: 503 });
}
