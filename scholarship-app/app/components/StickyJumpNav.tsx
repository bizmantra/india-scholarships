import React from 'react';

export function StickyJumpNav() {
  const items = [
    { label: 'Overview', href: '#overview' },
    { label: 'Eligibility', href: '#eligibility' },
    { label: 'Documents', href: '#documents-required' },
    { label: 'Dates', href: '#last-date' },
    { label: 'How to Apply', href: '#apply-online' },
    { label: 'FAQs', href: '#faqs' },
  ];

  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur-md border-y border-slate-200 py-2.5 px-4 mb-6 -mx-4 sm:mx-0 overflow-x-auto flex gap-2 no-scrollbar z-30">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full whitespace-nowrap border border-slate-300 hover:bg-blue-50 hover:text-blue-700 transition"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
