const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const inbox = require('./lib/agent-inbox');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

// Parse command line args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Parse --engine argument, default to gemini
const engineArgIndex = args.indexOf('--engine');
const engine = engineArgIndex !== -1 ? args[engineArgIndex + 1] : 'gemini';

// Optional limit for testing/debugging
const limitArgIndex = args.indexOf('--limit');
const testLimit = limitArgIndex !== -1 ? parseInt(args[limitArgIndex + 1], 10) : null;

if (engine === 'perplexity' && !PERPLEXITY_API_KEY) {
    console.error("❌ Error: Perplexity engine requested but PERPLEXITY_API_KEY is not defined in .env.local");
    process.exit(1);
} else if (engine === 'gemini' && !GEMINI_API_KEY) {
    console.error("❌ Error: Gemini API key is not defined in .env.local");
    process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'data', 'scholarships.db');

console.log(`🚀 Freshness Enrichment Sweep`);
console.log(`- Engine: ${engine}`);
console.log(`- Dry Run: ${dryRun}`);
if (testLimit) {
    console.log(`- Test Limit: ${testLimit}`);
}
console.log('');

const db = new Database(dbPath);
const AGENT = 'weekly-enrichment';

async function callModel(title, provider) {
    if (engine === 'perplexity') {
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

    // Default to Gemini Flash
    const prompt = `Research the official details for the "${title}" scholarship by ${provider} in India for the academic year 2025-26 or 2026.
Generate structured content targeting student and parent intent (e.g. disbursement details, selection criteria, renewal conditions, status tracking guides, and critical FAQs).
You must search Google to find the accurate, current values.

You must respond with a single, valid JSON object matching the following schema. Wrap the JSON in a markdown code block (e.g. \`\`\`json ... \`\`\`).
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
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
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
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response candidates returned from Gemini");
    }

    let contentText = data.candidates[0].content.parts[0].text.trim();
    if (contentText.startsWith('```')) {
        contentText = contentText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    return JSON.parse(contentText);
}

async function runEnrichment() {
    inbox.ensureAgentTables(db);
    if (inbox.skipIfDisabled(db, AGENT)) {
        fs.writeFileSync(path.join(__dirname, '..', 'data', 'weekly-enrichment-summary.json'),
            JSON.stringify({ skipped_run: true, swept: 0, skipped: 0, auto_updated: 0, pending_review: 0, check_failed: 0 }, null, 2));
        db.close();
        return;
    }
    // Select all active scholarships
    const query = `
        SELECT id, title, provider, slug, amount_annual, amount_min, official_source, apply_url, helpline, last_checked_at 
        FROM scholarships 
        WHERE status = 'Active' OR status IS NULL
    `;
    const rows = db.prepare(query).all();

    console.log(`📋 Total active scholarships found: ${rows.length}`);

    const now = new Date();
    const targets = [];
    let skippedCount = 0;

    for (const row of rows) {
        const lastChecked = row.last_checked_at ? new Date(row.last_checked_at) : null;
        // Skip if checked within last 6 days
        if (lastChecked && (now - lastChecked) < 6 * 24 * 60 * 60 * 1000) {
            skippedCount++;
            continue;
        }
        targets.push(row);
    }

    console.log(`⏭️ Skipped (checked < 6 days ago): ${skippedCount}`);
    console.log(`🎯 Targets to sweep: ${targets.length}\n`);

    const finalTargets = testLimit ? targets.slice(0, testLimit) : targets;

    let autoUpdatedCount = 0;
    let pendingReviewCount = 0;
    let failedCount = 0;

    const insertChangelog = db.prepare(`
        INSERT INTO scholarship_changelog (scholarship_id, scholarship_title, action_type, details)
        VALUES (?, ?, ?, ?)
    `);

    const updateLowStakesStmt = db.prepare(`
        UPDATE scholarships 
        SET amount_description = ?, 
            min_marks = ?, 
            selection = ?, 
            renewal = ?, 
            step_guide = ?, 
            faq_json = ?,
            last_checked_at = datetime('now')
        WHERE id = ?
    `);

    for (let i = 0; i < finalTargets.length; i++) {
        const item = finalTargets[i];
        console.log(`[${i + 1}/${finalTargets.length}] 🔍 Researching: "${item.title}" (${item.slug})`);

        try {
            const data = await callModel(item.title, item.provider || 'Government');
            console.log(`   ✅ Grounding search successful.`);

            // Amounts, links and helpline change facts on the page, so they go to the owner's inbox.
            // Blank or zero answers ("not found") and rewordings of the same fact are dropped by the inbox.
            const gated = [
                ['amount_annual', item.amount_annual, data.amount_annual],
                ['amount_min', item.amount_min, data.amount_min],
                ['official_source', item.official_source, data.official_source],
                ['apply_url', item.apply_url, data.apply_url],
                ['helpline', item.helpline, data.helpline],
            ];
            const diffs = [];
            for (const [field, oldValue, newValue] of gated) {
                const outcome = dryRun
                    ? (inbox.sameValue(field, oldValue, newValue) || inbox.isUnconfirmed(field, newValue)
                        || inbox.validateValue(field, newValue) || inbox.isMinorRewrite(field, oldValue, newValue) ? 'skipped' : 'created')
                    : inbox.proposeFieldChange(db, {
                        agent: AGENT, scholarshipId: item.id, scholarshipTitle: item.title, field, oldValue, newValue,
                        source: data.official_source || data.apply_url || 'Gemini Sweep'
                    });
                if (outcome === 'created' || outcome === 'superseded') diffs.push({ field, old: oldValue, new: newValue });
            }

            if (diffs.length > 0) {
                pendingReviewCount++;
                console.log(`   📝 Proposed gated changes added to the inbox:`, diffs);
            } else {
                autoUpdatedCount++;
            }

            if (!dryRun) {
                updateLowStakesStmt.run(
                    data.amount_description || '',
                    data.min_marks || 0,
                    data.selection || '',
                    data.renewal || '',
                    data.step_guide || '',
                    JSON.stringify(data.faq_json || []),
                    item.id
                );
                console.log(`   💾 Low-stakes fields updated & last_checked_at set.`);
            } else {
                console.log(`   [DRY RUN] Would update low-stakes fields and last_checked_at.`);
            }

        } catch (error) {
            failedCount++;
            console.error(`   ❌ Failed to process: ${error.message}`);
            if (!dryRun) {
                insertChangelog.run(item.id, item.title, 'check_failed', `Grounding check failed: ${error.message}`);
                // Still update last_checked_at so it doesn't get stuck retrying immediately
                db.prepare(`UPDATE scholarships SET last_checked_at = datetime('now') WHERE id = ?`).run(item.id);
            }
        }

        // Delay to prevent rate limits
        if (i < finalTargets.length - 1) {
            const delay = engine === 'perplexity' ? 2000 : 6000;
            console.log(`   ⏱️ Waiting ${delay/1000}s to respect API limit guidelines...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    const summary = {
        swept: finalTargets.length,
        skipped: skippedCount,
        auto_updated: autoUpdatedCount,
        pending_review: pendingReviewCount,
        check_failed: failedCount
    };

    console.log('\n🏁 Enrichment Sweep Complete:');
    console.log(JSON.stringify(summary, null, 2));

    if (!dryRun) {
        inbox.logEvent(db, {
            agent: AGENT,
            kind: failedCount > 0 ? 'run_warning' : 'run_finished',
            summary: `Enriched ${finalTargets.length} scholarships: ${pendingReviewCount} with new proposals, ${failedCount} failed`,
            details: summary
        });
    }

    // Save summary json for Github Actions
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'weekly-enrichment-summary.json'), JSON.stringify(summary, null, 2));

    db.close();
}

runEnrichment();
