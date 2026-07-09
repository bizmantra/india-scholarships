const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!GEMINI_API_KEY && !PERPLEXITY_API_KEY) {
    console.error("❌ Error: Neither GEMINI_API_KEY nor PERPLEXITY_API_KEY is defined in .env.local");
    process.exit(1);
}

const DATA_DIR = path.join(__dirname, '..', 'data', 'gsc-june-2026');
const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');

// Parse command line args
const args = process.argv.slice(2);
const limitArg = args.indexOf('--limit');
const limit = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : 5; // default to 5 for pilot
const offsetArg = args.indexOf('--offset');
const offset = offsetArg !== -1 ? parseInt(args[offsetArg + 1], 10) : 0;
const dryRun = args.includes('--dry-run');

console.log(`🚀 Gemini Google Grounding Enrichment Tool`);
console.log(`- Limit: ${limit}`);
console.log(`- Offset: ${offset}`);
console.log(`- Dry Run: ${dryRun}\n`);

const pages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pages.json'), 'utf-8'));
const db = new Database(dbPath);

const pageList = pages.slice(1).map(p => ({
    url: p[0].replace('https://www.indiascholarships.in', '').trim(),
    clicks: Number(p[1] || 0),
    impressions: Number(p[2] || 0),
    ctr: p[3],
    pos: Number(p[4] || 0)
}));

// 1. Identify Top 25 Low-CTR pages (Impressions > 5,000, CTR < 2.0%) sorted by impressions
const lowCtrCandidates = pageList
    .filter(p => p.url.startsWith('/scholarships/') && p.impressions > 5000 && parseFloat(p.ctr) < 2.0)
    .sort((a, b) => b.impressions - a.impressions);

const lowCtrTargets = [];
for (const page of lowCtrCandidates) {
    if (lowCtrTargets.length >= 25) break;
    const slug = page.url.replace('/scholarships/', '');
    const row = db.prepare('SELECT id, title, provider FROM scholarships WHERE slug = ?').get(slug);
    if (row) {
        lowCtrTargets.push({
            slug: slug,
            title: row.title,
            provider: row.provider || 'State/Central Government',
            impressions: page.impressions,
            ctr: page.ctr,
            reason: 'Low-CTR Improvement'
        });
    }
}

// 2. Identify Top 25 High-Traffic pages (regardless of CTR) sorted by impressions, avoiding duplicates
const highTrafficCandidates = pageList
    .filter(p => p.url.startsWith('/scholarships/'))
    .sort((a, b) => b.impressions - a.impressions);

const highTrafficTargets = [];
for (const page of highTrafficCandidates) {
    if (highTrafficTargets.length >= 25) break;
    const slug = page.url.replace('/scholarships/', '');
    if (lowCtrTargets.some(t => t.slug === slug)) continue;

    const row = db.prepare('SELECT id, title, provider FROM scholarships WHERE slug = ?').get(slug);
    if (row) {
        highTrafficTargets.push({
            slug: slug,
            title: row.title,
            provider: row.provider || 'State/Central Government',
            impressions: page.impressions,
            ctr: page.ctr,
            reason: 'High-Traffic Freshness Check'
        });
    }
}

const targets = [...lowCtrTargets, ...highTrafficTargets];
console.log(`📊 GSC Target Selection:`);
console.log(`   - Top Low-CTR targets selected: ${lowCtrTargets.length}`);
console.log(`   - Top High-Traffic targets selected: ${highTrafficTargets.length}`);
console.log(`   - Total unique targets: ${targets.length}`);

// Slice to batch limit/offset
const batch = targets.slice(offset, offset + limit);
console.log(`👉 Processing batch of ${batch.length} scholarships (Offset: ${offset}, Limit: ${limit})...\n`);

async function callGemini(title, provider) {
    if (PERPLEXITY_API_KEY) {
        const prompt = `Research the official details for the "${title}" scholarship by ${provider} in India for the academic year 2025-26 or 2026.
Generate structured content targeting student and parent intent.
You MUST search the web to find the accurate, current values.

You must respond with a single, valid JSON object matching the following schema. Do NOT wrap it in markdown code blocks.
JSON Schema:
{
  "amount_annual": integer (Estimated or exact highest annual amount in INR. 0 if variable/unknown),
  "amount_min": integer (Minimum annual amount in INR. 0 if unknown),
  "amount_description": string (Describe the amount, payment schedule, and Direct Benefit Transfer (DBT) to Aadhaar-seeded accounts details),
  "min_marks": integer (Minimum percentage marks required. 0 if none/unknown),
  "selection": string (Clear description of how candidates are selected),
  "renewal": string (Clear conditions for annual renewal and the process),
  "helpline": string (Official support phone numbers and email address, comma-separated),
  "official_source": string (Official department/provider URL),
  "apply_url": string (Official direct application form/portal link URL),
  "step_guide": string (Markdown instructions detailing how to register, apply, and track status online),
  "faq_json": [
    {
      "question": string (FAQ question),
      "answer": string (FAQ answer)
    }
  ] (Exactly 3 critical FAQ questions and answers solving parent/student anxieties)
}

Provide ONLY the raw JSON object.`;

        const url = 'https://api.perplexity.ai/chat/completions';
        const payload = {
            model: "sonar",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that performs thorough web searches and always outputs valid JSON matching the requested schema. Return only raw JSON, no markdown formatting."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: {
                type: "text"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const contentText = data.choices[0].message.content;
        return JSON.parse(contentText.trim());
    }

    // Fall back to Gemini
    const prompt = `Research the official details for the "${title}" scholarship by ${provider} in India for the academic year 2025-26 or 2026.
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
                    step_guide: { type: "STRING", description: "Markdown instructions detailing how to register, apply, and track status online." },
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
                    "step_guide",
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
            step_guide = ?, 
            faq_json = ?,
            verified_status = 'Verified',
            last_verified = datetime('now')
        WHERE slug = ?
    `);

    for (let i = 0; i < batch.length; i++) {
        const item = batch[i];
        console.log(`[${i + 1}/${batch.length}] 🔍 Researching: "${item.title}" (${item.slug})`);
        console.log(`   - GSC: ${item.impressions.toLocaleString()} imps | ${item.ctr} CTR | Reason: ${item.reason}`);
        
        try {
            const data = await callGemini(item.title, item.provider);
            console.log(`   ✅ Research fetched successfully.`);
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
                    data.step_guide || '',
                    JSON.stringify(data.faq_json || []),
                    item.slug
                );
                console.log(`   💾 Database updated successfully.`);
            }
        } catch (error) {
            console.error(`   ❌ Failed to process ${item.slug}:`, error.message);
        }
        
        // Wait 6 seconds to avoid Gemini AI Studio free tier rate limits (15 RPM)
        if (i < batch.length - 1) {
            console.log(`   ⏱️ Waiting 6s to respect Gemini Free Tier limits...`);
            await new Promise(resolve => setTimeout(resolve, 6000));
        }
    }
    
    console.log(`\n🏁 Batch execution complete.`);
    db.close();
}

runEnrichment();
