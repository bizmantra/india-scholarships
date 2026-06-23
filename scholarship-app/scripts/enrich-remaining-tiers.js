const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY is not defined in .env.local");
    process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');
const gapsPath = path.join(__dirname, '..', 'data', 'gaps-list.json');

if (!fs.existsSync(gapsPath)) {
    console.error(`❌ Error: gaps-list.json not found at ${gapsPath}. Run list-gaps.js first.`);
    process.exit(1);
}

// Parse command line args
const args = process.argv.slice(2);
const limitArg = args.indexOf('--limit');
const limit = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : 5; // default to 5 for pilot
const offsetArg = args.indexOf('--offset');
const offset = offsetArg !== -1 ? parseInt(args[offsetArg + 1], 10) : 0;
const dryRun = args.includes('--dry-run');

console.log(`🚀 Gemini Google Grounding Enrichment Tool (Remaining Tiers)`);
console.log(`- Limit: ${limit}`);
console.log(`- Offset: ${offset}`);
console.log(`- Dry Run: ${dryRun}\n`);

const targets = JSON.parse(fs.readFileSync(gapsPath, 'utf-8'));
const db = new Database(dbPath);

console.log(`🎯 Loaded ${targets.length} targets with gaps from gaps-list.json.`);

// Slice to batch limit/offset
const batch = targets.slice(offset, offset + limit);
console.log(`👉 Processing batch of ${batch.length} scholarships (Offset: ${offset}, Limit: ${limit})...\n`);

async function callGemini(title, provider) {
    const prompt = `Research the official details for the "${title}" scholarship by "${provider}" in India for the academic year 2025-26 or 2026.
Generate structured content targeting student and parent intent (e.g. disbursement details, selection criteria, renewal conditions, status tracking guides, and critical FAQs).
You must search Google to find the accurate, current values.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        tools: [
            {
                googleSearch: {}
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    amount_annual: { type: "INTEGER", description: "Estimated or exact annual amount in INR. 0 if variable/unknown." },
                    amount_min: { type: "INTEGER", description: "Minimum annual amount in INR. 0 if unknown." },
                    amount_description: { type: "STRING", description: "Describe the amount, payment schedule, and Direct Benefit Transfer (DBT) to Aadhaar-seeded accounts details." },
                    min_marks: { type: "INTEGER", description: "Minimum percentage marks required. 0 if none/unknown." },
                    selection: { type: "STRING", description: "Clear description of how candidates are selected (merit ranking on marks, preference for lower income, or exams)." },
                    renewal: { type: "STRING", description: "Clear conditions for annual renewal (passing previous exams with no backlogs, maintaining attendance) and the process." },
                    helpline: { type: "STRING", description: "Official support phone numbers and email address, comma-separated." },
                    official_source: { type: "STRING", description: "Official department/provider URL." },
                    apply_url: { type: "STRING", description: "Official direct application form/portal link URL." },
                    faq_json: {
                        type: "ARRAY",
                        description: "List of exactly 3 critical FAQ questions and answers solving parent/student anxieties.",
                        items: {
                            type: "OBJECT",
                            properties: {
                                question: { type: "STRING" },
                                answer: { type: "STRING" }
                            },
                            required: ["question", "answer"]
                        }
                    }
                },
                required: [
                    "amount_annual",
                    "amount_min",
                    "amount_description",
                    "min_marks",
                    "selection",
                    "renewal",
                    "helpline",
                    "official_source",
                    "apply_url",
                    "faq_json"
                ]
            }
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response candidates returned from Gemini");
    }

    const contentText = data.candidates[0].content.parts[0].text;
    return JSON.parse(contentText.trim());
}

async function callGeminiWithRetry(title, provider, maxRetries = 4) {
    let delay = 5000; // start with 5 seconds delay on failure
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await callGemini(title, provider);
        } catch (error) {
            console.warn(`   ⚠️ Attempt ${attempt} failed: ${error.message}`);
            if (attempt === maxRetries) {
                throw error;
            }
            console.log(`   ⏱️ Waiting ${delay / 1000}s before retrying...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // exponential backoff
        }
    }
}

async function runEnrichment() {
    const updateStmt = db.prepare(`
        UPDATE scholarships 
        SET amount_annual = ?, 
            amount_min = ?, 
            amount_description = ?, 
            min_marks = ?, 
            selection = ?, 
            renewal = ?, 
            helpline = ?, 
            official_source = ?, 
            apply_url = ?, 
            faq_json = ?,
            verified_status = 'Verified',
            last_verified = datetime('now')
        WHERE slug = ?
    `);

    for (let i = 0; i < batch.length; i++) {
        const item = batch[i];
        console.log(`[${i + 1}/${batch.length}] 🔍 Researching: "${item.title}" (${item.slug})`);
        console.log(`   - GSC: ${item.impressions.toLocaleString()} imps | ${item.ctr} CTR`);
        console.log(`   - Missing fields: ${item.gaps.join(', ')}`);
        
        try {
            const data = await callGeminiWithRetry(item.title, item.provider);
            console.log(`   ✅ Research fetched via Gemini Grounding.`);
            console.log(`      • Amount: ₹${data.amount_annual} (Min: ₹${data.amount_min})`);
            console.log(`      • Marks: ${data.min_marks}%`);
            console.log(`      • Source: ${data.official_source}`);
            
            if (dryRun) {
                console.log(`   [DRY RUN] Would update database record.`);
            } else {
                updateStmt.run(
                    data.amount_annual || 0,
                    data.amount_min || 0,
                    data.amount_description || '',
                    data.min_marks || 0,
                    data.selection || '',
                    data.renewal || '',
                    data.helpline || '',
                    data.official_source || '',
                    data.apply_url || '',
                    JSON.stringify(data.faq_json || []),
                    item.slug
                );
                console.log(`   💾 Database updated successfully.`);
            }
        } catch (error) {
            console.error(`   ❌ Failed to process ${item.slug} after retries:`, error.message);
        }
        
        // Wait 8 seconds to avoid Gemini AI Studio free tier rate limits (15 RPM max)
        if (i < batch.length - 1) {
            console.log(`   ⏱️ Waiting 8s to respect Gemini Free Tier limits...`);
            await new Promise(resolve => setTimeout(resolve, 8000));
        }
    }
    
    console.log(`\n🏁 Batch execution complete.`);
    db.close();
}

runEnrichment();
