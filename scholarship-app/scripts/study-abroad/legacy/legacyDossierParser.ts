// One-off copy of Study-Abroad/study-abroad-app/src/lib/legacyDossierParser.ts, used only by
// scripts/study-abroad/migrate-legacy.mts. Change: text before the first heading is kept as an intro section.
/**
 * legacyDossierParser.ts
 *
 * ONE-TIME / LEGACY IMPORTER — not a format to keep authoring against.
 *
 * The Germany + USA content in `docs/playbooks/` was hand-written with an internal
 * scaffolding convention mixed into the same markdown as the real content
 * (breadcrumb notes, SEO title/meta notes, sticky-nav specs, a hardcoded Tailwind
 * infobox, raw JSON-LD). That convention was only ever meant to help a human build
 * the page — it was never meant to render. The site currently dumps the raw
 * markdown verbatim, which is why "Navigation Breadcrumb", "Target URL Route",
 * "Primary SEO Title" etc. show up as visible body text on the live site.
 *
 * This module parses that specific existing convention into a clean, typed
 * separation of "chrome" (title/meta/breadcrumb/JSON-LD — goes in <head> or a
 * dedicated component) vs. "content" (what a reader actually sees). It exists to
 * unblock the current 51 Germany + 15 USA files. Future content should be authored
 * cleanly (real YAML frontmatter + plain markdown body) and will not need this.
 *
 * Usage:
 *   const parsed = parseDossierMarkdown(rawMarkdownString);
 *   // parsed.seoTitle      -> <title>
 *   // parsed.metaDescription -> <meta name="description">
 *   // parsed.breadcrumb    -> breadcrumb component
 *   // parsed.verified      -> the plain "Last verified..." line
 *   // parsed.whoIsThisFor  -> italic subtitle under H1
 *   // parsed.infobox       -> infobox component (if the dossier had one)
 *   // parsed.toc           -> auto-generated from real ## headings (not the hand-typed sticky bar)
 *   // parsed.sections      -> body sections, chrome blocks already stripped
 *   // parsed.faq           -> extracted Q/A pairs (for FAQPage schema + rendering)
 *   // parsed.related       -> footer "related/next" links, cleaned of emoji/blockquote formatting
 *   // parsed.jsonLd        -> any hand-authored JSON-LD found in the source (legacy — prefer
 *   //                         generating FAQPage schema from parsed.faq instead of trusting this)
 *   // parsed.warnings      -> anything the parser couldn't confidently classify — surface these,
 *   //                         don't silently drop unrecognized content
 */

export interface BreadcrumbItem {
  label: string;
  href: string | null; // null = current page (not a link)
}

export interface InfoboxRow {
  key: string;
  value: string;
  emphasis: boolean; // true if the source styled this value as a "success"/highlight color
}

export interface Infobox {
  title: string | null;
  rows: InfoboxRow[];
}

export interface TocItem {
  id: string;
  label: string;
  depth: number; // 2 = "##", 3 = "###"
}

export interface BodySection {
  id: string;
  heading: string;
  depth: number;
  html: string; // markdown left as-is for the existing markdown renderer to handle
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface RelatedLink {
  label: string;
  href: string;
}

export interface VerifiedInfo {
  date: string | null;
  against: string | null; // e.g. "USCIS (USA), DAAD / KMK (Germany), VFS Global"
  parentAdvisory: string | null; // the "*Parent Advisory: ...*" sentence, if present — genuinely reader-useful
}

export interface OtherMeta {
  label: string;
  value: string;
}

export interface ParsedDossier {
  title: string; // cleaned display title, emoji + internal code prefix stripped
  rawTitle: string; // the original H1 line, unmodified, for debugging
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalPath: string | null; // from "Target URL Route" — used for <link rel="canonical">, never shown
  breadcrumb: BreadcrumbItem[];
  whoIsThisFor: string | null;
  verified: VerifiedInfo;
  infobox: Infobox | null;
  toc: TocItem[];
  sections: BodySection[];
  faq: FaqItem[];
  related: RelatedLink[];
  jsonLd: unknown[]; // legacy hand-authored JSON-LD, if any — treat as reference only
  otherMeta: OtherMeta[]; // catch-all for labeled blockquotes not explicitly modeled above —
                          // captured so nothing is lost, but never rendered as body text
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Strips leading emoji/flag glyphs and markdown bold markers from a line. */
function stripLeadingEmoji(line: string): string {
  // Flag emoji (e.g. 🇩🇪) are pairs of Regional_Indicator code points, a different
  // Unicode category from Extended_Pictographic — both need covering, plus the
  // zero-width-joiner/variation-selector glue characters some emoji sequences use.
  return line
    .replace(/^[\p{Extended_Pictographic}\p{Regional_Indicator}‍️\s]+/gu, '')
    .trim();
}

function stripMd(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .trim();
}

// ---------------------------------------------------------------------------
// Block extractors — each removes its match from the working buffer and
// returns the parsed value, so leftover text is guaranteed chrome-free.
// ---------------------------------------------------------------------------

/**
 * Strips the "University Dossier: ", "Scholarship Dossier: ", "Playbook DE-X-01: "
 * editorial prefixes from a title string. Exported standalone (not just used
 * inside extractTitle) so callers with only a raw entity.title on hand — e.g. a
 * peer entity fetched for a comparison table, where parsing the full markdown_body
 * would be wasteful — can still get a clean display title without a full parse.
 */
export function stripDossierTitlePrefix(rawTitle: string): string {
  return stripLeadingEmoji(rawTitle)
    .replace(/^(Playbook\s+[A-Z]{2}-[A-Z]+-\d+[A-Z]?:\s*|University Dossier:\s*|Scholarship Dossier:\s*)/i, '')
    // author-only editorial notes (e.g. "%% should we add screenshots %%") that
    // sometimes survive at the end of a raw DB title column
    .replace(/\s*%%[\s\S]*?%%\s*/g, ' ')
    .trim();
}

function extractTitle(md: string): { title: string; rawTitle: string; rest: string } {
  const match = md.match(/^#\s+(.+)$/m);
  if (!match) {
    return { title: 'Untitled', rawTitle: '', rest: md };
  }
  const rawTitle = match[1].trim();
  const rest = md.slice(match.index! + match[0].length);

  const title = stripDossierTitlePrefix(rawTitle);

  return { title, rawTitle, rest };
}

/**
 * The current-page breadcrumb segment is written as bold plain text, e.g.
 * "**US-TOOL-01 WES GPA Calculator**" — no link, so it never passes through
 * rewriteInternalLinks' label humanization at all. Strip a leading internal code
 * prefix ("US-TOOL-01 ", "DE-CHOOSE-02: ") from plain text so it doesn't leak.
 */
function stripLeadingCodePrefix(text: string): string {
  return text.replace(/^(DE|US)-[A-Z]+-\d+[A-Z]?:?\s+/, '').trim();
}

function extractBreadcrumb(md: string): { breadcrumb: BreadcrumbItem[]; rest: string } {
  const match = md.match(/^>\s*\*\*Navigation Breadcrumb\*\*:\s*(.+)$/m);
  if (!match) return { breadcrumb: [], rest: md };

  const line = match[1];
  const rest = md.slice(0, match.index!) + md.slice(match.index! + match[0].length);

  // Segments are separated by ">" outside of link brackets/backticks.
  const rawSegments = line.split(/\s*>\s*/).map((s) => s.trim()).filter(Boolean);
  const breadcrumb: BreadcrumbItem[] = rawSegments.map((seg) => {
    const linkMatch = seg.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return { label: stripMd(linkMatch[1]), href: linkMatch[2] };
    }
    return { label: stripLeadingCodePrefix(stripMd(seg)), href: null };
  });

  return { breadcrumb, rest };
}

function extractLabeledLine(md: string, label: string): { value: string | null; rest: string } {
  const re = new RegExp(`^>\\s*\\*\\*${label}\\*\\*:\\s*(.+)$`, 'm');
  const match = md.match(re);
  if (!match) return { value: null, rest: md };
  const rest = md.slice(0, match.index!) + md.slice(match.index! + match[0].length);
  // Values are often wrapped in backticks and/or trailed with a parenthetical note.
  const value = stripMd(match[1].replace(/\s*\([^)]*\)\s*$/, '')).trim();
  return { value, rest };
}

function extractWhoIsThisFor(md: string): { value: string | null; rest: string } {
  const match = md.match(/^>\s*\*\*Who is this guide for\?\*\*\s*\n((?:>.*\n?)+)/m);
  if (!match) return { value: null, rest: md };
  const rest = md.slice(0, match.index!) + md.slice(match.index! + match[0].length);
  const value = match[1]
    .split('\n')
    .map((l) => l.replace(/^>\s?/, '').trim())
    .filter(Boolean)
    .join(' ');
  return { value: stripMd(value), rest };
}

function extractVerified(md: string): { verified: VerifiedInfo; rest: string } {
  const sectionMatch = md.match(/^##\s*🟢?\s*YMYL E-E-A-T Trust.*$\n((?:>.*\n?)+)/m);
  if (!sectionMatch) {
    return { verified: { date: null, against: null, parentAdvisory: null }, rest: md };
  }
  const rest = md.slice(0, sectionMatch.index!) + md.slice(sectionMatch.index! + sectionMatch[0].length);
  const block = sectionMatch[1];

  const dateMatch = block.match(/Last Verified:\s*([^|*]+)/i);
  // Non-greedy up to a period ONLY when it's a true sentence end (followed by
  // whitespace/end-of-string), not an abbreviation like "uni-assist e.V." —
  // a bare "." would stop at the first embedded period and truncate the citation.
  const againstMatch = block.match(/Verified against(?: official)?\s*(.+?)(?:\.(?=\s|$)|\n)/i);
  const advisoryMatch = block.match(/\*([^*]*Advisory:[^*]*)\*/i);

  return {
    verified: {
      date: dateMatch ? stripMd(dateMatch[1]).trim() : null,
      against: againstMatch ? stripMd(againstMatch[1]).trim() : null,
      parentAdvisory: advisoryMatch ? stripMd(advisoryMatch[1].replace(/^[^:]*:\s*/, '')).trim() : null,
    },
    rest,
  };
}

function extractStickyNavSection(md: string): { rest: string } {
  // "## 📌 Mobile Hero & Sticky Anchor Navigation" ... up to the next "---" or "##"
  const re = /^##\s*📌?\s*Mobile Hero.*$\n(?:.*\n)*?(?=^---|^##)/m;
  const rest = md.replace(re, '');
  return { rest };
}

function extractInfobox(md: string): { infobox: Infobox | null; rest: string } {
  // Matches the hardcoded Tailwind fact-block div and every row inside it.
  const divMatch = md.match(/<div class="bg-\[#F8F9FE\][\s\S]*?<\/div>\s*(?=\n---|\n##|\n\n)/);
  if (!divMatch) return { infobox: null, rest: md };

  const block = divMatch[0];
  const rest = md.slice(0, divMatch.index!) + md.slice(divMatch.index! + block.length);

  const rowRe = /<p class="[^"]*text-ink-soft">([^<]+)<\/p>\s*<p class="[^"]*(text-ink-success)?[^"]*">([^<]+)<\/p>/g;
  const rows: InfoboxRow[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(block)) !== null) {
    rows.push({ key: m[1].trim(), value: m[3].trim(), emphasis: Boolean(m[2]) });
  }

  // Try to recover the enclosing section heading as the infobox title, e.g.
  // "## <a id="overview"></a>1. University Overview & Key Financial Facts"
  const headingBefore = md.slice(0, divMatch.index!).match(/##[^\n]*\n\s*$/);
  const title = headingBefore
    ? stripMd(headingBefore[0].replace(/^##\s*(<a[^>]*><\/a>)?\s*\d*\.?\s*/, '')).trim()
    : null;

  return { infobox: rows.length ? { title, rows } : null, rest };
}

function extractJsonLd(md: string): { jsonLd: unknown[]; rest: string } {
  const jsonLd: unknown[] = [];
  const rest = md.replace(/```(?:json)?\s*([\s\S]*?)```/g, (full, body) => {
    try {
      const parsed = JSON.parse(body);
      const isSchemaOrg =
        parsed?.['@context']?.toString().includes('schema.org') ||
        parsed?.['@graph']?.some?.((n: { '@context'?: string }) => n?.['@context']?.toString().includes('schema.org'));
      const isComponentSlot = parsed?.component; // e.g. ProgramListingGrid — not our concern here, leave untouched
      if (isSchemaOrg) {
        jsonLd.push(parsed);
        return ''; // strip from body
      }
      if (isComponentSlot) {
        return full; // leave dynamic component slots exactly as-is
      }
      return full;
    } catch {
      return full; // not valid JSON (e.g. a plain code sample) — leave untouched
    }
  });
  return { jsonLd, rest };
}

function extractFaq(md: string): { faq: FaqItem[]; rest: string } {
  const faq: FaqItem[] = [];
  // Tolerant of an anchor tag (`<a id="faqs"></a>`), a numbered prefix ("5."), and a
  // trailing parenthetical ("(FAQs)") — all seen across different files in the corpus.
  // NOTE: a bare "$" here is unsafe — with the /m flag it matches before ANY line
  // break (e.g. a blank line right after the heading, which this corpus uses
  // constantly), so a lazy capture stops immediately and grabs nothing. Use
  // "(?![\s\S])" for "true end of string" instead.
  const sectionRe = /^##\s*(?:<a[^>]*><\/a>\s*)?(?:\d+\.\s*)?Frequently Asked Questions.*$\n([\s\S]*?)(?=\n^##\s|\n^---\s*$|(?![\s\S]))/m;
  const sectionMatch = md.match(sectionRe);
  if (!sectionMatch) return { faq, rest: md };

  const block = sectionMatch[1];
  const qaRe = /^###\s*Q\d*:?\s*(.+?)\n([\s\S]*?)(?=\n^###\s|(?![\s\S]))/gm;
  let m: RegExpExecArray | null;
  while ((m = qaRe.exec(block)) !== null) {
    faq.push({ q: stripMd(m[1]).trim(), a: stripMd(m[2].trim()) });
  }

  const rest = md.slice(0, sectionMatch.index!) + md.slice(sectionMatch.index! + sectionMatch[0].length);
  return { faq: dedupeFaq(faq), rest };
}

/**
 * The source corpus has at least one confirmed case of an entire FAQ block being
 * pasted twice into the same file (DE-UNI-tum-technical-university-munich.md — a
 * content-authoring bug, not a parsing artifact). Deduping identical Q/A pairs here
 * is a cheap safeguard regardless of source quality; it does not mask the underlying
 * issue, which still needs fixing at the source and is worth a corpus-wide sweep.
 */
function dedupeFaq(items: FaqItem[]): FaqItem[] {
  const seen = new Set<string>();
  const out: FaqItem[] = [];
  for (const item of items) {
    const key = item.q.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function extractRelated(md: string): { related: RelatedLink[]; rest: string } {
  const related: RelatedLink[] = [];

  // "> ⏭️ **Next Playbook in Series**: \n> Read **[Label](href)** ..."
  const nextRe = /^>\s*⏭️?\s*\*\*Next (?:Playbook|Module) in Series\*\*:\s*\n>\s*.*?\[([^\]]+)\]\(([^)]+)\)/gm;
  let m: RegExpExecArray | null;
  while ((m = nextRe.exec(md)) !== null) {
    related.push({ label: stripMd(m[1]), href: m[2] });
  }
  let rest = md.replace(nextRe, '');

  // "> ⏭️ **Return to Master Directory**: [Label](href) | [Label2](href2)" — a
  // third variant seen on entity dossier files (universities/scholarships),
  // distinct from the stage-guide "Next Playbook" and "Related Stage" patterns.
  const returnRe = /^>\s*⏭️?\s*\*\*Return to Master Directory\*\*:\s*(.+)$/m;
  const returnMatch = rest.match(returnRe);
  if (returnMatch) {
    const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
    let rm: RegExpExecArray | null;
    while ((rm = linkRe.exec(returnMatch[1])) !== null) {
      related.push({ label: stripMd(rm[1]), href: rm[2] });
    }
    rest = rest.slice(0, returnMatch.index!) + rest.slice(returnMatch.index! + returnMatch[0].length);
  }

  // "## 🔗 Related Stage Playbooks & Directories" footer list
  // Same "true end of string" fix as extractFaq's sectionRe — see note there.
  const footerMatch = rest.match(/^##\s*🔗?\s*Related Stage Playbooks.*$\n([\s\S]*?)(?=\n^##\s|(?![\s\S]))/m);
  if (footerMatch) {
    const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lm: RegExpExecArray | null;
    while ((lm = linkRe.exec(footerMatch[1])) !== null) {
      related.push({ label: stripMd(lm[1]), href: lm[2] });
    }
    rest = rest.slice(0, footerMatch.index!) + rest.slice(footerMatch.index! + footerMatch[0].length);
  }

  // The 4 recognized patterns above (Next Playbook, Return to Master Directory,
  // Related Stage Playbooks) aren't mutually exclusive within a single file, so
  // the same link can legitimately get captured twice — dedupe by href.
  const seenHrefs = new Set<string>();
  const dedupedRelated = related.filter((r) => {
    if (seenHrefs.has(r.href)) return false;
    seenHrefs.add(r.href);
    return true;
  });

  return { related: dedupedRelated, rest };
}

function buildSectionsAndToc(md: string): { sections: BodySection[]; toc: TocItem[] } {
  const lines = md.split('\n');
  const sections: BodySection[] = [];
  const toc: TocItem[] = [];

  let current: BodySection | null = null;
  const seenIds = new Set<string>();

  const flush = () => {
    if (current) sections.push(current);
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(###|##)\s*(?:<a[^>]*><\/a>)?\s*(.+)$/);
    if (headingMatch) {
      flush();
      const depth = headingMatch[1].length;
      const heading = stripMd(headingMatch[2].replace(/^\d+\.\s*/, '')).trim();
      let id = slugify(heading);
      let n = 2;
      while (seenIds.has(id)) id = `${slugify(heading)}-${n++}`;
      seenIds.add(id);

      current = { id, heading, depth, html: '' };
      if (depth === 2 || depth === 3) toc.push({ id, label: heading, depth });
      continue;
    }
    // Text before the first heading is the article's intro; keep it as a heading-less section
    if (!current) current = { id: 'intro', heading: '', depth: 0, html: '' };
    current.html += line + '\n';
  }
  flush();

  return { sections, toc };
}

// ---------------------------------------------------------------------------
// Internal link rewriting — .md filenames in link hrefs (and internal-code link
// text like "DE-WORK-03") are meaningless/broken once shipped to the live site.
// This resolves them to the clean URL scheme that matches actual Next.js routes:
//   /study-in/{country}/{country}-{slug}   for stage / hub / exam / tool guides
//   /universities/{slug}                   for university dossiers (DE-UNI-*)
//   /scholarships/{slug}                   for scholarship dossiers (DE-SCHOL-*)
//   /visas/{slug}                          for visa guides (DE-VISA-*)
//   /study-in/{country}                    for country portal home files
//
// IMPORTANT: Do NOT include the Next.js basePath (/study-abroad) in these hrefs.
// Next.js Link prepends basePath automatically; adding it manually produces the
// double /study-abroad/study-abroad/ bug visible in the browser URL bar.
//
// Slug generation mirrors sync-all-playbooks-to-db.js cleanSlugFromFilename() so
// generated hrefs match what is actually stored in the database.
// ---------------------------------------------------------------------------

// The 4 DE-COMP-* files retired and merged during the fold-in pass — hardcoded
// redirect destinations using the corrected slug + route scheme above.
const COMP_MAP: Record<string, { route: string; anchor: string | null }> = {
  '01': { route: '/study-in/germany/germany-blocked-account-manual', anchor: 'provider-comparison' },
  '02': { route: '/study-in/germany/germany-public-vs-private', anchor: null },
  '03': { route: '/study-in/germany/germany-top-public-unis-profiles', anchor: 'tum-vs-rwth-aachen-head-to-head' },
  '04': { route: '/study-in/germany/germany-education-loans-germany', anchor: null },
};

function countryWord(code: 'DE' | 'US'): 'germany' | 'usa' {
  return code === 'DE' ? 'germany' : 'usa';
}

// Domain acronyms that must render fully uppercase, not title-cased — the old
// "leave short words as-is" heuristic produced "aps Certificate Guide" and
// "Ects Credit Mapping" instead of "APS Certificate Guide" / "ECTS Credit Mapping".
const KNOWN_ACRONYMS = new Set([
  'aps', 'ects', 'gre', 'gmat', 'ielts', 'toefl', 'gpa', 'cgpa', 'daad', 'vfs',
  'uscis', 'sevis', 'sevp', 'tcs', 'lrs', 'rbi', 'ms', 'phd', 'tu', 'kit', 'tum',
  'rwth', 'faq', 'faqs', 'eu', 'us', 'usa', 'uk', 'stem', 'opt', 'cpt', 'f1',
  'i20', 'ds160', 'eb2', 'niw', 'sbi', 'hdfc', 'nbfc', 'wg', 'wes', 'pr', 'lrs',
  'tcs', 'ects', 'aps', 'vpd', 'tum', 'rwth', 'daad', 'kmk',
]);
// Small words that stay lowercase mid-title (but not as the first word).
const LOWERCASE_MIDWORDS = new Set(['of', 'a', 'an', 'the', 'in', 'on', 'for', 'vs', 'and', 'to']);

function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((w, i) => {
      if (KNOWN_ACRONYMS.has(w.toLowerCase())) return w.toUpperCase();
      if (i > 0 && LOWERCASE_MIDWORDS.has(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

const SLUG_ALIASES: Record<string, string> = {
  'purdue': 'purdue-university',
  'lmu-munich': 'lmu-munich-ludwig-maximilian',
  'asu-arizona-state-university': 'arizona-state-university',
  'uic-university-of-illinois-chicago': 'university-of-illinois-chicago',
  'sjsu-san-jose-state-university': 'san-jose-state-university',
  'gmu-george-mason-university': 'george-mason-university',
  'fulbright-nehru': 'fulbright-nehru-masters-fellowship',
  'fulbright-nehru-masters-fellowships': 'fulbright-nehru-masters-fellowship',
  'fulbright-nehru-doctoral-research-fellowships': 'fulbright-nehru-masters-fellowship',
  'jn-tata-endowment': 'jn-tata-endowment-loan-scholarship',
  'jn-tata-endowment-scholarship': 'jn-tata-endowment-loan-scholarship',
  'jn-tata-endowment-for-higher-education': 'jn-tata-endowment-loan-scholarship',
  'erasmus-mundus-joint-masters-scholarships': 'erasmus-mundus-joint-masters',
  'expatrio-vs-fintiba': 'expatrio-vs-fintiba-vs-coracle',
};

interface LinkResolution {
  href: string | null; // null = could not resolve, leave original href
  humanLabel: string | null; // null = keep original label as-is
}

function resolveInternalLink(rawHref: string): LinkResolution {
  if (!rawHref.endsWith('.md')) return { href: null, humanLabel: null };
  const filename = rawHref.split('/').pop()!;

  let m: RegExpMatchArray | null;

  // University dossier: DE-UNI-tum-technical-university-munich.md
  // → /universities/tum-technical-university-munich
  m = filename.match(/^(DE|US)-UNI-(.+)\.md$/i);
  if (m) {
    let slug = m[2].toLowerCase();
    slug = SLUG_ALIASES[slug] || slug;
    return { href: `/universities/${slug}`, humanLabel: humanizeSlug(slug) };
  }

  // Scholarship dossier: DE-SCHOL-daad-research-grants-germany.md
  // → /scholarships/daad-research-grants-germany
  m = filename.match(/^(DE|US)-SCHOL-(.+)\.md$/i);
  if (m) {
    let slug = m[2].toLowerCase();
    slug = SLUG_ALIASES[slug] || slug;
    return { href: `/scholarships/${slug}`, humanLabel: humanizeSlug(slug) };
  }

  // Retired comparison pages: DE-COMP-01-expatrio-vs-fintiba.md
  // Merged into specific guide pages during the fold-in pass.
  m = filename.match(/^DE-COMP-(\d+)-.+\.md$/i);
  if (m && COMP_MAP[m[1]]) {
    const { route, anchor } = COMP_MAP[m[1]];
    const slugPart = route.split('/').pop()!;
    return {
      href: `${route}${anchor ? `#${anchor}` : ''}`,
      humanLabel: humanizeSlug(slugPart),
    };
  }

  // All numbered guide files: DE-CHOOSE-02-public-vs-private.md,
  // DE-HUB-05-daad-scholarship-master-guide.md, DE-VISA-01-..., etc.
  // Mirrors cleanSlugFromFilename() in sync-all-playbooks-to-db.js — the slug
  // strips the "{CC}-{STAGE}-{NN}-" prefix and prepends the country name so the
  // generated href matches what is stored in the database.
  m = filename.match(/^(DE|US)-([A-Z]+)-(\d+[A-Z]?)-(.+)\.md$/i);
  if (m) {
    const cc = m[1].toUpperCase() as 'DE' | 'US';
    const stageCode = m[2].toUpperCase();
    const rawSlug = m[4].toLowerCase();
    const country = countryWord(cc);

    // Visa guides render at /visas/{slug} — their entity_type is 'visa_guide'
    if (stageCode === 'VISA') {
      // sync script does NOT add country prefix when slug already starts with country
      const slug = rawSlug.startsWith(`${country}-`) ? rawSlug : `${country}-${rawSlug}`;
      return { href: `/visas/${slug}`, humanLabel: humanizeSlug(rawSlug) };
    }

    // All other stage/hub/exam/tool guides: /study-in/{country}/{country}-{rawSlug}
    // (sync script adds "{country}-" prefix to guide slugs so they're globally unique)
    const fullSlug = rawSlug.startsWith(`${country}-`) ? rawSlug : `${country}-${rawSlug}`;
    return { href: `/study-in/${country}/${fullSlug}`, humanLabel: humanizeSlug(rawSlug) };
  }

  // Country portal home: GERMANY_MINISITE_HOME.md / USA_MINISITE_HOME.md
  m = filename.match(/^(GERMANY|USA)_MINISITE_HOME\.md$/i);
  if (m) {
    const country = m[1].toLowerCase();
    return {
      href: `/study-in/${country}`,
      humanLabel: country.charAt(0).toUpperCase() + country.slice(1),
    };
  }

  return { href: null, humanLabel: null }; // e.g. *_PLAYBOOK_TRACKER.md — an internal ops
                                            // file that should never be linked from a live
                                            // page; left unresolved and flagged
}

function rewriteInternalLinks(md: string, warnings: string[]): string {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  return md.replace(linkRe, (full, label: string, href: string) => {
    if (!href.endsWith('.md')) return full; // already a clean/external URL — leave alone
    const resolved = resolveInternalLink(href);
    if (!resolved.href) {
      warnings.push(`Internal link to "${href}" could not be resolved to a clean URL — left as a broken relative link; needs a manual mapping decision.`);
      return full;
    }
    // Only replace the label if it looks like a bare internal code (e.g. "DE-WORK-03"),
    // not when it's already genuine descriptive text (e.g. "APS Certificate Guide").
    // Covers three internal-naming patterns seen in link text across the corpus:
    // a bare code ("DE-WORK-03"), a code followed by more words ("DE-HUB-01 Listing
    // Hub" — this is what was leaking into breadcrumbs), and an ALL_CAPS_UNDERSCORE
    // file-style name ("GERMANY_MINISITE_HOME").
    const looksLikeInternalName =
      /^(DE|US)-[A-Z]+-?\d*[A-Z]?(\s|$)/.test(label.trim()) ||
      /^[A-Z][A-Z0-9_]{3,}$/.test(label.trim());
    const finalLabel = looksLikeInternalName && resolved.humanLabel ? resolved.humanLabel : label;
    return `[${finalLabel}](${resolved.href})`;
  });
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Author-only editorial notes wrapped in `%% ... %%` — scattered throughout
 * the corpus in H1 titles, headings, and inline body text (e.g. "%% expand
 * this later %%"). Never rendered to readers. Stripped as the very first
 * pass so every downstream extractor (title, headings, body) sees clean text
 * rather than needing its own special case.
 */
function stripEditorialNotes(md: string): string {
  return md
    .replace(/%%[\s\S]*?%%/g, '')
    // collapse whitespace left behind by an inline removal (e.g. "Title  for X")
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    // collapse blank lines left behind by a standalone note line
    .replace(/\n{3,}/g, '\n\n');
}

import { convertAsciiTablesAndSteps } from "./asciiTransformer.ts";

export function parseDossierMarkdown(raw: string): ParsedDossier {
  const warnings: string[] = [];
  let md = stripEditorialNotes(raw);
  md = convertAsciiTablesAndSteps(md);

  const t = extractTitle(md);
  md = t.rest;

  // Rewrite internal .md links to clean site URLs before anything else parses them,
  // so breadcrumb, body, FAQ, and related-links all pick up resolved hrefs uniformly.
  md = rewriteInternalLinks(md, warnings);

  const bc = extractBreadcrumb(md);
  md = bc.rest;

  // "Target URL Route" is the common label; "Target Route" is a variant seen on
  // hub/home files — handle both rather than let the variant leak through.
  let canonical = extractLabeledLine(md, 'Target URL Route');
  md = canonical.rest;
  if (!canonical.value) {
    canonical = extractLabeledLine(md, 'Target Route');
    md = canonical.rest;
  }

  const seoTitle = extractLabeledLine(md, 'Primary SEO Title');
  md = seoTitle.rest;

  const metaDesc = extractLabeledLine(md, 'Meta Description');
  md = metaDesc.rest;

  const whoFor = extractWhoIsThisFor(md);
  md = whoFor.rest;

  md = extractStickyNavSection(md).rest;

  const verified = extractVerified(md);
  md = verified.rest;

  const infobox = extractInfobox(md);
  md = infobox.rest;

  const jsonLdRes = extractJsonLd(md);
  md = jsonLdRes.rest;

  const faqRes = extractFaq(md);
  md = faqRes.rest;

  const relatedRes = extractRelated(md);
  md = relatedRes.rest;

  // Generic catch-all: ANY remaining single-line "> **Label**: value" blockquote is
  // internal scaffolding by convention in this corpus (every genuine reader-facing
  // blockquote — "Who is this guide for?", the Parent Advisory sentence — is already
  // consumed above). Strip every one of these from the body and capture the label/value
  // pair instead, so a label we didn't anticipate can never leak through as visible text.
  const otherMeta: OtherMeta[] = [];
  const genericLabelRe = /^>\s*\*\*([A-Z][^*]{2,60})\*\*:\s*(.+)$/gm;
  let strayMatch: RegExpExecArray | null;
  while ((strayMatch = genericLabelRe.exec(md)) !== null) {
    const label = strayMatch[1].trim();
    otherMeta.push({ label, value: stripMd(strayMatch[2]).trim() });
    warnings.push(`Unhandled labeled blockquote "${label}" was stripped from the body via the generic catch-all — review otherMeta and consider adding it as a named field if it recurs.`);
  }
  md = md.replace(genericLabelRe, '');

  // Strip now-empty horizontal rules and collapse resulting blank-line runs.
  md = md.replace(/^---\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();

  let { sections, toc } = buildSectionsAndToc(md);

  // A heading whose only content was the infobox fact-block (or any other chrome
  // block extracted earlier) is left with nothing underneath — a dangling heading
  // with an empty body reads as broken, not as "see the infobox." Drop it rather
  // than render it. (If a heading is legitimately meant to introduce the infobox,
  // that intent is better expressed by putting the infobox where the heading was,
  // which is a template-layer decision, not something to fake here.)
  const droppedEmpty = sections.filter((s) => s.html.trim().length === 0).map((s) => s.heading);
  sections = sections.filter((s) => s.html.trim().length > 0);
  toc = toc.filter((t) => !droppedEmpty.includes(t.label));
  if (droppedEmpty.length) {
    warnings.push(`Dropped ${droppedEmpty.length} empty section(s) with nothing left under the heading after chrome extraction: ${droppedEmpty.join(', ')}`);
  }

  // Defense in depth: the corpus is not consistent about how FAQ questions are
  // headed (nested "### Q1:" under a wrapper vs. sibling "### Q:" sections that
  // extractFaq's wrapper regex might still miss in some file). Any section whose
  // heading is clearly a question ("Q:" / "Q1:" prefix) that slipped through as a
  // generic body section gets reclassified here instead of rendering as a random
  // TOC entry.
  const strayFaq: FaqItem[] = [];
  sections = sections.filter((s) => {
    const qMatch = s.heading.match(/^#*\s*Q\d*:?\s*(.+)$/i);
    if (qMatch && s.heading.length < 200) {
      strayFaq.push({ q: qMatch[1].trim(), a: stripMd(s.html.trim()) });
      return false;
    }
    return true;
  });
  if (strayFaq.length) {
    faqRes.faq.push(...strayFaq);
    toc = toc.filter((item) => !strayFaq.some((f) => slugify(f.q) === item.id || item.label.includes(f.q)));
    warnings.push(`${strayFaq.length} FAQ question(s) were found outside the expected "Frequently Asked Questions" wrapper and reclassified automatically — spot-check the FAQ output for this file.`);
  }

  return {
    title: t.title,
    rawTitle: t.rawTitle,
    seoTitle: seoTitle.value,
    metaDescription: metaDesc.value,
    canonicalPath: canonical.value,
    breadcrumb: bc.breadcrumb,
    whoIsThisFor: whoFor.value,
    verified: verified.verified,
    infobox: infobox.infobox,
    toc,
    sections,
    faq: dedupeFaq(faqRes.faq), // final dedupe covers both the wrapper-matched path
                                 // (already deduped in extractFaq) and the stray-Q
                                 // fallback path (which pushes without deduping) —
                                 // safe to run twice, dedupeFaq is idempotent
    related: relatedRes.related,
    jsonLd: jsonLdRes.jsonLd,
    otherMeta,
    warnings,
  };
}
