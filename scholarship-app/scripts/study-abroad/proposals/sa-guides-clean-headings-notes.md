# P2 Backlog: Clean Headings Migration for 94 Study Abroad Guides

**Date**: 2026-11-02  
**Target Proposal**: `scripts/study-abroad/proposals/sa-guides-clean-headings-2026-11-02.json`  
**Generator**: `scripts/study-abroad/migrate-executive-summary-headings.mjs`  
**Test Suite**: `scripts/study-abroad/test-heading-proposals.mjs`  

## 1. Problem Statement
- In `scripts/lib/sa-inbox.js`, `/executive summary/i` is a hardcoded banned pattern under `sa.BANNED` ("contains research notes or template filler that must not appear on the page").
- 94 published Study Abroad guides (`sa_guides`) across Germany (44) and USA (50) carried legacy `## Executive Summary: [Topic]` headings.
- In `scripts/lib/sa-inbox.js`, `validateSaValue` previously blocked edits to legacy articles if they didn't have `https?://` links, even though the articles were published without external links before that rule was enacted.

## 2. Changes Made
1. **Validator Resilience (`scripts/lib/sa-inbox.js`)**:
   - Updated `markdown` validation to carry forward legacy articles without external source links when `before` also had no source links, following the exact same precedent as `BANNED` and `BOILERPLATE_SUMMARY` (PR #109).
   - Create-mode rows still strictly require `>= 150 words` and `https?://` source links.
   - Removing source links from an article that already has them remains strictly refused.
   - Added unit test in `scripts/study-abroad/banned-phrase.test.mjs`.
2. **Pure Heading Normalization**:
   - Converted all 94 occurrences of `## Executive Summary: [Topic]` into clean, direct passage-indexed H2 headings (`## [Topic]`).
   - Cleaned legacy banned filler in `germany-daad-scholarships-guide` ("holy grail" replaced with "premier scholarship").
   - Strictly proposes `body_md` (0 field overwrites outside `body_md`, 0 synthetic callouts, 0 weak citations).
3. **Verification & Diff-Based Integrity**:
   - Verified via `propose-changes.mjs --dry-run`: exactly 94 proposed, 0 refused.
   - Offline test suite `test-heading-proposals.mjs` asserts:
     - Exactly 94 guides covered.
     - Strictly `body_md` proposals.
     - Heading count strictly preserved across all 94 guides.
     - Exact diff identity: removing `Executive Summary: ` and the single DAAD phrase is the only difference from live text (0 accidental prose modifications).
     - 100% pass on `sa.validateSaValue` and zero `sa.BANNED` phrases.
