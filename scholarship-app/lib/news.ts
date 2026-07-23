import fs from 'fs';
import path from 'path';

export interface NewsMetadata {
  id: string;
  title: string;
  slug: string;
  date: string;
  author: string;
  tag: string;
  targetMoneyLink: string;
  relatedScholarships: string[];
  takeaways: string[];
}

export interface NewsData extends NewsMetadata {
  contentHtml: string;
  rawMarkdown: string;
}

const newsDirectory = path.join(process.cwd(), 'content/news');

/**
 * Simple zero-dependency Frontmatter & Markdown Parser
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
  let currentList: string[] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // List item (- "value")
    if (trimmed.startsWith('-') && currentKey && currentList) {
      const val = trimmed.replace(/^-/, '').trim().replace(/^["']|["']$/g, '');
      currentList.push(val);
      continue;
    }

    // Key-Value pair
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

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-slate-900 mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-extrabold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-100">$1</h2>');
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
  html = html.replace(/^([0-9]+)\. (.*$)/gim, '<li class="ml-4 list-decimal text-slate-700 mb-2 font-medium">$1</li>');

  // Paragraphs
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (p.startsWith('<h') || p.startsWith('<blockquote') || p.startsWith('<div') || p.startsWith('<li')) {
      return p;
    }
    return `<p class="text-slate-700 text-base leading-relaxed mb-4">${p}</p>`;
  }).join('\n');

  return html;
}

/**
 * Get all news updates metadata sorted by date
 */
export function getAllNews(): NewsMetadata[] {
  if (!fs.existsSync(newsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(newsDirectory);
  const newsList: NewsMetadata[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md')) continue;

    const fullPath = path.join(newsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = parseFrontmatter(fileContents);

    newsList.push({
      id: data.id || `NEWS-${fileName.replace(/\.md$/, '')}`,
      title: data.title || fileName.replace(/\.md$/, ''),
      slug: data.slug || fileName.replace(/\.md$/, ''),
      date: data.date || '2026-07-22',
      author: data.author || 'IndiaScholarships Editorial Team',
      tag: data.tag || 'News Update',
      targetMoneyLink: data.targetMoneyLink || '/tools/eligibility-checker',
      relatedScholarships: Array.isArray(data.relatedScholarships) ? data.relatedScholarships : [],
      takeaways: Array.isArray(data.takeaways) ? data.takeaways : []
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const publishedNews = process.env.NODE_ENV === 'production'
    ? newsList.filter(n => n.date <= todayStr)
    : newsList;

  return publishedNews.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Get news update by slug with HTML content
 */
export function getNewsBySlug(slug: string): NewsData | null {
  const fullPath = path.join(newsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = parseFrontmatter(fileContents);

  const todayStr = new Date().toISOString().split('T')[0];
  const newsDate = data.date || '2026-07-22';
  if (process.env.NODE_ENV === 'production' && newsDate > todayStr) {
    return null;
  }

  const contentHtml = simpleMarkdownToHtml(content);

  return {
    id: data.id || `NEWS-${slug}`,
    title: data.title || slug,
    slug: data.slug || slug,
    date: data.date || '2026-07-22',
    author: data.author || 'IndiaScholarships Editorial Team',
    tag: data.tag || 'News Update',
    targetMoneyLink: data.targetMoneyLink || '/tools/eligibility-checker',
    relatedScholarships: Array.isArray(data.relatedScholarships) ? data.relatedScholarships : [],
    takeaways: Array.isArray(data.takeaways) ? data.takeaways : [],
    contentHtml,
    rawMarkdown: content
  };
}

/**
 * Get news updates linked to a specific scholarship slug
 */
export function getNewsForScholarship(scholarshipSlug: string): NewsMetadata[] {
  const allNews = getAllNews();
  return allNews.filter(n => n.relatedScholarships.includes(scholarshipSlug));
}

/**
 * Get news updates matching a specific state name
 */
export function getNewsForState(stateName: string): NewsMetadata[] {
  const allNews = getAllNews();
  const lowerState = stateName.toLowerCase();
  return allNews.filter(n => 
    n.title.toLowerCase().includes(lowerState) || 
    n.slug.toLowerCase().includes(lowerState) ||
    n.tag.toLowerCase().includes(lowerState)
  );
}
