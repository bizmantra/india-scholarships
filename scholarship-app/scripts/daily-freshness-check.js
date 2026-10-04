const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const inbox = require('./lib/agent-inbox');
const { researchFacts, compare, evidenceFor } = require('./lib/research');
const sources = require('./lib/sources');
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
const AGENT = 'deadline-freshness';
const SUMMARY_PATH = path.join(__dirname, '..', 'data', 'daily-check-summary.json');

console.log(`⏰ Daily Deadline Freshness Check`);
console.log(`- Dry Run: ${dryRun}\n`);

// What counts as "the deadline" (kept from the original instructions)
const DEADLINE_RULES = `Use the student application submission deadline (the last date for fresh or renewal students to apply),
not the institute (L1) or district/state (L2) verification deadline or the portal closure date, which are usually later.
If school (Pre-Matric) and college (Post-Matric) students have different dates, use the one this scholarship is for.`;

// Evidence-backed research (lib/research.js): value, official page, exact sentence, two independent answers
async function researchDeadline(item) {
    const found = await researchFacts({
        subject: `the "${item.title}" scholarship by ${item.provider || 'its provider'}, 2026-27 application cycle`,
        context: DEADLINE_RULES,
        knownSources: sources.sourcesFor(item),
        fields: {
            deadline: { instruction: '"YYYY-MM-DD" the student application deadline, or "" if not officially published', compare: compare.date },
            deadline_description: { instruction: '"one short sentence about the current application window"', compare: compare.text },
        },
    });
    if (found.answered === 0) throw new Error(found.errors.join(' | ') || 'No answer from the research model');
    sources.remember(db, item.id, found.facts, { dryRun });
    return found.facts;
}

async function runDailyCheck() {
    inbox.ensureAgentTables(db);
    sources.ensureColumn(db);
    if (inbox.skipIfDisabled(db, AGENT)) {
        fs.writeFileSync(SUMMARY_PATH, JSON.stringify({ skipped: true, checked: 0, pending_review: 0, check_failed: 0, changes: [], failed: [] }, null, 2));
        db.close();
        return;
    }
    const maxChecks = inbox.getSetting(db, AGENT, 'max_checks', 30);
    const daysBefore = inbox.getSetting(db, AGENT, 'window_days_before', 14);
    const daysAfter = inbox.getSetting(db, AGENT, 'window_days_after', 30);

    // 1. Get all active scholarships
    const allActive = db.prepare(`
        SELECT id, title, slug, provider, deadline, deadline_description, always_open, last_checked_at,
               official_source, apply_url, source_pages
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

        // Near-deadline range: [-daysBefore, +daysAfter]
        if (diffDays >= -daysBefore && diffDays <= daysAfter) {
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
        SELECT s.id, s.title, s.slug, s.provider, s.deadline, s.deadline_description, s.always_open, s.last_checked_at,
               s.official_source, s.apply_url, s.source_pages, t.clicks, t.impressions
        FROM scholarships s
        JOIN gsc_traffic_cache t ON s.slug = t.slug
        WHERE (s.status = 'Active' OR s.status IS NULL)
        ORDER BY t.clicks DESC, t.impressions DESC
    `).all();

    const targets = [];
    const targetIds = new Set();

    // Priority 1: Add near-deadline targets up to 30
    for (const t of nearDeadlineTargets) {
        if (targets.length >= maxChecks) break;
        targets.push(t);
        targetIds.add(t.id);
    }

    // Priority 2: Fill remaining slots with high-traffic not checked in last 7 days
    for (const s of highTrafficCandidates) {
        if (targets.length >= maxChecks) break;
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

    // How each proposed value was handled by the inbox (see proposeFieldChange)
    const outcomes = { created: 0, superseded: 0, repeat: 0, unchanged: 0, unconfirmed: 0, invalid: 0, minor: 0, rejected_before: 0 };
    let pendingReviewCount = 0;
    let failedCount = 0;
    const reviewChanges = [];
    const failedRows = [];

    for (let i = 0; i < targets.length; i++) {
        const item = targets[i];
        console.log(`[${i + 1}/${targets.length}] 🔍 Checking deadline: "${item.title}" (${item.slug})`);
        console.log(`   - Reason: ${item.reason}`);

        try {
            const facts = await researchDeadline(item);
            const data = {
                deadline: /^\d{4}-\d{2}-\d{2}$/.test(String(facts.deadline.value || '').trim()) ? String(facts.deadline.value).trim() : '',
                deadline_description: facts.deadline_description.value || '',
                official_source: facts.deadline.source || facts.deadline_description.source,
            };
            const evidence = { deadline: evidenceFor(facts.deadline), deadline_description: evidenceFor(facts.deadline_description) };
            console.log(`   ✅ Researched. Deadline: ${data.deadline || 'not found'} [${facts.deadline.verdict}${facts.deadline.reason ? `: ${facts.deadline.reason}` : ''}]`);

            const proposedDeadline = data.deadline || '';
            const proposedDescription = data.deadline_description || '';

            const existingDeadline = item.deadline || '';
            const existingDescription = item.deadline_description || '';

            const source = data.official_source || data.apply_url || 'Gemini daily-check';
            const propose = (field, oldValue, newValue, extra = {}) => {
                if (dryRun) {
                    if (inbox.sameValue(field, oldValue, newValue)) return 'unchanged';
                    if (inbox.isUnconfirmed(field, newValue)) return 'unconfirmed';
                    return inbox.isMinorRewrite(field, oldValue, newValue, extra) ? 'minor' : 'created';
                }
                return inbox.proposeFieldChange(db, {
                    agent: AGENT, scholarshipId: item.id, scholarshipTitle: item.title,
                    field, oldValue, newValue, source, evidence: evidence[field], ...extra
                });
            };

            // A blank date means "not found", so it is never proposed (the inbox drops it)
            const diffs = [];
            const deadlineOutcome = propose('deadline', existingDeadline, proposedDeadline);
            outcomes[deadlineOutcome]++;
            if (deadlineOutcome === 'created' || deadlineOutcome === 'superseded') {
                diffs.push({ field: 'deadline', old: existingDeadline, new: proposedDeadline });
            }
            // A reworded description is only proposed with a date change, or when there was none (the inbox decides)
            const dateIsChanging = ['created', 'superseded', 'repeat'].includes(deadlineOutcome);
            const descOutcome = propose('deadline_description', existingDescription, proposedDescription, { withDateChange: dateIsChanging });
            outcomes[descOutcome]++;
            if (descOutcome === 'created' || descOutcome === 'superseded') {
                diffs.push({ field: 'deadline_description', old: existingDescription, new: proposedDescription });
            }

            if (diffs.length > 0) {
                pendingReviewCount++;
                reviewChanges.push({ title: item.title, slug: item.slug, changes: diffs, source });
                console.log(`   📝 New proposal added to the inbox.`);
            } else {
                console.log(`   ✔️  Nothing new to review (deadline: ${deadlineOutcome}).`);
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
        outcomes,
        changes: reviewChanges,
        failed: failedRows
    };
    if (!dryRun) {
        inbox.logEvent(db, {
            agent: AGENT,
            kind: failedCount > 0 ? 'run_warning' : 'run_finished',
            summary: `Checked ${targets.length} deadlines: ${pendingReviewCount} new proposal(s), ${outcomes.repeat} repeat(s), ` +
                `${outcomes.unconfirmed} not found, ${failedCount} failed`,
            details: { outcomes, failed: failedRows.map(f => f.slug) }
        });
    }

    console.log('\n🏁 Daily Check Complete:');
    console.log(JSON.stringify(summary, null, 2));

    // Save summary json for Github Actions email reporting
    fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));

    db.close();
}

runDailyCheck();
