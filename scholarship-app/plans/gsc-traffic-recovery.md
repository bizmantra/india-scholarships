# Traffic recovery plan (main site) — written 2026-10-04

Source: Search Console API (domain property), git history, Google update trackers. GSC data runs to 2026-09-29 (reporting lag).

## 1. Where we really are

| | Clicks/day | Impressions/day | Avg position |
|---|---|---|---|
| Late June (Jun 20–24), a calm month | ~1,590 | ~64,000 | 5.9 |
| July 18 – Aug 1 (pre-crash window) | ~3,100 | ~205,000 | ~6.3 |
| Aug 2 (the cliff) | 268 | 9,475 | 3.9 |
| Mid-Aug to Sep 24 (trough) | 30–150 | 500–5,000 | 8–25 |
| Sep 29 (latest data) | 869 | 77,107 | 6.9 |

- The site is **already recovering**: impressions started coming back on **Sep 25** and are now above the late-June level. Clicks are about 55% of late June.
- "Pre-crash" July was a **seasonal peak** (a few big July-deadline schemes), not a normal month. The honest target is the late-June level first, not the July peak.
- Click-through rate fell from ~2.5% (June) to ~1.1% (now) at a similar position. That is a separate problem worth looking at (section 5, Phase 2).

## 2. What probably happened (three overlapping causes, not one)

I first said the Jul 26 redirect change (deleted subpages → `#fragment` redirects) was the main cause. The data does not support that on its own. Corrected view:

**Gap between the July 18–Aug 1 average (3,106 clicks/day) and now (732/day, avg Sep 26–29) = 2,374 clicks/day:**

| Piece | Clicks/day before → now | Share of gap | Read |
|---|---|---|---|
| Deleted subpages (`/scholarships/slug/eligibility` etc.) | 1,103 → 3 | ~46% | Partly seasonal, partly real loss (below) |
| PM Yashasvi page | 668 → 29 | ~27% | Seasonal: applications closed Jul 31. Will not return until the next cycle |
| All other scholarship pages | 940 → 523 | ~18% | Recovering (56%) |
| Everything else | — | ~9% | Guides are back to 85% of baseline |

- **Seasonality (big):** In the top 25 queries that used to land on the deleted subpages, "Talliki Vandanam" queries are ~65% of the clicks (about 4,400 of 6,700 in Jul 1–25). That scheme's window has passed; those searches are gone for now. This is not damage.
- **The consolidation partly worked:** several former subpage queries now rank on the parent page at the same or better position (PM Yashasvi "apply online 2026": position 7.6 → 1.8; Atul Maheshwari 5.9 → 5.0; Kanyashree 6.0 → 6.0). "Page with redirect" in Search Console is the normal, expected label for a redirected URL. It is not an error, and I was wrong to call those 3,573 pages "damage".
- **Real, recoverable loss:** some former subpage queries now rank worse or are answered by a state hub or guide instead of the scheme page (Aikyashree, MYSY, e-Kalyan, Post Matric Odisha/Bihar). That is the part we can win back (Phase 2).
- **Google timing:** the cliff (Aug 1→2) matches an unconfirmed Google ranking volatility event on Aug 1–3. The recovery (Sep 25) matches the start of Google's September 2026 spam update (announced Sep 24, rolling ~2 weeks, so it is **not finished**). I can't prove either caused our change; the timing fits. No manual action and no security issue exist (checked in Search Console).
- **Not the cause:** middleware (admin only), robots.txt (the locale block predates the cliff and is now removed by PR #33), the Jul 29 pillars/articles → guides merge (Guides are the best-recovered section).

Confidence: high on the numbers and the seasonality; medium on the Google-event explanation; low on any claim that one specific deploy caused the cliff.

## 3. What not to do

- Do **not** revert or rewrite the Jul 26 redirects. Google has already processed them; changing them now restarts the clock.
- Do **not** mass-request indexing or mass-submit anything. It does not scale and does not help.
- Do **not** delete or noindex pages in a panic while the spam update is still rolling.
- Do **not** ship another structural change (URL moves, template rebuilds, bulk page batches) until Phase 0 ends.

## 4. Phase 0 — Stabilise (now until ~Oct 19)

Ends 7 days after the spam update finishes (rollout ends about Oct 8).

- No URL changes, no template rebuilds, no bulk generated pages.
- Normal editorial work is fine (new articles, scholarship data fixes, deadline updates).
- Owner: look at Search Console impressions each morning. If daily impressions fall by more than 40% two days running, stop all deploys and tell Claude.
- Checkpoint Oct 19: if clicks are at or above ~1,000/day, stay the course. If below ~600/day, or the recovery reverses (as happened with the Sep 4 → Sep 13 update), start Phase 3 early.

## 5. Phases

### Phase 1 — Small fixes (safe, do now)

Tasks for the AI agent (plan-file handoff). Touch only the files named. No commits to `main`.

1. **Sitemap leak.** 5 URLs in `/sitemap/core.xml` return a 308 redirect instead of 200: `/guides/nsp`, `/guides/nsp/status-check`, `/guides/nsp/student-login`, `/guides/nsp/documents-list`, `/guides/nsp/scholarships-list`. They redirect to `/guides/nsp-national-scholarship-portal-guide/...`. Make the sitemap list the final destination URLs. Locate the generator in `app/sitemap.ts` first. Also check the first redirect's destination has a trailing slash while the others do not, and that no second redirect follows.
   - Check: re-run the all-URLs check (852 URLs; every one must be 200).
2. **Owner task in Search Console** (no API for these lists): Indexing → Pages → open each reason and use Export. Reasons: Server error (5xx) 67, Not found (404) 186, Soft 404 29, Duplicate without user-selected canonical 224, Duplicate/Google chose different canonical 539, Crawled – currently not indexed 215. Save the CSVs in `data/gsc-exports/`. Claude then sorts them into "fix", "expected", "ignore".
3. **Locale cleanup follow-up.** PR #33 already removed the locale block and redirects old `/hi|bn|ta|te|or|kn/` URLs to English. Re-check Indexing → Pages on ~Oct 20: "Blocked by robots.txt" (13,492) and "Indexed though blocked" (7,350) should be shrinking. If they are not, investigate.

### Phase 2 — Win back the recoverable demand (page edits only, no URL changes)

1. Build a table of the top ~100 queries that used to land on deleted subpages (Jul 1–25), with their current position and answering page. (Claude can do this from the API; the first 25 are done.)
2. For queries where the scheme page now ranks worse than ~8 or a state hub/guide answers instead (Aikyashree, MYSY, e-Kalyan, Post Matric Odisha/Bihar so far): edit the scheme page — title/H1 and meta description should name the intent ("eligibility, last date, documents, apply online" plus the year), and the H2 section headings should use the words people search. Add a short "On this page" jump list at the top that links to the sections. Same URLs.
3. **Click-through rate** (2.5% → 1.1%): pull the top 50 pages by impressions, compare current titles/descriptions with their June versions in git, and fix titles that got longer, vaguer or lost the year.
4. **Seasonal calendar.** Build a month-by-month list of schemes with predictable windows (Talliki Vandanam, PM Yashasvi, NSP, state post-matric, etc.). Refresh each scheme page 3–4 weeks before its window opens, not after.

### Phase 3 — Reduce exposure to the spam update's target (after Phase 0, or earlier if the checkpoint fails)

The September update is reported to hit "highly templated, programmatic, probably AI-generated" pages. This is a **risk audit, not a diagnosis**. For each page family, count pages, measure 90-day clicks/impressions per page, and check how much of each page is unique:

- Scholarship detail pages (database-driven text)
- State × category hubs (pSEO Phases 5–6)
- Auto-generated news posts
- Study Abroad programme / programme-detail pages (~193 URLs, ~25 impressions in 90 days so far)
- Programmatic pillars

Output a keep / improve / merge / noindex recommendation per family. The owner decides; nothing is removed automatically.

### Phase 4 — Be less fragile

- One scheme (PM Yashasvi) was ~21% of July traffic and it expired. Spread risk: more evergreen pages (documents, income certificate, how-to, status-check guides), plus owned channels (Telegram exists; the email popup was reverted in PR #32, so redo it carefully later).
- Keep Bing/Yandex indexing running (agent already enabled).

### Phase 5 — Monitoring and change discipline

- Weekly scorecard: clicks and impressions by page group (scholarships, state hubs, category hubs, guides, news) against the late-June baseline. Claude can produce this from the API.
- Make sure the Traffic Watchdog agent alerts on **Search Console impressions**, not only GA4 sessions. The Aug 3 report used GA4 only and missed this.
- Write down every structural deploy with its date. Rule: at most one structural change per two weeks, tried on staging first.

## 6. Decisions for the owner

Answered by the owner on 2026-10-04:

1. **Hold new bulk page launches** (including the Study Abroad UK/Canada/Australia/Ireland expansion) until after the Oct 19 checkpoint. **Decided: yes, hold.**
2. Restore any deleted subpages? Recommended: no, unless Phase 2 shows a specific high-demand query the scheme page cannot serve. Still open.
3. Phase 1 sitemap fix: **done by Claude on its own branch** (`fix/sitemap-nsp-redirects`, see section 8). This plan lives on `docs/gsc-traffic-recovery-plan`.

## 7. Open questions

- Why did clicks per impression fall by more than half? (Phase 2 task 3.)
- Will the recovery hold once the spam update finishes? Only time answers this; the Oct 19 checkpoint is the test.
- Regional-language demand: only one Hindi query appeared in the top 25 former-subpage queries (Atul Maheshwari, 111 clicks). Not enough to size the parked localization plan; needs its own query pull.

## 8. Indexing-report analysis (exports downloaded 2026-10-04)

Nine Search Console "Pages" exports (reports last crawled around Sep 22, so partly stale). Not yet exported: Server error (5xx) 67, Soft 404 29, Blocked due to other 4xx 2. Each export is capped at ~1,000 rows.

I checked a live sample of the URLs in every list to separate "still broken today" from "already fixed, report is stale".

| Search Console reason | Count | What it really is | Status |
|---|---|---|---|
| Blocked by robots.txt / Indexed though blocked / Google chose different canonical | ~3,000 shown (13,492 + 7,350 + 539 total) | 100% old `/hi /bn /ta /te /or /kn` pages. Live robots.txt no longer blocks them and every sampled URL now returns a permanent redirect to English | **Fixed (PR #33). Stale.** Should clear as Google recrawls; recheck ~Oct 20 |
| Page with redirect | 3,573 (885 + 73 shown are deleted subpages) | Normal, expected result of the Jul 26 consolidation | **No action** |
| Duplicate without user-selected canonical (224) and Alternate page with proper canonical (187) | 411 | All `/eligibility-checker?level=...` parameter URLs. Live pages now carry `canonical = /eligibility-checker` (the 224 were last crawled Jul 21, before that) | **Fixed, stale.** No action |
| Crawled – currently not indexed | 215 | 192 are CSS files (`/_next/static/...?dpl=`). Not pages | **Ignore** |
| Discovered – not indexed | 58 | Mostly the dead `studyabroad.` subdomain | Removal request already filed |
| Not found (404) | 186 | 62 already fixed; 22 now redirect but with a temporary 307; **100 still 404** | **Action** (below) |

### Still-404 URLs (100) — `plans/gsc-traffic-recovery-still-404.txt`

| Group | ~Count | Cause | Proposed fix |
|---|---|---|---|
| Old Study Abroad paths at the site root: `/universities/…`, `/visas/…`, `/loans/…`, `/tools/…`, `/study-in/…`, plus a few on `study.indiascholarships.in` | 55 | None of these are in `lib/study-abroad/redirects.json` (0 of 55) | Add redirects to the matching `/study-abroad/...` page where one exists, else the nearest hub. **Belongs to the Study Abroad track; hand over, don't do on this branch** |
| `/scholarships-in/:state/:category` (e.g. `/scholarships-in/gujarat/pwd`) | 12 | **Code bug, not a missing redirect.** The page is meant to redirect empty combinations to the state hub, but a `try/catch` swallowed the redirect and returned a 404 | **Fixed on `fix/legacy-404-redirects`** |
| `/scholarships-level/…`, `/scholarships-by-category/…`, `/scholarships-by-education/…`, `/scholarships-by-income/…` | ~16 | Old taxonomy URLs. The `/scholarships-level` ones redirect with a **temporary 307** | Make them permanent and point to the nearest current hub |
| `/scholarships/<old-slug>` (e.g. `daad-scholarships-germany-master-phd`, `daad-research-grants-for-doctoral-candidates-3`, `jn-tata-endowment-loan-scholarship`) | 11 | Old scholarship slugs with no redirect | Add to the slug redirect list in `next.config.ts` (needs a title match per slug) |
| `/scholarships/<slug>/<sentence of text>` | 4 | Old junk links. I first blamed 4 bad database records, which was wrong: the 4 scholarships these URLs came from (`holland-scholarship`, `commonwealth-masters-scholarships`, `sikshashree-scholarship-scheme-west-bengal`, `chief-minister-higher-education-scholarship-rajasthan`) now have clean links, so the data was already corrected | **No action** |
| (separate real bug found) | 4 pages | 4 other scholarships (`punjab-attendance-scholarship-for-sc-girls`, `australian-government-research-training-program-rtp-scholarships`, `destination-australia-scholarship`, `ontario-graduate-scholarship`) have a sentence in `apply_url`. The page used that field first and hid the valid `official_source`, so they had no Apply button | **Fixed in code, no database edit** (try each field in turn). Verified: each page now has its Apply link |

### Other findings

- **Redirect chains:** old locale subpage URLs take two hops (`/kn/scholarships/x/documents-required` → `/scholarships/x/documents-required` → `/scholarships/x#documents-required`). Works, but wasteful. Tidy after the Oct 19 checkpoint, not before.
- Recommended order, given the "no structural change" freeze: (1) the NSP sitemap + redirect fix (done), (2) the 4 data records, (3) the redirects for the 12 + 16 + 11 URLs (they only touch URLs that currently 404, so they can't hurt indexed pages), (4) the Study Abroad redirects via that track.

### Not exported/handled, and why

- **5xx (66 rows):** all crawled in early July; all 67 now answer with a clean redirect. Fixed already. No action.
- **Soft 404 (28 rows):** all `/scholarships-for/<level>/in/<country>` pages (2–6 scholarships each) plus `/scholarships-for/{phd,mba,masters,undergraduate}` and `/scholarships-for/in/<country>`. These are thin pages, so they belong to the Phase 3 audit (enrich, merge or noindex). **Deliberately not changed during the freeze.**
- **Left as is:** `/scholarships/reliance-foundation-phd-scholarship` (no PhD page exists; no honest match), the Study Abroad `.md` file URL, CSS file URLs, and the 3 `study.indiascholarships.in` URLs (that hostname has to be attached to the project in Vercel for any redirect to apply; check the domain settings).

### Done so far (3 code branches + this plan; nothing pushed, no PRs yet)

All branched from `origin/main`. Each was type-checked; redirects and page changes were also tested on a local server.

| Branch | What it does | Tested |
|---|---|---|
| `fix/sitemap-nsp-redirects` (2 commits) | Removes 5 redirecting NSP guide URLs from the sitemap; points old NSP subpage URLs at the guide instead of at 404s | All 852 sitemap URLs were 200 apart from these 5 |
| `fix/legacy-404-redirects` (3 commits) | 7 old scholarship slugs and 11 old category/education/income/level URLs now redirect; catch-all for impossible `/scholarships-level/a/b` paths; empty state×category pages redirect to the state hub instead of 404; unknown level/state redirects are now permanent (were 307); All-India scholarship pages link straight to `/state-scholarships`; Apply button kept when `apply_url` holds text | 25/25 checks on a local server; Apply link verified on the 4 pages |
| `fix/study-abroad-legacy-redirects` (1 commit) | 50 old root-level Study Abroad URLs (`/universities/…`, `/visas/…`, `/loans/…`, `/study-in/…`, a few old `/study-abroad/…`) redirect to the right new page. Uses a new hand-maintained file; the generated `redirects.json` is untouched | 50/50 exact; all destinations return 200 |
| `docs/gsc-traffic-recovery-plan` | This plan | n/a |

Merge conflicts: the three code branches each add lines to `next.config.ts` in different places; expect at most a trivial conflict when merging the second and third.
