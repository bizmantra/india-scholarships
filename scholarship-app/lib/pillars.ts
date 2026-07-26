import fs from 'fs';
import path from 'path';

export interface HubLink {
  label: string;
  href: string;
}

export interface PillarMetadata {
  id: string;
  title: string;
  slug: string;
  date: string;
  readTime: string;
  author: string;
  tag: string;
  clusterCategories: string[];
  clusterStates: string[];
  clusterLevels: string[];
  clusterProviderTypes: string[];
  clusterCourses: string[];
  hubLinks: HubLink[];
  relatedArticleSlugs: string[];
  takeaways: string[];
  checklist: string[];
  faqs?: { q: string; a: string }[];
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
}

export interface PillarData extends PillarMetadata {
  contentHtml: string;
  headings: { id: string; text: string; level: number }[];
}

const pillarsDirectory = path.join(process.cwd(), 'content/pillars');

const HUB_LINKS_MARKER = '<!-- HUB_LINKS -->';
const RELATED_ARTICLES_MARKER = '<!-- RELATED_ARTICLES -->';

/**
 * Extract H2/H3 headings for Table of Contents (mirrors lib/articles.ts)
 */
function extractHeadings(markdown: string): { id: string; text: string; level: number }[] {
  const lines = markdown.split('\n');
  const headings: { id: string; text: string; level: number }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      const isH2 = trimmed.startsWith('## ');
      const text = trimmed.replace(/^##+\s+/, '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      headings.push({ id, text, level: isH2 ? 2 : 3 });
    }
  }
  return headings;
}

/**
 * GFM Table Parser Helper (mirrors lib/articles.ts)
 */
function convertMarkdownTableToHtml(lines: string[]): string {
  if (lines.length < 2) return lines.join('\n');

  const rows = lines.map(line => {
    const parts = line.split('|');
    return parts.slice(1, parts.length - 1).map(p => p.trim());
  });

  const headers = rows[0];
  const separator = rows[1];
  const dataRows = rows.slice(2);

  const alignments = separator.map(cell => {
    if (cell.startsWith(':') && cell.endsWith(':')) return 'text-center';
    if (cell.endsWith(':')) return 'text-right';
    return 'text-left';
  });

  let html = '<div class="overflow-x-auto my-6 border border-slate-200 rounded-xl shadow-sm"><table class="min-w-full divide-y divide-slate-200 text-sm">';
  html += '<thead class="bg-slate-50"><tr>';
  headers.forEach((header, idx) => {
    const align = alignments[idx] || 'text-left';
    html += `<th scope="col" class="px-6 py-3.5 ${align} text-xs font-bold text-slate-500 uppercase tracking-wider">${header}</th>`;
  });
  html += '</tr></thead>';
  html += '<tbody class="divide-y divide-slate-100 bg-white">';
  dataRows.forEach(row => {
    html += '<tr class="hover:bg-slate-50/50 transition-colors">';
    row.forEach((cell, idx) => {
      const align = alignments[idx] || 'text-left';
      html += `<td class="px-6 py-4 ${align} text-slate-700 whitespace-pre-wrap leading-relaxed">${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';

  return html;
}

function parseTables(text: string): string {
  const lines = text.split('\n');
  let inTable = false;
  let tableLines: string[] = [];
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true;
      tableLines.push(line);
    } else {
      if (inTable) {
        result.push(convertMarkdownTableToHtml(tableLines));
        inTable = false;
        tableLines = [];
      }
      result.push(lines[i]);
    }
  }

  if (inTable && tableLines.length > 0) {
    result.push(convertMarkdownTableToHtml(tableLines));
  }

  return result.join('\n');
}

/**
 * Simple Frontmatter & Markdown Parser (mirrors lib/articles.ts)
 */
function parseFrontmatter(fileContent: string): { data: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/;
  const match = frontmatterRegex.exec(fileContent);

  if (!match) {
    return { data: {}, content: fileContent };
  }

  const yamlBlock = match[1];
  const content = match[2];
  const data: Record<string, any> = {};

  const lines = yamlBlock.split('\n');
  let currentKey: string | null = null;
  let currentList: any[] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('-')) {
      const rest = trimmed.replace(/^-/, '').trim();
      const matchKeyVal = /^[a-zA-Z_][a-zA-Z0-9_-]*\s*:/.exec(rest);

      if (matchKeyVal) {
        const colonIdx = rest.indexOf(':');
        const k = rest.slice(0, colonIdx).trim();
        const v = rest.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (currentList) {
          currentList.push({ [k]: v });
        }
      } else {
        if (currentList) {
          currentList.push(rest.replace(/^["']|["']$/g, ''));
        }
      }
      continue;
    }

    if (line.startsWith(' ') && currentList && currentList.length > 0) {
      const matchKeyVal = /^[a-zA-Z_][a-zA-Z0-9_-]*\s*:/.exec(trimmed);
      if (matchKeyVal) {
        const colonIdx = trimmed.indexOf(':');
        const k = trimmed.slice(0, colonIdx).trim();
        const v = trimmed.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
        const lastObj = currentList[currentList.length - 1];
        if (lastObj && typeof lastObj === 'object') {
          lastObj[k] = v;
        }
        continue;
      }
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
      if (currentKey && currentList) {
        data[currentKey] = currentList;
        currentList = null;
      }

      const key = trimmed.slice(0, colonIdx).trim();
      const val = trimmed.slice(colonIdx + 1).trim();

      if (val === '') {
        currentKey = key;
        currentList = [];
      } else {
        currentKey = key;
        data[key] = val.replace(/^["']|["']$/g, '');
      }
    }
  }

  if (currentKey && currentList) {
    data[currentKey] = currentList;
  }

  return { data, content };
}

/**
 * Lightweight Markdown to HTML Converter (mirrors lib/articles.ts)
 */
function simpleMarkdownToHtml(markdown: string): string {
  let html = markdown;

  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = parseTables(html);
  html = html.replace(/^---$/gim, '<hr class="my-8 border-slate-200" />');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-6 flex justify-center"><img src="$2" alt="$1" class="rounded-xl border border-slate-100 shadow-sm max-w-full print:border-none print:shadow-none" /></div>');

  html = html.replace(/^### (.*$)/gim, (match, title) => {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `<h3 id="${id}" class="text-xl font-bold text-slate-900 mt-6 mb-3 scroll-mt-24">${title}</h3>`;
  });
  html = html.replace(/^## (.*$)/gim, (match, title) => {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `<h2 id="${id}" class="text-2xl font-extrabold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-100 scroll-mt-24">${title}</h2>`;
  });
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black text-slate-900 mt-8 mb-4">$1</h1>');

  html = html.replace(/^&gt; 💡 (.*$)/gim, '<div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-4 text-amber-900 font-medium"><span class="mr-2">💡</span>$1</div>');
  html = html.replace(/^&gt; ⚠️ (.*$)/gim, '<div class="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg my-4 text-rose-900 font-medium"><span class="mr-2">⚠️</span>$1</div>');
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="bg-slate-50 border-l-4 border-indigo-500 p-4 italic text-slate-700 my-4">$1</blockquote>');

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-sm">$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 font-semibold underline hover:text-indigo-800">$1</a>');
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 mb-1.5">$1</li>');
  html = html.replace(/^([0-9]+)\. (.*$)/gim, '<li class="ml-4 list-decimal text-slate-700 mb-2 font-medium">$2</li>');
  html = wrapListItems(html);

  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<div') || p.startsWith('<ol') || p.startsWith('<ul') || p.startsWith('<table') || p.startsWith('<hr')) {
      return p;
    }
    return `<p class="text-slate-700 text-base leading-relaxed mb-4">${p}</p>`;
  }).join('\n');

  return html;
}

/**
 * Group consecutive <li> lines into their own <ol>/<ul>. Without this, bare
 * <li> siblings share one browser-generated counter across the whole page,
 * so numbered lists don't restart at 1 per list — they keep counting from
 * wherever the previous numbered list on the page left off.
 */
function wrapListItems(html: string): string {
  const lines = html.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('<li class="ml-4 list-decimal')) {
      const group: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('<li class="ml-4 list-decimal')) {
        group.push(lines[i]);
        i++;
      }
      result.push(`<ol class="my-4 space-y-1">${group.join('\n')}</ol>`);
    } else if (trimmed.startsWith('<li class="ml-4 list-disc')) {
      const group: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('<li class="ml-4 list-disc')) {
        group.push(lines[i]);
        i++;
      }
      result.push(`<ul class="my-4 space-y-1">${group.join('\n')}</ul>`);
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  return result.join('\n');
}

/**
 * Strip the HUB_LINKS / RELATED_ARTICLES marker lines from the raw markdown
 * before conversion. The page component renders those two sections itself,
 * as live React (DB-fetched scholarships, resolved articles) placed right
 * after the main body — not literally inline — so the shared article body
 * component (TOC/checklist/FAQ/print controls) only wraps once, not per chunk.
 */
function stripMarkers(rawMarkdown: string): string {
  return rawMarkdown
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed !== HUB_LINKS_MARKER && trimmed !== RELATED_ARTICLES_MARKER;
    })
    .join('\n');
}

function toMetadata(data: Record<string, any>, fallbackSlug: string): PillarMetadata {
  return {
    id: data.id || `PILLAR-${fallbackSlug}`,
    title: data.title || fallbackSlug,
    slug: data.slug || fallbackSlug,
    date: data.date || '2026-07-25',
    readTime: data.readTime || '10 min read',
    author: data.author || 'IndiaScholarships Editorial Team',
    tag: data.tag || 'Pillar Guide',
    clusterCategories: Array.isArray(data.clusterCategories) ? data.clusterCategories : [],
    clusterStates: Array.isArray(data.clusterStates) ? data.clusterStates : [],
    clusterLevels: Array.isArray(data.clusterLevels) ? data.clusterLevels : [],
    clusterProviderTypes: Array.isArray(data.clusterProviderTypes) ? data.clusterProviderTypes : [],
    clusterCourses: Array.isArray(data.clusterCourses) ? data.clusterCourses : [],
    hubLinks: Array.isArray(data.hubLinks) ? data.hubLinks : [],
    relatedArticleSlugs: Array.isArray(data.relatedArticleSlugs) ? data.relatedArticleSlugs : [],
    takeaways: Array.isArray(data.takeaways) ? data.takeaways : [],
    checklist: Array.isArray(data.checklist) ? data.checklist : [],
    faqs: Array.isArray(data.faqs) ? data.faqs : [],
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    featured: data.featured === true || data.featured === 'true',
  };
}

/**
 * Get all pillar metadata, sorted by date
 */
export function getAllPillars(): PillarMetadata[] {
  if (!fs.existsSync(pillarsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(pillarsDirectory);
  const pillars: PillarMetadata[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md')) continue;
    const fullPath = path.join(pillarsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = parseFrontmatter(fileContents);
    pillars.push(toMetadata(data, fileName.replace(/\.md$/, '')));
  }

  return pillars.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Pillars flagged `featured: true` in frontmatter, for surfaces like the
 * homepage that only have room for a handful — driven by the flag instead of
 * a hardcoded slug list, so newly published pillars can be featured (or
 * rotated in) by editing content, not by shipping a code change.
 */
export function getFeaturedPillars(limit = 6): PillarMetadata[] {
  return getAllPillars()
    .filter((p) => p.featured)
    .slice(0, limit);
}

/**
 * Get a pillar by slug, with content parsed into renderable segments
 */
export function getPillarBySlug(slug: string): PillarData | null {
  const fullPath = path.join(pillarsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = parseFrontmatter(fileContents);
  const metadata = toMetadata(data, slug);

  const cleanedContent = stripMarkers(content);

  return {
    ...metadata,
    contentHtml: simpleMarkdownToHtml(cleanedContent),
    headings: extractHeadings(cleanedContent),
  };
}

/**
 * When more than one pillar covers the same tag (e.g. a broad "SC/ST in
 * India" pillar and a dedicated "West Bengal" pillar both list West Bengal),
 * prefer the more specific one — fewest entries in the given cluster field —
 * so a state hub links to its own dedicated guide instead of a broader one
 * that merely mentions it as an example.
 */
function pickMostSpecific(
  pillars: PillarMetadata[],
  field: 'clusterCategories' | 'clusterStates' | 'clusterLevels' | 'clusterProviderTypes' | 'clusterCourses'
): PillarMetadata | null {
  if (pillars.length === 0) return null;
  return pillars.reduce((best, p) => (p[field].length < best[field].length ? p : best));
}

/**
 * Reverse-lookup: find the pillar (if any) covering a given category slug,
 * e.g. 'sc' or 'st' -> the SC/ST pillar. Used by hub pages to render a
 * "Read the full guide" callout linking up to the matching pillar.
 */
export function getPillarForCategory(categorySlug: string): PillarMetadata | null {
  const pillars = getAllPillars();
  const normalized = categorySlug.toLowerCase();
  const matches = pillars.filter(p =>
    p.clusterCategories.some(c => c.toLowerCase() === normalized)
  );
  return pickMostSpecific(matches, 'clusterCategories');
}

export function getPillarForState(stateName: string): PillarMetadata | null {
  const pillars = getAllPillars();
  const normalized = stateName.toLowerCase();
  const matches = pillars.filter(p =>
    p.clusterStates.some(s => s.toLowerCase() === normalized)
  );
  return pickMostSpecific(matches, 'clusterStates');
}

export function getPillarForLevel(levelSlug: string): PillarMetadata | null {
  const pillars = getAllPillars();
  const normalized = levelSlug.toLowerCase();
  const matches = pillars.filter(p =>
    p.clusterLevels.some(l => l.toLowerCase() === normalized)
  );
  return pickMostSpecific(matches, 'clusterLevels');
}

export function getPillarForProviderType(providerType: string): PillarMetadata | null {
  const pillars = getAllPillars();
  const normalized = providerType.toLowerCase();
  const matches = pillars.filter(p =>
    p.clusterProviderTypes.some(t => t.toLowerCase() === normalized)
  );
  return pickMostSpecific(matches, 'clusterProviderTypes');
}

export function getPillarForCourse(courseName: string): PillarMetadata | null {
  const pillars = getAllPillars();
  const normalized = courseName.toLowerCase();
  const matches = pillars.filter(p =>
    p.clusterCourses.some(c => c.toLowerCase() === normalized)
  );
  return pickMostSpecific(matches, 'clusterCourses');
}

/**
 * Reverse-lookup a single best-fit pillar for a scholarship detail page,
 * so a page like "Odisha e-Medhabruti" can link up to the pillar that
 * explains the wider system it belongs to.
 *
 * Priority mirrors how a student would want the guide framed: a
 * state-specific scheme should point to the state pillar, not a generic
 * category one; a corporate/private scheme has no state or category pillar
 * to fall back on, so that check comes next; course and category follow;
 * level is the last, broadest fallback.
 */
export function getPillarForScholarship(scholarship: {
  state?: string | null;
  provider_type?: string | null;
  caste?: string[] | null;
  course_stream?: string[] | string | null;
  level?: string | null;
}): PillarMetadata | null {
  const { state, provider_type, caste, course_stream, level } = scholarship;

  if (state && state !== 'All India' && state !== 'Multiple States' && state !== 'Selected States' && state !== 'Selected Cities') {
    const statePillar = getPillarForState(state);
    if (statePillar) return statePillar;
  }

  if (provider_type === 'Corporate' || provider_type === 'Private') {
    const providerPillar = getPillarForProviderType(provider_type);
    if (providerPillar) return providerPillar;
  }

  if (course_stream) {
    const rawCourses = Array.isArray(course_stream) ? course_stream : [course_stream];
    const courseTokens = rawCourses.flatMap(c => c.split(/[,/]/)).map(t => t.trim()).filter(Boolean);
    for (const token of courseTokens) {
      const coursePillar = getPillarForCourse(token);
      if (coursePillar) return coursePillar;
    }
  }

  if (caste && caste.length > 0) {
    for (const c of caste) {
      const categoryPillar = getPillarForCategory(c);
      if (categoryPillar) return categoryPillar;
    }
  }

  if (level) {
    const levelTokens = level.split(',').map(t => t.trim()).filter(Boolean);
    for (const token of levelTokens) {
      const levelPillar = getPillarForLevel(token);
      if (levelPillar) return levelPillar;
    }
  }

  return null;
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ') // drop "(Odisha)" / "(UG)" style suffixes
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Turns a bolded scholarship name mentioned in a pillar's prose (e.g.
 * "**Post-Matric Scholarship for SC Students**") into a link to its live
 * detail page, so users don't have to scroll to the "Featured Scholarships"
 * cards to act on something the text just told them about.
 *
 * Only links when exactly one scholarship's title matches the bolded text
 * (via a normalized prefix match) — ambiguous names like "e-Medhabruti",
 * which map to 3 separate Odisha scheme variants, are deliberately left
 * unlinked rather than guessed at.
 */
export function autoLinkScholarshipMentions(
  html: string,
  scholarships: { title: string; slug: string }[]
): string {
  const seen = new Set<string>();

  return html.replace(/<strong[^>]*>(.*?)<\/strong>/g, (fullMatch, inner: string) => {
    const plainText = inner
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    const normalizedText = normalizeForMatch(plainText);
    if (normalizedText.length < 4) return fullMatch;

    const candidates = scholarships.filter((s) => {
      const normalizedTitle = normalizeForMatch(s.title);
      return normalizedTitle.startsWith(normalizedText) || normalizedText.startsWith(normalizedTitle);
    });

    if (candidates.length !== 1) return fullMatch;

    const match = candidates[0];
    if (seen.has(match.slug)) return fullMatch; // only link the first mention

    seen.add(match.slug);
    return `<a href="/scholarships/${match.slug}" class="text-indigo-600 font-semibold hover:underline">${inner}</a>`;
  });
}
