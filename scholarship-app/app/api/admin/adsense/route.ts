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
            console.error('Google AdSense API fetch failed, falling back to mock:', e.message);
        }
    }

    // Fallback Mock Mode
    console.log('💸 AdSense API Mock mode activated.');
    const mockDaily = [];
    const now = new Date();
    let mockTotalEarnings = 0;
    let mockTotalImpressions = 0;
    let mockTotalClicks = 0;
    let mockTotalViews = 0;

    for (let i = 30; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];

        // Random earnings between $10 - $25 (represented in INR e.g. ₹800 - ₹2000)
        const randBase = Math.sin(i / 5) * 300 + 1200;
        const earnings = Math.round(randBase + Math.random() * 200);
        const views = Math.round(earnings * (1.8 + Math.random() * 0.4));
        const impressions = Math.round(views * 1.5);
        const clicks = Math.round(impressions * (0.015 + Math.random() * 0.005));

        mockTotalEarnings += earnings;
        mockTotalImpressions += impressions;
        mockTotalClicks += clicks;
        mockTotalViews += views;

        mockDaily.push({ date: dateStr, earnings, impressions, clicks, views });
    }

    const todayEarnings = Math.round(1100 + Math.random() * 300);
    const yesterdayEarnings = Math.round(1450 + Math.random() * 200);

    const averageCtr = mockTotalImpressions > 0 ? (mockTotalClicks / mockTotalImpressions) * 100 : 1.8;
    const pageRpm = mockTotalViews > 0 ? (mockTotalEarnings / mockTotalViews) * 1000 : 450;

    return NextResponse.json({
        liveMode: false,
        summary: {
            today: todayEarnings,
            yesterday: yesterdayEarnings,
            thisMonth: Math.round(mockTotalEarnings * 0.65), // partial month
            last30Days: mockTotalEarnings,
            impressions: mockTotalImpressions,
            clicks: mockTotalClicks,
            views: mockTotalViews,
            ctr: averageCtr.toFixed(2),
            rpm: pageRpm.toFixed(2)
        },
        daily: mockDaily,
        units: [
            { name: 'Detail_Pages_Sticky_Footer_Banner', earnings: Math.round(mockTotalEarnings * 0.42), impressions: Math.round(mockTotalImpressions * 0.35), clicks: Math.round(mockTotalClicks * 0.45) },
            { name: 'Detail_Pages_Sidebar_Responsive', earnings: Math.round(mockTotalEarnings * 0.28), impressions: Math.round(mockTotalImpressions * 0.30), clicks: Math.round(mockTotalClicks * 0.25) },
            { name: 'Homepage_Top_Leaderboard', earnings: Math.round(mockTotalEarnings * 0.18), impressions: Math.round(mockTotalImpressions * 0.20), clicks: Math.round(mockTotalClicks * 0.18) },
            { name: 'Eligibility_Checker_Responsive', earnings: Math.round(mockTotalEarnings * 0.12), impressions: Math.round(mockTotalImpressions * 0.15), clicks: Math.round(mockTotalClicks * 0.12) }
        ]
    });
}
