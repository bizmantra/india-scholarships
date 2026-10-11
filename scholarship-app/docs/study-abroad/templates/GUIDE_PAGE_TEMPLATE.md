# Guide Page Template

`/study-abroad/study-in/{country}/{slug}`, stored in `sa_guides` with `kind = 'guide'`. Shared rules: [README.md](README.md). Links: [LINKING_RULES.md](LINKING_RULES.md) (Guide).

**The reader:** a student (and often a parent) at one step of the process with one practical question: how do I open a blocked account, how does Uni-Assist work, how do I convert my CGPA.

**The job of the page:** answer that question completely, step by step, with official sources, better than the official site does for an Indian applicant. Each guide owns one search topic.

**Today (audit, 11 Oct 2026):** 93 guides, median about 600 words. "Executive Summary" headings on 130 pages, titles with "Operational Manual", "Master Manual" and "Hacks". 30 guides have never appeared in Google. Only 3 of 108 guide, visa and loan pages record an official source; none records a checked date. At least 12 topics have two or more competing guides.

## Before writing: does this guide earn its place?

A guide is kept only if all three are true:

1. **One clear search topic** that no other page owns (check the overlap list in the audit and IS-149).
2. **Demand:** the topic appears in keyword data or Search Console, or it is a necessary step that a university, course or visa page links to.
3. **Official sources exist** for its facts.

Otherwise merge it into the owner page or a university/country page, and redirect.

## Sections

Guides vary more than other page types, so the structure is a pattern, not fixed headings.

| # | Part | Content |
|---|---|---|
| 1 | **The short answer** | 2–4 sentences answering the main question directly, with the key number or rule. Heading written as the question or topic, never "Executive Summary". |
| 2 | **At a glance** (if there are key facts) | Small table: amounts, times, fees, deadlines, each with source. |
| 3 | **Step by step** (for process guides) | Numbered steps, each with what to do, what you need, how long it takes, and common mistakes Indian applicants make (only where documented by an official source or clearly evident from the official process). |
| 4 | **Details by situation** | Variations that change the answer: degree length, intake, provider, state, etc. |
| 5 | **What to do next** | One or two sentences linking to the next step's owner page. |
| 6 | **FAQs** | 4–6 as people search them. |
| 7 | **Sources** | All official links with check dates. |

**Length:** what the question needs; usually 900–1,800 words for a process guide, 600–1,000 for a narrow rule.

## Fields (`sa_guides`)

`title` (plain, under 65 with brand appended by the layout), `summary` (under 200 characters), `seo_title`, `meta_description`, `who_for` (one line: "Indian students applying to German universities through Uni-Assist"), `infobox_json` (section 2), `body_md`, `faq_json`, `related_json` (max 5, same stage and country), `official_source` (main source), `checked_at`.

## Search

- Title states the topic in the words people search: "Blocked Account in Germany for Indian Students: €11,904 Explained", not "Blocked Account Operational Manual".
- One main query per guide; supporting questions become FAQs or H2s.

## Checklist

- [ ] Passes the "earns its place" test
- [ ] Short answer first; no "Executive Summary", "Manual", "Hacks"
- [ ] Every number sourced; `official_source` and `checked_at` filled
- [ ] Names of universities, courses, tools and scholarships link to their pages
- [ ] No closing list of more than 5 related links
