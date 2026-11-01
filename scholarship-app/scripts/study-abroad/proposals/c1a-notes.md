# Batch C1a Notes: Germany Guide Summaries

**Date:** 2026-10-29  
**Agent:** content-editor  
**Target:** staging (`libsql://india-scholarships-staging-***.aws-ap-south-1.turso.io`)

## Summary & Counts
- **Total published Germany guides queried on staging:** 54
- **Published Germany guides with boilerplate summaries (`summary LIKE 'Complete 20%'`):** 21
- **Proposals generated:** 21
- **Proposals submitted to staging inbox:** 21
- **Proposals refused:** 0
- **Pages skipped:** 0

## Notes on Specific Pages
- **Duplicate/Redirect Pair (`germany-routes-hub-guide` and `germany-visa-routes-hub-guide`):**
  `germany-routes-hub-guide` has a redirect rule pointing to `germany-visa-routes-hub-guide` in `lib/study-abroad/redirects.json`. However, both rows currently exist as published records in `sa_guides` on staging with the boilerplate summary. To ensure complete cleanup across the table without leaving dangling boilerplate, distinct compliant summaries were proposed for both, with distinct opening phrases and character lengths under 220 characters.

## Quality & Rule Compliance
- All 21 summaries are under 220 characters (range: 177–209 chars).
- No summaries start with "Complete 2026 guide to" or any template filler.
- No two summaries in the batch share the first five words.
- All facts are sourced strictly from each page's existing `body_md` and `who_for` fields with zero new facts introduced.
