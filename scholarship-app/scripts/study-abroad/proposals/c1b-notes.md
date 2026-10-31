# Batch C1b Notes: USA Guide Summaries (2026-10-29)

- **Target Query**: `country = 'usa' AND status = 'published' AND summary LIKE 'Complete 20%'` on `sa_guides`
- **Target Database**: Staging (`--target=staging`)
- **Total Published USA Guides Matching Boilerplate**: 49
- **Proposals Generated & Submitted**: 49
- **Pages Skipped**: 0 (all 49 pages addressed)

## Files Created
1. `scripts/study-abroad/proposals/c1b-usa-summaries-1-2026-10-29.json` (20 pages)
2. `scripts/study-abroad/proposals/c1b-usa-summaries-2-2026-10-29.json` (20 pages)
3. `scripts/study-abroad/proposals/c1b-usa-summaries-3-2026-10-29.json` (9 pages)

## Summary Constraints Verification
- **Character Count**: All 49 summaries are under 220 characters.
- **Specific**: Each summary identifies the target audience (e.g. Indian students, parents, offer holders, STEM applicants) and cites a concrete fact directly stated in the guide's own body.
- **No Boilerplate**: 0 summaries start with "Complete 2026 guide to" or any "Complete 20xx" variant.
- **Uniqueness**: No two summaries in the batch share the same first 5 words.
- **Dry-run**: 0 refusals across all 3 files.
- **Submission**: All 49 proposals submitted to the staging agent inbox (`agent: content-editor`, `category: study_abroad`, `kind: sa_field_change`).

## 5-Page Fact Spot-Check
1. `us-consulate-slot-booking-hacks`:
   - *Summary Claim*: Requires scheduling two separate appointments on usvisascheduling.com (OFC biometrics before consular interview).
   - *Page Verification*: Verified in body Section 1 ("Two Separate Appointments Required", OFC biometrics and Consular Interview).
2. `usa-duolingo-det-preparation-guide`:
   - *Summary Claim*: Duolingo English Test costs ~$59 and delivers certified scores to US universities within 48 hours.
   - *Page Verification*: Verified in body Section 1 ("Low Cost ($59 USD)", "Fast 48-Hour Results").
3. `usa-health-insurance-waiver-guide`:
   - *Summary Claim*: Replaces $2,200 to $3,500 university health plans with qualifying ISO or PSI plans.
   - *Page Verification*: Verified in body Section 1 ("High University Plan Costs ($2,200 to $3,500 USD per year)", ISO and PSI waiver comparison).
4. `usa-on-campus-jobs-20hr-rule`:
   - *Summary Claim*: Legal work limit of up to 20 hours/week during semesters and 40 hours during vacations.
   - *Page Verification*: Verified in body Section 1 ("20 Hours/Week Limit During Semesters", "40 hours per week during official university winter/summer breaks").
5. `usa-wes-credential-evaluation-manual`:
   - *Summary Claim*: WES ICAP course-by-course package costs $217 for evaluating Indian university marksheets.
   - *Page Verification*: Verified in body Section 1 ("Order the 'ICAP Course-by-Course' Package", "$217 USD").
