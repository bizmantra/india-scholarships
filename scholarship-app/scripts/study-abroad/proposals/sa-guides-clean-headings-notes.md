# P2 Backlog: Clean Headings Migration for 94 Study Abroad Guides

**Date**: 2026-11-02  
**Target Proposal**: `scripts/study-abroad/proposals/sa-guides-clean-headings-2026-11-02.json`  
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
2. **Official Statutory & Institutional Citations**:
   - Integrated verified 1-to-1 official citations from allowlisted domains (`data/study-abroad/official-domains.json`):
     - Germany: `daad.de`, `uni-assist.de`, `gesetze-im-internet.de`, `auswaertiges-amt.de`, `india.diplo.de`, `tum.de`, `rwth-aachen.de`, `kit.edu`.
     - USA: `studyinthestates.dhs.gov`, `ice.gov`, `uscis.gov`, `purdue.edu`, `gatech.edu`, `utexas.edu`, `utdallas.edu`, `buffalo.edu`, `sjsu.edu`, `uta.edu`, `asu.edu`, `iit.edu`, `uic.edu`.
   - Every citation was verified via HTTP 200 before inclusion.
   - Inserted official reference callouts linking directly to the statutory/institutional page.
3. **Inbox Proposal Compliance**:
   - Verified via `propose-changes.mjs --dry-run`: 0 refusals across all 94 guides.
   - Offline test suite `test-heading-proposals.mjs` asserts 100% pass on `sa.validateSaValue`, zero `BANNED` phrases, allowlist domain membership, and word count / link requirements.
