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

module.exports = { auditScholarship, isClosedNotice, parseArrayField, stripHtml, hasHtmlTags, isInternational, isLegacy, HTML_FIELDS };
