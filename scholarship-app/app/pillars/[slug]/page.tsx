import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPillarBySlug, getAllPillars, autoLinkScholarshipMentions } from '@/lib/pillars';
import { getArticleBySlug } from '@/lib/articles';
import { getNewsForPillar } from '@/lib/news';
import { getScholarshipsByCategory, getScholarshipsByState, getScholarshipsByProviderType, getScholarshipsByCourse } from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ScholarshipCard from '@/app/components/ScholarshipCard';
import PillarBody from '@/app/components/PillarBody';
import { Calendar, Clock, ChevronRight, BookOpen } from 'lucide-react';

interface PillarPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pillars = getAllPillars();
  return pillars.map((pillar) => ({ slug: pillar.slug }));
}

export async function generateMetadata({ params }: PillarPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pillar = getPillarBySlug(slug);

  if (!pillar) {
    return { title: 'Guide Not Found | IndiaScholarships.in' };
  }

  return {
    title: pillar.seoTitle ? `${pillar.seoTitle} | IndiaScholarships.in` : `${pillar.title} | IndiaScholarships.in`,
    description: pillar.seoDescription || pillar.takeaways[0] || `Complete guide to ${pillar.title}.`,
    alternates: {
      canonical: `https://www.indiascholarships.in/pillars/${pillar.slug}`,
    },
  };
}

// Only surface scholarships that are still relevant (open or undated),
// per the site's anti-thin-content / freshness convention used on hub pages.
function isLikelyOpen(s: any): boolean {
  if (!s.deadline) return true;
  const d = new Date(s.deadline);
  return isNaN(d.getTime()) || d >= new Date(new Date().setHours(0, 0, 0, 0));
}

// getScholarshipsByCategory pulls in anything that merely *includes* the
// cluster category (e.g. a "General, OBC, SC, ST, EWS" scheme open to
// everyone), which would make a category-focused guide (like SC/ST) feature
// non-specific scholarships such as a sports or CSR grant. Only applies when
// the pillar actually declares clusterCategories — a state-only pillar (no
// categories set) legitimately covers every scheme in that state, including
// "General"/"All" ones, so it must skip this filter rather than zero out.
function isCategoryFocused(s: any, clusterCategories: string[]): boolean {
  if (clusterCategories.length === 0) return true;
  const casteArr: string[] = Array.isArray(s.caste) ? s.caste.map((c: string) => c.toLowerCase()) : [];
  if (casteArr.length === 0) return false;
  const clusterLower = clusterCategories.map((c) => c.toLowerCase());
  const matchesCluster = casteArr.some((c) => clusterLower.includes(c));
  const isOpenToGeneral = casteArr.includes('general') || casteArr.includes('all');
  return matchesCluster && !isOpenToGeneral;
}

export default async function PillarPage({ params }: PillarPageProps) {
  const { slug } = await params;
  const pillar = getPillarBySlug(slug);

  if (!pillar) {
    notFound();
  }

  // Live "top scholarships in this cluster" — pulled fresh from the DB,
  // never hardcoded, so this section stays accurate as schemes open/close.
  const clusterScholarshipLists = await Promise.all([
    ...pillar.clusterCategories.map((c) => getScholarshipsByCategory(c)),
    ...pillar.clusterStates.map((s) => getScholarshipsByState(s)),
    ...pillar.clusterProviderTypes.map((t) => getScholarshipsByProviderType(t)),
    ...pillar.clusterCourses.map((c) => getScholarshipsByCourse(c)),
  ]);
  const merged = Array.from(
    new Map(clusterScholarshipLists.flat().map((s: any) => [s.id, s])).values()
  ) as any[];
  const eligibleScholarships = merged
    .filter(isLikelyOpen)
    .filter((s) => isCategoryFocused(s, pillar.clusterCategories))
    .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
  const featuredScholarships = eligibleScholarships.slice(0, 9);
  const remainingCount = eligibleScholarships.length - featuredScholarships.length;
  // The pillar's job is to explain, then hand off — the primary hub link (always
  // listed first in frontmatter) is where the full, unfiltered list actually lives.
  const primaryHubLink = pillar.hubLinks[0];

  // Link scholarship names as soon as the prose mentions them, not just in the
  // cards further down — matched against the full cluster, not just the top 9.
  const contentHtml = autoLinkScholarshipMentions(pillar.contentHtml, merged);

  // Related editorial articles, resolved live so broken slugs don't 404 silently
  const relatedArticles = pillar.relatedArticleSlugs
    .map((s) => getArticleBySlug(s))
    .filter(Boolean) as NonNullable<ReturnType<typeof getArticleBySlug>>[];

  // Live news relevant to this pillar's states/categories, newest first
  const relatedNews = getNewsForPillar(pillar).slice(0, 3);

  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: pillar.title,
      datePublished: pillar.date,
      dateModified: pillar.date,
      author: { '@type': 'Organization', name: pillar.author },
      publisher: { '@type': 'Organization', name: 'IndiaScholarships', url: 'https://www.indiascholarships.in' },
      description: pillar.seoDescription || pillar.takeaways[0] || pillar.title,
    },
  ];
  if (pillar.faqs && pillar.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: pillar.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    });
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />

      <div>
        <Header />

        {/* Breadcrumb Header */}
        <div className="bg-gray-50 border-b border-gray-100 print:hidden">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link href="/" className="hover:text-google-blue transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">{pillar.title}</span>
          </nav>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:py-0">
          {/* Mobile Navigation Pills — the desktop TOC sidebar is hidden below `lg`,
              so without this, mobile readers (90% of traffic) have zero on-page
              navigation for what's often a very long guide. */}
          <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 overflow-x-auto scrollbar-none flex gap-2 border-b border-gray-200/80 shadow-xs mb-6 print:hidden">
            {pillar.headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 whitespace-nowrap transition-all"
              >
                {h.text}
              </a>
            ))}
            {featuredScholarships.length > 0 && (
              <a
                href="#featured-scholarships"
                className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 whitespace-nowrap transition-all"
              >
                🎓 Scholarships
              </a>
            )}
            {pillar.faqs && pillar.faqs.length > 0 && (
              <a
                href="#faq-section"
                className="flex-shrink-0 px-4 py-2.5 rounded-full font-bold text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 whitespace-nowrap transition-all"
              >
                ❓ FAQ
              </a>
            )}
          </div>

          <header className="mb-8 pb-6 border-b border-gray-100 print:pb-2 print:mb-4">
            <div className="flex items-center gap-2 mb-4 print:hidden">
              <span className="px-2.5 py-0.5 border border-google-blue text-google-blue text-[10px] font-bold uppercase tracking-wider rounded-sm">
                {pillar.tag}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight print:text-2xl print:mb-2">
              {pillar.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400 print:hidden" />
                Updated {pillar.date}
              </span>
              <span className="flex items-center gap-1.5 print:hidden">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {pillar.readTime}
              </span>
              <span>By {pillar.author}</span>
            </div>
          </header>

          {/* Key Takeaways — plain bordered block, no color tint */}
          {pillar.takeaways.length > 0 && (
            <div className="border-t border-b border-gray-100 py-6 mb-8 print:border-gray-200 print:p-4 print:mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Key Takeaways</h2>
              <ul className="space-y-2.5">
                {pillar.takeaways.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-800 flex items-start gap-2 leading-relaxed print:text-xs">
                    <span className="font-bold text-gray-400 shrink-0">—</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Explore by category and state — above the fold, right after takeaways, so
              readers who just want the destination page don't have to scroll past the
              whole article to find it. Links down to hubs, not duplicating their listings. */}
          {pillar.hubLinks.length > 0 && (
            <div className="mb-10 print:hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Jump Straight to a Hub</h3>
              <div className="border-t border-gray-100">
                {pillar.hubLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between gap-2 py-3 border-b border-gray-100 font-semibold text-google-blue hover:underline text-sm transition-colors"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Main body — single wrapper so TOC/checklist/FAQ render once, not per section */}
          <PillarBody
            contentHtml={contentHtml}
            headings={pillar.headings}
            faqs={pillar.faqs || []}
            checklist={pillar.checklist}
          />

          {/* Top Scholarships in This Cluster — live from DB, never hardcoded */}
          {featuredScholarships.length > 0 && (
            <div id="featured-scholarships" className="my-10 scroll-mt-24 print:page-break-inside-avoid">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-google-blue print:hidden" />
                <span>Featured Scholarships in This Guide</span>
              </h3>
              {/* Human-readable pointer to the full list, right where a reader lands
                  on this section — not just after they've scrolled past all the cards. */}
              {primaryHubLink && (
                <p className="text-sm text-gray-500 mb-4 print:hidden">
                  See the complete list of{' '}
                  <Link href={primaryHubLink.href} className="text-google-blue font-semibold hover:underline">
                    {primaryHubLink.label.replace(/^All\s+/i, '').replace(/\s+Scholarships$/i, '')} scholarships
                  </Link>.
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredScholarships.map((sc: any) => (
                  <ScholarshipCard key={sc.id} scholarship={sc} />
                ))}
              </div>
              {/* A plain sentence, not a CTA button — these are the top picks, not
                  the whole list, so say so and point at where the rest actually live. */}
              {remainingCount > 0 && primaryHubLink && (
                <p className="mt-4 text-sm text-gray-500 print:hidden">
                  These are the {featuredScholarships.length} highest-priority picks out of {eligibleScholarships.length} open right now
                  {pillar.hubLinks.length > 1 ? (
                    <> — the rest are on the hub pages above.</>
                  ) : (
                    <>
                      {' '}— see the rest on{' '}
                      <Link href={primaryHubLink.href} className="text-google-blue font-semibold hover:underline">
                        {primaryHubLink.label}
                      </Link>
                      .
                    </>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Related step-by-step guides — plain list, same pattern as "Jump to a Hub" above */}
          {relatedArticles.length > 0 && (
            <div className="my-10 print:hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Related How-To Guides</h3>
              <div className="border-t border-gray-100">
                {relatedArticles.map((art) => (
                  <Link
                    key={art.slug}
                    href={`/guides/${art.slug}`}
                    className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 hover:underline transition-colors"
                  >
                    <span className="text-sm font-semibold text-google-blue">{art.title}</span>
                    <span className="text-xs text-gray-400 shrink-0">{art.readTime}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Latest News — plain list; date as quiet metadata, not a colored badge */}
          {relatedNews.length > 0 && (
            <div className="my-10 print:hidden">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Related News</h3>
              <div className="border-t border-gray-100">
                {relatedNews.map((news) => (
                  <Link
                    key={news.slug}
                    href={`/news/${news.slug}`}
                    className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 hover:underline transition-colors"
                  >
                    <span className="text-sm font-semibold text-google-blue">{news.title}</span>
                    <span className="text-xs text-gray-400 shrink-0">{news.date}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-150 flex items-center gap-3 text-xs text-gray-500 print:mt-4 print:pt-2">
            <span>Official Government Portal Source Reference. Information cross-checked with state guidelines.</span>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
