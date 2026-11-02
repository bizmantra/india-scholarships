# P2 Backlog: Clean Headings Migration for 94 Study Abroad Guides

**Date**: 2026-11-02  
**Target Proposal**: `scripts/study-abroad/proposals/sa-guides-clean-headings-2026-11-02.json`  
**Tracked Sources Registry**: `scripts/study-abroad/proposals/heading-migration-sources.json`  
**Generator**: `scripts/study-abroad/migrate-executive-summary-headings.mjs`  
**Test Suite**: `scripts/study-abroad/test-heading-proposals.mjs`  

## 1. Problem Statement
- In `scripts/lib/sa-inbox.js`, `/executive summary/i` is a hardcoded banned pattern under `sa.BANNED` ("contains research notes or template filler that must not appear on the page").
- 94 published Study Abroad guides (`sa_guides`) across Germany (44) and USA (50) carried legacy `## Executive Summary: [Topic]` headings.
- Any future `body_md` edit for those guides was blocked unless the heading was renamed and an official citation was provided (inbox requires `>= 150 words` and `https?://` links).

## 2. Changes Made
1. **Heading Normalization**:
   - Converted all 94 `## Executive Summary: [Topic]` occurrences into direct, passage-indexed H2 headings (`## [Topic]`).
   - Cleaned legacy filler in `germany-daad-scholarships-guide` ("holy grail" replaced with "premier scholarship").
2. **Authoritative Statutory & Institutional Citations**:
   - Integrated verified 1-to-1 official citations from allowlisted domains (`data/study-abroad/official-domains.json`):
     - Germany: `daad.de`, `uni-assist.de`, `gesetze-im-internet.de`, `auswaertiges-amt.de`, `india.diplo.de`, `tum.de`, `rwth-aachen.de`, `kit.edu`.
     - USA: `studyinthestates.dhs.gov`, `ice.gov`, `uscis.gov`, `purdue.edu`, `gatech.edu`, `utexas.edu`, `utdallas.edu`, `buffalo.edu`, `sjsu.edu`, `uta.edu`, `asu.edu`, `iit.edu`, `uic.edu`.
   - Placed citation callouts cleanly at the bottom of the article (`\n\n---\n\n> 🔗 ...\n`) with tailored categories (`Statutory Reference`, `Official Government Guidance`, `Official Portal`, `Institutional Guidelines`), preventing intro-splitting or CommonMark parsing issues.
   - Proposed strictly `body_md` (0 overwrites of `official_source` or other fields).
3. **Reproducibility & Verification**:
   - Tracked all 94 verified citations in `heading-migration-sources.json`.
   - Verified via `propose-changes.mjs --dry-run`: exactly 94 proposed, 0 refused.
   - Offline test suite `test-heading-proposals.mjs` asserts:
     - 94 items with tracked inputs.
     - Strictly `body_md` proposals.
     - Diff-based content integrity: heading count preserved, clean callout boundary, and zero accidental prose regressions.
     - 100% pass on `sa.validateSaValue`, zero `sa.BANNED` phrases, and 100% allowlisted domains.
