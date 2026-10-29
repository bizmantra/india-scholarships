# Study Abroad SEO, schema and trust rules

Restored from the retired `Study-Abroad-IS` repo (`STUDY_ABROAD_SEO_GUIDELINES.md`, `SEO_E_E_A_T_COMPLIANCE_SPEC.md`, `CONTENT_OPERATIONS_REPLICATION_PLAYBOOK.md`, `STUDY_ABROAD_CONTENT_ARCHITECTURE.md`), which were not carried over in the September 2026 cut-over. See [PORT_MAP.md](PORT_MAP.md). Audit of the gaps: 29 Oct 2026.

This file adds only what the live [templates](templates/README.md) lack. Where the two disagree, the templates win (for example title length is under 65 characters, descriptions 140–160, not the old 50–60 and 150–160). Old URL paths in the retired specs (`/study-abroad/germany`, `/study-abroad/scholarships/…`) are out of date; use the routes in the templates README.

Items marked **Decision needed** are not settled. Do not build them until the owner picks.

## 1. Evergreen slugs (hard rule)

- Never put a year in a URL slug (`-2026`). The year lives in the title tag and the page text, updated in place.
- Why: a year in the slug creates a new URL every year and loses the authority the old one earned.
- Time-sensitive pages (fees, visa rules, intake dates) end the title with the year. Pages that are not time-sensitive do not.

## 2. Structured data (JSON-LD) per page type

Every page ships at least one valid schema type. Do not add a type the page content does not support.

| Page type | Live today | Old rule |
|---|---|---|
| University | `CollegeOrUniversity`, `WebPage`, `FAQPage`, `BreadcrumbList` | `CollegeOrUniversity` + `FAQPage` |
| Course | `Course` (with `provider`, `offers`), `FAQPage` | `Course` + `FAQPage` |
| Course comparison | `ItemList` | not covered |
| Calculator | `WebApplication` | `SoftwareApplication` alongside the parent type |
| Loan and money page | `FAQPage`, `BreadcrumbList` only | `FinancialProduct` (or `Product`) + `FAQPage` |
| Visa guide | `FAQPage`, `BreadcrumbList` only | `HowTo` + `FAQPage` |
| Guide | `FAQPage`, `BreadcrumbList` only | `Article` + `FAQPage` |
| Country page and country lists | `BreadcrumbList` | `CollectionPage` + `BreadcrumbList` |
| International scholarship block | not built (IS-146) | `MonetaryGrant` + `FAQPage` |

**Decision needed:** the retired specs disagree with each other and with the code (for example `HowTo` for visas appears in one, not the other; `Course` vs `EducationalOrganization` for universities). Pick one type per page type, then apply it to every page of that type. Do not mix.

Rules that held in both old specs and still apply:
- **FAQ markup only where the page really is Q&A.** Do not add `FAQPage` to a single-argument essay or opinion piece. Forced FAQ markup is a spam signal.
- **Never fabricate ratings.** No `Review` or `AggregateRating` unless we collect real user reviews.

## 3. Money and visa pages (YMYL trust rules)

These pages are about money and visas, where Google and readers expect extra care.

1. **Last-verified stamp on every volatile figure.** Each fee, rate, deadline or funds amount shows its check date and links to the official source (`checked_at`, `official_source`). A page-level "Last Checked" is not enough on its own when a page carries several figures.
2. **Visible disclaimer near the call to action** on every loan, rate and blocked-account page: figures change, confirm with the provider, this is not financial advice. Place it next to the button or table, not only in the footer. (Live today: one line in the comparison block in `app/study-abroad/_components/blocks.tsx`; the templates only ban advice wording.)
3. The affiliate disclosure in [LOAN_PAGE_TEMPLATE.md](templates/LOAN_PAGE_TEMPLATE.md) stays as written.

## 4. Page-level checks missing from the templates

- **One H1 per page**, aligned with the title tag but not necessarily identical.
- **H2s phrased as the question or answer a reader searches for**, not vague labels ("Documents You Need", not "Document Verification Requirements"; see [CONTENT_RULES.md](CONTENT_RULES.md)). Any on-page jump links or anchor pills point at real H2s.
- **Canonical tag on every page**, self-referencing unless the page is a true duplicate.
- **Image alt text names the entity** (university, lender, visa type). Never "image" or a filename.
- **Hub pages** (country page, country lists) show a clear "top N" with a link to the full list, not an endless unstructured list.
- Internal-link minimums are in [templates/LINKING_RULES.md](templates/LINKING_RULES.md).

## 5. Design bet: calculators inside entity pages

Audited competitors (MyGermanUniversity, GyanDhan, Yocket, Expatrio) keep calculators generic and separate from university and loan pages. Our edge is a calculator in rupees, **inside** the university or loan page and tied to that entity's data, not a link out to `/tools/`. Build templates around this. Current state: the four calculators live under `/study-abroad/tools/*`; embedding them in entity pages is not done.

## 6. New-country checklist additions

[STUDY_ABROAD_COUNTRY_EXPANSION_PLAN.md](STUDY_ABROAD_COUNTRY_EXPANSION_PLAN.md) E2 already collects visa fee, proof of funds, health cover, post-study work length, English minimums and intake months. The old playbook also required these, so add them to the country fact sheet (`sa_facts`) before writing any content for a new country:

| Variable | What to record | Germany | USA |
|---|---|---|---|
| Grade conversion | Scale used for Indian marks | Bavarian formula | WES 4.0 GPA |
| In-study work limit | Part-time work allowed | 140 full days a year | 20 hours a week on campus |
| Permanent residency | Qualifying timeline | 21 months (Blue Card with B1 German) | EB-2 NIW / PERM, long backlog |
| Mandatory credential | Indian document needed | APS certificate | WES evaluation |

The old playbook also set a 9-stage structure per country (choose, qualify, fund, apply, visa, arrive, work and PR, exams, directory hubs). The live guide stages in `app/study-abroad/_components/stages.ts` group guides by journey stage; compare before adding a country.
Check the values above against official sources before using them; they come from the old playbook, which is dated August 2026.
