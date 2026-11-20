# IS-36 re-check: click-through rate against Search Console

Written 2026-10-13. Status: FINDINGS ONLY. No page was changed. Data: Search Console API (domain property), read-only.
Windows: June 1-30 (calm month), Jul 1-25 (seasonal peak), Sep 11 - Oct 9 (now, 29 days).

## Findings

**The original item is out of date.** IS-36 said "129 pages, about 85K extra clicks a month". That came from the July peak, when the site had 5.5M impressions in 25 days (now 0.96M in 29 days) and much of it came from a few seasonal schemes (PM Yashasvi, Talliki Vandanam). Measured the same way against a standard click-through curve:

| Window | Pages with upside | Upside clicks / 30 days |
|---|---|---|
| June (calm) | 290 | ~78,000 |
| July peak | 1,481 | ~233,000 |
| Now | 256 | ~32,000 |

These are optimistic: a standard curve overstates what scholarship pages can get, because the SERPs are crowded with portals and ads. Using the site's own June curve instead, the upside now is about 2,000 clicks a month. The truth is between the two.

**Most of the "gap" is ranking, not titles.** Of the 256 pages, 206 rank worse than position 6 (about 19,600 of the 31,600 upside). Rewriting a title will not move a page from position 8 to position 4. Examples: Sitaram Jindal went from 5.9% click-through at position 4.1 to 0.7% at 7.1; Tata Capital Pankh from 3.4% at 4.1 to 0.3% at 8.3. Those are ranking losses, which belong to the traffic recovery plan (IS-96).

**Click-through has not broadly collapsed at the same position.** For 136 pages that are in both June and now at about the same position (within 1.5), the median click-through is 94% of June. The headline fall (2.6% in June to 1.3% now) is mostly the mix: positions drifted from 5.7 to 6.9, and the big high-CTR scheme (PM Yashasvi, 4.3% at 4.6) closed. 35% of those pages did lose more than 30%, so a minority really got worse.

**A short, real title problem exists:** 14 pages rank in the top 6 but get under 60% of the expected click-through (about 9,000 clicks a month on the standard curve). Their live titles run long and repeat the same ending ("Apply Online, Portal Login & Status Check"), and three UP post-matric variants have near-identical titles and compete with each other.

**Some title work already happened.** Commit `8edcbc6` (2026-07-29) "fix low-CTR scholarship page titles" changed the title logic in `app/scholarships/[slug]/page.tsx`. So the item was partly done in July, and nothing on the board recorded it. There is also an unmerged branch `fix/meta-description-cut`; check it for overlap before starting.

**Overlap with the recovery plan:** `plans/gsc-traffic-recovery.md` Phase 2 step 3 (top 50 pages by impressions, compare titles with June, fix longer or vaguer ones) is the same job as the 14-page list below.

## Recommended scope (replaces "129 pages")

| # | What | Pages | Why | Expected |
|---|---|---|---|---|
| 1 | Shorten and sharpen titles and descriptions on the snippet-problem pages (list below) | 14 | Rank top 6, click-through under 60% of expected | Up to ~9,000 clicks/month (optimistic); test on a few first |
| 2 | Give the three UP post-matric variants distinct titles | 3 (inside the 14) | Near-identical titles compete | Part of #1 |
| 3 | Leave the 206 pages ranking worse than 6 to the recovery plan | 206 | Ranking problem, not a title problem | n/a |
| 4 | Re-run this check in 3 weeks, once the September spam update has settled | all | Positions are still moving; numbers will shift | n/a |

## The 14 pages (now: position, click-through, impressions per 30 days, upside clicks per month)

| Page | Pos | CTR | Impr/30d | Upside |
|---|---|---|---|---|
| /guides/e-kalyan-jharkhand/student-login | 2.7 | 0.98% | 31,096 | ~3,100 |
| /scholarships/pm-yashasvi-scholarship | 5.2 | 2.86% | 36,620 | ~1,500 (seasonal; closed) |
| /scholarships/krishi-vidya-nidhi-yojana-odisha | 6.0 | 0.63% | 25,055 | ~1,100 |
| /scholarships/up-post-matric-other-than-intermediate-general-sc-st | 4.9 | 0.29% | 9,988 | ~670 |
| /scholarships/chief-minister-higher-education-scholarship-rajasthan | 5.1 | 0.65% | 6,339 | ~400 |
| /scholarships/up-post-matric-other-than-intermediate-obc | 5.6 | 0.23% | 7,929 | ~380 |
| /scholarships/infosys-foundation-stem-stars-scholarship-program | 5.7 | 1.56% | 10,444 | ~360 |
| /scholarships/up-post-matric-outside-state-general-sc-st | 5.2 | 1.08% | 4,676 | ~280 |
| /scholarships/mp-gaon-ki-beti-yojana | 5.9 | 1.24% | 7,064 | ~270 |
| /scholarships/pre-matric-scholarship-for-obcsebc-students-odisha | 6.0 | 0.67% | 5,244 | ~230 |
| /scholarships/tamil-nadu-post-matric-scholarship-for-scst | 5.2 | 2.49% | 4,908 | ~220 |
| /scholarships/rajasthan-post-matric-scholarship-obc | 4.8 | 0.95% | 3,142 | ~190 |
| /scholarships/post-matric-scholarship-for-obcsebc-students-odisha | 5.9 | 0.30% | 3,505 | ~165 |
| /scholarships/e-medhabruti-pg-merit-scholarship-odisha | 5.8 | 0.50% | 3,290 | ~150 |

Note: the first row is a guide and the second is seasonal (PM Yashasvi applications closed on 31 July), so the real list to act on is about 12 pages.

## How the numbers were made (so they can be repeated)

Search Console API, `page` dimension, per window. Upside = impressions per 30 days x (expected click-through at that position, minus actual), for pages with 300+ impressions per 30 days at positions 1.5-20 and at least 10 clicks of upside. Expected click-through: standard curve (28%, 15%, 11%, 8%, 7%, 5%, 4%, 3.3%, 2.8%, 2.5% for positions 1-10, then 1.5% and 1%) and, as a floor, the site's own June median by position.
