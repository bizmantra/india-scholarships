/**
 * Quality Fixer
 *
 * Works through the scholarships that fail the content quality audit (scripts/lib/quality-rules.js):
 *   - Mechanical problems it fixes itself (they do not change facts): raw HTML tags in text fields.
 *     Each fix is logged in scholarship_changelog as 'auto_fix'.
 *   - Missing or outdated facts it researches (Gemini + Google Search, official sources only) and puts in
 *     the owner's inbox: deadline and deadline text, documents, helpline, minimum amount, apply link.
 *     Fills and outdated text go to the "Missing or outdated details" group; deadline changes to "Deadline changes".
 *   - What it cannot fix is counted in its report (e.g. an old year in a title).
 *
 * Most-visited pages first; research is capped per run (setting max_research). Pages researched in the last
 * recheck_days are skipped, so each run moves on to new pages instead of repeating the same ones.
 * Runs on the local copy: pull → fix → format check → push.
 *
 * Usage: node scripts/quality-fixer.js [--dry-run] [--max=30] [--only=<slug>]
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const inbox = require('./lib/agent-inbox');
const { auditScholarship, isLegacy, isClosedNotice, stripHtml, hasHtmlTags, HTML_FIELDS } = require('./lib/quality-rules');
const { researchFacts, compare, evidenceFor } = require('./lib/research');
const sources = require('./lib/sources');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), quiet: true });

const AGENT = 'quality-fixer';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const argValue = name => args.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const DB_PATH = process.env.LOCAL_DB_PATH || path.join(__dirname, '..', 'data', 'scholarships.db');
const SUMMARY_PATH = path.join(__dirname, '..', 'data', 'quality-fixer-summary.json');

// Audit problems the research step can answer, and the fields it asks for
const RESEARCHABLE = {
    missing_deadline: ['deadline', 'deadline_description'],
    expired_deadline: ['deadline', 'deadline_description', 'cycle_status', 'next_cycle_expected'],
    old_year: ['deadline', 'deadline_description'],
    always_open_text: ['deadline_description'],
    missing_docs: ['docs_needed'],
    missing_helpline: ['helpline'],
    missing_amount_min: ['amount_min'],
    missing_amount_annual: ['amount_annual'],
    invalid_apply_url: ['apply_url'],
    missing_links: ['apply_url', 'official_source'],
};

const FIELD_INSTRUCTIONS = {
    deadline: '"deadline": "YYYY-MM-DD" the student application deadline of the CURRENT (2026-27) cycle, or "" if not officially published yet',
    deadline_description: '"deadline_description": one short sentence about the current cycle\'s application window (no years before 2026 unless quoting a past cycle as past)',
    docs_needed: '"docs_needed": ["document 1", "document 2", ...] the documents students must submit',
    helpline: '"helpline": official phone number and/or email for applicant queries, or ""',
    amount_min: '"amount_min": the smallest award in rupees as a whole number (for a fixed award, the same as the annual amount), or 0 if not stated',
    amount_annual: '"amount_annual": the largest annual award in rupees as a whole number, or 0 if not stated',
    apply_url: '"apply_url": the official web address where students apply (must start with http), or ""',
    official_source: '"official_source": the official page that describes the scheme (must start with http), or ""',
    cycle_status: '"cycle_status": "open" if applications are open now or a future closing date is announced, "closed" if the current cycle has closed and no new dates are announced, "unknown" otherwise',
    next_cycle_expected: '"next_cycle_expected": month and year the next cycle is expected to open based on the official pattern, e.g. "July 2027", or "" if not known',
};

// Answers that shape a proposal but are not page fields themselves
const HELPER_FIELDS = new Set(['cycle_status', 'next_cycle_expected']);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "Applications closed on 15 August 2026. The next cycle is expected to open around July 2027."
function closedNotice(deadline, nextCycle) {
    const [y, m, d] = String(deadline).split('-').map(Number);
    const closedOn = `${d} ${MONTHS[m - 1]} ${y}`;
    const next = new RegExp(`^(${MONTHS.join('|')}) 20\\d\\d$`).test(String(nextCycle || '').trim())
        ? `The next cycle is expected to open around ${String(nextCycle).trim()}.`
        : 'The next cycle has not been announced yet.';
    return `Applications closed on ${closedOn}. ${next}`;
}

// How two answers are compared, per field
const COMPARE = {
    deadline: compare.date, amount_min: compare.int, amount_annual: compare.int,
    apply_url: compare.url, official_source: compare.url, docs_needed: compare.list,
};

// Evidence-backed research (lib/research.js): value, official page, exact sentence, two independent answers
async function research(s, fields) {
    const spec = Object.fromEntries(fields.map(f => [f, {
        instruction: FIELD_INSTRUCTIONS[f].replace(/^"[a-z_]+":\s*/, ''),
        compare: COMPARE[f] || compare.text,
    }]));
    const found = await researchFacts({
        subject: `the "${s.title}" scholarship by ${s.provider || 'its provider'}${s.state ? ` (${s.state})` : ''}`,
        title: s.title,
        knownSources: sources.sourcesFor(s),
        knownSecondary: sources.secondaryFor(s),
        context: s.always_open === 1 ? 'This scholarship is listed as open all year (rolling); confirm that in the deadline text if true.' : '',
        fields: spec,
    });
    if (found.answered === 0) throw new Error(found.errors.join(' | ') || 'No answer from the research model');
    const out = { _evidence: {}, _facts: found.facts };
    for (const [f, fact] of Object.entries(found.facts)) {
        out[f] = fact.value;
        out._evidence[f] = evidenceFor(fact);
    }
    out.source = Object.values(found.facts).map(f => f.source).find(Boolean) || null;
    return out;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
    const db = new Database(DB_PATH);
    inbox.ensureAgentTables(db);
    sources.ensureColumn(db);
    if (inbox.skipIfDisabled(db, AGENT)) {
        db.close();
        return;
    }
    const maxResearch = parseInt(argValue('max') || inbox.getSetting(db, AGENT, 'max_research', 30), 10);
    const only = argValue('only');
    const recheckDays = inbox.getSetting(db, AGENT, 'recheck_days', 14);
    // When each scholarship was last researched (agent memory), so runs rotate through the list
    const researchedAt = inbox.getState(db, AGENT, 'researched_at', {});
    const recentCutoff = Date.now() - recheckDays * 86400000;

    const rows = db.prepare(`
        SELECT s.*, COALESCE(g.clicks, 0) AS clicks FROM scholarships s
        LEFT JOIN gsc_traffic_cache g ON g.slug = s.slug
        WHERE (s.status = 'Active' OR s.status IS NULL) ${only ? 'AND s.slug = ?' : ''}
        ORDER BY clicks DESC`).all(...(only ? [only] : []));
    const failing = rows
        .filter(s => !isLegacy(s))
        .map(s => ({ s, issues: auditScholarship(s) }))
        .filter(x => x.issues.length > 0);
    console.log(`🧹 Quality Fixer: ${failing.length} scholarship(s) fail the audit (of ${rows.length} active)`);

    const report = { failing: failing.length, autoFixed: 0, researched: 0, proposals: 0, outcomes: {}, notFixable: {}, failed: [] };
    const count = (bucket, key) => { report[bucket][key] = (report[bucket][key] || 0) + 1; };

    // 1. Mechanical fixes: strip raw HTML (formatting only, facts unchanged)
    const logFix = db.prepare(`INSERT INTO scholarship_changelog (scholarship_id, scholarship_title, action_type, details) VALUES (?, ?, 'auto_fix', ?)`);
    for (const { s, issues } of failing) {
        if (!issues.some(i => i.code === 'contains_html')) continue;
        const changes = HTML_FIELDS.filter(f => hasHtmlTags(s[f])).map(f => ({ field: f, old: s[f], new: stripHtml(s[f]) }));
        console.log(`   🧽 ${s.slug}: removed HTML from ${changes.map(c => c.field).join(', ')}`);
        if (!dryRun) {
            db.transaction(() => {
                changes.forEach(c => db.prepare(`UPDATE scholarships SET ${c.field} = ? WHERE id = ?`).run(c.new, s.id));
                logFix.run(s.id, s.title, JSON.stringify({ changes, reason: 'Removed raw HTML tags', by: `agent:${AGENT}` }));
            })();
        }
        report.autoFixed++;
    }

    // 2. Research what is missing or out of date, most-visited first
    const toResearch = failing
        .map(x => ({ ...x, fields: [...new Set(x.issues.flatMap(i => RESEARCHABLE[i.code] || []))] }))
        .filter(x => x.fields.length > 0)
        .filter(x => only || !(researchedAt[x.s.slug] && new Date(researchedAt[x.s.slug]).getTime() > recentCutoff));
    report.skippedRecent = failing.filter(x => !only && researchedAt[x.s.slug] && new Date(researchedAt[x.s.slug]).getTime() > recentCutoff).length;
    failing.forEach(({ issues }) => issues.filter(i => !RESEARCHABLE[i.code] && i.code !== 'contains_html').forEach(i => count('notFixable', i.code)));

    for (const { s, issues, fields } of toResearch.slice(0, maxResearch)) {
        console.log(`🔍 ${s.slug} (${s.clicks} clicks): ${issues.map(i => i.code).join(', ')}`);
        report.researched++;
        let found;
        try {
            found = await research(s, fields);
            sources.remember(db, s.id, found._facts, { dryRun });
        } catch (error) {
            report.failed.push({ slug: s.slug, error: error.message.slice(0, 160) });
            console.error(`   ❌ ${error.message.slice(0, 160)}`);
            await sleep(6000);
            continue;
        }
        researchedAt[s.slug] = new Date().toISOString();
        const codes = new Set(issues.map(i => i.code));
        const deadlineOutcome = fields.includes('deadline') ? propose(s, 'deadline', found.deadline, found.source, { evidence: found._evidence.deadline }) : null;
        const dateChanging = ['created', 'superseded', 'repeat'].includes(deadlineOutcome);
        // Closed for this cycle and no new date: tell students so, instead of showing a past date as if it were current
        if (codes.has('expired_deadline') && !dateChanging && found.cycle_status === 'closed') {
            found.deadline_description = closedNotice(s.deadline, found.next_cycle_expected);
            // The notice is written by the agent; its evidence is what the research said about the cycle
            found._evidence.deadline_description = found._evidence.cycle_status;
            count('outcomes', 'closed_notice');
        }
        for (const field of fields.filter(f => f !== 'deadline' && !HELPER_FIELDS.has(f))) {
            // A description mentioning a past year is out of date even when the date itself is unchanged
            const allowRewording = field === 'deadline_description' && (codes.has('old_year') || codes.has('always_open_text') || codes.has('expired_deadline'));
            propose(s, field, found[field], found._evidence[field]?.source || found.source, { withDateChange: dateChanging, allowRewording, fill: true, evidence: found._evidence[field] });
        }
        await sleep(6000); // respect Gemini rate limits
    }

    function propose(s, field, value, source, { withDateChange = false, allowRewording = false, fill = false, evidence } = {}) {
        const empty = inbox.isUnconfirmed(field, s[field]) || Boolean(inbox.validateValue(field, s[field]));
        const options = {
            agent: AGENT, scholarshipId: s.id, scholarshipTitle: s.title, field, oldValue: s[field], newValue: value,
            source: /^https?:\/\//.test(source || '') ? source : null, withDateChange, allowRewording, evidence,
            // Fills and out-of-date text go to "Missing or outdated details"; a deadline change (and the text that
            // comes with it) stays in "Deadline changes"
            category: fill && (empty || allowRewording) && !(field === 'deadline_description' && withDateChange) ? 'missing_info' : undefined,
        };
        let outcome;
        if (dryRun) {
            outcome = inbox.sameValue(field, s[field], value) ? 'unchanged'
                : inbox.isUnconfirmed(field, value) ? 'unconfirmed'
                    : inbox.validateValue(field, value) ? 'invalid' : 'created';
        } else {
            outcome = inbox.proposeFieldChange(db, options);
        }
        count('outcomes', outcome);
        if (outcome === 'created' || outcome === 'superseded') {
            report.proposals++;
            console.log(`   📝 ${field}: ${String(s[field] ?? '').slice(0, 40) || '(empty)'} → ${String(inbox.normalizeValue(field, value)).slice(0, 60)}`);
        }
        return outcome;
    }

    report.leftForNextRun = Math.max(toResearch.length - maxResearch, 0);
    // Remember what was researched (entries older than the recheck window are dropped)
    if (!dryRun) {
        const kept = Object.fromEntries(Object.entries(researchedAt).filter(([, at]) => new Date(at).getTime() > recentCutoff));
        inbox.setState(db, AGENT, 'researched_at', kept);
    }
    const summary = `Checked ${failing.length} incomplete scholarship(s): ${report.autoFixed} tidied automatically, ` +
        `${report.researched} researched, ${report.proposals} new proposal(s)` +
        (report.skippedRecent ? `, ${report.skippedRecent} skipped (researched in the last ${recheckDays} days)` : '') +
        (report.leftForNextRun ? `, ${report.leftForNextRun} left for the next run` : '') +
        (report.failed.length ? `, ${report.failed.length} failed` : '');
    console.log(`\n🏁 ${summary}`);
    console.log(JSON.stringify(report, null, 2));
    fs.writeFileSync(SUMMARY_PATH, JSON.stringify(report, null, 2));
    if (!dryRun) inbox.logEvent(db, { agent: AGENT, kind: report.failed.length ? 'run_warning' : 'run_finished', summary, details: report });
    db.close();
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `auto_fixed=${dryRun ? 0 : report.autoFixed}\n`);
}

run().catch(error => {
    console.error(`❌ Quality Fixer failed: ${error.message}`);
    process.exit(1);
});
