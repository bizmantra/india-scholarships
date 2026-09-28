// Renders Study Abroad articles for the detail layout (app/study-abroad/_components/DetailShell.tsx).
import type { KeyFact, Faq } from '@/lib/editorial';
import { extractHeadings, simpleMarkdownToHtml } from '@/lib/articles';
import { parseJson, type SaGuide, type SaUniversity } from './data';
import redirects from './redirects.json';

export const SITE = 'https://www.indiascholarships.in';

// Google shows about 60 characters of a title, so the brand suffix is only added when it fits
export const pageTitle = (title: string) => {
    const full = `${title} | IndiaScholarships`;
    return full.length <= 65 ? full : title;
};

// Old or misspelled URLs that redirect elsewhere (next.config.ts serves the same list)
export const REDIRECTS = new Map(redirects.map(r => [r.source, r.destination]));

// Links inside articles that point at a redirected URL go straight to the final page
const fixLinks = (md: string) =>
    md.replace(/\]\((\/study-abroad\/[^)\s#?]+)/g, (m, path: string) => {
        const target = REDIRECTS.get(path.replace(/\/$/, ''));
        return target ? `](${target}` : m;
    });

// Fenced blocks in the migrated articles are checklists or step lists written as plain text
// ("[ ] 1. TITLE" with an indented description below). The site's converter has no code blocks,
// so they become ordinary bullet lists.
function fencedBlockToList(block: string): string {
    const items: { title: string; desc: string[] }[] = [];
    for (const line of block.split('\n')) {
        const text = line.trim();
        if (!text) continue;
        const checkbox = text.match(/^\[[ xX]\]\s*(?:\d+[.)]\s*)?(.*)$/);
        if (checkbox) items.push({ title: checkbox[1], desc: [] });
        else if (/^\s/.test(line) && items.length) items[items.length - 1].desc.push(text);
        else items.push({ title: text.replace(/^[-*]\s+/, ''), desc: [] });
    }
    return '\n' + items.map(i => `- ${i.desc.length ? `**${i.title}**: ${i.desc.join(' ')}` : i.title}`).join('\n') + '\n';
}

// The migrated articles use "* " bullets, which the site's converter reads as italics
function normalizeMarkdown(md: string): string {
    return fixLinks(md)
        .replace(/^```[a-z]*\n([\s\S]*?)^```\s*$/gm, (_, block) => fencedBlockToList(block))
        .replace(/^(\s*)\* /gm, '$1- ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

const formatDate = (value: string | null) => {
    if (!value) return '';
    const d = new Date(value.replace(' ', 'T'));
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const readTime = (md: string) => `${Math.max(2, Math.round(md.split(/\s+/).length / 220))} min read`;

function infoboxFacts(json: string | null): KeyFact[] {
    const box = parseJson<{ rows?: { key: string; value: string }[] } | null>(json, null);
    return (box?.rows || []).filter(r => r.key && r.value).map(r => ({ label: r.key, value: r.value }));
}

export interface Article {
    html: string;
    headings: { id: string; text: string }[]; // h2 only, for the section pills
    faqs: { q: string; a: string }[];
    facts: { label: string; value: string }[]; // the article's own fact box, minus rows already shown
    readTime: string;
    updated: string;
}

// One Study Abroad article, ready for DetailShell
export function renderArticle(row: SaGuide | SaUniversity, knownFacts: { label: string }[] = []): Article {
    const md = normalizeMarkdown(row.body_md || '');
    const title = 'name' in row ? row.name : row.title;
    const seen = new Set(knownFacts.map(f => f.label.toLowerCase()));
    const facts = infoboxFacts(row.infobox_json).filter(f => {
        const label = f.label.toLowerCase();
        if (seen.has(label) || label === 'university name' || f.value === title) return false;
        seen.add(label);
        return true;
    });
    return {
        html: md ? simpleMarkdownToHtml(md) : '',
        headings: md ? extractHeadings(md).filter(h => h.level === 2).map(h => ({ id: h.id, text: h.text.replace(/[*_`]/g, '') })) : [],
        faqs: parseJson<Faq[]>(row.faq_json, []).filter(f => f.q && f.a),
        facts,
        readTime: md ? readTime(md) : '',
        updated: formatDate(row.updated_at),
    };
}

// Plain-text description for <meta name="description">
export function describe(row: { summary: string | null; meta_description: string | null }, fallback: string) {
    return (row.meta_description || row.summary || fallback).replace(/[*_`#>]/g, '').slice(0, 300);
}

// Stored yes/no fields come through as "true"/"false"/"1"/"0"
export const yesNo = (value: string | null, yes = 'Required', no = 'Not required') =>
    value == null ? null : /^(true|1|yes)$/i.test(value) ? yes : /^(false|0|no)$/i.test(value) ? no : value;

export const money = (amount: number | null, currency: string | null) => {
    if (amount == null) return null;
    if (amount === 0) return 'No tuition fee';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(amount);
};

// A value from a university's article fact box, by the first matching label
export function infoboxValue(json: string | null, labels: string[]): string | null {
    const rows = infoboxFacts(json);
    for (const label of labels) {
        const row = rows.find(r => r.label.toLowerCase() === label.toLowerCase());
        if (row) return row.value;
    }
    return null;
}

// What a university card shows: location, tuition and living costs, from fields or the fact box
export function universityCard(u: SaUniversity) {
    return {
        location: u.city || infoboxValue(u.infobox_json, ['Campus Location', 'Location']),
        tuition: money(u.tuition_per_year, u.tuition_currency) || infoboxValue(u.infobox_json, ['Tuition Fee Status', 'Out-of-State Tuition']),
        living: infoboxValue(u.infobox_json, ['Monthly Living Expenses', 'Estimated Monthly Living Expenses']),
    };
}
