// Turns Study Abroad rows into the main site's EditorialContent, so every Study Abroad
// article renders with the same EditorialTemplate as the site's own guides.
import type { EditorialContent, KeyFact, Faq } from '@/lib/editorial';
import { extractHeadings, simpleMarkdownToHtml } from '@/lib/articles';
import { parseJson, type SaGuide, type SaUniversity } from './data';

export const SITE = 'https://www.indiascholarships.in';

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
    return md
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

export function toEditorial(row: SaGuide | SaUniversity, opts: { tag: string; extraFacts?: KeyFact[] }): EditorialContent {
    const md = normalizeMarkdown(row.body_md || '');
    const title = 'name' in row ? row.name : row.title;
    const faqs = parseJson<Faq[]>(row.faq_json, []);
    // Structured facts first; infobox rows repeating a label (or just restating the name) are dropped
    const seen = new Set((opts.extraFacts || []).map(f => f.label.toLowerCase()));
    const keyFacts = [...(opts.extraFacts || []), ...infoboxFacts(row.infobox_json).filter(f => {
        const label = f.label.toLowerCase();
        if (seen.has(label) || label === 'university name' || f.value === title) return false;
        seen.add(label);
        return true;
    })];
    return {
        id: row.slug,
        slug: row.slug,
        kind: 'how-to',
        tag: opts.tag,
        title,
        seoTitle: row.seo_title || undefined,
        seoDescription: row.meta_description || row.summary || undefined,
        date: formatDate(row.updated_at),
        readTime: md ? readTime(md) : '',
        author: 'IndiaScholarships Study Abroad',
        body: md ? simpleMarkdownToHtml(md) : '',
        headings: md ? extractHeadings(md) : [],
        keyFacts: keyFacts.length ? keyFacts : undefined,
        faqs: faqs.length ? faqs : undefined,
        hideStudyAbroadCta: true,
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
