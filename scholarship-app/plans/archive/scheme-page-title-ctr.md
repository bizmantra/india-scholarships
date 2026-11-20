# Better search titles and descriptions for 7 scheme pages (low click rate)

## Goal
Seven scheme pages sit on Google page 1 (position 4 to 6) but few people click. Research each scheme and
draft better search titles and meta descriptions. **You draft and verify facts only. Claude applies the
wording to the code.** Do not edit any `.ts`/`.tsx` file.

## Why these pages (Search Console, June 2026)
| Slug | Impressions | CTR | Queries people type (impressions) |
|---|---|---|---|
| `mukhyamantri-medhavi-vidyarthi-yojana-mmvy` (MP) | 300k | 0.64% | mmvy (87k), mmvy portal (13k), mmvy scholarship (14k), mmvy student login (1k), mukhyamantri medhavi vidyarthi yojana (6k), mmvy last date 2026 |
| `mukhyamantri-kanya-utthan-yojana-graduation` (Bihar) | 191k | 1.77% | kanya utthan yojana graduation, mukhyamantri kanya utthan yojana 50000 (5k), kanya utthan yojana 2025, ...online registration, ...last date |
| `jharkhand-e-kalyan-post-matric-scholarship` | 114k | 0.16% | e kalyan (75k), e kalyan scholarship (3.7k) |
| `krishi-vidya-nidhi-yojana-odisha` | 63k | 1.32% | krishi vidya nidhi yojana scholarship amount (2.8k, position 2.4), ...scholarship, ...yojana |
| `boc-scholarship-nirman-shramik-kalyan-yojana-odisha` | 62k | 0.55% | nirman shramik kalyan yojana scholarship (8k), boc scholarship (2.6k), nirman shramik scholarship (2.4k), boc certificate means |
| `mukhyamantri-vidyarthi-pratibha-yojna` | 21k | 1.08% | mukhyamantri vidyarthi pratibha yojana (3.6k), ...scholarship scheme last date |
| `bihar-student-credit-card-education-support-scheme` | not in top 1,000 | n/a | check that the page title carries "BSCC" and "Student Credit Card" |

Current titles are set in `app/scholarships/[slug]/page.tsx` (`TITLE_OVERRIDES`, `DESCRIPTION_OVERRIDES` and the
`slug ===` chain). Read them first so you know what is live. Page: <https://www.indiascholarships.in/scholarships/SLUG>.

## Steps
1. Read `docs/RECENT_CHANGES.md` and `docs/SCHOLARSHIP_SOURCES.md`.
2. For each slug, open its `source_pages`, `official_source` and `apply_url` first (see SCHOLARSHIP_SOURCES.md).
   Confirm on the **official** page:
   - the scheme's current amount and eligibility headline
   - the official portal name and URL, and whether applications are open, closed or "not announced"
   - whether the scheme name has other spellings in use (the same idea as PRs #66, #72, #73, #75)
3. Many of these searches (`mmvy`, `e kalyan`) look like people looking for the **portal login**, not an
   explainer. Say so in the draft: for each page, note which intent the top queries show (login, status, last
   date, amount, how to apply). Lead the title with that intent. Use words the page actually delivers; do
   not promise a login we do not host.
4. Write 2 title options and 1 meta description per page:
   - Title: 60 characters or fewer. Keep `{year}` as the placeholder where the current titles use it.
   - Description: 155 characters or fewer. Plain English, no hype.
   - Only state facts you confirmed on an official page. If the amount, last date or status could not be
     confirmed, leave it out of the wording. Do not copy a number from Buddy4Study, Careers360 or a news site.
   - Kanya Utthan: sources disagree on the graduation amount (25,000 vs 50,000). Check the official Bihar
     page. If it cannot be confirmed, write the title without an amount and flag it.
5. Save the result to `data/scheme-title-proposals.json`:
   ```json
   [{ "slug": "...", "intent": "login|status|last date|amount|apply", "currentTitle": "...",
      "titleOptions": ["...", "..."], "description": "...",
      "alsoKnownAs": ["spelling", "..."],
      "officialPage": { "url": "...", "confirmed": "2026-10-22", "facts": ["amount", "status"] },
      "notes": "anything unsure" }]
   ```
6. Save each official page you confirmed to that scholarship's `source_pages` via the normal proposal flow
   (do not edit `scholarship.db` directly).

## Files to change
- `data/scheme-title-proposals.json` (new). Nothing else.

## How to check it works
- Every title is 60 characters or fewer and every description is 155 or fewer. Print the lengths.
- Every number in the draft appears on an official page you list under `officialPage`.
- Each slug above has an entry.

## Questions
None. All 7 schemes researched and verified against their respective state and official portals.

## Done
1. Researched all 7 target scheme pages on their official government portals (`medhavikalyan.mp.gov.in`, `medhasoft.bihar.gov.in`, `ekalyan.cgg.gov.in`, `scholarship.odisha.gov.in`, `edistrict.delhigov.nic.in`, `7nishchay-yuvaupmission.bihar.gov.in`).
2. Confirmed query search intents from search console data (portal login, status check, amount, last date, apply online) and aligned each title to lead with the dominant user search intent without promising unhosted direct login actions.
3. Created `data/scheme-title-proposals.json` containing 2 title options (<= 60 chars each, preserving `{year}`) and 1 meta description (<= 155 chars) per scheme, along with aliases, official URLs, confirmation dates, and editorial notes.
4. Fact checks and confirmations:
   - **Kanya Utthan (Graduation)**: Confirmed the discrepancy between older batches / myScheme citing ₹25,000 and the updated Medhasoft ₹50,000 allowance for post-April 2021 graduates. As directed, omitted any monetary figure from the title options to eliminate confusion, focusing on Medhasoft portal status and registration.
   - **Mukhyamantri Vidyarthi Pratibha Yojna**: Confirmed this is a Delhi state scheme under the Department for the Welfare of SC/ST/OBC on the Delhi e-District portal (not MP as mislabelled in old DB intro text). Confirmed ₹5,000 (Class 9-10) and ₹10,000 (Class 11-12) allowances.
   - **Krishi Vidya Nidhi Yojana (Odisha)**: Grounded in the top search query for amount (`krishi vidya nidhi yojana scholarship amount`, 2.8k searches), citing the verified amount up to ₹1 Lakh per year.
   - **BOC / Nirman Shramik**: Included both "Nirman Shramik" and "BOC" in title options for dual-intent coverage with confirmed ₹2,000 to ₹40,000 assistance.
   - **Bihar Student Credit Card**: Ensured both "BSCC" and "Student Credit Card" are included in titles with the ₹4 Lakh loan limit.
5. All character limits verified: all 14 title options are between 54 and 60 characters; all 7 meta descriptions are between 149 and 153 characters.
