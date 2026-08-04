import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { EditorialContent } from '@/lib/editorial';
import StudyAbroadCTA from './StudyAbroadCTA';

interface Crumb {
  label: string;
  href?: string;
}

interface EditorialTemplateProps {
  content: EditorialContent;
  breadcrumbs: Crumb[];
}

const shouldShowStudyAbroadCTA = (content: EditorialContent) => {
  // Target articles about PG exams, domestic scholarships, educational loans, or careers.
  const keywords = [
    'loan', 'loans', 'pg', 'postgraduate', 'gate', 'exam', 'exams',
    'career', 'careers', 'domestic', 'scholarship', 'scholarships',
    'scheme', 'schemes', 'btech', 'engineering', 'mba', 'master',
    'masters', 'phd', 'abroad', 'overseas', 'international'
  ];
  const textToSearch = `${content.title} ${content.tag || ''} ${content.body || ''}`.toLowerCase();
  return keywords.some(keyword => textToSearch.includes(keyword));
};

// The single shared renderer for Pillars, Articles, and Portal Guides (IS-113).
// "kind" only tweaks small defaults (TOC visibility threshold) — every block below
// is conditional on the corresponding optional field being present, not on kind.
export default function EditorialTemplate({ content, breadcrumbs }: EditorialTemplateProps) {
  const showToc = content.headings.length > 0 && (content.kind === 'pillar' || content.headings.length >= 4);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b border-gray-100">
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          {breadcrumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
              {c.href ? (
                <Link href={c.href} className="hover:text-google-blue transition-colors">{c.label}</Link>
              ) : (
                <span className="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">{c.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Content-type tag — rounded pill */}
        <div className="mb-4">
          <span className="px-3 py-1 border border-[#4A47FF] bg-[#F5F6FF] text-[#4A47FF] text-[11px] font-bold uppercase tracking-wider rounded-full shadow-xs">
            {content.tag}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2E2C57] font-heading leading-tight mb-4 tracking-tight">
          {content.title}
        </h1>

        {(content.date || content.readTime || content.author) && (
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#56547A] font-medium mb-8 pb-6 border-b border-[#E2E2E8]">
            {content.date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#4A47FF]" />
                Updated {content.date}
              </span>
            )}
            {content.readTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#4A47FF]" />
                {content.readTime}
              </span>
            )}
            {content.author && <span>By {content.author}</span>}
          </div>
        )}

        {/* Key Facts — plain fact-strip, same device the Detail page uses */}
        {content.keyFacts && content.keyFacts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#E2E2E8] bg-[#F8F9FE] rounded-2xl mb-8 overflow-hidden">
            {content.keyFacts.map((f, i) => (
              <div key={i} className={`py-4 px-4 ${i > 0 ? 'border-l border-[#E2E2E8]' : ''}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#56547A] mb-1">{f.label}</p>
                <p className="text-sm font-bold text-[#2E2C57]">{f.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Takeaways — LeapScholar soft card */}
        {content.takeaways && content.takeaways.length > 0 && (
          <div className="border border-[#E2E2E8] bg-[#F8F9FE] rounded-2xl p-6 mb-8 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#4A47FF] mb-3 font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4A47FF]"></span>
              Key Takeaways
            </h2>
            <ul className="space-y-2.5">
              {content.takeaways.map((point, idx) => (
                <li key={idx} className="text-sm text-[#2E2C57] flex items-start gap-2.5 leading-relaxed font-medium">
                  <span className="font-bold text-[#4A47FF] shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* "What to Do Now" Box for News (Phase 6 / IS-115) */}
        {content.kind === 'news' && content.monetizationLink && (
          <div className="border border-blue-200 bg-blue-50/50 rounded-3xl p-6 mb-8 shadow-xs">
            <h2 className="text-sm font-bold text-blue-900 mb-2 font-heading">
              What to Do Now
            </h2>
            <p className="text-sm text-blue-800 leading-relaxed mb-4">
              An important official update has been released regarding this scholarship. Check the details, verify your eligibility, and submit your application before the deadline.
            </p>
            <Link
              href={content.monetizationLink}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs hover:shadow-md transition-all shrink-0"
            >
              Check Scholarship Details →
            </Link>
          </div>
        )}

        {/* Primary CTA for Guides (Phase 6 / IS-115) */}
        {content.kind !== 'news' && content.monetizationLink && (
          <div className="mb-8">
            <Link
              href={content.monetizationLink}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#4A47FF] hover:bg-[#3b38df] text-white font-bold text-xs hover:shadow-md transition-all shrink-0"
            >
              View Application Details & Apply →
            </Link>
          </div>
        )}

        {/* Hub links — plain list */}
        {content.hubLinks && content.hubLinks.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">{content.kind === 'pillar' ? 'Jump Straight to a Hub' : 'Related Hubs'}</h3>
            <div className="border-t border-gray-100">
              {content.hubLinks.map((link) => (
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

        {/* Official portal link, inline — not a hero CTA */}
        {content.officialUrl && (
          <div className="border border-gray-200 rounded-md p-5 mb-10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">Official Portal</h4>
              <p className="text-xs text-gray-500">This takes you to the government portal. IndiaScholarships doesn't process applications.</p>
            </div>
            <a
              href={content.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-google-blue border border-google-blue rounded-sm px-3 py-2 hover:bg-google-blue hover:text-white transition-colors shrink-0"
            >
              Visit portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {showToc && (
            <aside className="hidden lg:block w-64 shrink-0 sticky top-24 max-h-[80vh] overflow-y-auto pr-4 border-r border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-3">In This Guide</span>
              <nav className="space-y-2">
                {content.headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block text-xs font-semibold leading-relaxed pl-2.5 border-l-2 border-transparent text-gray-500 hover:text-google-blue hover:border-gray-300 transition-all ${h.level === 3 ? 'ml-3' : ''}`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </aside>
          )}

          <div className="w-full flex-1 min-w-0">
            {content.body && (
              <div
                className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-google-blue prose-a:font-semibold"
                dangerouslySetInnerHTML={{ __html: content.body }}
              />
            )}

            {shouldShowStudyAbroadCTA(content) && <StudyAbroadCTA />}

            {/* Checklist — bordered checkbox list, legitimate list-of-equal-items */}
            {content.checklist && content.checklist.length > 0 && (
              <div className="my-10 bg-gray-50 border border-gray-200 rounded-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Documents Checklist</h3>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {content.checklist.map((item, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-3 bg-white rounded-md border border-gray-200 hover:border-google-blue transition-colors cursor-pointer">
                      <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-google-blue focus:ring-google-blue" />
                      <span className="text-xs font-semibold text-gray-800 leading-normal">
                        {item.label}
                        {item.note && <span className="block text-[11px] font-normal text-gray-500 mt-0.5">{item.note}</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Steps — numbered, grouped (login vs status vs "how to find the right scheme") */}
            {content.steps && content.steps.map((group, gi) => (
              <section key={gi} className="my-10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 pb-3 border-b border-gray-100">{group.group}</h3>
                <ol className="space-y-0">
                  {group.items.map((step, i) => (
                    <li key={i} className="flex gap-4 py-3 border-b border-gray-100 last:border-b-0">
                      <span className="text-xs font-bold text-gray-400 shrink-0 w-5 pt-0.5">{i + 1}</span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">{step.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}

            {/* Featured scholarships — resolved live (Pillar cluster query) or static (Article
                mention list) by the page, template just renders the result the same way */}
            {content.featuredScholarships && content.featuredScholarships.length > 0 && (
              <div className="my-10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Featured Scholarships</h3>
                <div className="border-t border-gray-100">
                  {content.featuredScholarships.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 hover:underline transition-colors"
                    >
                      <div>
                        <span className="text-sm font-semibold text-gray-900 block">{s.title}</span>
                        {s.meta && <span className="text-xs text-gray-500">{s.meta}</span>}
                      </div>
                      {s.amount && <span className="text-xs font-bold text-gray-700 shrink-0">{s.amount}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Schemes — static curated list */}
            {content.schemes && content.schemes.length > 0 && (
              <div className="my-10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Top Schemes</h3>
                <div className="border-t border-gray-100">
                  {content.schemes.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/scholarships/${s.slug}`}
                      className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 hover:underline transition-colors"
                    >
                      <div>
                        <span className="text-sm font-semibold text-gray-900 block">{s.name}</span>
                        <span className="text-xs text-gray-500">{s.targetGroup}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700 shrink-0">{s.amount}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ — accordion */}
            {content.faqs && content.faqs.length > 0 && (
              <div className="my-10 border-t border-gray-100 pt-8">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-2">
                  {content.faqs.map((faq, idx) => (
                    <details key={idx} className="border-b border-gray-100 py-3 group">
                      <summary className="cursor-pointer text-sm font-semibold text-gray-900 list-none flex items-center justify-between">
                        {faq.q}
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="text-sm text-gray-600 leading-relaxed mt-2">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Helpline */}
            {content.helpline && (content.helpline.phone || content.helpline.email) && (
              <div className="my-10 border-t border-gray-100 pt-6 text-xs text-gray-500 leading-relaxed">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Helpline</h3>
                {content.helpline.phone && <p>{content.helpline.phone}</p>}
                {content.helpline.email && <p>{content.helpline.email}</p>}
                {content.helpline.hours && <p>{content.helpline.hours}</p>}
              </div>
            )}

            {/* Related guides — plain list, pre-resolved by the caller (page-level lookup) */}
            {content.relatedGuides && content.relatedGuides.length > 0 && (
              <div className="my-10 border-t border-gray-100 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">More on This Topic</h3>
                <div className="border-t border-gray-100">
                  {content.relatedGuides.map((g) => (
                    <Link
                      key={g.href}
                      href={g.href}
                      className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 hover:underline transition-colors"
                    >
                      <span className="text-sm font-semibold text-google-blue">{g.title}</span>
                      {g.meta && <span className="text-xs text-gray-400 shrink-0">{g.meta}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
