# UK Study Abroad Pre-Launch Audit & Readiness Report

**Date:** 2026-11-21  
**Branch:** `chore/uk-prelaunch-audit`  
**Scope:** 12 UK universities, 35 UK courses (11 MBAs + 24 MSc CS/DS), 2 UK visa/cost guides, and 6 UK `sa_facts` entries (49 pages + 6 facts across 60 `scripts/study-abroad/proposals/uk-*.json` files).  
**Country Launch Flag:** `launched: false` on UK in `lib/study-abroad/countries.ts` (unchanged).

---

## 1. Launch Readiness Verdict

**Status:** **READY FOR INBOX FILING & OWNER APPROVAL** (after HC 584 alignment proposal is applied).

All 49 UK draft pages pass `auditStudyAbroad` Rules 1, 2, 3, 4, 5, and 7 with **0 errors and 0 warnings**, have **0 broken internal links**, and follow evergreen slug and `seo_title` rules. The 25-page HC 584 living-money alignment proposal (`scripts/study-abroad/proposals/uk-hc584-living-money-align-2026-11-21.json`) is now ready alongside the 3 open-fact fix proposals.

### Remaining Launch Steps
1. **HC 584 Living Money Rate Alignment (Proposal Ready):**
   - Created `scripts/study-abroad/proposals/uk-hc584-living-money-align-2026-11-21.json` updating all 25 pages (11 MBA drafts, 12 University drafts, and both UK guides) from pre-30-Nov-2026 rates (`£1,171/mo` outside London, `£1,529/mo` in London) to **HC 584** rates (`£1,203/mo` = `£10,827` for 9 months outside London, `+£288` on worked totals; `£1,570/mo` = `£14,130` for 9 months in London, `+£369` on worked totals), with `checked_at: "2026-11-21"`.
   - `sa_facts` HC 584 effective-date updates are handled in Workstream 1 (`uk-funds-calculator-facts-2026-11-21.json`).
2. **Command Center Inbox Filing & Approval:**
   - All `uk-*.json` proposal files (57 existing + 3 open-fact fix proposals + 1 HC 584 alignment proposal = **61 files**) remain unfiled in `scripts/study-abroad/proposals/`. File via `propose-changes.mjs` and approve in `/admin`.
3. **Audit Rule 6 Allowlist (`UNLAUNCHED_COUNTRIES`):**
   - `scripts/lib/quality-rules.js` (line 149) currently includes `'uk'` in `UNLAUNCHED_COUNTRIES`, triggering **52 `unlaunched_country_link`** errors on UK internal links. Remove `'uk'` from `UNLAUNCHED_COUNTRIES` in the same PR that sets `launched: true` for UK.

---

## 2. Open UK Research Items Closed (Task 2)

Re-checked directly against live official `.ac.uk` pages on **2026-11-21**:

| Item | Status | Finding & Source | Action Taken |
|---|---|---|---|
| **Birmingham MBA: IELTS row** | `NOT CONFIRMED` | `birmingham.ac.uk/.../mba` still omits an IELTS line. `international-entry-requirements` lists Management at 7.0 (min 6.5) with a footnote that some Business programmes require higher grades. | Updated `plans/uk-research/mba/university-of-birmingham.md`. No proposal change. |
| **Glasgow MBA: "India World Changers" £5,000 award (2027)** | **CONFIRMED** | `gla.ac.uk/scholarships/worldchangersglasgowscholarship/` confirms **£5,000** automatic discount for Sep 2027 / Jan 2028; India is eligible and `MBA (Master of Business Administration)` is explicitly listed under Eligible programmes. `worldchangersindiaexcellenceaward/` (£12,500, deadline 31 Mar 2027) also explicitly lists the MBA for 2027/28. | Updated `plans/uk-research/mba/university-of-glasgow.md` and wrote `uk-course-university-of-glasgow-mba-world-changers-fix-2026-11-21.json`. |
| **Nottingham MBA: management-experience rule** | **CONFIRMED** | `nottingham.ac.uk/.../business-administration-mba` and `applying-for-an-mba.aspx` both state work experience must include **"some management experience"** (Home/Applying: 3–5 years; International tab: min 3 years). | Updated `plans/uk-research/mba/university-of-nottingham.md` and wrote `uk-course-university-of-nottingham-mba-experience-fix-2026-11-21.json`. |
| **Manchester MSc Data Science: 2027 international tuition** | **CONFIRMED** | `manchester.ac.uk/.../22195/.../` now publishes September 2027 tuition: **£37,000 per annum** international (UK: £18,200). Worked first-year total: **£49,549** (£37,000 + £10,827 + £558 + £1,164), or **£37,549** after the £12,000 Global Futures Scholarship. | Updated `plans/uk-research/cs-ds/university-of-manchester.md` and wrote `uk-course-university-of-manchester-ds-tuition-fix-2026-11-21.json` (also tightened `meta_description` to 147 chars). |

---

## 3. Compliance & Number-Check Audit (Task 3)

### 3.1 `check-draft-numbers.mjs`
- Ran across all 57 existing `uk-*.json` proposals against `plans/uk-research/` notes: **50 changes** had flagged figures, all of which are **worked arithmetic sums/differences** (e.g. first-year totals, post-scholarship totals, 9-month living-cost products, visa-length months) rather than unsourced facts.
- Ran on the **3 new fix proposals** against their respective research notes + `uk-visa-facts.md` + `uk-surcharge-note.md`:
  - `uk-course-university-of-glasgow-mba-world-changers-fix-2026-11-21.json`: 33/37 in notes; 4 flagged (`£10539`, `£52973`, `3 november`, `21 november` — worked arithmetic & check dates).
  - `uk-course-university-of-nottingham-mba-experience-fix-2026-11-21.json`: 25/32 in notes; 7 flagged (`£10539`, `£46673`, `£31800`, `£43673`, `85%`, `3 november`, `21 november` — worked arithmetic, check dates, and `85%` from `uk-gaps-round3.md`).
  - `uk-course-university-of-manchester-ds-tuition-fix-2026-11-21.json`: 39/41 in notes; 2 flagged (`£37549`, `21 november` — worked post-scholarship total & check date).

### 3.2 `auditStudyAbroad` (`scripts/lib/quality-rules.js`)
Simulating all 49 merged UK pages as `status: 'published'` (today = `2026-11-21`):
- **Rule 1 (Boilerplate / summary length <= 220):** 0 errors
- **Rule 2 (`seo_title` <= 70, `meta_description` 110–170, no duplicate titles):** 0 errors
- **Rule 3 (Banned phrases):** 0 errors
- **Rule 4 (`official_source` & `checked_at` present, <= 90 days):** 0 errors, 0 warnings
- **Rule 5 (Identical money values across 4+ pages):** 0 errors
- **Rule 6 (Internal links):** **0 `broken_internal_link`**, **52 `unlaunched_country_link`** (expected while UK is `launched: false`)
- **Rule 7 (Program `university_slug` exists & published):** 0 errors

### 3.3 `CONTENT_RULES.md` & `SEO_AND_SCHEMA_RULES.md` Advisories
- **Evergreen slugs (no year in slug):** 0 violations.
- **`seo_title` <= 65 chars:** 0 violations.
- **No `# ` H1 inside `body_md` / no exclamation marks:** 0 violations.
- **`meta_description` outside 140–160 chars** (template target; `audit-content.mjs` allows 110–170): **6 remaining pages** are 161–165 chars (`newcastle-university-data-science` 163, `university-of-leeds-data-science` 163, `university-of-manchester-computer-science` 163, `university-of-nottingham-data-science` 162, `university-of-sheffield-computer-science` 162, `uk-total-cost-breakdown` 161).
- **Course `body_md` word count outside 800–1,400 words:** 21 of 35 courses are 1,407–1,548 words (slightly over 1,400 due to Sources links and tables; non-blocking).

---

## 4. Next Steps (For Coordinator / Owner)
1. File and approve the 3 open-fact fix proposals (`*-2026-11-21.json`) and `uk-hc584-living-money-align-2026-11-21.json` alongside the existing UK proposals in `/admin`.
2. Remove `'uk'` from `UNLAUNCHED_COUNTRIES` in `scripts/lib/quality-rules.js` when flipping `launched: true` on UK.
3. Keep `Birmingham MBA` IELTS marked `NOT CONFIRMED` unless Birmingham Business School admissions confirms which table row applies.
