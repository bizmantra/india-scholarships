const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const { google } = require('googleapis');

async function expandAnalysis() {
    console.log('🔍 Comprehensive Portal & Category Guide Opportunity Audit...\n');

    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const searchconsole = google.searchconsole({ version: 'v1', auth });

    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const startDateObj = new Date();
    startDateObj.setDate(today.getDate() - 30);
    const startDate = startDateObj.toISOString().split('T')[0];

    try {
        const gscRes = await searchconsole.searchanalytics.query({
            siteUrl: 'sc-domain:indiascholarships.in',
            requestBody: {
                startDate: startDate,
                endDate: endDate,
                dimensions: ['query'],
                rowLimit: 2500
            }
        });

        const rows = gscRes.data.rows || [];
        console.log(`Fetched ${rows.length} search queries from GSC.\n`);

        // State & Portal keyword mappings
        const portalClusters = {
            'Jharkhand (e-Kalyan)': ['ekalyan', 'e kalyan', 'jharkhand scholarship', 'e-kalyan'],
            'Gujarat (Digital Gujarat & MYSY)': ['digital gujarat', 'mysy', 'gujarat scholarship', 'digitalgujarat'],
            'National (NSP & PFMS)': ['nsp', 'national scholarship portal', 'pfms', 'scholarships.gov.in'],
            'Madhya Pradesh (MPTAAS & MMVY)': ['mptaas', 'mmvy', 'mp scholarship', 'medhavi vidyarthi', 'mp taash'],
            'West Bengal (Aikyashree, Oasis, SVMCM, Nabanna)': ['aikyashree', 'oasis scholarship', 'svmcm', 'nabanna', 'wb scholarship', 'wbmdfc'],
            'Kerala (E-Grantz 3.0)': ['egrantz', 'e grantz', 'kerala scholarship'],
            'Karnataka (SSP & e-Pass)': ['ssp', 'ssp scholarship', 'karnataka scholarship', 'epass karnataka'],
            'Odisha (State Scholarship Portal)': ['odisha scholarship', 'medhabruti', 'boc scholarship', 'nirman shramik'],
            'Uttar Pradesh (UP Scholarship / Saksham)': ['up scholarship', 'scholarship.up.gov.in', 'up scholarship status'],
            'Maharashtra (MahaDBT / Rajarshi Shahu)': ['mahadbt', 'maha dbt', 'maharashtra scholarship'],
            'Andhra Pradesh / Telangana (Jagananna / ePASS)': ['jagananna', 'talliki vandanam', 'epass telangana', 'ts epass', 'ap epass'],
            'Bihar (Post Matric Bihar / PMS Bihar)': ['pms bihar', 'bihar scholarship', 'post matric bihar'],
            'Rajasthan (SJE / RajPoshak)': ['sje rajasthan', 'rajasthan scholarship', ' उत्तरछात्रवृत्ति']
        };

        // Category Mappings
        const categoryClusters = {
            'Girls / Women Scholarships': ['girl', 'girls', 'female', 'kanya', 'pragati', 'single girl'],
            'SC / ST Category': ['sc scholarship', 'st scholarship', 'scheduled caste', 'scheduled tribe', 'post matric sc'],
            'OBC / EBC Category': ['obc scholarship', 'ebc scholarship', 'other backward', 'post matric obc'],
            'Minority Scholarships': ['minority scholarship', 'moma', 'begum hazrat', 'pre matric minority'],
            'Corporate / Private CSR': ['jindal', 'tata', 'hdfc', 'reliance', 'lic', 'kotak', 'sitaram jindal', 'tata capital']
        };

        function evaluateCluster(clusters, title) {
            console.log(`=======================================================`);
            console.log(`📌 ${title}`);
            console.log(`=======================================================\n`);

            const results = [];

            Object.entries(clusters).forEach(([groupName, keywords]) => {
                let totalClicks = 0;
                let totalImpressions = 0;
                let weightedPosSum = 0;
                const matchedQueries = [];

                rows.forEach(r => {
                    const q = r.keys[0].toLowerCase();
                    if (keywords.some(kw => q.includes(kw))) {
                        totalClicks += r.clicks;
                        totalImpressions += r.impressions;
                        weightedPosSum += (r.position * r.impressions);
                        matchedQueries.push({
                            query: r.keys[0],
                            clicks: r.clicks,
                            impressions: r.impressions,
                            ctr: (r.ctr * 100).toFixed(2),
                            position: r.position.toFixed(1)
                        });
                    }
                });

                if (totalImpressions > 0) {
                    const avgPos = (weightedPosSum / totalImpressions).toFixed(1);
                    const avgCtr = ((totalClicks / totalImpressions) * 100).toFixed(2);
                    results.push({
                        groupName,
                        totalClicks,
                        totalImpressions,
                        avgCtr,
                        avgPos,
                        queryCount: matchedQueries.length,
                        topQueries: matchedQueries.sort((a, b) => b.impressions - a.impressions).slice(0, 5)
                    });
                }
            });

            results.sort((a, b) => b.totalImpressions - a.totalImpressions);

            results.forEach(res => {
                console.log(`🏢 Group: ${res.groupName}`);
                console.log(`   - Total Impressions: ${res.totalImpressions.toLocaleString()}`);
                console.log(`   - Total Clicks:      ${res.totalClicks.toLocaleString()}`);
                console.log(`   - Average CTR:       ${res.avgCtr}%`);
                console.log(`   - Average Position:  ${res.avgPos}`);
                console.log(`   - Matched Queries:   ${res.queryCount}`);
                console.log(`   - Top 5 Search Terms:`);
                res.topQueries.forEach(q => {
                    console.log(`     • "${q.query}" → Imps: ${q.impressions.toLocaleString()} | Clicks: ${q.clicks} | CTR: ${q.ctr}% | Pos: ${q.position}`);
                });
                console.log('');
            });
        }

        evaluateCluster(portalClusters, 'STATE & GOVERNMENT PORTAL OPPORTUNITY AUDIT');
        evaluateCluster(categoryClusters, 'CATEGORY & SCHEME CLUSTER OPPORTUNITY AUDIT');

    } catch (err) {
        console.error('❌ Error during expand analysis:', err.message);
    }
}

expandAnalysis();
