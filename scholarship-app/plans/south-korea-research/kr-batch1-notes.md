# South Korea, batch 1 (hub, D-2 visa, proof of funds, cost of living): filing notes

Date: 2026-11-28. Status: drafts only. South Korea stays `launched: false` in `lib/study-abroad/countries.ts` and is in `UNLAUNCHED_COUNTRIES` (`scripts/lib/quality-rules.js`) and `KNOWN_COUNTRIES` (`scripts/lib/sa-inbox.js`). Nothing here is filed to the Inbox. Do not run `propose-changes.mjs` on these files until Roshan approves.

## The pages

| Page | Where its text lives | File |
|---|---|---|
| Country hub `/study-abroad/study-in/south-korea` | Built by code. Its three key-fact tiles come from `sa_facts`. | `scripts/study-abroad/proposals/south-korea-facts-2026-11-28.json` (7 facts) and the `KEY_FACTS['south-korea']` line in `app/study-abroad/study-in/[country]/page.tsx` |
| D-2 visa guide `/study-abroad/visas/south-korea-student-visa-guide` | `sa_guides`, kind `visa` | `south-korea-visa-guide-2026-11-28.json` |
| Proof of funds `/study-abroad/study-in/south-korea/south-korea-proof-of-funds-guide` | `sa_guides`, kind `guide` | `south-korea-funds-guide-2026-11-28.json` |
| Cost of living `/study-abroad/study-in/south-korea/south-korea-cost-of-living` | `sa_guides`, kind `guide` | `south-korea-cost-of-living-guide-2026-11-28.json` |

Routing follows the UK, Australia and Canada pattern (visa guide under `/visas/`, other guides under `/study-in/<country>/`). The slugs are my choice; the build schedule's URL for Korea does not match the site's real routes.

Every figure, quote, URL and read date is in `kr-visa-facts.md`.

## Hub tiles

1. `south-korea.visa.d2_fee_usd` (USD 60, blue) "Student visa fee (D-2)"
2. `south-korea.living.monthly_min_krw` (KRW 750,000, green) "Living cost per month, from"
3. `south-korea.visa.kvac_service_fee_inr` (INR 1,380, emerald) "Visa centre service fee, India"

The tile formatter formats any 3-letter unit as currency with `en-IN`. The value `750,000` has a comma, so I changed one line to strip commas before `Number(...)` (same fix as the Canada PR; the two PRs will merge cleanly on that line). A KRW tile will show as `₩750,000`. The INR tile shows as `₹1,380`.

## Suggested filing order (after approval)

1. The three guide files, then the facts file. Dry run first: `node scripts/study-abroad/propose-changes.mjs <file> --target=staging --dry-run`.
2. Seven entries are added to `data/study-abroad/source-checks.json`. All seven pass `verify-sources.mjs`. Two quote the Korean-language Embassy page; the checker's text cleaner puts a space between Korean and digits, so those quotes carry that space (the note on each entry says so).

## Numbers that need a second look

- **Exchange rate (owner decision).** No official KRW to INR rate exists. The pages use INR 0.0694 per won, built from the RBI rate (INR 92.9139 per USD, 27 Nov 2026) and the Bank of Korea close (KRW 1,337.9 per USD, 27 Nov 2026). It is written into the text. `lib/study-abroad/rbi-rate.ts` is live only for USD, GBP and EUR. Roshan does not want hardcoded rates, so Korea needs a live read before launch. Until then the rupee figures are dated text.
- **Proof of funds.** The Ministry of Justice figure (KRW 20 million capital area, KRW 16 million elsewhere) comes from a footnote in a 5 Feb 2026 press release about a different topic (junior-college pilot courses). It is a PDF, so `verify-sources.mjs` cannot check it, and no `sa_facts` row uses it. It appears only in the funds guide text. Korea.net (23 June 2023) confirms the 2023 change to won. Roshan or a reviewer should look for the current immigration guideline page and see if it can replace the footnote.
- **KAIST says USD 16,000 is the Ministry minimum.** That is not the won figure. The funds guide shows both and tells the reader to treat the university's number as the one to meet.
- **Visa fee** is "approximately USD 60" on Study in Korea. The Embassy page does not state how the fee is paid.
- **Living costs.** The four items on Study in Korea add up to more than its total. The guide says so.
- **Facts carry `recheck_after` 2027-02-26.**

## Left out because no official page I could read gives it

- Visa-centre fees, hours and processing times for Mumbai and Chennai.
- The contents of the D-2 and D-4 checklist (PDF attached to the Embassy page).
- Which cities count as "capital area" for the KRW 20 million rule.
- Any city-by-city budget. Study in Korea's price table is sourced to Namu Wiki, a user-edited wiki.
- Rent outside dormitories.
- The Korean-language standard for master's students' part-time hours (the page shows "-").
- Interview rates or approval rates for India (no official figure).
- Spouse and dependants rules (not researched).

## Launch checklist for South Korea (not done here)

- Remove `'south-korea'` from `UNLAUNCHED_COUNTRIES` in `scripts/lib/quality-rules.js` in the PR that sets `launched: true`. The `unlaunched_country_link` errors in the audit come from that list and are expected while hidden.
- Add a live KRW read (see the exchange rate note).
- Re-read every source in `kr-visa-facts.md` and `kr-batch2-notes.md`. Intake dates and fees change each cycle.

## Live KRW/INR rate (added 2026-11-28, owner decision)

The working rate is a live cross rate in code, not a hardcoded figure: RBI USD/INR divided by the Bank of Korea USD/KRW 15:30 close (ECOS series 731Y003, item 0000003). The reader is `lib/study-abroad/krw-rate.ts`, composed with `lib/study-abroad/rbi-rate.ts`. Fallback values, used only when a live read fails, are RBI ₹92.9139 per USD and Bank of Korea ₩1,337.9 per USD, both as of 27 November 2026. Guide prose still shows dated rupee snapshots at ₹0.0694 per won, and says the working rate should be read live.
