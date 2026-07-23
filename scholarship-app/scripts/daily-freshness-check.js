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
const db = new Database(dbPath);

// Parse command line args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

console.log(`⏰ Daily Deadline Freshness Check`);
console.log(`- Dry Run: ${dryRun}\n`);

async function callGeminiForDeadline(title, provider) {
    const prompt = `Research the official current application deadline details for the "${title}" scholarship by ${provider} in India.
You must search Google to find the accurate, current deadline for the 2025-26 or 2026-27 application cycle.

CRITICAL REQUIREMENT FOR DEADLINES:
1. You MUST find the student application submission deadline (the last date for fresh or renewal student applications to be submitted).
2. Do NOT use the institutional verification (L1) deadline, state/district verification (L2) deadline, or final portal closure/billing date (which are usually later). If a table of dates is listed, select the student submission date, which is always the earliest.
3. If the portal lists separate deadlines for school (Pre-Matric) and college (Post-Matric) students, prioritize the one relevant to "${title}".

You must respond with a single, valid JSON object matching the following schema:
{
  "deadline": "YYYY-MM-DD" (Format strictly as YYYY-MM-DD. If unknown/continuous/always open, leave empty string. Do not guess),
  "deadline_description": "string" (A short description of the deadline period, e.g., 'Expected August 2026', 'Applications close on 31st October'),
  "official_source": "string" (Official department/provider URL),
  "apply_url": "string" (Official direct application form/portal link URL)
}
Provide ONLY the raw JSON object.`;

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
                    deadline: { type: "STRING", description: "Strictly YYYY-MM-DD. Empty if unknown." },
                    deadline_description: { type: "STRING", description: "Brief description of the deadline cycle." },
                    official_source: { type: "STRING" },
                    apply_url: { type: "STRING" }
                },
                required: ["deadline", "deadline_description", "official_source", "apply_url"]
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
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response candidates returned from Gemini");
    }

    const contentText = data.candidates[0].content.parts[0].text;
    return JSON.parse(contentText.trim());
}

async function runDailyCheck() {
    // 1. Get all active scholarships
    const allActive = db.prepare(`
        SELECT id, title, slug, deadline, deadline_description, always_open, last_checked_at 
        FROM scholarships 
        WHERE status = 'Active' OR status IS NULL
    `).all();

    const today = new Date();
    today.setHours(0,0,0,0);

    // Filter Bucket A: near-deadline
    const nearDeadlineTargets = [];
    for (const s of allActive) {
        if (s.always_open === 1 || s.always_open === true) continue;
        if (!s.deadline) continue;

        const deadlineDate = new Date(s.deadline);
        if (isNaN(deadlineDate.getTime())) continue;

        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Near-deadline range: [-14 days, +30 days]
        if (diffDays >= -14 && diffDays <= 30) {
            nearDeadlineTargets.push({
                ...s,
                diffDays,
                reason: `Near Deadline (${diffDays} days remaining)`
            });
        }
    }

    // Sort by diffDays ascending (most urgent deadlines first)
    nearDeadlineTargets.sort((a, b) => a.diffDays - b.diffDays);

    // Filter Bucket B: High traffic candidates from cache not checked in last 7 days
    const highTrafficCandidates = db.prepare(`
        SELECT s.id, s.title, s.slug, s.deadline, s.deadline_description, s.always_open, s.last_checked_at, t.clicks, t.impressions
        FROM scholarships s
        JOIN gsc_traffic_cache t ON s.slug = t.slug
        WHERE (s.status = 'Active' OR s.status IS NULL)
        ORDER BY t.clicks DESC, t.impressions DESC
    `).all();

    const targets = [];
    const targetIds = new Set();

    // Priority 1: Add near-deadline targets up to 30
    for (const t of nearDeadlineTargets) {
        if (targets.length >= 30) break;
        targets.push(t);
        targetIds.add(t.id);
    }

    // Priority 2: Fill remaining slots with high-traffic not checked in last 7 days
    for (const s of highTrafficCandidates) {
        if (targets.length >= 30) break;
        if (targetIds.has(s.id)) continue;

        const lastChecked = s.last_checked_at ? new Date(s.last_checked_at) : null;
        if (!lastChecked || (today - lastChecked) >= 7 * 24 * 60 * 60 * 1000) {
            targets.push({
                ...s,
                reason: 'High Traffic Freshness Check'
            });
            targetIds.add(s.id);
        }
    }

    console.log(`🎯 Selection results:`);
    console.log(`   - Near-deadline matching rows: ${nearDeadlineTargets.length}`);
    console.log(`   - Selected total targets: ${targets.length}`);
    console.log(`👉 Starting sweep of targets...\n`);

    const insertChangelog = db.prepare(`
        INSERT INTO scholarship_changelog (scholarship_id, scholarship_title, action_type, details)
        VALUES (?, ?, ?, ?)
    `);

    const updateLastChecked = db.prepare(`
        UPDATE scholarships 
        SET last_checked_at = datetime('now') 
        WHERE id = ?
    `);

    let pendingReviewCount = 0;
    let failedCount = 0;
    const reviewChanges = [];
    const failedRows = [];

    for (let i = 0; i < targets.length; i++) {
        const item = targets[i];
        console.log(`[${i + 1}/${targets.length}] 🔍 Checking deadline: "${item.title}" (${item.slug})`);
        console.log(`   - Reason: ${item.reason}`);

        try {
            const data = await callGeminiForDeadline(item.title, item.provider || 'Government');
            console.log(`   ✅ Grounding search successful. Proposed: ${data.deadline || 'NA'}`);

            const proposedDeadline = data.deadline || '';
            const proposedDescription = data.deadline_description || '';

            const existingDeadline = item.deadline || '';
            const existingDescription = item.deadline_description || '';

            let diffs = [];
            if (proposedDeadline !== existingDeadline) {
                diffs.push({ field: 'deadline', old: existingDeadline, new: proposedDeadline });
            }
            if (proposedDescription !== existingDescription) {
                diffs.push({ field: 'deadline_description', old: existingDescription, new: proposedDescription });
            }

            if (diffs.length > 0) {
                pendingReviewCount++;
                const source = data.official_source || data.apply_url || 'Gemini daily-check';
                reviewChanges.push({
                    title: item.title,
                    slug: item.slug,
                    changes: diffs,
                    source: source
                });

                if (!dryRun) {
                    const detailsJson = JSON.stringify({
                        changes: diffs,
                        source_citation: source
                    });
                    insertChangelog.run(item.id, item.title, 'pending_review', detailsJson);
                }
                console.log(`   📝 Proposed changes logged to changelog.`);
            }

            if (!dryRun) {
                updateLastChecked.run(item.id);
            }
        } catch (error) {
            failedCount++;
            failedRows.push({ title: item.title, slug: item.slug, error: error.message });
            console.error(`   ❌ Failed to check: ${error.message}`);

            if (!dryRun) {
                insertChangelog.run(item.id, item.title, 'check_failed', `Deadline check failed: ${error.message}`);
                updateLastChecked.run(item.id);
            }
        }

        // Rate limiting delay
        if (i < targets.length - 1) {
            console.log(`   ⏱️ Waiting 6s to respect API limit guidelines...`);
            await new Promise(resolve => setTimeout(resolve, 6000));
        }
    }

    const summary = {
        checked: targets.length,
        pending_review: pendingReviewCount,
        check_failed: failedCount,
        changes: reviewChanges,
        failed: failedRows
    };

    console.log('\n🏁 Daily Check Complete:');
    console.log(JSON.stringify(summary, null, 2));

    // Save summary json for Github Actions email reporting
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'daily-check-summary.json'), JSON.stringify(summary, null, 2));

    db.close();
}

runDailyCheck();
