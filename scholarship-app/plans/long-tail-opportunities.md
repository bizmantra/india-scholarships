# Long-tail opportunities: plan and tracker

Source: Search Console, 90 days to 2026-10-10 (43k queries, 3M impressions). Started 2026-10-12.
**This table is the single source of truth. Every add, change or removal is made here and logged below.**

## Tracker

| # | Item | Batch | Owner | Status | Notes |
|---|---|---|---|---|---|
| 0 | Add 20 live pages to sitemap, delete test routes | done | Claude | PR #59 open, waiting for merge | |
| 1 | OASIS West Bengal portal guide (split out of the Aikyashree guide; move the `oasis` alias to it) | 1 | Gemini drafts, Claude checks + builds | Built, PR #61 (staging test pending) | ~22k impressions. v2: 11/12 quotes found; Claude removed 3 unsupported claims (APB payment system, status-page field names, a deadline) |
| 2 | Odisha State Scholarship Portal guide | 1 | Gemini drafts, Claude checks + builds | Built, PR #61 (staging test pending) | Official pages read through owner's Chrome; v2: 15/15 quotes found |
| 2b | **Added:** scholarship pages link to their portal guide ("Scholarship Guides" section) | 1 | Claude | Built, PR #61 (staging test pending) | 82 scholarship pages get a link across 11 guides; guides were not linked from scholarship pages before |
| 3 | Karnataka income limits by caste category (2A/2B/3A/3B/Cat-1) guide | 1 | Gemini drafts, Claude checks | Not started | Check overlap with Karnataka pillar first. Existing editorial guides get few impressions (see findings) |
| 4 | ~~AP Jnanabhumi + Bihar Medhasoft guides~~ → **Merge the two duplicate Bihar post-matric articles; drop AP** | 1 | Claude | Approved 2026-10-13, not started | AP already has a portal guide + Vidya Deevena article (both ~0 impressions) |
| 5 | "School vs college" section on existing state pages (no new URLs) | 1 | Claude | Built, PR #61 (staging test pending) | ~10k impressions. Section + 2 FAQs per state, from scholarship data |
| 6 | Post-matric / pre-matric hub per state (~12 states with 3+ versions) | 2 (after Oct 19) | Gemini drafts intros, Claude builds | Not started | ~49k impressions. 5 existing state post-matric articles get ~0 impressions; the hub would absorb and redirect them |
| 7 | ~~New page per class~~ → **Per-class sections and jump links on the existing class 9-12 hub** | 2 (after Oct 19) | Claude | Approved 2026-10-13, not started | Existing hub works (7.2k impressions, 250 clicks, pos 5.7); class-10/12-passed articles get ~0 |
| 8 | State × category hubs in sitemap (only with enough scholarships) | 3 (after Phase 3 audit) | Claude | Not started | |

## Findings that changed the plan (2026-10-12)

- Several proposed pages already existed as guides or articles; I had not checked before proposing them.
- Existing editorial guides barely show in search (90 days): Bihar PMS guide 52 impressions, Odisha e-Medhabruti 16,
  class-10-passed 24, class-12-passed 0, Karnataka SSP post-matric 0. Scholarship pages and hubs are what rank.
  So new pages should be data-rich hubs or portal guides, not more how-to articles.

## Gemini handoff: how it went (batch 1)

| Run | Setup | Result |
|---|---|---|
| v1 (OASIS, Odisha) | `gemini-3.1-pro-preview`, Google Search + URL reading, our scholarship list in the prompt | Good structure and tone, used our slugs and amounts correctly. **Could not open either official portal.** Odisha sources: 4 blogs, our own site, myscheme, one university circular. OASIS citations all said oasis.gov.in although it never read the page. Missed the three key notices on the OASIS homepage (NSP OTR for ST, OBC certificate revalidation, Aadhaar seeding) |
| v2 (OASIS, Odisha) | Same, but Claude fetched the official homepage, track page and 2 official PDFs and put the text in the prompt | OASIS 11/12 and Odisha 15/15 quotes found word-for-word in official text; all three OASIS notices included. ~40 s and ~13k tokens each. Still invented 3 details on OASIS that Claude removed |

**Workflow from now on:** Claude fetches official pages → Gemini writes from that text → automatic quote check →
Claude reviews anything unmatched, fixes, builds and opens the PR.

## Change log

- 2026-10-12: table created (items 0–8). Items 4 and 7 changed after finding existing content; item 2 blocked.
- 2026-10-13: owner approved changes to 4 and 7. Item 2 unblocked (portal opens in owner's Chrome). Items 1, 2, 5 built; item 2b added (guide links on scholarship pages).
