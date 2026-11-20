# After-scholarship guide + "What next" government-exam links

## Goal

Send students who have finished the scholarship hunt (and reserved-category students browsing
scholarship category hubs) to IndiaCalculators' government-exam age-limit pages, and publish one
guide that explains the step after a scholarship: renewal, PFMS credit, documents, then the age
limit for SSC / UPSC / IBPS. Every outbound link carries `utm_source=indiascholarships` so the
partner can attribute the traffic.

## Background (verified before writing this plan)

- Partner URLs are live: `https://indiacalculators.org/exams/` (200) and
  `https://indiacalculators.org/ssc-cgl-age-limit/` (200), checked 2026-10-30.
- Guides are plain markdown in `content/articles/`. They are served at `/guides/:slug` by
  `app/guides/[portal]/page.tsx`, listed on `/guides` via `getAllArticles()`, and added to
  `app/sitemap.ts` automatically. **No route, config or sitemap edit is needed for a new guide.**
- `targetMoneyLink` is rendered as the primary CTA by `app/components/EditorialTemplate.tsx`
  (`next/link`, label "View Application Details & Apply →"). Absolute URLs pass through
  unchanged, so it can point at the partner site.
- Outbound links must be plain `<a href="…">` with `target="_blank"` and
  `rel="noopener noreferrer"`, matching the existing Telegram link in `app/components/Footer.tsx`
  — **not** `next/link`.
- `relatedScholarships` slugs are resolved to live DB rows by `app/articles/[slug]/page.tsx`;
  unknown slugs are dropped, so only confirmed slugs are listed.
- Category slugs reachable on `/scholarships-for/[category]` for this task are `obc`, `sc`, `st`
  and `ews` (canonical slugs from `getCanonicalSlugForCategory` in `lib/utils.ts`).

## Files to change

| File | Change |
| --- | --- |
| `plans/after-scholarship-what-next-exam-age-links.md` | This plan (new file). |
| `app/components/Footer.tsx` | Footer grid 3 → 4 columns; new "What next" column with one outbound link. |
| `app/tools/ToolsClient.tsx` | New "What next" card under the tools grid, outbound `<a>`. |
| `app/tools/page.tsx` | **No change needed.** It only supplies DB stats + FAQ schema to `ToolsClient`; the card lives in `ToolsClient`. Listed because the brief named it — leave untouched. |
| `app/scholarships-for/[category]/page.tsx` | Relaxation banner + outbound CTA with category-aware copy, rendered only for `obc` / `sc` / `st` / `sc-st` / `ews`. |
| `content/articles/after-scholarship-what-next.md` | New guide (`targetMoneyLink` = exams hub, `utm_campaign=guide`). |

No other file is touched. No dependency changes. All changes stay uncommitted on the current
branch (`docs/study-abroad-specs`) for review.

## Exact URLs and copy

| Placement | URL | Notes |
| --- | --- | --- |
| Footer "What next" column | `https://indiacalculators.org/exams/?utm_source=indiascholarships&utm_medium=referral&utm_campaign=footer` | anchor text "Government exam age limits" |
| Tools hub card | `https://indiacalculators.org/exams/?utm_source=indiascholarships&utm_medium=referral&utm_campaign=tools-hub` | card text "Checked your scholarship? Now check if you're age-eligible for SSC CGL, SSC GD or RRB NTPC" |
| Category banner (obc/sc/st/sc-st/ews only) | `https://indiacalculators.org/ssc-cgl-age-limit/?utm_source=indiascholarships&utm_medium=referral&utm_campaign=category-page` | copy per category: OBC "+3 years"; SC/ST (and legacy `sc-st`) "+5 years"; EWS "no age relaxation — check the base age limit" |
| Guide `targetMoneyLink` | `https://indiacalculators.org/exams/?utm_source=indiascholarships&utm_medium=referral&utm_campaign=guide` | campaign name chosen for this plan; adjust if the partner wants a different one |

All three inline links open in a new tab and carry `rel="noopener noreferrer"`.

## Steps

1. **Footer** (`app/components/Footer.tsx`)
   - Change the column grid to `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12`.
   - Add a fourth `<div>` after the "Resources" column: `<h4>What next</h4>` + a single-line `<ul>`
     containing one plain `<a>` to the footer URL, styled like the existing Telegram link.
   - Nothing else in the file changes; existing `next/link` internal links stay as they are.

2. **Tools hub card** (`app/tools/ToolsClient.tsx`)
   - Between the tools grid `</main>` and the FAQ section, add a "What next" section: heading
     "What next", the card copy above, a one-line supporting sentence, and the outbound `<a>`.
   - Card reuses the existing visual language (`rounded-3xl border border-gray-200 bg-white
     p-6 shadow-xs hover:shadow-md hover:border-brand`) but is a plain `<a>`, not `ToolCard`,
     because `ToolCard` renders `next/link` and expects an internal `href`.
   - The card is not added to `TOOL_GROUPS`/`ALL_TOOLS`, so it is not counted in the "free tools"
     total and is not affected by the category filter tabs.

3. **Category banner** (`app/scholarships-for/[category]/page.tsx`)
   - Add a module-level `RELAXATION_BANNER_COPY: Record<string, string>` mapping each reserved
     category slug to its copy (OBC "+3", SC/ST "+5", EWS "no relaxation"), including the legacy
     combined `sc-st` slug.
   - In `CategoryHubPage`, look up `relaxationBannerCopy` from the normalised `categorySlug` in
     the main (non-study-abroad, non-gender) branch, and render the banner after the scholarships
     list, before the FAQ block.
   - Banner: small "What next" eyebrow, the mapped copy, and the plain `<a>` CTA
     "Check your SSC CGL age limit →".
   - Study-abroad level pages, gender pages, and every other category (`minority`, `pwd`,
     `general`, `ebc`, …) render exactly as before.
   - Reviewer approved the category-aware copy **and** including `sc-st` on 2026-10-30; see
     Questions.

4. **Guide** (`content/articles/after-scholarship-what-next.md`, new)
   - Frontmatter: `id: "ART-121"` (next free id), slug `after-scholarship-what-next`,
     date `2026-10-30`, `tag: "Procedural & Docs"`, `targetMoneyLink` = guide URL,
     `relatedScholarships: ["national-scholarship-portal-nsp"]` (verified live slug).
     **No `relatedPillarSlug`** — that would require a reverse `relatedArticleSlugs` edit in an
     unlisted pillar file.
   - Body: post-submission steps (PFMS credit → renewal → expiring documents) and then the exam
     stage: a small table of base limits and relaxations for SSC CGL 2026, UPSC CSE 2026 and
     IBPS PO 2026, the "age is checked on one cutoff date" rule, and the reminder that relaxation
     applies to the upper limit only.
   - 3–6 internal links, all editorial links as `/guides/:slug`:
     `/guides/pfms-scholarship-payment-status-tracking-guide`,
     `/guides/nsp-national-scholarship-portal-guide`,
     `/guides/state-income-domicile-certificate-guide`, plus `/scholarships-by-category`. The outbound partner link appears once inline and once through
     the CTA.
   - Facts: base limits 32 / 32 / 30 for General-EWS; OBC-NCL +3; SC/ST +5; cutoffs 1 Aug 2026
     (SSC CGL, UPSC CSE) and 1 Jul 2026 (IBPS PO). The guide tells the reader to confirm each
     cycle against that exam's own notification.

5. Run the checks below, then fill in `## Done

Implemented 2026-10-30, committed and opened as a PR from `feat/after-scholarship-what-next` after re-checking.

### What changed

- `app/components/Footer.tsx` - four-column footer grid; "What next" column with one plain `<a>` (`utm_campaign=footer`).
- `app/tools/ToolsClient.tsx` - "What next" card between the tools grid and the FAQ (`utm_campaign=tools-hub`), outside `TOOL_GROUPS`/`ALL_TOOLS`. `app/tools/page.tsx` untouched.
- `app/scholarships-for/[category]/page.tsx` - `RELAXATION_BANNER_COPY` map and banner for `obc` / `sc` / `st` / `sc-st` / `ews` (`utm_campaign=category-page`). Other branches unchanged.
- `content/articles/after-scholarship-what-next.md` - new guide `ART-121`.
- This plan.

### Checks (re-run 2026-10-30)

- `npx tsc --noEmit`: no errors in the changed files. Three errors remain in `app/admin/backlog/board/page.tsx` because `@dnd-kit/core` is declared in `package.json` but missing from the local `node_modules`; not related to this change.
- `eslint` on the three changed code files: 90 problems on `main`, 94 with this change. The 4 extra are `react-hooks/error-boundaries` ("Avoid constructing JSX within try/catch") from the banner JSX inside the category page's existing `try` block, the same violation the page already had. Repo-wide lint already fails on thousands of problems and CI does not gate on it.
- Partner URLs `https://indiacalculators.org/exams/` and `/ssc-cgl-age-limit/` returned HTTP 200 on 2026-10-30. The three internal guide slugs exist.
- Exam limits were compared with search excerpts of the official 2026 notices (IBPS CRP PO/MT-XVI, UPSC CSE notice 05/2026, SSC CGL notice); the full PDFs were not read, so the owner confirms them. The guide table now shows stable rules without dated cutoffs: SSC CGL "up to 32, varies by post", UPSC 21-32, IBPS PO 20-30, with OBC-NCL +3 and SC/ST +5.
- `scripts/audit-article-links.js --strict` (the CI `enrich` check) rejected `/guides/documents`, which is a page route but not an article slug; the link was removed.
- Smoke test on the Vercel preview (2026-10-30): footer and tools card present; banner on obc/sc/st/sc-st/ews with the right copy and absent on minority/pwd/general/mba; guide and its internal links return 200; guide listed on /guides and in the core sitemap; outbound links carry `target="_blank"` and `rel="noopener noreferrer"`. The owner reviewed the preview pages.

### Open points

- All three 2026 application windows have closed, so the guide no longer quotes 2026 cutoff dates. Review the limits each year.
