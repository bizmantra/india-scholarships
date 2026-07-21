require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const path = require('path');
const db = require('better-sqlite3')(path.join(__dirname, '..', 'data', 'scholarships.db'));

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.indiascholarships.in';
const INDEXNOW_KEY = 'c0326e5e8e894b92b67f1b7454efb507';

async function main() {
    console.log('=== PRIORITY INDEXING SUBMISSION PIPELINE ===\n');

    // 1. Select top URLs to notify (up to 200 URLs to respect Google Indexing API daily quota)
    const scholarships = db.prepare('SELECT slug FROM scholarships ORDER BY amount_annual DESC LIMIT 150').all();
    const states = db.prepare("SELECT DISTINCT state FROM scholarships WHERE state IS NOT NULL AND state != '' LIMIT 30").all();

    const targetUrls = [
        `${BASE_URL}/`,
        `${BASE_URL}/scholarships`,
        `${BASE_URL}/state-scholarships`,
        `${BASE_URL}/scholarships/deadlines`,
        `${BASE_URL}/scholarships/recently-added`
    ];

    scholarships.forEach(s => targetUrls.push(`${BASE_URL}/scholarships/${s.slug}`));
    states.forEach(st => {
        const slug = st.state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        targetUrls.push(`${BASE_URL}/scholarships-in/${slug}`);
    });

    console.log(`Prepared ${targetUrls.length} priority URLs for submission.\n`);

    // --- STEP 1: SUBMIT TO INDEXNOW (BING & YANDEX) ---
    console.log('1. Submitting to IndexNow (Bing / Yandex)...');
    try {
        const payload = {
            host: 'www.indiascholarships.in',
            key: INDEXNOW_KEY,
            keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
            urlList: targetUrls
        };

        const res = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload)
        });

        if (res.status === 200 || res.status === 202) {
            console.log(`✅ IndexNow Submission Successful! (HTTP ${res.status} ${res.statusText})`);
            console.log(`   Pushed ${targetUrls.length} URLs to Bing & Yandex.`);
        } else {
            console.log(`⚠️ IndexNow responded with HTTP ${res.status} ${res.statusText}`);
        }
    } catch (e) {
        console.error('❌ IndexNow Submission Error:', e.message);
    }

    // --- STEP 2: SUBMIT TO GOOGLE INDEXING API ---
    console.log('\n2. Submitting to Google Indexing API (Service Account)...');
    try {
        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const indexing = google.indexing({ version: 'v3', auth });

        let successCount = 0;
        let failCount = 0;
        let serviceDisabled = false;

        for (const url of targetUrls.slice(0, 50)) { // Submit top 50 in batch loop
            try {
                await indexing.urlNotifications.publish({
                    requestBody: {
                        url: url,
                        type: 'URL_UPDATED'
                    }
                });
                successCount++;
            } catch (err) {
                failCount++;
                if (failCount === 1) {
                    console.log('Google Indexing API Error Sample:', err.message);
                }
                if (err.message.includes('Web Search Indexing API has not been used in project')) {
                    serviceDisabled = true;
                    break;
                }
            }
            await new Promise(r => setTimeout(r, 100));
        }

        if (serviceDisabled) {
            console.log('⚠️ Google Web Search Indexing API is disabled on your GCP project.');
            console.log('👉 To enable Google direct push, visit this 1-click link:');
            console.log('   https://console.developers.google.com/apis/api/indexing.googleapis.com/overview?project=971256855880');
        } else {
            console.log(`✅ Google Indexing API Batch Finished: ${successCount} succeeded, ${failCount} failed.`);
        }

    } catch (e) {
        console.error('❌ Google Indexing API Error:', e.message);
    }

    db.close();
}

main().catch(console.error);
