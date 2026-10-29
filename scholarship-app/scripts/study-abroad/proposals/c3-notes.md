# Batch C3 Notes: Sourcing `sa_facts` (2026-10-29)

- **Target Query**: `sa_facts` rows where `official_source IS NULL OR official_source = ''`
- **Target Database**: Staging (`--target=staging`)
- **Total Facts in Database**: 41
- **Database Count Reconciliation**:
  - **Core Spec / Production Status**: 30 rows already carry official sources; **11 rows** were unsourced (the 11 facts identified in `plans/study-abroad-content-spec.md`).
  - **Staging Database Status**: Staging was also missing official sources for 6 government/statutory facts that were already sourced in production (`germany.blocked_account.annual_eur`, `germany.blocked_account.monthly_withdrawal_eur`, `germany.aps.fee_inr`, `germany.visa.national_fee_eur`, `usa.visa.f1_mrv_fee_usd`, and `usa.visa.sevis_i901_fee_usd`). Thus staging returned **17 empty rows** (11 core unsourced facts + 6 staging-unsourced official facts).
- **Audit Findings**:
  - **Verified Official Facts**: **6** (all 6 are government or statutory bodies setting the numbers; all quotes confirm the stored amounts with no ellipses).
  - **Gaps (Unchanged)**: **11** (all 11 core unsourced facts from the spec; 0 proposals made).
  - **Commercial Sites Policy**: The 4 private blocked account provider facts (`expatrio_*`, `fintiba_*`) are classified as **gaps**. Per review feedback, commercial provider sites cannot serve as `official_source`; provider URLs are cited below solely as market examples, labelled as such.
  - **Dates & Evidence**: `checked_at` (`2026-10-29`) and `recheck_after` (`2027-01-27`) are proposed ONLY for the 6 verified facts whose official government quotes confirm the stored values.

## Restated Counts

| Scope | Total Audited | Verified | Gaps | Proposed Changes |
|---|---|---|---|---|
| **Core Spec Facts** (unsourced in spec & production) | 11 | 0 | 11 | 0 |
| **Staging Sync Facts** (unsourced only on staging) | 6 | 6 | 0 | 18 (6 × 3 fields) |
| **Combined Staging Total** | 17 | 6 | 11 | 18 |

---

## Verdict Table

### 1. Verified Official Facts (6 proposed to staging)

| Fact Key | Verdict | Official Source URL | Verbatim Quote Confirming Amount |
|---|---|---|---|
| `germany.blocked_account.annual_eur` | **verified** | https://www.auswaertiges-amt.de/en/sperrkonto/388600 | "For the year 2024/2025, the required amount is 992 euros per month or 11,904 euros per year." |
| `germany.blocked_account.monthly_withdrawal_eur` | **verified** | https://www.auswaertiges-amt.de/en/sperrkonto/388600 | "For the year 2024/2025, the required amount is 992 euros per month or 11,904 euros per year." |
| `germany.aps.fee_inr` | **verified** | https://aps-india.de/ | "The verification fee is 18,000/- INR (non-refundable)." |
| `germany.visa.national_fee_eur` | **verified** | https://www.auswaertiges-amt.de/en/visa-and-service/visa-faqs/03-visa-fees-node | "The fee for a national visa is 75 €." |
| `usa.visa.f1_mrv_fee_usd` | **verified** | https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html | "The application fee for the most common nonimmigrant visa categories is $185. This includes visitor, student, and exchange visas." |
| `usa.visa.sevis_i901_fee_usd` | **verified** | https://www.ice.gov/sevis/i901 | "I-901 SEVIS Fee for F or M visa applicants (full payment): $350" |

### 2. Gaps (11 core facts left unchanged; no proposals submitted)

| Fact Key | Verdict | Market Example / Reference URL | Quote / Rationale |
|---|---|---|---|
| `germany.blocked_account.expatrio_setup_eur` | **gap** | https://www.expatrio.com/blocked-account *(market example only)* | Commercial provider fee (€119). No government or statutory authority sets or publishes commercial provider pricing. Excluded from proposals per rule 4. |
| `germany.blocked_account.expatrio_monthly_eur` | **gap** | https://www.expatrio.com/blocked-account *(market example only)* | Commercial provider fee (€9/mo). No government or statutory authority sets or publishes commercial provider pricing. Excluded from proposals. |
| `germany.blocked_account.fintiba_setup_eur` | **gap** | https://www.fintiba.com/blocked-account-germany *(market example only)* | Commercial provider fee (€159). No official regulatory page sets private provider rates. Excluded from proposals. |
| `germany.blocked_account.fintiba_monthly_eur` | **gap** | https://www.fintiba.com/blocked-account-germany *(market example only)* | Commercial provider fee (€9.90/mo). No official regulatory page sets private provider rates. Excluded from proposals. |
| `germany.blocked_account.coracle_setup_eur` | **gap** | https://help.coracle.de/ *(market example only)* | Commercial provider fee. Coracle has paused new blocked account onboarding ("New Blocked Account Application Pause") and removed public rate tables. Excluded from proposals. |
| `germany.blocked_account.coracle_monthly_eur` | **gap** | https://help.coracle.de/ *(market example only)* | Commercial provider fee. Onboarding paused; no live public rate confirmation. Excluded from proposals. |
| `germany.blocked_account.buffer_eur` | **gap** | https://www.auswaertiges-amt.de/en/sperrkonto/388600 | German Federal Foreign Office mandates only core living funds (€992/mo = €11,904/yr). Expatrio abolished the buffer for accounts from July 7, 2026. No official body mandates a €100 buffer. |
| `germany.vfs.service_fee_inr` | **gap** | https://visa.vfsglobal.com/ind/en/deu/ | VFS and German Missions publish the statutory €75 visa fee; VFS logistics fees vary across VACs, service types, and optional courier add-ons (e.g. ₹2,096 Schengen logistic fee). Neither publishes a static ₹2,300 national visa fee. |
| `germany.fx.eur_inr` | **gap** | N/A | Floating foreign exchange market estimate used for INR display approximations; not fixed or issued by an official authority. |
| `usa.living.monthly_average_usd` | **gap** | https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html | F-1 visa living costs are determined by each university's specific Form I-20 Cost of Attendance (COA), not set as a flat $1,200/mo by US State Dept, USCIS, or EducationUSA. |
| `usa.fx.usd_inr` | **gap** | N/A | Floating foreign exchange market estimate used for INR display approximations; not fixed or issued by an official authority. |
