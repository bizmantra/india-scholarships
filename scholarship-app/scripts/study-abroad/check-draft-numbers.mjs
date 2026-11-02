/**
 * Guard for drafted Study Abroad pages: every figure on the page must appear in the research notes it was written from.
 * Read-only: no database, no network.
 *
 *   node scripts/study-abroad/check-draft-numbers.mjs <changes.json> <notes.md> [more notes ...]
 *
 * Looks at the summary, meta description, body_md and faq_json of every change in the file. It pulls out money (£1,200),
 * percentages, decimals (IELTS 6.5), "N months/weeks/years" and day-month dates, and looks for each one in the notes.
 * A figure that is not in the notes is listed. Sums and other calculated figures will be listed too: check the arithmetic
 * by hand. Exit 0 when every figure is found, 1 when some are missing, 2 when a file cannot be read.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MONTHS = 'january|february|march|april|may|june|july|august|september|october|november|december';

// Lower case; no commas inside numbers; no space after a currency sign; ordinals dropped; no markdown emphasis
export function normalize(text) {
    return String(text)
        .toLowerCase()
        .replace(/(\d),(?=\d{3})/g, '$1')
        .replace(/([£$€])\s+/g, '$1')
        .replace(/(\d)(st|nd|rd|th)\b/g, '$1')
        .replace(/[*_`]/g, '');
}

// Figures a reader could act on, as normalized tokens
export function extractFigures(text) {
    const t = normalize(text);
    const found = new Set();
    for (const m of t.matchAll(/[£$€]\d+(?:\.\d+)?/g)) found.add(m[0]);
    for (const m of t.matchAll(/\d+(?:\.\d+)?%/g)) found.add(m[0]);
    for (const m of t.matchAll(/(?<![\d£$€.])\d\.\d(?![\d%])/g)) found.add(m[0]);
    for (const m of t.matchAll(/\b(\d+)[ -](months?|weeks?|years?)\b/g)) found.add(`${m[1]} ${m[2].replace(/s$/, '')}`);
    for (const m of t.matchAll(new RegExp(`\\b(\\d{1,2}) (${MONTHS})\\b`, 'g'))) found.add(`${m[1]} ${m[2]}`);
    return [...found];
}

// Is the figure in the notes (already normalized)? Dates also match "month day"
export function inNotes(figure, notes) {
    if (notes.includes(figure)) return true;
    const unit = figure.match(/^(\d+) (month|week|year)$/);
    if (unit) return new RegExp(`\\b${unit[1]}[ -]${unit[2]}s?\\b`).test(notes);
    const date = figure.match(new RegExp(`^(\\d{1,2}) (${MONTHS})$`));
    if (date) return notes.includes(`${date[2]} ${date[1]}`);
    return false;
}

function textOf(fields) {
    const faq = typeof fields.faq_json === 'string' ? fields.faq_json : JSON.stringify(fields.faq_json || []);
    return [fields.summary, fields.meta_description, fields.body_md, faq].filter(Boolean).join('\n');
}

export function checkChanges(changes, notesText) {
    const notes = normalize(notesText);
    return changes.map(c => {
        const figures = extractFigures(textOf(c.fields || {}));
        return { key: c.key, total: figures.length, missing: figures.filter(f => !inNotes(f, notes)) };
    });
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
    const [draftFile, ...noteFiles] = process.argv.slice(2);
    if (!draftFile || noteFiles.length === 0) {
        console.error('Usage: node scripts/study-abroad/check-draft-numbers.mjs <changes.json> <notes.md> [more notes ...]');
        process.exit(2);
    }
    let changes, notesText;
    try {
        changes = JSON.parse(readFileSync(draftFile, 'utf8')).changes || [];
        notesText = noteFiles.map(f => readFileSync(f, 'utf8')).join('\n');
    } catch (err) {
        console.error(`cannot read input: ${err.message}`);
        process.exit(2);
    }
    let bad = 0;
    for (const r of checkChanges(changes, notesText)) {
        console.log(`${r.missing.length ? '✗' : '✓'} ${r.key}: ${r.total - r.missing.length} of ${r.total} figures found in the notes`);
        for (const f of r.missing) console.log(`    not in notes: ${f}`);
        bad += r.missing.length;
    }
    console.log(bad ? `\n${bad} figure(s) not in the notes. Check each against its source or the arithmetic.` : '\nAll figures are in the notes.');
    process.exit(bad ? 1 : 0);
}
