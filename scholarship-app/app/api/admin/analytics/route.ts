import { NextResponse } from 'next/server';
import { getAnalyticsClient } from '@/lib/google-auth';

export async function GET() {

    const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

    // Check if live credentials and property ID are configured
    if (email && privateKey && propertyId) {
        try {
            const analytics = getAnalyticsClient();
            const property = `properties/${propertyId}`;

            // 1. Fetch Real-time Active Users (last 30 minutes)
            let realtimeUsers = 0;
            try {
                const realtimeRes = await analytics.properties.runRealtimeReport({
                    property,
                    requestBody: {
                        metrics: [{ name: 'activeUsers' }]
                    }
                });
                realtimeUsers = parseInt(realtimeRes.data.rows?.[0]?.metricValues?.[0]?.value || '0') || 0;
            } catch (err: any) {
                console.warn('GA4 Realtime query failed, using 0:', err.message);
            }

            // 2. Fetch 30-Day Trend (Sessions, Pageviews, Active Users)
            const trendRes = await analytics.properties.runReport({
                property,
                requestBody: {
                    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                    dimensions: [{ name: 'date' }],
                    metrics: [
                        { name: 'activeUsers' },
                        { name: 'screenPageviews' },
                        { name: 'averageSessionDuration' }
                    ]
                }
            });

            const trendData = (trendRes.data.rows || []).map(row => {
                const rawDate = row.dimensionValues?.[0]?.value || '';
                // Format YYYYMMDD to YYYY-MM-DD
                const formattedDate = rawDate.length === 8 
                    ? `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}` 
                    : rawDate;

                return {
                    date: formattedDate,
                    users: parseInt(row.metricValues?.[0]?.value || '0') || 0,
                    pageviews: parseInt(row.metricValues?.[1]?.value || '0') || 0,
                    avgDuration: Math.round(parseFloat(row.metricValues?.[2]?.value || '0') || 0)
                };
            }).sort((a, b) => a.date.localeCompare(b.date));

            // 3. Fetch Top Sources (sessionSourceMedium)
            const sourceRes = await analytics.properties.runReport({
                property,
                requestBody: {
                    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                    dimensions: [{ name: 'sessionSourceMedium' }],
                    metrics: [{ name: 'activeUsers' }],
                    limit: '10'
                }
            });

            const topSources = (sourceRes.data.rows || []).map(row => ({
                source: row.dimensionValues?.[0]?.value || 'Direct / None',
                users: parseInt(row.metricValues?.[0]?.value || '0') || 0
            }));

            // 4. Fetch Top Page Paths
            const pageRes = await analytics.properties.runReport({
                property,
                requestBody: {
                    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                    dimensions: [{ name: 'pagePath' }],
                    metrics: [{ name: 'screenPageviews' }],
                    limit: '15'
                }
            });

            const topPages = (pageRes.data.rows || []).map(row => ({
                path: row.dimensionValues?.[0]?.value || '/',
                views: parseInt(row.metricValues?.[0]?.value || '0') || 0
            }));

            return NextResponse.json({
                liveMode: true,
                realtime: realtimeUsers,
                trend: trendData,
                sources: topSources,
                pages: topPages
            });

        } catch (e: any) {
            console.error('Google Analytics request failed:', e.message);
            return notConnected(`Google Analytics did not answer: ${e.message}. Check GOOGLE_ANALYTICS_PROPERTY_ID and that the service account can read the property.`);
        }
    }

    // No made-up numbers: when the real source is unavailable, say so
    return notConnected('Google Analytics is not configured on this server (credentials missing).');
}

function notConnected(error: string) {
    return NextResponse.json({ error, connected: false }, { status: 503 });
}
