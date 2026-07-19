// scripts/post-new-to-telegram.js
// Batch broadcaster script that posts new scholarships to Telegram.
// Group updates > 5 into a single highlights digest.
// Run: node scripts/post-new-to-telegram.js [--dry-run] [--init]

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const Database = require('better-sqlite3');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const POSTED_JSON_PATH = path.resolve(__dirname, '../data/telegram-posted.json');
const DB_PATH = path.resolve(__dirname, '../data/scholarships.db');

const isDryRun = process.argv.includes('--dry-run');
const isInitOnly = process.argv.includes('--init');

if (!TOKEN || !CHANNEL_ID) {
    console.warn('⚠️ Warning: TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID is not defined. Skipping Telegram broadcast.');
    process.exit(0);
}

// Ensure database exists
if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Error: SQLite database not found at ${DB_PATH}`);
    process.exit(1);
}

// Load posted registry
let postedSlugs = [];
if (fs.existsSync(POSTED_JSON_PATH)) {
    try {
        postedSlugs = JSON.parse(fs.readFileSync(POSTED_JSON_PATH, 'utf8'));
        if (!Array.isArray(postedSlugs)) {
            postedSlugs = [];
        }
    } catch (e) {
        console.warn('⚠️ Warning: Failed to parse telegram-posted.json, starting fresh.');
        postedSlugs = [];
    }
}

const db = new Database(DB_PATH);

async function run() {
    try {
        // Query all active and verified scholarships
        const scholarships = db.prepare(`
            SELECT * FROM scholarships 
            WHERE status = 'Active' AND verified_status = 'Verified'
        `).all();

        console.log(`🔍 Found ${scholarships.length} active, verified scholarships in DB.`);

        // Handle initialization mode
        if (isInitOnly) {
            const allSlugs = scholarships.map(s => s.slug).filter(Boolean);
            fs.writeFileSync(POSTED_JSON_PATH, JSON.stringify(allSlugs, null, 2));
            console.log(`✅ Initialized registry with ${allSlugs.length} slugs. No messages sent.`);
            db.close();
            process.exit(0);
        }

        // Find new/unposted scholarships
        const newScholarships = scholarships.filter(s => s.slug && !postedSlugs.includes(s.slug));

        if (newScholarships.length === 0) {
            console.log('ℹ️ No new scholarships to broadcast.');
            db.close();
            process.exit(0);
        }

        console.log(`✨ Identified ${newScholarships.length} new scholarships to broadcast.`);

        if (isDryRun) {
            console.log('⚡ DRY RUN: No messages will be sent to Telegram.');
            newScholarships.forEach(s => console.log(`  - Would post: ${s.title} (${s.slug})`));
            db.close();
            process.exit(0);
        }

        if (newScholarships.length <= 5) {
            // Small batch: post individually with throttling delay
            console.log(`📤 Posting ${newScholarships.length} scholarships individually...`);
            for (const s of newScholarships) {
                await postIndividual(s);
                // Mark as posted immediately
                postedSlugs.push(s.slug);
                saveRegistry(postedSlugs);
                
                // Throttling delay
                if (newScholarships.indexOf(s) < newScholarships.length - 1) {
                    console.log('⏳ Waiting 5 seconds before next post...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        } else {
            // Large batch: post a single digest summary
            console.log(`📤 Posting a single digest summary for ${newScholarships.length} new scholarships...`);
            await postDigest(newScholarships);
            
            // Mark all of them as posted
            newScholarships.forEach(s => {
                if (!postedSlugs.includes(s.slug)) {
                    postedSlugs.push(s.slug);
                }
            });
            saveRegistry(postedSlugs);
        }

        console.log('🎉 Batch broadcast completed successfully.');

    } catch (err) {
        console.error('❌ Error during broadcast execution:', err);
    } finally {
        db.close();
    }
}

// Save registry helper
function saveRegistry(slugs) {
    try {
        fs.writeFileSync(POSTED_JSON_PATH, JSON.stringify(slugs, null, 2));
    } catch (e) {
        console.error('❌ Failed to save posted registry:', e.message);
    }
}

// Format benefit helper
function getBenefitText(s) {
    if (s.amount_annual && s.amount_annual > 0) {
        return `₹${Number(s.amount_annual).toLocaleString('en-IN')}/year`;
    } else if (s.amount_min && s.amount_min > 0) {
        return `₹${Number(s.amount_min).toLocaleString('en-IN')}/year`;
    }
    return 'Amount Varies';
}

// Post individual scholarship to Telegram
async function postIndividual(row) {
    const amountText = getBenefitText(row);
    const deadlineText = (row.deadline && row.deadline !== 'NA' && row.deadline !== 'Not specified') ? row.deadline : 'Check Portal';
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

    await sendTelegramMessage(message);
    console.log(`✅ Successfully posted alert for "${title}"`);
}

// Post batch digest to Telegram
async function postDigest(list) {
    // Sort by amount_annual (descending) or priority_score to highlight the top ones
    const sorted = [...list].sort((a, b) => (b.amount_annual || 0) - (a.amount_annual || 0));
    const top5 = sorted.slice(0, 5);

    let message = `🔔 *New Scholarships Update!*

We have just updated our database with *${list.length}* new scholarship opportunities! Here are the top highlights:

`;

    top5.forEach((s, idx) => {
        const benefit = getBenefitText(s);
        const url = `https://www.indiascholarships.in/scholarships/${s.slug}`;
        message += `${idx + 1}. *${s.title}*\n`;
        message += `   🏢 Provider: ${s.provider || 'Verified'}\n`;
        message += `   💰 Benefit: ${benefit}\n`;
        message += `   🔗 [Apply & Check Eligibility](${url})\n\n`;
    });

    message += `🔗 *View all newly added opportunities:*
[https://www.indiascholarships.in/scholarships](https://www.indiascholarships.in/scholarships)`;

    await sendTelegramMessage(message);
    console.log(`✅ Successfully posted batch digest for ${list.length} scholarships.`);
}

// Low-level HTTP POST to Telegram Bot API
async function sendTelegramMessage(text) {
    const apiURL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    const response = await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CHANNEL_ID,
            text: text,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
        })
    });

    const result = await response.json();
    if (!result.ok) {
        throw new Error(`Telegram API Error: ${JSON.stringify(result)}`);
    }
    return result;
}

run();
