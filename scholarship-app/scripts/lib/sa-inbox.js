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

const NEW_KIND = 'sa_new_page';

// Required columns per table, read from the DDL in scripts/lib/study-abroad-tables.js
const REQUIRED = {
    sa_universities: ['slug', 'name', 'country', 'summary', 'seo_title', 'meta_description', 'body_md', 'official_source', 'checked_at'],
    sa_guides: ['slug', 'title', 'country', 'kind', 'summary', 'seo_title', 'meta_description', 'body_md', 'official_source', 'checked_at'],
    sa_programs: ['id', 'slug', 'university_slug', 'country', 'degree', 'field', 'title'],
    sa_facts: ['key', 'label', 'value', 'unit', 'official_source', 'checked_at'],
};

// All valid DDL columns per table (unknown columns are rejected)
const TABLE_COLUMNS = {
    sa_universities: new Set([
        'slug', 'name', 'country', 'city', 'summary', 'seo_title', 'meta_description', 'who_for',
        'tuition_per_year', 'tuition_currency', 'living_cost_per_year', 'living_currency',
        'gre_required', 'stem_opt', 'coop_program', 'ranking', 'acceptance_rate',
        'application_deadlines', 'infobox_json', 'body_md', 'faq_json', 'related_json',
        'official_source', 'checked_at', 'status', 'created_at', 'updated_at'
    ]),
    sa_guides: new Set([
        'slug', 'kind', 'country', 'title', 'summary', 'seo_title', 'meta_description', 'who_for',
        'infobox_json', 'body_md', 'faq_json', 'related_json', 'data_json',
        'official_source', 'checked_at', 'status', 'created_at', 'updated_at'
    ]),
    sa_programs: new Set([
        'id', 'slug', 'university_slug', 'country', 'degree', 'field', 'title',
        'tuition_per_year', 'tuition_currency', 'living_cost_per_year', 'living_currency',
        'gpa_min', 'ielts_min', 'gre', 'location', 'application_deadlines',
        'official_source', 'checked_at', 'status', 'created_at', 'updated_at',
        'summary', 'seo_title', 'meta_description', 'body_md', 'faq_json',
        'language', 'duration', 'intakes', 'english_requirements',
        'application_portal', 'application_fee', 'stem_designated'
    ]),
    sa_facts: new Set([
        'key', 'label', 'country', 'value', 'unit', 'official_source', 'checked_at',
        'recheck_after', 'notes', 'updated_at'
    ]),
};

// Known countries in lib/study-abroad/countries.ts (unlaunched allowed for drafts)
const KNOWN_COUNTRIES = new Set(['germany', 'usa', 'uk', 'canada', 'australia', 'ireland']);

const BOILERPLATE_SUMMARY = /^\s*complete 20\d\d guide to/i;

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
const toText = v => (v === null || v === undefined ? '' : typeof v === 'string' ? v : JSON.stringify(v));

function fieldType(table, field) {
    return FIELDS[table] && FIELDS[table][field];
}

/**
 * Error message for a value that cannot go live, or null when it is fine.
 * `previous` is the value the page holds now (omit it when creating a row). A banned phrase that is already
 * there is carried forward instead of blocking an unrelated edit - 123 published pages still have a legacy
 * "## Executive Summary" heading and would otherwise be un-editable. A phrase the change introduces is refused,
 * and the D3 audit keeps reporting the existing ones.
 * @param {string} table
 * @param {string} field
 * @param {unknown} value
 * @param {{ source?: string|null, previous?: unknown }} [options]
 */
function validateSaValue(table, field, value, { source, previous } = {}) {
    const type = fieldType(table, field);
    if (!type) return `${field} cannot be changed through the inbox`;
    const text = toText(value).trim();
    const before = toText(previous);
    if (BANNED.some(rx => rx.test(text) && !rx.test(before))) return 'contains research notes or template filler that must not appear on the page';
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
    const text = toText(value).trim();
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

/** Error message for a proposed new page row that cannot be accepted, or null when valid. */
function validateNewRow(table, row, opts = {}) {
    if (!TARGETS[table]) return `${table} is not a valid Study Abroad table`;
    if (!row || typeof row !== 'object') return 'row must be an object';

    // Unknown columns are rejected
    const allowed = TABLE_COLUMNS[table];
    for (const col of Object.keys(row)) {
        if (!allowed.has(col)) return `unknown column: ${col}`;
    }

    // Required columns
    const reqCols = REQUIRED[table] || [];
    for (const col of reqCols) {
        const val = row[col];
        if (val === undefined || val === null || toText(val).trim() === '') {
            return `missing required column: ${col}`;
        }
    }

    // Key uniqueness
    const keyCol = TARGETS[table].key;
    const key = toText(row[keyCol]).trim();
    if (opts.keyExists && opts.keyExists(key)) {
        return `duplicate key: "${key}" already exists`;
    }

    // Slug check (universities, guides, programs)
    if (row.slug !== undefined && row.slug !== null) {
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(toText(row.slug).trim())) {
            return 'slug must match ^[a-z0-9]+(-[a-z0-9]+)*$';
        }
    }

    // Country check
    if (row.country !== undefined && row.country !== null && toText(row.country).trim() !== '') {
        const countries = opts.countries || KNOWN_COUNTRIES;
        if (!countries.has(toText(row.country).trim().toLowerCase())) {
            return `unknown country: "${row.country}"`;
        }
    } else if (table !== 'sa_facts') {
        return 'missing required column: country';
    }

    // Guides kind check
    if (table === 'sa_guides') {
        const kind = toText(row.kind).trim();
        if (!['guide', 'visa', 'loan'].includes(kind)) {
            return 'kind must be "guide", "visa" or "loan"';
        }
    }

    // Programs university_slug check
    if (table === 'sa_programs') {
        const uniSlug = toText(row.university_slug).trim();
        if (opts.universityExists && !opts.universityExists(uniSlug)) {
            return `unknown university_slug: "${row.university_slug}"`;
        }
    }

    // Money and admission fields source check
    const moneyFields = ['tuition_per_year', 'living_cost_per_year', 'application_fee', 'value'];
    for (const col of moneyFields) {
        const val = row[col];
        if (val !== undefined && val !== null && toText(val).trim() !== '') {
            if (!row.official_source || !/^https?:\/\/\S+$/.test(toText(row.official_source).trim())) {
                return `missing source on a money field: ${col} requires official_source`;
            }
            if (!row.checked_at || !/^\d{4}-\d{2}-\d{2}$/.test(toText(row.checked_at).trim())) {
                return `missing source on a money field: ${col} requires checked_at date`;
            }
        }
    }

    // Banned phrases and field formatting checks
    for (const [col, rawVal] of Object.entries(row)) {
        if (rawVal === undefined || rawVal === null) continue;
        if (['created_at', 'updated_at', 'status'].includes(col)) continue;
        const val = toText(rawVal);
        const text = val.trim();
        if (BANNED.some(rx => rx.test(text))) {
            return `${col} contains research notes or template filler that must not appear on the page`;
        }
        if (FIELDS[table] && FIELDS[table][col]) {
            const err = validateSaValue(table, col, val, { source: row.official_source });
            if (err) return `${col}: ${err}`;
        }
    }

    return null;
}

/** Error message when a row cannot be published, or null when valid. */
function validatePublishRow(table, row, opts = {}) {
    if (!TARGETS[table]) return `${table} is not a valid Study Abroad table`;
    if (!row || typeof row !== 'object') return 'row must be an object';

    // 1. All required columns present
    const reqCols = REQUIRED[table] || [];
    for (const col of reqCols) {
        const val = row[col];
        if (val === undefined || val === null || asText(val).trim() === '') {
            return `cannot publish: missing required column "${col}"`;
        }
    }

    // 2. Summary is not boilerplate
    if (row.summary !== undefined && row.summary !== null) {
        const sumText = asText(row.summary).trim();
        if (BOILERPLATE_SUMMARY.test(sumText)) {
            return 'cannot publish: summary is boilerplate ("Complete 20xx guide to...")';
        }
    }

    // 3. Every money/visa field has official_source and checked_at
    const hasMoneyOrVisa = (row.tuition_per_year !== undefined && row.tuition_per_year !== null && asText(row.tuition_per_year).trim() !== '') ||
                           (row.living_cost_per_year !== undefined && row.living_cost_per_year !== null && asText(row.living_cost_per_year).trim() !== '') ||
                           (row.application_fee !== undefined && row.application_fee !== null && asText(row.application_fee).trim() !== '') ||
                           (table === 'sa_facts' && row.value !== undefined && row.value !== null && asText(row.value).trim() !== '') ||
                           (table === 'sa_guides' && (row.kind === 'visa' || row.kind === 'loan'));
    if (hasMoneyOrVisa) {
        if (!row.official_source || !/^https?:\/\/\S+$/.test(asText(row.official_source).trim())) {
            return 'cannot publish: money or visa facts require official_source';
        }
        if (!row.checked_at || !/^\d{4}-\d{2}-\d{2}$/.test(asText(row.checked_at).trim())) {
            return 'cannot publish: money or visa facts require checked_at date';
        }
    }

    // 4. No banned phrases
    for (const [col, rawVal] of Object.entries(row)) {
        if (rawVal === undefined || rawVal === null) continue;
        const val = toText(rawVal);
        const text = val.trim();
        if (BANNED.some(rx => rx.test(text))) {
            return `cannot publish: ${col} contains research notes or template filler`;
        }
        if (FIELDS[table] && FIELDS[table][col]) {
            const err = validateSaValue(table, col, val, { source: row.official_source });
            if (err) return `cannot publish: ${col}: ${err}`;
        }
    }

    // 5. For sa_programs, check university_slug exists
    if (table === 'sa_programs' && opts.universityExists) {
        if (!opts.universityExists(toText(row.university_slug).trim())) {
            return `cannot publish: university_slug "${row.university_slug}" does not exist in sa_universities`;
        }
    }

    return null;
}

module.exports = {
    TARGETS, FIELDS, LABELS, NEEDS_SOURCE, BANNED, REQUIRED, TABLE_COLUMNS, BOILERPLATE_SUMMARY, KNOWN_COUNTRIES,
    fieldType, toText, validateSaValue, storedSaValue, sameSaValue, pagePath, targetId, parseTargetId,
    validateNewRow, validatePublishRow,
    KIND: 'sa_field_change', NEW_KIND, CATEGORY: 'study_abroad',
};
