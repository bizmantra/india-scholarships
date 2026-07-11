// scripts/post-to-telegram.js
// Automated script to broadcast scholarship alerts to Telegram.
// Run: node scripts/post-to-telegram.js --slug <scholarship-slug>

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const Database = require('better-sqlite3');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

if (!TOKEN || !CHANNEL_ID) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be defined in your .env.local file.');
    process.exit(1);
}

// Parse args
const args = process.argv.slice(2);
const slugIndex = args.indexOf('--slug');
let targetSlug = null;
if (slugIndex !== -1 && args[slugIndex + 1]) {
    targetSlug = args[slugIndex + 1];
}

if (!targetSlug) {
    console.error('❌ Error: Please specify a scholarship slug. Example:');
    console.error('  node scripts/post-to-telegram.js --slug amazon-future-engineer-scholarship-india');
    process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const db = new Database(dbPath);

async function postScholarship() {
    try {
        console.log(`🔍 Fetching scholarship with slug: "${targetSlug}"...`);
        const row = db.prepare('SELECT * FROM scholarships WHERE slug = ?').get(targetSlug);

        if (!row) {
            console.error(`❌ Error: Scholarship not found in database for slug: "${targetSlug}"`);
            db.close();
            process.exit(1);
        }

        // Format annual amount
        let amountText = 'Amount Varies';
        if (row.amount_annual && row.amount_annual > 0) {
            amountText = `₹${Number(row.amount_annual).toLocaleString('en-IN')}/year`;
        } else if (row.amount_min && row.amount_min > 0) {
            amountText = `₹${Number(row.amount_min).toLocaleString('en-IN')}/year`;
        }

        // Format deadline
        let deadlineText = 'Check Portal';
        if (row.deadline && row.deadline !== 'NA' && row.deadline !== 'Not specified') {
            deadlineText = row.deadline;
        }

        // Formulate message with markdown styling
        const title = row.title.trim();
        const provider = row.provider ? row.provider.trim() : 'Verified Provider';
        const url = `https://www.indiascholarships.in/scholarships/${row.slug}`;

        const message = 
`🔔 *New Scholarship Alert!*

🎓 *${title}*

🏢 *Provider:* ${provider}
💰 *Benefit:* ${amountText}
📅 *Last Date to Apply:* ${deadlineText}

🔗 *Read Eligibility & Apply Here:*
[${url}](${url})`;

        console.log('Sending message to Telegram Channel...');
        const apiURL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHANNEL_ID,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: false
            })
        });

        const result = await response.json();
        if (result.ok) {
            console.log(`✅ Successfully posted alert for "${title}" to Telegram!`);
        } else {
            console.error('❌ Telegram API returned an error:', result);
        }

    } catch (err) {
        console.error('❌ System Error during broadcast:', err.message);
    } finally {
        db.close();
    }
}

postScholarship();
