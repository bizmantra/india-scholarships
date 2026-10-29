# Batch C1c: University Summaries Replacement

## Scope
- **Batch**: C1c (Study Abroad University Summaries)
- **Target Table**: `sa_universities` where `status = 'published'` and `summary LIKE 'Complete 20%'`
- **Agent**: `content-editor`
- **Target Environment**: Staging Turso database (`india-scholarships-staging-wonderchild111`)

## Database Audit & Count Confirmation
Per `DATABASE_OPERATIONS.md`, **Turso Production is the master / current database**.
- **Production Count (Current)**:
  - 45 total published universities.
  - **16** published universities with boilerplate "Complete 20..." summaries (and 29 universities already have verified, specific summaries updated on 2026-10-23).
  - Matches the ~17 count estimated from local snapshots when `study-abroad-content-spec.md` was drafted.
- **Staging Count (Unrefreshed Snapshot)**:
  - Staging had not been refreshed from production via `scripts/refresh-staging.js` since before the 2026-10-23 updates.
  - Consequently, staging still had **37** published universities with boilerplate summaries.
  - To ensure complete consistency across staging and production, proposals were generated for all 37 universities present with boilerplate summaries on staging.

## Review Corrections & Revision Notes (20 Summaries)
During PR review, 20 of the 37 initial proposals were identified as containing figures not explicitly stated on the page data:
1. **Generic Semester Fees ("€250 to €350")**:
   - Replaced with exact figures from the page data (e.g. €341.40 for Chemnitz, €363.07 for Bonn, €402 for Hamburg, €400 for TUHH, €472.50 for TU Braunschweig, €367.80 for Duisburg-Essen, €190 for Freiburg, €453.16 for Leibniz Hannover, €329.30 for OVGU Magdeburg, €412.30 for Saarland, and €361 for TU Dresden).
2. **Generic Bavarian GPA Cutoffs ("2.0", "2.2", "2.3", "2.5")**:
   - Extrapolated grade matrix ranges were dropped or replaced with specific program requirements from the page data (e.g., German GPA 3.0 for UDE ISE, C1 / IELTS requirements, APS, and aptitude tests).
3. **US Cost & Admission Figures**:
   - Replaced with the exact page data figures:
     - `gatech-georgia-tech`: $16,540/semester tuition (fall 2026), $57,025 proof of funds for I-20, 3-year degree rule.
     - `neu-northeastern-university`: $1,922 per credit hour (2026–27), $59,449 proof of funds for I-20, 3-year degree accepted.
     - `suny-buffalo`: $14,914.86/semester graduate tuition (fall 2026), $57,200 I-20 proof of funds.
     - `ut-arlington-uta`: $44,720/year average non-resident graduate cost, GRE 305+ cutoff for CSE.
4. **TU Dresden Specific Contribution**:
   - Stated €361 semester contribution included.

## Staging Inbox Status
- The initial 20 proposals on staging (IDs 2898, 2919, 2925, 2915, 2912, 2923, 2924, 2904, 2907, 2909, 2903, 2914, 2916, 2913, 2930, 2900, 2902, 2906, 2918, 2931) were marked **`rejected`** in `agent_proposals` with note: *"Rejected in review: contains unverified or generic figures not stated on page"*.
- The revised 20 summaries were submitted cleanly via `propose-changes.mjs --target=staging` (creating 20 new proposals).
- The other 17 approved summaries (e.g. ASU, CMU, Columbia, GMU, NYU, Rutgers, Stevens, Stony Brook, TAMU, UC Berkeley, UCI, UCSD, UIUC, UMich, UNCC, USC, UTD) remain pending and waiting in the staging inbox.

## Content Standards Enforced
1. **Length**: All 37 summaries are <= 220 characters (range: 145–218 chars).
2. **Specificity**: Includes city/campus location, primary academic strength/reputation, and exact verifiable figures from page data.
3. **Anti-Boilerplate**: None start with "Complete 2026 guide to..." or template phrases.
4. **Uniqueness**: No two summaries start with the same five words.
5. **Factual Integrity**: Every figure in all 37 summaries strictly matches existing page data.
