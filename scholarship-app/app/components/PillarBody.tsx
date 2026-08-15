"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ListChecks, HelpCircle } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface Faq {
  q: string;
  a: string;
}

interface PillarBodyProps {
  contentHtml: string;
  headings: Heading[];
  faqs: Faq[];
  checklist: string[];
}

// A trimmed sibling of InteractiveArticleBody, for pillar/authority guides
// rather than blog-style how-to articles. Keeps the TOC, checklist and FAQ
// mechanics (still useful here) but drops the stats-report framing that
// doesn't fit a topic guide: no "Save Report as PDF", no citation-copy box
// hardcoded to /articles/ URLs, no "verify these statistics" copy.
export default function PillarBody({ contentHtml, headings, faqs, checklist }: PillarBodyProps) {
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
      let currentActive = '';
      for (const el of headingElements) {
        if (el && el.getBoundingClientRect().top <= 120) {
          currentActive = el.id;
        }
      }
      if (currentActive) setActiveHeading(currentActive);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative my-6">
      <style jsx global>{`
        @media print {
          header, footer, nav, aside, button, .print\\:hidden, #pillar-toc-sidebar {
            display: none !important;
          }
          main {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Sticky TOC Sidebar — Wiki Style */}
      {headings.length > 0 && (
        <aside id="pillar-toc-sidebar" className="hidden lg:block w-64 shrink-0 sticky top-24 max-h-[80vh] overflow-y-auto pr-4 border-r border-slate-300">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-3 pb-1 border-b border-slate-200">In This Guide</span>
          <nav className="space-y-1.5">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={`block text-xs font-medium leading-relaxed transition-all pl-2 border-l-2 hover:text-blue-700 ${
                  activeHeading === h.id
                    ? 'text-blue-800 border-blue-700 font-bold bg-slate-100 py-0.5 rounded-r'
                    : 'text-slate-600 border-transparent hover:border-slate-400'
                } ${h.level === 3 ? 'ml-3 text-[11px]' : ''}`}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </aside>
      )}

      <div className="w-full flex-1 min-w-0">
        <div
          className="prose prose-slate max-w-none prose-p:text-slate-900 prose-p:leading-relaxed prose-p:text-base prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-blue-700 prose-a:font-semibold prose-a:underline"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {checklist.length > 0 && (
          <div className="my-8 bg-slate-50 border border-slate-300 rounded-md p-5 print:page-break-inside-avoid">
            <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider border-b border-slate-200 pb-2">
              Mandatory Checklist & Requirements
            </h3>
            <ul className="space-y-2">
              {checklist.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-800 flex items-start gap-2 bg-white border border-slate-200 p-2.5 rounded">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {faqs.length > 0 && (
          <div id="faq-section" className="my-10 scroll-mt-24 border-t border-slate-200 pt-8 print:page-break-inside-avoid">

            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-google-blue" />
              <span>Frequently Asked Questions (FAQ)</span>
            </h3>
            <div className="space-y-3.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 print:border-slate-300">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="flex items-center justify-between w-full px-5 py-3.5 text-left font-bold text-xs text-slate-800 hover:bg-slate-100/50 transition-colors print:pointer-events-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform print:hidden ${openFaqs.includes(idx) ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`${openFaqs.includes(idx) ? 'block' : 'hidden'} print:block px-5 py-3.5 border-t border-slate-200 bg-white text-xs text-slate-650 leading-relaxed`}
                  >
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
