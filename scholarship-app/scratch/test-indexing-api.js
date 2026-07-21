require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testIndexingAPI() {
    console.log('Testing Google Indexing API with Service Account...');
    
    try {
        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const indexing = google.indexing({ version: 'v3', auth });

        const testUrl = 'https://www.indiascholarships.in/scholarships/tata-capital-pankh-scholarship';
        
        console.log(`Sending URL_UPDATED notification for: ${testUrl}`);
        const res = await indexing.urlNotifications.publish({
            requestBody: {
                url: testUrl,
                type: 'URL_UPDATED'
            }
        });

        console.log('Indexing API Response:', JSON.stringify(res.data, null, 2));

    } catch (e) {
        console.error('Indexing API Error:', e.message);
        if (e.response && e.response.data) {
            console.error('Error Details:', JSON.stringify(e.response.data, null, 2));
        }
    }
}

testIndexingAPI();
