import { google } from 'googleapis';

/**
 * Returns Google Service Account JWT auth client for a list of scopes.
 * Reuses Google Sheets credentials if dedicated Google Services credentials are not set.
 */
function getServiceAccountAuth(scopes: string[]) {
    const email = process.env.GOOGLE_SERVICES_CLIENT_EMAIL || process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICES_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY;

    if (!email || !privateKey) {
        throw new Error('Google Service Account credentials missing in environment.');
    }

    return new google.auth.JWT({
        email,
        key: privateKey.replace(/\\n/g, '\n'),
        scopes
    });
}

/**
 * Returns Google OAuth2 client with a configured refresh token (needed for Google AdSense).
 */
function getOAuth2Auth() {
    const clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADSENSE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_ADSENSE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Google AdSense OAuth credentials missing in environment.');
    }

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret
    );
    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });

    return oauth2Client;
}

/**
 * Google Search Console (GSC) API Client
 */
export function getSearchConsoleClient() {
    const auth = getServiceAccountAuth(['https://www.googleapis.com/auth/webmasters.readonly']);
    return google.webmasters({ version: 'v3', auth });
}

/**
 * Google Analytics 4 (GA4) API Client
 */
export function getAnalyticsClient() {
    const auth = getServiceAccountAuth(['https://www.googleapis.com/auth/analytics.readonly']);
    return google.analyticsdata({ version: 'v1beta', auth });
}

/**
 * Google AdSense Management API Client
 */
export function getAdSenseClient() {
    const auth = getOAuth2Auth();
    return google.adsense({ version: 'v2', auth });
}

/**
 * Diagnose health status of configured Google API clients.
 * Safely tries queries and reports connection statuses.
 */
export async function verifyGoogleConnections() {
    const status = {
        gsc: { connected: false, error: null as string | null },
        ga4: { connected: false, error: null as string | null },
        adsense: { connected: false, error: null as string | null }
    };

    // 1. Verify GSC
    try {
        const gsc = getSearchConsoleClient();
        const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:indiascholarships.in';
        // Run simple query for yesterday
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await gsc.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: yesterday,
                endDate: yesterday,
                rowLimit: 1
            }
        });
        status.gsc.connected = true;
    } catch (e: any) {
        status.gsc.error = e.message || 'Verification query failed.';
    }

    // 2. Verify GA4
    try {
        const ga4 = getAnalyticsClient();
        const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
        if (!propertyId) throw new Error('GOOGLE_ANALYTICS_PROPERTY_ID env var is missing.');
        
        await ga4.properties.runReport({
            property: `properties/${propertyId}`,
            requestBody: {
                dateRanges: [{ startDate: 'yesterday', endDate: 'yesterday' }],
                metrics: [{ name: 'activeUsers' }],
                limit: '1'
            }
        });
        status.ga4.connected = true;
    } catch (e: any) {
        status.ga4.error = e.message || 'Verification query failed.';
    }

    // 3. Verify AdSense
    try {
        const adsense = getAdSenseClient();
        const accountId = process.env.GOOGLE_ADSENSE_ACCOUNT_ID;
        if (!accountId) throw new Error('GOOGLE_ADSENSE_ACCOUNT_ID env var is missing.');
        
        await adsense.accounts.get({
            name: `accounts/${accountId}`
        });
        status.adsense.connected = true;
    } catch (e: any) {
        status.adsense.error = e.message || 'Verification query failed.';
    }

    return status;
}
