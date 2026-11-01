/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Content quality rules for one scholarship, shared by the audit (content-quality-audit.js)
 * and the Quality Fixer agent (quality-fixer.js), so both always agree on what "incomplete" means.
 *
 * auditScholarship(row, today) → [{ code, text }]
 */

// Real HTML tags only: Markdown autolinks (<https://…>) and template placeholders (<<Student Name>>) are content
const HTML_TAG = /<\/?(p|br|div|span|li|ul|ol|a|b|i|u|strong|em|h[1-6]|table|thead|tbody|tr|td|th|img|hr|font|center|section|article)\b[^<>]*\/?>/gi;
const hasHtmlTags = text => Boolean(text) && new RegExp(HTML_TAG.source, 'i').test(String(text));
const hasOldYear = text => Boolean(text) && /\b(202[0-5])\b/.test(text);

function tryParseJSON(value, fallback) {
    if (!value || typeof value !== 'string' || value.trim() === '') return fallback;
    try { return JSON.parse(value); } catch { return fallback; }
}

// docs_needed / caste may be a JSON list, or older free text split by newlines or commas
function parseArrayField(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    const trimmed = String(value).trim();
    if (trimmed === '') return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try { return JSON.parse(trimmed); } catch { /* fall through to splitting */ }
    }
    return trimmed.includes('\n')
        ? trimmed.split('\n').map(s => s.trim()).filter(Boolean)
        : trimmed.split(',').map(s => s.trim()).filter(Boolean);
}

const HTML_FIELDS = ['intro_seo', 'benefits', 'step_guide', 'selection', 'renewal'];
const ROLLING_WORDS = ['rolling', 'continuous', 'year-round', 'round the year', 'throughout the year', 'always open', 'open year-round', 'any time'];
const blankish = v => !v || ['not specified', 'na', 'contact'].includes(String(v).trim().toLowerCase());

// A page whose deadline has passed is fine when it tells students the cycle is closed and what comes next,
// e.g. "Applications closed on 15 August 2026. The next cycle is expected to open around July 2027."
function isClosedNotice(text) {
    const t = String(text || '');
    return /\bclosed\b/i.test(t) && /\b(next|upcoming) (application )?(cycle|round|session|intake|year)\b/i.test(t);
}

const isInternational = s => String(s.scholarship_scope || '').toLowerCase() === 'international';
const isLegacy = s => String(s.title || '').startsWith('[LEGACY]') || String(s.slug || '').startsWith('legacy-');

function auditScholarship(s, today = new Date()) {
    const issues = [];
    const add = (code, text) => issues.push({ code, text });
    const deadlineVal = s.deadline ? String(s.deadline).trim() : '';
    const applyUrl = s.apply_url ? String(s.apply_url).trim() : '';
    const officialSource = s.official_source ? String(s.official_source).trim() : '';

    // International scholarships only need a deadline and an apply link
    if (isInternational(s)) {
        if (!deadlineVal) add('missing_deadline', 'Missing Deadline Date');
        if (!applyUrl) add('missing_links', 'Missing / Bad Apply Link');
        return issues;
    }

    // 1. Amounts
    if (s.amount_annual === null || s.amount_annual === undefined || Number(s.amount_annual) === 0) {
        add('missing_amount_annual', 'Missing Annual Amount (causes "upto 0k" display)');
    }
    if (s.amount_min === null || s.amount_min === undefined || Number(s.amount_min) === 0) {
        add('missing_amount_min', 'Missing Min Amount');
    }

    // 2. Deadline
    if (s.always_open === 1) {
        const text = [s.deadline_description, s.amount_description, s.selection, s.benefits].map(v => v || '').join(' ').toLowerCase();
        if (!ROLLING_WORDS.some(w => text.includes(w))) {
            add('always_open_text', 'Always Open marked but rolling/continuous verification text is missing in descriptions');
        }
    } else if (!deadlineVal || ['not specified', 'na'].includes(deadlineVal.toLowerCase())) {
        add('missing_deadline', 'Missing Deadline Date');
    } else {
        const date = new Date(deadlineVal);
        if (!isNaN(date.getTime()) && date < today && !isClosedNotice(s.deadline_description)) {
            add('expired_deadline', `Expired Deadline (${deadlineVal})`);
        }
    }
    if (hasOldYear(s.deadline_description) || hasOldYear(s.title)) {
        add('old_year', 'Old Year Reference (e.g. 2024 or 2025 in title or description)');
    }

    // 3–5. Selection, renewal, steps
    const selection = s.selection ? String(s.selection).trim() : '';
    if (!selection || selection.toLowerCase() === 'not specified' || selection.length < 15) {
        add('incomplete_selection', `Incomplete Selection Criteria (${selection ? 'too short: ' + selection.length + ' chars' : 'empty'})`);
    }
    const renewal = s.renewal ? String(s.renewal).trim() : '';
    if (!renewal || renewal.toLowerCase() === 'not specified' || renewal.length < 15) {
        add('incomplete_renewal', `Incomplete Renewal Policy (${renewal ? 'too short: ' + renewal.length + ' chars' : 'empty'})`);
    }
    const stepGuide = s.step_guide ? String(s.step_guide).trim() : '';
    if (!stepGuide || stepGuide.length < 20) {
        add('incomplete_step_guide', `Incomplete/Missing Step Guide (${stepGuide ? 'too short: ' + stepGuide.length + ' chars' : 'empty'})`);
    }

    // 6. Documents
    if (parseArrayField(s.docs_needed).length === 0) add('missing_docs', 'Missing Required Documents');

    // 7. Links
    if (!applyUrl && !officialSource) {
        add('missing_links', 'Missing Apply URL & Official Source');
    } else {
        if (applyUrl && !applyUrl.startsWith('http')) add('invalid_apply_url', `Invalid Apply URL format: "${applyUrl}"`);
        if (officialSource && !officialSource.startsWith('http')) add('invalid_official_source', `Invalid Official Source format: "${officialSource}"`);
    }

    // 8. Helpline
    if (blankish(s.helpline ? String(s.helpline).trim() : '')) add('missing_helpline', 'Missing Helpline Contact Details');

    // 9. FAQs
    if (tryParseJSON(s.faq_json, []).length === 0) add('missing_faqs', 'Missing FAQ Content');

    // 10. Raw HTML
    if (HTML_FIELDS.some(f => hasHtmlTags(s[f]))) add('contains_html', 'Contains Unwanted Raw HTML Tags');

    return issues;
}

// Plain text with line breaks kept, for the mechanical HTML clean-up
function stripHtml(text) {
    if (!text) return text;
    return String(text)
        .replace(/<\s*br\s*\/?>/gi, '\n')
        .replace(/<\s*li\b[^<>]*>/gi, '\n• ')
        .replace(/<\/\s*(p|div|li|ul|ol|h[1-6]|tr)\s*>/gi, '\n')
        .replace(HTML_TAG, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n+• /g, '\n• ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// -----------------------------------------------------------------------------
// Study Abroad Content Quality Rules (Spec D3)
// -----------------------------------------------------------------------------

const { BANNED, pagePath } = require('./sa-inbox');

const BOILERPLATE_SUMMARY_REGEX = /^\s*complete 20\d\d guide to/i;
const UNLAUNCHED_COUNTRIES = new Set(['uk', 'canada', 'australia', 'ireland']);

let DEFAULT_REDIRECTS = [];
try {
    DEFAULT_REDIRECTS = require('../../lib/study-abroad/redirects.json');
} catch {
    DEFAULT_REDIRECTS = [];
}

/**
 * Audit Study Abroad published content against the 7 quality rules (Spec D3).
 *
 * @param {Object} data - { universities, guides, programs, facts }
 * @param {Object} [options]
 * @param {Date} [options.today]
 * @param {Array} [options.redirects]
 * @returns {Object} { issues, pages, summary }
 */
function auditStudyAbroad(data = {}, options = {}) {
    const today = options.today || new Date();
    const redirectsList = options.redirects || DEFAULT_REDIRECTS;
    const redirectMap = new Map(redirectsList.map(r => [r.source.replace(/\/$/, ''), r.destination]));

    const universities = data.universities || [];
    const guides = data.guides || [];
    const programs = data.programs || [];
    const facts = data.facts || [];

    const pubUnis = universities.filter(r => r.status === 'published');
    const pubGuides = guides.filter(r => r.status === 'published');
    const pubPrograms = programs.filter(r => r.status === 'published');

    const issues = [];
    const addIssue = (table, row, rule, code, severity, message) => {
        const id = row.slug || row.id || row.key;
        issues.push({
            table,
            id,
            path: pagePath(table, row),
            rule,
            code,
            severity,
            message,
        });
    };

    // Build known valid routes for Rule 6
    const validRoutes = new Set([
        '/study-abroad',
        '/study-abroad/tools',
        '/study-abroad/tools/blocked-account-calculator',
        '/study-abroad/tools/rbi-lrs-tcs-calculator',
        '/study-abroad/tools/i20-cost-calculator',
        '/study-abroad/tools/bavarian-grade-calculator',
        '/study-abroad/study-in/germany',
        '/study-abroad/study-in/germany/universities',
        '/study-abroad/study-in/germany/visas',
        '/study-abroad/study-in/germany/loans',
        '/study-abroad/study-in/germany/scholarships',
        '/study-abroad/study-in/usa',
        '/study-abroad/study-in/usa/universities',
        '/study-abroad/study-in/usa/visas',
        '/study-abroad/study-in/usa/loans',
        '/study-abroad/study-in/usa/scholarships',
    ]);
    for (const u of pubUnis) validRoutes.add(`/study-abroad/universities/${u.slug}`);
    for (const g of pubGuides) {
        if (g.kind === 'visa') validRoutes.add(`/study-abroad/visas/${g.slug}`);
        else if (g.kind === 'loan') validRoutes.add(`/study-abroad/loans/${g.slug}`);
        else validRoutes.add(`/study-abroad/study-in/${g.country}/${g.slug}`);
    }
    for (const p of pubPrograms) {
        validRoutes.add(`/study-abroad/program-detail/${p.country}/${p.university_slug}/${p.slug}`);
        if (p.degree && p.field) {
            validRoutes.add(`/study-abroad/programs/${p.country}/${p.degree}/${p.field}`);
        }
    }

    // -------------------------------------------------------------------------
    // Rule 1: Boilerplate summary, summary over 220 chars, empty summary
    // -------------------------------------------------------------------------
    for (const u of pubUnis) {
        const s = u.summary ? String(u.summary).trim() : '';
        if (!s) {
            addIssue('sa_universities', u, 1, 'empty_summary', 'error', 'Summary is empty');
        } else if (BOILERPLATE_SUMMARY_REGEX.test(s)) {
            addIssue('sa_universities', u, 1, 'boilerplate_summary', 'error', 'Boilerplate summary: matches (/^\\s*complete 20\\d\\d guide to/i)');
        } else if (s.length > 220) {
            addIssue('sa_universities', u, 1, 'summary_too_long', 'error', `Summary is ${s.length} characters (max 220)`);
        }
    }
    for (const g of pubGuides) {
        const s = g.summary ? String(g.summary).trim() : '';
        if (!s) {
            addIssue('sa_guides', g, 1, 'empty_summary', 'error', 'Summary is empty');
        } else if (BOILERPLATE_SUMMARY_REGEX.test(s)) {
            addIssue('sa_guides', g, 1, 'boilerplate_summary', 'error', 'Boilerplate summary: matches (/^\\s*complete 20\\d\\d guide to/i)');
        } else if (s.length > 220) {
            addIssue('sa_guides', g, 1, 'summary_too_long', 'error', `Summary is ${s.length} characters (max 220)`);
        }
    }
    for (const p of pubPrograms) {
        if (p.summary) {
            const s = String(p.summary).trim();
            if (BOILERPLATE_SUMMARY_REGEX.test(s)) {
                addIssue('sa_programs', p, 1, 'boilerplate_summary', 'error', 'Boilerplate summary: matches (/^\\s*complete 20\\d\\d guide to/i)');
            } else if (s.length > 220) {
                addIssue('sa_programs', p, 1, 'summary_too_long', 'error', `Summary is ${s.length} characters (max 220)`);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Rule 2: seo_title over 70, meta_description outside 110–170, duplicate seo_title
    // -------------------------------------------------------------------------
    const titleSeen = new Map(); // normalized_title -> [{ table, row }]
    const checkSeoRow = (table, row) => {
        const title = row.seo_title ? String(row.seo_title).trim() : '';
        const desc = row.meta_description ? String(row.meta_description).trim() : '';

        if (!title) {
            addIssue(table, row, 2, 'empty_seo_title', 'error', 'SEO title is empty');
        } else if (title.length > 70) {
            addIssue(table, row, 2, 'seo_title_too_long', 'error', `SEO title is ${title.length} characters (max 70)`);
        }

        const descLen = desc.length;
        if (descLen < 110 || descLen > 170) {
            addIssue(table, row, 2, 'meta_description_length', 'error', `Meta description length is ${descLen} characters (expected 110–170)`);
        }

        if (title) {
            const norm = title.toLowerCase();
            if (!titleSeen.has(norm)) titleSeen.set(norm, []);
            titleSeen.get(norm).push({ table, row, originalTitle: title });
        }
    };

    for (const u of pubUnis) checkSeoRow('sa_universities', u);
    for (const g of pubGuides) checkSeoRow('sa_guides', g);
    for (const p of pubPrograms) {
        if (p.seo_title || p.meta_description) checkSeoRow('sa_programs', p);
    }

    // Check duplicate SEO titles across pages
    for (const [, occurrences] of titleSeen.entries()) {
        if (occurrences.length > 1) {
            const ids = occurrences.map(o => `${o.table}/${o.row.slug || o.row.id}`);
            for (const { table, row, originalTitle } of occurrences) {
                const others = ids.filter(id => id !== `${table}/${row.slug || row.id}`);
                addIssue(table, row, 2, 'duplicate_seo_title', 'error', `Duplicate SEO title "${originalTitle}" shared with: ${others.join(', ')}`);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Rule 3: Banned phrases anywhere in body_md, summary, faq_json
    // -------------------------------------------------------------------------
    const checkBannedInRow = (table, row) => {
        const fields = [
            { name: 'summary', val: row.summary },
            { name: 'body_md', val: row.body_md },
            { name: 'faq_json', val: row.faq_json },
        ];
        for (const { name, val } of fields) {
            if (!val) continue;
            const text = String(val);
            for (const rx of BANNED) {
                // If it's summary matching the boilerplate pattern, Rule 1 is the primary rule
                if (name === 'summary' && rx.source === BOILERPLATE_SUMMARY_REGEX.source) continue;
                if (rx.test(text)) {
                    addIssue(table, row, 3, 'banned_phrase', 'error', `Contains banned phrase matching ${rx} in ${name}`);
                    break;
                }
            }
        }
    };
    for (const u of pubUnis) checkBannedInRow('sa_universities', u);
    for (const g of pubGuides) checkBannedInRow('sa_guides', g);
    for (const p of pubPrograms) checkBannedInRow('sa_programs', p);

    // -------------------------------------------------------------------------
    // Rule 4: Money/visa fields without official_source or checked_at;
    //         checked_at older than 90 days (warning)
    // -------------------------------------------------------------------------
    const checkSourceAndFreshness = (table, row, hasMoneyVisa) => {
        if (!hasMoneyVisa) return;
        const src = row.official_source ? String(row.official_source).trim() : '';
        const dt = row.checked_at ? String(row.checked_at).trim() : '';

        if (!src || !dt) {
            addIssue(table, row, 4, 'missing_source', 'error', `Missing ${!src && !dt ? 'official_source and checked_at' : !src ? 'official_source' : 'checked_at'} for money/visa data`);
        } else if (!/^https?:\/\//i.test(src)) {
            addIssue(table, row, 4, 'invalid_source', 'error', `official_source "${src}" is not a valid https:// URL`);
        }

        if (dt) {
            const checkDate = new Date(dt.replace(' ', 'T'));
            if (!Number.isNaN(checkDate.getTime())) {
                const ageDays = Math.floor((today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));
                if (ageDays > 90) {
                    addIssue(table, row, 4, 'stale_checked_at', 'warning', `checked_at (${dt}) is ${ageDays} days old (exceeds 90 days)`);
                }
            }
        }
    };

    // All published guides are country/visa/loan guides with facts
    for (const g of pubGuides) checkSourceAndFreshness('sa_guides', g, true);
    // Universities with tuition or living cost figures
    for (const u of pubUnis) checkSourceAndFreshness('sa_universities', u, u.tuition_per_year != null || u.living_cost_per_year != null);
    // Programs with tuition or living cost figures
    for (const p of pubPrograms) checkSourceAndFreshness('sa_programs', p, p.tuition_per_year != null || p.living_cost_per_year != null);
    // Facts table (all facts hold money/visa reference figures)
    for (const f of facts) checkSourceAndFreshness('sa_facts', f, true);

    // -------------------------------------------------------------------------
    // Rule 5: Identical money values repeated across 4+ universities or programs
    //         of the same country (recovery #23)
    // -------------------------------------------------------------------------
    const checkRepeatedMoney = (table, rows, fieldName) => {
        const byCountry = new Map();
        for (const r of rows) {
            const val = r[fieldName];
            if (val === null || val === undefined || val === '') continue;
            const country = r.country || 'unknown';
            if (!byCountry.has(country)) byCountry.set(country, new Map());
            const countryMap = byCountry.get(country);
            if (!countryMap.has(val)) countryMap.set(val, []);
            countryMap.get(val).push(r);
        }

        for (const [country, valMap] of byCountry.entries()) {
            for (const [val, matchingRows] of valMap.entries()) {
                if (matchingRows.length >= 4) {
                    for (const r of matchingRows) {
                        addIssue(
                            table,
                            r,
                            5,
                            `identical_money_${fieldName}`,
                            'error',
                            `Identical ${fieldName} (${val}) repeated across ${matchingRows.length} ${table === 'sa_universities' ? 'universities' : 'programs'} in ${country}`
                        );
                    }
                }
            }
        }
    };

    checkRepeatedMoney('sa_universities', pubUnis, 'tuition_per_year');
    checkRepeatedMoney('sa_universities', pubUnis, 'living_cost_per_year');
    checkRepeatedMoney('sa_programs', pubPrograms, 'tuition_per_year');
    checkRepeatedMoney('sa_programs', pubPrograms, 'living_cost_per_year');

    // -------------------------------------------------------------------------
    // Rule 6: Internal links in body_md that point to routes that do not exist
    //         or to unlaunched countries
    // -------------------------------------------------------------------------
    const checkInternalLinksInRow = (table, row) => {
        if (!row.body_md) return;
        const matches = String(row.body_md).matchAll(/\[[^\]]*\]\(([^)\s#?]+)(?:[#?][^)]*)?\)/g);
        for (const m of matches) {
            const rawHref = m[1];
            let href = rawHref.replace(/^https?:\/\/(www\.)?indiascholarships\.in/i, '');
            if (!href.startsWith('/study-abroad')) continue;

            const cleanPath = href.replace(/\/$/, '') || '/';
            const segments = cleanPath.split('/').filter(Boolean);

            // Check unlaunched country
            const unlaunchedMatch = segments.find(s => UNLAUNCHED_COUNTRIES.has(s.toLowerCase()));
            if (unlaunchedMatch) {
                addIssue(table, row, 6, 'unlaunched_country_link', 'error', `Internal link points to unlaunched country "${unlaunchedMatch}": ${rawHref}`);
                continue;
            }

            // Check if route exists or has valid redirect
            const target = redirectMap.get(cleanPath) || cleanPath;
            if (!validRoutes.has(target)) {
                addIssue(table, row, 6, 'broken_internal_link', 'error', `Internal link points to non-existent route: ${rawHref}`);
            }
        }
    };

    for (const u of pubUnis) checkInternalLinksInRow('sa_universities', u);
    for (const g of pubGuides) checkInternalLinksInRow('sa_guides', g);
    for (const p of pubPrograms) checkInternalLinksInRow('sa_programs', p);

    // -------------------------------------------------------------------------
    // Rule 7: Published sa_programs whose university_slug is missing or draft
    // -------------------------------------------------------------------------
    const uniStatusMap = new Map(universities.map(u => [u.slug, u.status]));
    for (const p of pubPrograms) {
        const uStatus = uniStatusMap.get(p.university_slug);
        if (!uStatus) {
            addIssue('sa_programs', p, 7, 'missing_university', 'error', `university_slug "${p.university_slug}" does not exist in sa_universities`);
        } else if (uStatus !== 'published') {
            addIssue('sa_programs', p, 7, 'draft_university', 'error', `university_slug "${p.university_slug}" has status "${uStatus}" (must be published)`);
        }
    }

    // Group issues by page (one entry per page with failed rule(s))
    const pagesMap = new Map();
    for (const issue of issues) {
        const key = `${issue.table}/${issue.id}`;
        if (!pagesMap.has(key)) {
            pagesMap.set(key, {
                page: issue.path,
                table: issue.table,
                id: issue.id,
                rules: [],
                errors: [],
                warnings: [],
            });
        }
        const p = pagesMap.get(key);
        if (!p.rules.includes(issue.rule)) {
            p.rules.push(issue.rule);
            p.rules.sort((a, b) => a - b);
        }
        if (issue.severity === 'error') {
            p.errors.push({ rule: issue.rule, code: issue.code, message: issue.message });
        } else {
            p.warnings.push({ rule: issue.rule, code: issue.code, message: issue.message });
        }
    }

    const pages = Array.from(pagesMap.values());

    const summary = {
        totalChecked: {
            universities: pubUnis.length,
            guides: pubGuides.length,
            programs: pubPrograms.length,
            facts: facts.length,
            totalPages: pubUnis.length + pubGuides.length + pubPrograms.length,
        },
        countsByRule: {
            rule1: issues.filter(i => i.rule === 1).length,
            rule2: issues.filter(i => i.rule === 2).length,
            rule3: issues.filter(i => i.rule === 3).length,
            rule4_errors: issues.filter(i => i.rule === 4 && i.severity === 'error').length,
            rule4_warnings: issues.filter(i => i.rule === 4 && i.severity === 'warning').length,
            rule5: issues.filter(i => i.rule === 5).length,
            rule6: issues.filter(i => i.rule === 6).length,
            rule7: issues.filter(i => i.rule === 7).length,
        },
        totalIssues: issues.length,
        totalErrors: issues.filter(i => i.severity === 'error').length,
        totalWarnings: issues.filter(i => i.severity === 'warning').length,
        pagesWithErrors: pages.filter(p => p.errors.length > 0).length,
        pagesWithWarnings: pages.filter(p => p.warnings.length > 0).length,
    };

    return { issues, pages, summary };
}

/**
 * Builds a fast lookup Set from quality-baseline.json contents.
 */
function buildBaselineSet(baselineData) {
    const set = new Set();
    if (!baselineData) return set;

    if (Array.isArray(baselineData)) {
        for (const item of baselineData) {
            if (typeof item === 'string') {
                set.add(item);
                continue;
            }
            if (!item || !item.table || !item.id) continue;
            const targetKey = `${item.table}/${item.id}`;
            // If item itself is a single issue object:
            if (item.code) {
                set.add(`${targetKey}:${item.code}`);
                if (item.rule) set.add(`${targetKey}:rule_${item.rule}`);
            }
            // If item is a page entry containing errors/warnings:
            if (Array.isArray(item.errors)) {
                for (const err of item.errors) {
                    const code = typeof err === 'string' ? err : err.code;
                    if (code) set.add(`${targetKey}:${code}`);
                    if (err && err.rule) set.add(`${targetKey}:rule_${err.rule}`);
                }
            }
            if (Array.isArray(item.warnings)) {
                for (const warn of item.warnings) {
                    const code = typeof warn === 'string' ? warn : warn.code;
                    if (code) set.add(`${targetKey}:${code}`);
                    if (warn && warn.rule) set.add(`${targetKey}:rule_${warn.rule}`);
                }
            }
        }
    } else if (typeof baselineData === 'object') {
        for (const [key, val] of Object.entries(baselineData)) {
            if (Array.isArray(val)) {
                for (const v of val) {
                    const code = typeof v === 'string' ? v : v.code;
                    if (code) set.add(`${key}:${code}`);
                }
            } else {
                set.add(key);
            }
        }
    }
    return set;
}

/**
 * Check if a specific issue is acknowledged in the baseline set.
 */
function isProblemInBaseline(baselineSet, issue) {
    if (!baselineSet || baselineSet.size === 0) return false;
    const targetKey = `${issue.table}/${issue.id}`;
    if (baselineSet.has(targetKey)) return true;
    if (baselineSet.has(`${targetKey}:${issue.code}`)) return true;
    if (baselineSet.has(`${targetKey}:rule_${issue.rule}`)) return true;
    return false;
}

module.exports = {
    auditScholarship, isClosedNotice, parseArrayField, stripHtml, hasHtmlTags, isInternational, isLegacy, HTML_FIELDS,
    auditStudyAbroad, buildBaselineSet, isProblemInBaseline,
};

