import fs from 'fs';
import path from 'path';



export interface ArticleMetadata {
  id: string;
  title: string;
  slug: string;
  date: string;
  readTime: string;
  author: string;
  tag: string;
  targetMoneyLink: string;
  relatedScholarships: string[];
  relatedPillarSlug?: string;
  takeaways: string[];
  checklist?: string[];
  featuredStats?: { label: string; value: string }[];
  faqs?: { q: string; a: string }[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface ArticleData extends ArticleMetadata {
  contentHtml: string;
  rawMarkdown: string;
  headings: { id: string; text: string; level: number }[];
}

const articlesDirectory = path.join(process.cwd(), 'content/articles');

/**
 * Extract H2/H3 headings for Table of Contents
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
      headings.push({
        id,
        text,
        level: isH2 ? 2 : 3
      });
    }
  }
  return headings;
}

/**
 * GFM Table Parser Helper
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
  
  html += '<thead class="bg-slate-50">';
  html += '<tr>';
  headers.forEach((header, idx) => {
    const align = alignments[idx] || 'text-left';
    html += `<th scope="col" class="px-6 py-3.5 ${align} text-xs font-bold text-slate-500 uppercase tracking-wider">${header}</th>`;
  });
  html += '</tr>';
  html += '</thead>';

  html += '<tbody class="divide-y divide-slate-100 bg-white">';
  dataRows.forEach(row => {
    html += '<tr class="hover:bg-slate-50/50 transition-colors">';
    row.forEach((cell, idx) => {
      const align = alignments[idx] || 'text-left';
      html += `<td class="px-6 py-4 ${align} text-slate-700 whitespace-pre-wrap leading-relaxed">${cell}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  html += '</table></div>';

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
 * Simple Frontmatter & Markdown Parser
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

    // List item starting with '-'
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

    // Indented properties under list item (like value: or a:)
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

    // Root-level key-value pair
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
 * Lightweight Markdown to HTML Converter
 */
function simpleMarkdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML entities to prevent injection
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Tables
  html = parseTables(html);

  // Horizontal Rules
  html = html.replace(/^---$/gim, '<hr class="my-8 border-slate-200" />');

  // Images (Parse before regular links)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-6 flex justify-center"><img src="$2" alt="$1" class="rounded-xl border border-slate-100 shadow-sm max-w-full print:border-none print:shadow-none" /></div>');

  // Headings with Slugified Anchor IDs
  html = html.replace(/^### (.*$)/gim, (match, title) => {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `<h3 id="${id}" class="text-xl font-bold text-slate-900 mt-6 mb-3">${title}</h3>`;
  });
  html = html.replace(/^## (.*$)/gim, (match, title) => {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `<h2 id="${id}" class="text-2xl font-extrabold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-100">${title}</h2>`;
  });
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black text-slate-900 mt-8 mb-4">$1</h1>');

  // Callout boxes (> 💡 Pro Tip: ...)
  html = html.replace(/^&gt; 💡 (.*$)/gim, '<div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-4 text-amber-900 font-medium"><span class="mr-2">💡</span>$1</div>');
  html = html.replace(/^&gt; ⚠️ (.*$)/gim, '<div class="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg my-4 text-rose-900 font-medium"><span class="mr-2">⚠️</span>$1</div>');
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="bg-slate-50 border-l-4 border-indigo-500 p-4 italic text-slate-700 my-4">$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-sm">$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 font-semibold underline hover:text-indigo-800">$1</a>');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 mb-1.5">$1</li>');
  html = html.replace(/^([0-9]+)\. (.*$)/gim, '<li class="ml-4 list-decimal text-slate-700 mb-2 font-medium">$2</li>');
  html = wrapListItems(html);

  // Paragraphs
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
 * Get all articles metadata sorted by date
 */
export function getAllArticles(): ArticleMetadata[] {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(articlesDirectory);
  const articles: ArticleMetadata[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md')) continue;

    const fullPath = path.join(articlesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = parseFrontmatter(fileContents);

    articles.push({
      id: data.id || `ART-${fileName.replace(/\.md$/, '')}`,
      title: data.title || fileName.replace(/\.md$/, ''),
      slug: data.slug || fileName.replace(/\.md$/, ''),
      date: data.date || '2026-07-21',
      readTime: data.readTime || '3 min read',
      author: data.author || 'IndiaScholarships Editorial Team',
      tag: data.tag || 'General Guide',
      targetMoneyLink: data.targetMoneyLink || '/tools/eligibility-checker',
      relatedScholarships: Array.isArray(data.relatedScholarships) ? data.relatedScholarships : [],
      relatedPillarSlug: data.relatedPillarSlug || undefined,
      takeaways: Array.isArray(data.takeaways) ? data.takeaways : [],
      checklist: Array.isArray(data.checklist) ? data.checklist : [],
      featuredStats: Array.isArray(data.featuredStats) ? data.featuredStats : [],
      faqs: Array.isArray(data.faqs) ? data.faqs : []
    });
  }

  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Get article by slug with converted HTML content
 */
export function getArticleBySlug(slug: string): ArticleData | null {
  const fullPath = path.join(articlesDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = parseFrontmatter(fileContents);

  const contentHtml = simpleMarkdownToHtml(content);

  return {
    id: data.id || `ART-${slug}`,
    title: data.title || slug,
    slug: data.slug || slug,
    date: data.date || '2026-07-21',
    readTime: data.readTime || '3 min read',
    author: data.author || 'IndiaScholarships Editorial Team',
    tag: data.tag || 'General Guide',
    targetMoneyLink: data.targetMoneyLink || '/tools/eligibility-checker',
    relatedScholarships: Array.isArray(data.relatedScholarships) ? data.relatedScholarships : [],
    relatedPillarSlug: data.relatedPillarSlug || undefined,
    takeaways: Array.isArray(data.takeaways) ? data.takeaways : [],
    checklist: Array.isArray(data.checklist) ? data.checklist : [],
    featuredStats: Array.isArray(data.featuredStats) ? data.featuredStats : [],
    faqs: Array.isArray(data.faqs) ? data.faqs : [],
    headings: extractHeadings(content),
    contentHtml,
    rawMarkdown: content
  };
}

/**
 * Get articles linked to a specific scholarship slug
 */
export function getArticlesForScholarship(scholarshipSlug: string): ArticleMetadata[] {
  const allArticles = getAllArticles();
  return allArticles.filter(art => art.relatedScholarships.includes(scholarshipSlug));
}

/**
 * Get other articles that share the same pillar, so a reader who finishes
 * one narrow how-to guide has somewhere else on-site to go besides back to a
 * listing page. Articles have no other shared taxonomy to cluster on, so
 * relatedPillarSlug — already required to point a single article "up" to its
 * pillar — doubles as the sideways grouping key here.
 */
export function getRelatedArticles(currentSlug: string, limit = 3): ArticleMetadata[] {
  const current = getArticleBySlug(currentSlug);
  if (!current || !current.relatedPillarSlug) return [];

  const allArticles = getAllArticles();
  return allArticles
    .filter(art => art.slug !== currentSlug && art.relatedPillarSlug === current.relatedPillarSlug)
    .slice(0, limit);
}
