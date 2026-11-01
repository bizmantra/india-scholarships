# Brief for AGY: Krishi (Krushi) Vidya Nidhi Yojana, Odisha: find the official source for the amounts

Written 2026-10-22 (backlog item CNT-114). Research only: see the rules.

## Goal
Our scholarship page for Krishi Vidya Nidhi Yojana (Odisha) states some amounts and rules that appear only on secondary websites, and those sites disagree with each other. Find out which of them an **official** Odisha government page confirms, contradicts, or does not mention.

## What is already confirmed (do not redo)
Odisha Information & Public Relations press release, 28-03-2025: https://inpr.odisha.gov.in/sites/default/files/2025-03/News-AgFE_28032025EEEE.pdf. Krushi Vidya Nidhi is a component of CM-KISAN for sons/daughters of CM-KISAN beneficiaries; annual tuition fees including hostel fees; actual course fee in government institutes; private-institute yearly caps (B.Tech 60,000; M.Tech 66,000; MBA 65,000; medical 4-5 years 37,950; B.Pharma 35,000; nursing 19,450; 2-year medical 58,000; architecture 60,000). It does not mention ₹1,00,000 or ₹5,000.

## The claims to check (1, 2, 4 and 5 are as written on our page; 3 and 6 are open questions)
| # | Claim on our page | Where to look |
|---|---|---|
| 1 | "variable financial assistance ranging from ₹5,000 to ₹1,00,000 per annum" (so a **minimum of ₹5,000** and a **maximum of ₹1,00,000**) | Scheme guidelines or notification |
| 2 | "students admitted to premier institutions (NIT, IIT, IIM, AIIMS, ICAR) can receive up to ₹1,00,000 or actual recommended fees, whichever is lower" | Same |
| 3 | Open question: are premier institutions **outside Odisha** eligible? (secondary websites disagree: some say yes, some say no) | Same |
| 4 | Hostel and mess: ₹1,200 per month for 10 months (₹12,000 a year) for UG, PG and PhD; ₹1,000 per month for 10 months (₹10,000 a year) for Diploma, Polytechnic and ITI | Same |
| 5 | The scheme pays tuition, annual fees and one-time fees, and excludes caution money and refundable amounts | Same |
| 6 | The 2026-27 application window (opening date and last date for students), if officially published | scholarship.odisha.gov.in notice board or the department's notice |

## Where to start
1. https://scholarship.odisha.gov.in (State Scholarship Portal): notices, scheme pages, guidelines downloads.
2. The Odisha Agriculture & Farmers' Empowerment Department website and the CM-KISAN pages (search the department's site for "Krushi Vidya Nidhi" and "CM-KISAN").
3. Odisha government resolutions, gazette notifications and press releases (odisha.gov.in, inpr.odisha.gov.in).
4. Only if the above have nothing, other official or provider pages. Secondary sites are leads only.

## Rules (read first)
- You only **research and report**. Do **not** edit any file except the one results file named below. Do not touch the database, `.env*` files, scripts, `app/`, `lib/` or `data/`. Do not run git commands, open pull requests or commit.
- Use only **official** pages as proof: government sites (`.gov.in`, `.nic.in`, state portals), the provider's own site, university or institute sites, and official PDFs or gazette notices. Platform and listing sites (Buddy4Study, Vidyasaarathi, Careers360, Shiksha, news) may be listed as **leads** but never as proof. Coaching sites are never a source. See `docs/SCHOLARSHIP_SOURCES.md` for the tiers.
- Every fact you report needs (1) the exact URL of the page that states it and (2) a **verbatim quote** (one or two sentences, copied exactly) from that page. If you cannot show both, write `NOT FOUND`. Do not guess, round, translate dates from memory, or fill gaps from what is "usually" true. An invented date or amount is worse than `NOT FOUND`.
- If a page does not load, say so and give the URL. Do not substitute another page's information.
- Dates are written `YYYY-MM-DD`. Today is 2026-10-22. Only the **student application deadline** counts (not institute or district verification, not portal closure).
- Claude checks every quote against its page before anything is used, so a quote that is not on the page will be found and the whole answer discarded.

## Output
Write **only** `plans/agy-results/agy-krishi-findings.md` (create the folder if needed) with:

1. A table, one row per claim 1 to 6: `claim | verdict | official URL | verbatim quote | document date`.
   Verdict is exactly one of `CONFIRMED`, `CONTRADICTED`, `NOT FOUND`. `CONTRADICTED` needs a quote that states something different.
2. A short list of **leads** (secondary pages) that pointed you somewhere, each labelled with the kind of site. Never use these as proof.
3. A list of the official pages you opened that had nothing relevant, so nobody repeats the search.

## How Claude will check it
Every quote is looked up on its page. Anything not found there is dropped. Confirmed items become a reviewed correction (or an inbox proposal) with your URL as the source; nothing you write goes live by itself.

## Questions
(write here if blocked, then stop)

## Done
(fill in when finished: the results file path and how many claims are CONFIRMED / CONTRADICTED / NOT FOUND)
