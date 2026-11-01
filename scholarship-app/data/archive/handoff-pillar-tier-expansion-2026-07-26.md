# Handoff: Pillar Tier Expansion & Discoverability Wiring (2026-07-26)

For Antigravity — context on what changed this session, why, and what core docs need updating. This builds on the original pillar tier (14 guides) shipped earlier and documented in the existing IA/SEO material.

## 1. What shipped

### 11 new pillar guides (content/pillars/*.md)
Pillar count went from 14 → 25. New guides, in priority order they were built:

1. `corporate-private-scholarships-guide` — first pillar clustered by `provider_type` (Corporate + Private) rather than state/category. Built because Sitaram Jindal and Tata Capital Pankh were confirmed top-5 site traffic, yet the underlying hub was a thin 96-line list page.
2. `nsp-national-scholarship-portal-guide` — national-tier explainer for the National Scholarship Portal, distinct from the existing `/guides/nsp` how-to (registration/login steps). This pillar covers the *conceptual* confusion: which schemes route through NSP vs state portals, why applications get rejected/stuck.
3. `state-scholarships-how-they-work-guide` — meta pillar explaining the general state-scholarship pattern (category split, class-stage split, common documents), justified by very high combined keyword volume for generic "state scholarship portal" queries.
4. `obc-scholarships-guide`, `minority-scholarships-guide` — national category pillars, same tier as the existing SC/ST pillar.
5. `engineering-btech-scholarships-guide`, `mbbs-medical-scholarships-guide` — first course-level pillars.
6. `jharkhand-scholarships-guide`, `punjab-scholarships-guide`, `haryana-scholarships-guide` — new state pillars (moderate keyword volume, moderate DB inventory: 3/5/7 scholarships respectively).
7. `gujarat-scholarships-guide` — **built in a separate concurrent session, not by me.** Landed after Gujarat's DB inventory grew from 8→14 rows. I verified it renders correctly against the pillar template and is structurally consistent with the other 24.

Also audited (not rebuilt): `uttar-pradesh-scholarships-guide` — checked against the current 19-row UP inventory and found it already covers every scheme 1:1. No content gap; flagged instead in the model-layer fixes below.

### New `/pillars` index page (`app/pillars/page.tsx`)
Lists all 25 guides grouped into 5 sections (topic/meta, category, course, provider-type, state), auto-derived from each pillar's cluster fields — no manual list to maintain. Added to `app/sitemap.ts`.

### Content-model extensions (`lib/pillars.ts`)
The original pillar model only clustered scholarships by `clusterCategories` / `clusterStates` / `clusterLevels`. Two new cluster dimensions were added to support the new pillar types:
- `clusterProviderTypes` — matches DB's `provider_type` column (Corporate, Private, etc.)
- `clusterCourses` — matches DB's `course_stream` column via the existing `getScholarshipsByCourse()` substring search

Each has a corresponding reverse-lookup export (`getPillarForProviderType`, `getPillarForCourse`), following the same pattern as the existing `getPillarForState`/`getPillarForCategory`/`getPillarForLevel`, wired into `PillarGuideCallout` on the relevant hub pages (`/corporate-scholarships`, `/private-scholarships`, `/scholarships-by-course/[course]`).

## 2. Template-level fixes to `app/pillars/[slug]/page.tsx`

Three UX fixes to the pillar page, applying automatically to all 25 guides (not per-file edits):

1. **Hub-links callout moved above the fold.** Previously rendered after the entire article body (TOC, checklist, FAQ) — users had to scroll past ~2000 words to find the link to the actual hub/listing page. Now renders directly under the Key Takeaways box, before the article body.
2. **Scholarship names auto-link in prose.** New `autoLinkScholarshipMentions()` in `lib/pillars.ts` — post-processes the rendered HTML, finding `<strong>` spans that uniquely match a scholarship title (via normalized prefix matching against the live-fetched cluster scholarships) and wraps them in a link to `/scholarships/[slug]`. Deliberately skips ambiguous matches (e.g. Odisha's 3 separate e-Medhabruti variants) rather than guessing wrong.
3. **Featured-scholarships section ends with a contextual sentence, not a button.** Originally just showed up to 9 cards with no path to the rest. Now computes the true eligible count and renders a plain sentence ("These are the 9 highest-priority picks out of 61 open right now — the rest are on the hub pages above.") pointing back to the correct hub(s). Explicitly avoided a "See All →" button pattern per your feedback that it reads dated.

## 3. Bugs found and fixed along the way (not originally planned work)

- **`/corporate-scholarships` was silently rendering 0 scholarships.** It called `getScholarshipsByType('Corporate')`, which filters on the `scholarship_type` column — but that column only ever holds `Government`/`Private`/`Study Abroad`, never `'Corporate'`. Switched to `getScholarshipsByProviderType('Corporate')`, which correctly filters on `provider_type` (24 rows). `/private-scholarships` was checked too and found to be working correctly under its own (different) criteria — left unchanged.
- **`ScholarshipCard.tsx` crashed at runtime** ("Event handlers cannot be passed to Client Component props") the first time a scholarship with a `thumbnail_url` was rendered (an `<img onError>` inline handler in a Server Component). This had never surfaced before because no previously-rendered scholarship set included one with a logo — the Corporate pillar's Google entry was the first. Fixed by adding `'use client'`.
- **Auto-linker HTML-entity bug.** The markdown-to-HTML pipeline escapes `&` → `&amp;` before converting `**bold**` to `<strong>`, so a scheme name like "UP Divyangjan Post-Matric Scholarship & Fee Reimbursement" was being compared against DB data with a literal `"amp"` token still in it, breaking the match. Fixed by decoding common entities before normalizing for comparison — this improves matching retroactively across every pillar with an `&` in a scheme name, not just UP.
- **Two corrected claims from earlier in this session, worth noting for the record:** (1) `/scholarships-by-university` is **not** foreign-university content — it's a curated Indian-institution list (`lib/universities.ts`: BITS, IITs, NITs, DU, JNU, etc.), separate from the DB's raw `provider_type='University'` column which happens to hold foreign entries. (2) `/scholarships/international` was already a well-built live tracker page (FAQ, country/level hub grid) — restructuring it into a pillar would have been a downgrade; the actual gap was just a missing cross-link between the two pages, which is now fixed.

## 4. Discoverability layer (previously: 1/14 pillars linked from anywhere)

- **Homepage** (`app/HomeClient.tsx`): new "Scholarship Guides" section with 6 curated links + "All Guides" link to `/pillars`, placed right after the Category Gateway section.
- **Desktop nav** (`app/components/Header.tsx`): the "Find Scholarships" dropdown's single stale SC/ST-only link replaced with "All Scholarship Guides →" pointing to `/pillars`. Also fixed a mislabeled "Private & Corporate" link that only pointed to `/private-scholarships` — now two correctly labeled, correctly linked entries.
- **Mobile nav**: new dedicated "📘 Scholarship Guides" entry point (previously zero pillar presence on mobile, despite 90% mobile traffic).
- **Article → pillar backlinks**: `ArticleMetadata` gained a `relatedPillarSlug?: string` field. Populated by reversing the existing pillar → article `relatedArticleSlugs` associations (20 articles matched a pillar this way — no new associations invented, just the reverse direction added). `PillarGuideCallout` now renders on `app/articles/[slug]/page.tsx` above the fold when a match exists.

## 5. Explicitly NOT done — needs a decision from you/Roshan

**Caste-field data quality (was IS-101).** The `caste` column mixes at least 5 different formats across ~472 rows — clean JSON arrays, comma strings, and genuine free-text sentences (e.g. "General Category - EWS... Brahmin community students (separate scheme under Brahmin Development Board - verify)"). Filtering by substring match still works today regardless of format, but display quality and "is this scheme category-exclusive" logic are unreliable against the free-text rows. **A blind regex rewrite was explicitly rejected** — it risks silently erasing real eligibility nuance on the ~15-20 genuinely free-text rows.

The scoped correct fix (not yet started, full detail in `data/backlog-dev.json` under IS-101):
1. Add two new columns, additive only: `caste_tags` (controlled enum: SC/ST/OBC/EWS/General/Minority/PWD/EBC/etc., never free text) and `eligibility_notes` (free text, for the nuance a tag can't capture).
2. Auto-populate `caste_tags` for the ~450 already-clean rows — safe, mechanical.
3. Hand-review only the ~15-20 genuine free-text outliers.
4. Migrate all category-filter call sites (`getScholarshipsByCategory`, `isCategoryFocused`, `getPillarForCategory`) from LIKE-matching raw `caste` to querying `caste_tags`.
5. Enforce `caste_tags` as a required, enum-validated field at ingestion time going forward, so this doesn't re-accumulate. This is a real conversation about who owns writes to `scholarships.db` and what your enrichment pipeline validates before insert.

**Gujarat/UP DB inventory** — Gujarat grew 8→14 rows in a concurrent session; UP is still at 19 rows despite being the single largest keyword cluster found in research (4M+/mo for "up scholarship"). Worth prioritizing further UP enrichment specifically.

## 6. Suggested core-doc updates

- **IA/site-structure docs**: pillar count is now 25, not 14; document the two new cluster dimensions (`clusterProviderTypes`, `clusterCourses`) alongside the existing three.
- **Content backlog process**: this session's pattern — validate against real DB inventory + actual GSC/traffic data before building, not just keyword volume — is worth writing into whatever doc governs future pillar/content prioritization (see the Corporate/Private pillar and the University/International correction as concrete examples of why).
- **Data-quality backlog**: IS-101 (caste schema fix) should get a permanent home in whichever doc tracks DB schema/ingestion rules, since it's really an ingestion-validation gap, not a one-time cleanup.
