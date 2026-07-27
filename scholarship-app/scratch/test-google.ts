import dotenv from 'dotenv';
import path from 'path';
// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { verifyGoogleConnections } from '../lib/google-auth';

async function run() {
    console.log('🔄 Verifying Google API connections...');
    try {
        const status = await verifyGoogleConnections();
        console.log('📊 Connection Status:', JSON.stringify(status, null, 2));
    } catch (err) {
        console.error('❌ Error during verification:', err);
    }
}

run();
