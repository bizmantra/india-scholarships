// Unified Editorial content schema (IS-113).
// One shape for Pillars, Articles, and Portal Guides — "kind" only sets sensible defaults
// (e.g. whether the TOC shows by default), it does not select a different template.
// Every field below is optional except the core ones, so a renderer can conditionally
// show/hide blocks depending on what a given piece of content actually has.

export interface KeyFact {
  label: string;
  value: string;
}

export interface ChecklistItem {
  label: string;
  note?: string;
}

export interface StepGroup {
  group: string;
  items: { title: string; desc: string }[];
}

export interface SchemeRef {
  name: string;
  slug: string;
  targetGroup: string;
  amount: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface HubLink {
  label: string;
  href: string;
}

export interface Helpline {
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
}

export interface EditorialContent {
  // Core — every Editorial page has these
  id: string;
  slug: string;
  kind: 'pillar' | 'how-to' | 'portal' | 'news';
  tag: string;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  date: string;
  readTime: string;
  author: string;
  body: string; // markdown/HTML prose
  headings: { id: string; text: string; level: number }[];

  // Optional nuance blocks — absent means the corresponding template section doesn't render
  keyFacts?: KeyFact[];
  takeaways?: string[];
  checklist?: ChecklistItem[];
  steps?: StepGroup[];
  schemes?: SchemeRef[];
  relatedScholarshipQuery?: {
    categories?: string[];
    states?: string[];
    providerTypes?: string[];
    courses?: string[];
  };
  relatedScholarshipSlugs?: string[];
  // Pre-resolved render list for relatedScholarshipQuery / relatedScholarshipSlugs above —
  // the DB fetch happens at the page level (server component), the template just renders it.
  featuredScholarships?: { title: string; href: string; amount?: string; meta?: string }[];
  faqs?: Faq[];
  helpline?: Helpline;
  hubLinks?: HubLink[];
  // Pre-resolved, not raw slugs — content lookups (Article/Pillar/DB) happen at the page
  // level, where the data source is known; the generic template just renders a plain list.
  relatedGuides?: { title: string; href: string; meta?: string }[];
  officialUrl?: string;
  monetizationLink?: string;
}

// --- Adapter: PortalGuide -> EditorialContent -------------------------------------
// Proves the schema is a genuine superset: every PortalGuide field maps somewhere,
// nothing is silently dropped.
import { PortalGuide } from './portalsData';

export function portalGuideToEditorial(guide: PortalGuide): EditorialContent {
  const stepGroups: StepGroup[] = [];
  if (guide.loginSteps?.length) {
    stepGroups.push({
      group: 'Student Login & Registration',
      items: guide.loginSteps.map((s) => ({ title: s.title, desc: s.desc })),
    });
  }
  if (guide.statusSteps?.length) {
    stepGroups.push({
      group: 'Checking Application Status',
      items: guide.statusSteps.map((s) => ({ title: s.title, desc: s.desc })),
    });
  }

  return {
    id: guide.id,
    slug: guide.id,
    kind: 'portal',
    tag: guide.portalTag || 'Portal Guide',
    title: guide.name,
    seoTitle: guide.fullTitle,
    seoDescription: guide.seoDesc,
    date: '',
    readTime: '',
    author: 'IndiaScholarships Editorial Team',
    body: guide.description,
    headings: [],
    keyFacts: [
      { label: 'Active Schemes', value: guide.stats.activeSchemes },
      { label: 'Beneficiaries', value: guide.stats.beneficiaries },
      { label: 'Disbursement', value: guide.stats.disbursementType },
      { label: 'Verification', value: guide.stats.verificationMode },
    ],
    checklist: guide.documents.map((d) => ({ label: `${d.name} (${d.format})`, note: d.note })),
    steps: stepGroups.length > 0 ? stepGroups : undefined,
    schemes: guide.topSchemes.length > 0 ? guide.topSchemes : undefined,
    faqs: guide.faqs.length > 0 ? guide.faqs : undefined,
    helpline: guide.helpline,
    officialUrl: guide.officialUrl,
  };
}

// --- Adapter: ArticleData -> EditorialContent -------------------------------------
import { ArticleData } from './articles';

export function articleToEditorial(article: ArticleData): EditorialContent {
  return {
    id: article.id,
    slug: article.slug,
    kind: 'how-to',
    tag: article.tag || 'How-To',
    title: article.title,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    date: article.date,
    readTime: article.readTime,
    author: article.author,
    body: article.contentHtml,
    headings: article.headings,
    keyFacts: article.featuredStats?.length ? article.featuredStats : undefined,
    takeaways: article.takeaways.length > 0 ? article.takeaways : undefined,
    checklist: article.checklist?.length ? article.checklist.map((c) => ({ label: c })) : undefined,
    faqs: article.faqs?.length ? article.faqs : undefined,
    relatedScholarshipSlugs: article.relatedScholarships.length > 0 ? article.relatedScholarships : undefined,
    monetizationLink: article.targetMoneyLink || undefined,
    // relatedGuides (sibling articles) and hubLinks (parent pillar) are resolved at the
    // page level, same as Pillars — this adapter only carries article-native fields.
  };
}

// --- Adapter: NewsData -> EditorialContent -----------------------------------------
// News stays a separate content type in nav/taxonomy by design (not folded into
// Editorial) — reusing EditorialTemplate here is purely about rendering consistency,
// not a taxonomy change. No TOC (news has no headings), no checklist, no steps.
import { NewsData } from './news';

export function newsToEditorial(news: NewsData): EditorialContent {
  return {
    id: news.id,
    slug: news.slug,
    kind: 'news',
    tag: news.tag || 'News',
    title: news.title,
    date: news.date,
    readTime: '',
    author: news.author,
    body: news.contentHtml,
    headings: [],
    takeaways: news.takeaways.length > 0 ? news.takeaways : undefined,
    relatedScholarshipSlugs: news.relatedScholarships.length > 0 ? news.relatedScholarships : undefined,
    monetizationLink: news.targetMoneyLink || undefined,
  };
}
