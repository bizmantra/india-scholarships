import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getArticleBySlug, getAllArticles, getRelatedArticles } from '@/lib/articles';
import { getScholarshipBySlug } from '@/lib/db';
import { getPillarBySlug } from '@/lib/pillars';
import { articleToEditorial } from '@/lib/editorial';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import PillarGuideCallout from '@/app/components/PillarGuideCallout';
import EditorialTemplate from '@/app/components/EditorialTemplate';
import UpStatusDecoder from '@/app/components/UpStatusDecoder';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | IndiaScholarships.in',
    };
  }

  return {
    title: article.seoTitle ? `${article.seoTitle} | IndiaScholarships.in` : `${article.title} | IndiaScholarships.in`,
    description: article.seoDescription || article.takeaways[0] || `Step-by-step guide on ${article.title} for Indian students.`,
    alternates: {
      canonical: `https://www.indiascholarships.in/articles/${article.slug}`,
    },
    openGraph: {
      images: [
        {
          url: slug === 'india-scholarships-statistics-2025-2026'
            ? 'https://www.indiascholarships.in/images/stats-report-featured.svg'
            : 'https://www.indiascholarships.in/images/logo-is.png',
          width: 1200,
          height: 630,
          alt: article.title
        }
      ]
    }
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedPillar = article.relatedPillarSlug ? getPillarBySlug(article.relatedPillarSlug) : null;
  const moreArticles = getRelatedArticles(slug);

  // Resolve the static relatedScholarships slug list into live DB records — same "resolve
  // at the page level" convention EditorialTemplate expects for all its list blocks.
  const relatedScholarshipsData = (await Promise.all(
    article.relatedScholarships.map((sSlug) => getScholarshipBySlug(sSlug))
  )).filter(Boolean) as any[];

  const editorialContent = articleToEditorial(article);
  editorialContent.featuredScholarships = relatedScholarshipsData.length > 0
    ? relatedScholarshipsData.map((sc) => ({
        title: sc.title,
        href: `/scholarships/${sc.slug}`,
        amount: sc.amount_annual ? `₹${sc.amount_annual.toLocaleString('en-IN')}/yr` : undefined,
        meta: sc.state || 'All India',
      }))
    : undefined;
  editorialContent.relatedGuides = moreArticles.length > 0
    ? moreArticles.map((art) => ({ title: art.title, href: `/guides/${art.slug}`, meta: art.readTime }))
    : undefined;

  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      datePublished: article.date,
      dateModified: article.date,
      author: { '@type': 'Organization', name: article.author },
      publisher: { '@type': 'Organization', name: 'IndiaScholarships', url: 'https://www.indiascholarships.in' },
      description: article.takeaways[0] || article.title,
    }
  ];
  if (article.faqs && article.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    });
  }

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <PillarGuideCallout pillar={relatedPillar} />

        {/* Featured image banner — special-cased for the one stats-report article, not a
            schema field, since it's a one-off, not a reusable content shape. */}
        {slug === 'india-scholarships-statistics-2025-2026' && (
          <div className="relative w-full aspect-[1200/630] rounded-md overflow-hidden border border-gray-200 mb-8">
            <img
              src="/images/stats-report-featured.svg"
              alt={article.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </div>

      <EditorialTemplate
        content={editorialContent}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: article.title },
        ]}
      />

      {/* UP Status Decoder — special-cased widget for one specific article */}
      {slug === 'up-scholarship-status-check-2026' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-10">
          <UpStatusDecoder />
        </div>
      )}

      <Footer />
    </div>
  );
}
