# Port map: retired `Study-Abroad-IS` repo → live `scholarship-app`

Date fence: the live site took over study-abroad on **28 Sep 2026** (Phase 1 cut-over, recovery plan). The old repo's later commits are only the redirect and recovery-plan docs. Audit done 24 Oct 2026.

Status key: **Live** = replaced by a file or code here. **Restored** = brought back by this change. **Unchecked** = not compared line by line; do that before relying on or deleting the old file. **Dead** = superseded.

## Docs (`docs/internal-specs/` in the old repo)

| Old file | Now | Status |
|---|---|---|
| `STUDY_ABROAD_CONTENT_RULES.md` | [CONTENT_RULES.md](CONTENT_RULES.md) + [TERMS.md](TERMS.md) | Restored |
| `STUDY_ABROAD_SEO_GUIDELINES.md` (per page type) | [templates/](templates/README.md) (title/description rules, one file per page type) | Restored in [SEO_AND_SCHEMA_RULES.md](SEO_AND_SCHEMA_RULES.md) (slugs, schema per type, page checks) |
| `STUDY_ABROAD_CONTENT_ARCHITECTURE.md` (page map, 30-university queue) | Routes under `app/study-abroad/`, tables `sa_*`, [STUDY_ABROAD_COUNTRY_EXPANSION_PLAN.md](STUDY_ABROAD_COUNTRY_EXPANSION_PLAN.md) | Compared 29 Oct 2026: calculator-in-entity-page decision recorded in [SEO_AND_SCHEMA_RULES.md](SEO_AND_SCHEMA_RULES.md) §5; 30-university queue not checked against the database |
| `STUDY_ABROAD_ARCHITECTURE.md`, `SYSTEM_ARCHITECTURE_MAP.md` | `docs/ARCHITECTURE_CONTEXT.md`, `lib/study-abroad/`, [templates/LINKING_RULES.md](templates/LINKING_RULES.md) | Unchecked |
| `SEO_E_E_A_T_COMPLIANCE_SPEC.md` (title/meta contracts, YMYL safeguards, JSON-LD) | Template shared rules 1–2, 5, 7 (sources, byline, titles); JSON-LD in `app/study-abroad/_components/DetailShell.tsx` and the university/program pages | Restored in [SEO_AND_SCHEMA_RULES.md](SEO_AND_SCHEMA_RULES.md) (YMYL, JSON-LD). Schema choice per type still needs an owner decision |
| `CONTENT_OPERATIONS_REPLICATION_PLAYBOOK.md` (country bootstrap, 7-variable matrix, 9-module taxonomy) | [STUDY_ABROAD_COUNTRY_EXPANSION_PLAN.md](STUDY_ABROAD_COUNTRY_EXPANSION_PLAN.md), `lib/study-abroad/countries.ts` | Compared 29 Oct 2026: missing variables added in [SEO_AND_SCHEMA_RULES.md](SEO_AND_SCHEMA_RULES.md) §6; 9-stage structure still to compare with `stages.ts` |
| `STUDY_ABROAD_CONTENT_ENGINE_BLUEPRINT_V2.md` | Templates + recovery plan | Unchecked |
| `UI_UX_DESIGN_SYSTEM_SPEC.md`, `PRODUCT_VISION_STRATEGY_TACTICS.md` | `docs/DESIGN_SYSTEM.md`, `docs/PRODUCT_VISION_STRATEGY_TACTICS.md` | Live (main-site docs cover the whole site) |
| `AGENTIC_CONTENT_PIPELINE.md` | Agent Center (`docs/AGENT_CENTER.md`) | Dead: replaced |

## Code (`study-abroad-app/src` in the old repo)

| Old | Now | Status |
|---|---|---|
| `components/TermCallout.tsx`, `lib/termDictionary.ts` | Nothing. Terms are defined inline per [TERMS.md](TERMS.md) | Gap, rule restored; component not rebuilt |
| Calculators (Bavarian grade, blocked account, I-20, RBI LRS/TCS) | `app/study-abroad/tools/*` | Live |
| Routes | `app/study-abroad/*` (30+ directories) | Live |
| `lib/asciiTransformer.ts`, `legacyDossierParser.ts`, `schemaHelper.ts`, `affiliates.ts`, `programs.ts` | `lib/study-abroad/`, `scripts/study-abroad/` | Unchecked |

## Scripts and branches

- `study-abroad-app/scripts/*` (about 30): live code does not reference them. `push-to-turso.js` is replaced by the main app's sync. Treat the rest as Unchecked; `study-abroad-quality-audit.js` (the "7-CSV" audit) is the one to compare against `scripts/content-quality-audit.js` and `scripts/audit-article-tone.js` if its rules matter.
- `feat/subfolder-config` was merged into the old repo's `main` (merge `1cca60e`), not abandoned. It is history now.
- `docs/ARCHIVE/legacy-playbook-poc`: old markdown playbooks, kept as reference only. Nothing live calls them.

## Archiving the old repo

Safe to archive read-only on GitHub once the Unchecked rows you care about are compared. Do not delete; git history is the only copy of the old files.
