# Task brief: UK MSc Computer Science and Data Science course pages

Written 2026-11-04. For the Grok bots (or any research-and-draft agent). Read `plans/grok-bot-brief.md` first for the standing rules. This file is the task.

## Goal

Draft hidden UK course pages for **MSc Computer Science** and **MSc Data Science** (and the closest named equivalent) at the 12 UK universities, so an Indian student can check entry rules, total cost, deadlines and how to apply on one page. Up to 24 pages. You **propose**; the owner approves each page. Nothing goes live: the UK stays hidden (`launched: false`) until the hub page ships.

## What is already done (do not redo)

- UK visa, cost and 12 university pages are approved as hidden drafts.
- The 11 MBA course pages are approved. **They are the style model.** Copy their structure and tone: `scripts/study-abroad/proposals/uk-course-*-mba-2026-11-03.json`.
- First-pass research for CS and DS already exists in `plans/uk-research/round5/<university>.md` (course pages read on 2026-11-03) and `plans/uk-research/uk-gaps-round3.md`, `uk-gaps-round4.md`. Many rows are marked NOT CONFIRMED. Start there.
- Shared facts and the health surcharge note: `plans/uk-research/uk-visa-facts.md`, `plans/uk-research/uk-surcharge-note.md`.

## The 12 universities

Birmingham, Coventry, Edinburgh, Glasgow, Leeds, Manchester, Newcastle, Nottingham, Sheffield, Southampton, UCL, Warwick. Slugs: `university-of-birmingham`, `coventry-university`, `university-of-edinburgh`, `university-of-glasgow`, `university-of-leeds`, `university-of-manchester`, `newcastle-university`, `university-of-nottingham`, `university-of-sheffield`, `university-of-southampton`, `ucl`, `university-of-warwick`.

If a university has no matching CS or DS master's (for example only a conversion course or a differently named one), say so and name the closest course. Do not force a page.

## Method (same pipeline as the MBA set)

1. **Fill the gaps.** Open `round5/<university>.md` and read every NOT CONFIRMED row. Try to confirm it from the university's official course, fees, entry and scholarship pages. Use a real browser: accordions, country selectors and "Entry requirements" tabs hide content from plain fetches. Set the country selector to India where there is one.
2. **Write research notes** to `plans/uk-research/cs-ds/<university>.md` in the same table format as `plans/uk-research/mba/*.md` (Item, Answer, Quote under 15 words, URL, Date read, Entry year). One quote per fact. No quote, no claim. Mark anything you cannot confirm as `NOT CONFIRMED`.
3. **Draft the page** only from those notes, as a filing file `scripts/study-abroad/proposals/uk-course-<slug>-<cs|ds>-<date>.json` in the same shape as the MBA files. Page structure: `docs/study-abroad/templates/COURSE_PAGE_TEMPLATE.md`. Length 800 to 1,400 words. Rules: `docs/study-abroad/CONTENT_RULES.md`, `TERMS.md`, `SEO_AND_SCHEMA_RULES.md`.
4. **Check the numbers:** `node scripts/study-abroad/check-draft-numbers.mjs <draft.json> <notes.md>`. Every figure must be in the notes. Sums and read dates may show as unmatched; check those by hand.
5. **Check the sources:** `node scripts/study-abroad/check-proposals.mjs <draft.json>` (source allowlist `data/study-abroad/official-domains.json`). Use warwick.ac.uk, not wbs.ac.uk, as the Warwick source.
6. **Dry run:** `node scripts/study-abroad/propose-changes.mjs <draft.json> --target=production --dry-run`. It enforces the inbox rules (banned phrases such as "check the current", summary up to 220 characters, seo_title up to 70, meta description 110 to 170, body at least 150 words with a link, FAQ as JSON).
7. **Independent check:** a second agent re-reads the live pages and compares every figure to the draft. In the MBA set this caught about 6 percent wrong. Fix what it finds.
8. **Hand back** (see below). Do **not** run `propose-changes.mjs` without `--dry-run`. The owner reviews batches of 4 on the project board; Claude files approved pages to the Inbox.

## Page fields for CS and DS rows

`degree: master` (MSc), `field: computer-science` or `field: data-science`, `country: uk`, `university_slug` as above. Copy field names and value types from an MBA file.

## UK facts you will need (confirmed 2026-11-03, re-check on launch day)

- Health surcharge (IHS): £776 **per year of visa**, not per year of course. A visa over 1 year pays the yearly fee plus half; 16 months = £1,164. £776 is the minimum for a one-year master's, never the total.
- Visa money (maintenance): £1,171 per month outside London, £1,529 London, up to 9 months, held for 28 days.
- Visa application fee £558 from outside the UK.
- Graduate visa: 2 years if applied by 31 Dec 2026, 18 months from 1 Jan 2027, fee £937.
- ATAS: some CS and DS courses need an ATAS certificate (takes at least 30 working days). Check each course page for it and say so.
- A worked first-year total must add tuition + visa money + visa fee + surcharge. Label the visa money as money shown, not money paid.

## Rules that matter most

1. Never invent or estimate a figure. A visible `NOT CONFIRMED` is better than a guess.
2. Current entry only (2027 entry, or 2027-28 fees). Say which year each fee is for.
3. India-specific: how Indian grades map (percent or CGPA), whether the course asks for GRE, and any India-specific scholarship (for example GREAT India, Chevening). Only if the university's own page says it.
4. No coaching sites, no aggregator numbers. Official `.ac.uk` and `gov.uk` only for facts.
5. Do not change any existing live page or number. Report conflicts; do not resolve them quietly.
6. Plain English. Define each term on first use (CAS, ATAS, IELTS).

## Hand-back

Open a pull request named `content(study-abroad): UK CS and DS research and drafts` containing only: `plans/uk-research/cs-ds/*.md`, the new `uk-course-*-cs-*.json` and `uk-course-*-ds-*.json` files, and one line in `docs/RECENT_CHANGES.md`. List in the PR description: pages drafted, pages skipped and why, every NOT CONFIRMED left, every conflict found. Do not merge.

## Done looks like

- Per university: a research note, and a draft for CS and for DS (or a stated reason there is none).
- All drafts pass the number check, the source check and the dry run.
- An independent re-read of the live pages found no unfixed mismatch.
- The owner can review them in batches of 4.

## Task tracking

Notion Tasks database, Project = StudyAbroad. See `AGENTS.md` for the update rules. Never delete tasks.
