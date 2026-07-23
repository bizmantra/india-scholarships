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
  takeaways: string[];
  checklist?: string[];
}

export interface ArticleData extends ArticleMetadata {
  contentHtml: string;
  rawMarkdown: string;
}

const articlesDirectory = path.join(process.cwd(), 'content/articles');

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
      takeaways: Array.isArray(data.takeaways) ? data.takeaways : [],
      checklist: Array.isArray(data.checklist) ? data.checklist : []
    });
  }

  return articles.sort((a, b) => (a.date < b.date ? 1 : -1));
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

  const articleDate = data.date || '2026-07-21';

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
    takeaways: Array.isArray(data.takeaways) ? data.takeaways : [],
    checklist: Array.isArray(data.checklist) ? data.checklist : [],
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
