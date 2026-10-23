/**
 * Study Abroad pages in the agent inbox: which pages and fields can be proposed, the value rules,
 * and how a proposal is stored. Shared by the command center (lib/command-center/inbox.ts) and the
 * script that submits proposals (scripts/study-abroad/propose-changes.mjs).
 *
 * A Study Abroad proposal is an agent_proposals row with:
 *   kind            'sa_field_change'
 *   scholarship_id  '<table>:<key>'   e.g. 'sa_universities:tum-technical-university-munich'
 *   scholarship_title  the page title (for display)
 *   field, old_value, new_value
 *   category        'study_abroad'
 *   payload_json    { table, key, path }   path = the live page, for links and refresh
 *
 * Approving writes the field and updated_at on the sa_* row. Nothing is written to
 * scholarship_changelog (that table is keyed by scholarship and read by other agents); the old and
 * new values are kept in the approval's agent_events row, which is what undo reads.
 */

const TARGETS = {
    sa_universities: { key: 'slug', title: 'name' },
    sa_guides: { key: 'slug', title: 'title' },
    sa_programs: { key: 'id', title: 'title' },
    sa_facts: { key: 'key', title: 'label' },
};

// Field types: text (short), markdown (article), faq (JSON array of {q, a}), json (any JSON),
// int, url, date (YYYY-MM-DD), number
const FIELDS = {
    sa_universities: {
        name: 'text', city: 'text', summary: 'summary', seo_title: 'seo_title', meta_description: 'meta_description', who_for: 'text',
        tuition_per_year: 'int', tuition_currency: 'currency', living_cost_per_year: 'int', living_currency: 'currency',
        gre_required: 'text', stem_opt: 'text', application_deadlines: 'json', infobox_json: 'json', body_md: 'markdown',
        faq_json: 'faq', related_json: 'json', official_source: 'url', checked_at: 'date', status: 'status',
    },
    sa_guides: {
        title: 'text', summary: 'summary', seo_title: 'seo_title', meta_description: 'meta_description', who_for: 'text',
        infobox_json: 'json', body_md: 'markdown', faq_json: 'faq', related_json: 'json', official_source: 'url', checked_at: 'date', status: 'status',
    },
    sa_programs: {
        title: 'text', location: 'text', tuition_per_year: 'int', tuition_currency: 'currency', living_cost_per_year: 'int', living_currency: 'currency',
        gpa_min: 'text', ielts_min: 'number', gre: 'text', application_deadlines: 'json', official_source: 'url', checked_at: 'date', status: 'status',
        summary: 'summary', seo_title: 'seo_title', meta_description: 'meta_description', body_md: 'markdown', faq_json: 'faq',
        language: 'text', duration: 'text', intakes: 'text', english_requirements: 'text', application_portal: 'text',
        application_fee: 'text', stem_designated: 'text',
    },
    sa_facts: {
        label: 'text', value: 'text', unit: 'text', official_source: 'url', checked_at: 'date', recheck_after: 'date', notes: 'text',
    },
};

// Money and admission facts need an official source on the proposal itself
const NEEDS_SOURCE = new Set(['tuition_per_year', 'living_cost_per_year', 'application_deadlines', 'gre_required', 'gre', 'gpa_min', 'ielts_min', 'value',
    'english_requirements', 'application_fee', 'stem_designated']);

// Phrases that must never reach a page (research notes, template filler)
const BANNED = [
    /not specified in the official source/i, /check the current/i, /not clearly stated/i, /third-party sources/i, /verify the current/i,
    /\bnot (confirmed|stated)\b[^.]*\b(page|source)s?\b/i, /in the provided official sources?/i, /check (tum's|the) accepted/i,
    /^\s*complete 20\d\d guide to/i, /navigation breadcrumb/i, /primary seo title/i, /executive summary/i, /holy grail/i,
];

const LABELS = {
    name: 'Name', title: 'Title', city: 'City', location: 'Location', summary: 'Summary', seo_title: 'Google title', meta_description: 'Google description',
    who_for: 'Who it is for', tuition_per_year: 'Tuition per year', tuition_currency: 'Tuition currency', living_cost_per_year: 'Living costs per year',
    living_currency: 'Living cost currency', gre_required: 'GRE required', gre: 'GRE', gpa_min: 'Minimum grade', ielts_min: 'IELTS minimum',
    stem_opt: 'STEM OPT', application_deadlines: 'Deadlines', infobox_json: 'Facts box', body_md: 'Article', faq_json: 'FAQs', related_json: 'Related links',
    official_source: 'Official source', checked_at: 'Facts checked', status: 'Status', label: 'Label', value: 'Value', unit: 'Unit',
    recheck_after: 'Re-check after', notes: 'Notes', language: 'Teaching language', duration: 'Length', intakes: 'Intakes',
    english_requirements: 'English requirements', application_portal: 'Where to apply', application_fee: 'Application fee', stem_designated: 'STEM designated',
};

const asText = v => (v === null || v === undefined ? '' : String(v));

function fieldType(table, field) {
    return FIELDS[table] && FIELDS[table][field];
}

/** Error message for a value that cannot go live, or null when it is fine. */
function validateSaValue(table, field, value, { source } = {}) {
    const type = fieldType(table, field);
    if (!type) return `${field} cannot be changed through the inbox`;
    const text = asText(value).trim();
    if (BANNED.some(rx => rx.test(text))) return 'contains research notes or template filler that must not appear on the page';
    if (NEEDS_SOURCE.has(field) && !/^https?:\/\//.test(asText(source))) return 'needs an official source link on the proposal';
    switch (type) {
        case 'summary':
            if (!text) return 'summary cannot be empty';
            if (text.length > 220) return `summary is ${text.length} characters (max 220)`;
            return null;
        case 'seo_title':
            if (!text) return 'Google title cannot be empty';
            if (text.length > 70) return `Google title is ${text.length} characters (max 70)`;
            return null;
        case 'meta_description':
            if (text.length < 110 || text.length > 170) return `Google description is ${text.length} characters (aim for 140–160)`;
            return null;
        case 'markdown':
            if (text.split(/\s+/).length < 150) return 'article is shorter than 150 words';
            if (!/https?:\/\//.test(text)) return 'article has no source links';
            return null;
        case 'faq': {
            let faqs;
            try { faqs = JSON.parse(text); } catch { return 'FAQs are not valid JSON'; }
            if (!Array.isArray(faqs) || faqs.length === 0) return 'FAQs must be a non-empty list';
            if (faqs.some(f => !f || !asText(f.q).trim() || !asText(f.a).trim())) return 'every FAQ needs a question (q) and an answer (a)';
            return null;
        }
        case 'json':
            if (!text) return null;
            try { JSON.parse(text); return null; } catch { return 'not valid JSON'; }
        case 'int':
            if (text === '') return null;
            return /^\d+$/.test(text) ? null : 'must be a whole number (or empty)';
        case 'number':
            if (text === '') return null;
            return Number.isFinite(Number(text)) ? null : 'must be a number (or empty)';
        case 'currency':
            return text === '' || /^[A-Z]{3}$/.test(text) ? null : 'must be a 3-letter currency code like EUR or USD';
        case 'url':
            return /^https?:\/\/\S+$/.test(text) ? null : 'must be a full https:// link';
        case 'date': {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return 'must be a date like 2026-10-11';
            if (text > new Date(Date.now() + 86400000).toISOString().slice(0, 10) && field === 'checked_at') return 'facts-checked date is in the future';
            return null;
        }
        case 'status':
            return ['published', 'draft'].includes(text) ? null : "must be 'published' or 'draft'";
        default:
            return null;
    }
}

/** The value as stored in the sa_* table. */
function storedSaValue(table, field, value) {
    const type = fieldType(table, field);
    const text = asText(value).trim();
    if (type === 'int') return text === '' ? null : Number(text);
    if (type === 'number') return text === '' ? null : Number(text);
    if ((type === 'json' || type === 'faq') && text) return JSON.stringify(JSON.parse(text));
    return text === '' ? null : text;
}

/** Same value for the purpose of "has the page changed since the proposal was made". */
function sameSaValue(a, b) {
    const norm = v => {
        const t = asText(v).trim();
        if (t.startsWith('{') || t.startsWith('[')) { try { return JSON.stringify(JSON.parse(t)); } catch { /* text */ } }
        return t.replace(/\r\n/g, '\n');
    };
    return norm(a) === norm(b);
}

/** Live page path of a row (null for facts, which appear on many pages). */
function pagePath(table, row) {
    if (!row) return null;
    if (table === 'sa_universities') return `/study-abroad/universities/${row.slug}`;
    if (table === 'sa_programs') return `/study-abroad/program-detail/${row.country}/${row.university_slug}/${row.slug}`;
    if (table === 'sa_guides') {
        if (row.kind === 'visa') return `/study-abroad/visas/${row.slug}`;
        if (row.kind === 'loan') return `/study-abroad/loans/${row.slug}`;
        return `/study-abroad/study-in/${row.country}/${row.slug}`;
    }
    return null;
}

const targetId = (table, key) => `${table}:${key}`;
function parseTargetId(id) {
    const i = asText(id).indexOf(':');
    return i > 0 ? { table: id.slice(0, i), key: id.slice(i + 1) } : null;
}

module.exports = {
    TARGETS, FIELDS, LABELS, NEEDS_SOURCE, BANNED,
    fieldType, validateSaValue, storedSaValue, sameSaValue, pagePath, targetId, parseTargetId,
    KIND: 'sa_field_change', CATEGORY: 'study_abroad',
};
