# Batch C3 Notes: Sourcing `sa_facts` (2026-10-29)

- **Target Query**: `sa_facts` rows where `official_source IS NULL OR official_source = ''`
- **Target Database**: Staging (`--target=staging`)
- **Total Facts on Staging**: 41
- **Total Unsourced Facts on Staging**: 17 (24 were seeded in E2 for UK, Canada, Australia, Ireland; 17 Germany and USA facts remained unsourced)
- **Verified Facts Proposed**: 10
- **Gaps Identified (Unchanged)**: 7
- **Corrected Values**: 0 (all 10 verified facts confirmed current stored values)
- **Checked Date**: `2026-10-29`
- **Recheck Date**: `2027-01-27` (90 days)

## Verdict Table

| Fact Key | Verdict | Source URL | Quote / Rationale |
|---|---|---|---|
| `germany.blocked_account.annual_eur` | verified | https://www.auswaertiges-amt.de/en/sperrkonto/388600 | "For the year 2024/2025, the required amount is 992 euros per month or 11,904 euros per year." |
| `germany.blocked_account.monthly_withdrawal_eur` | verified | https://www.auswaertiges-amt.de/en/sperrkonto/388600 | "For the year 2024/2025, the required amount is 992 euros per month or 11,904 euros per year." |
| `germany.aps.fee_inr` | verified | https://aps-india.de/ | "The verification fee is 18,000/- INR (non-refundable)." |
| `germany.visa.national_fee_eur` | verified | https://www.auswaertiges-amt.de/en/visa-and-service/visa-faqs/03-visa-fees-node | "The fee for a national visa is 75 €." |
| `germany.blocked_account.expatrio_setup_eur` | verified | https://www.expatrio.com/blocked-account | "Initial set-up fee: €119" |
| `germany.blocked_account.expatrio_monthly_eur` | verified | https://www.expatrio.com/blocked-account | "Monthly fee: Only €9" |
| `germany.blocked_account.fintiba_setup_eur` | verified | https://www.fintiba.com/blocked-account-germany | "PRICES={initial_fee:159.00, monthly_fee:9.90}" / "Initial account setup fee: €159.00" |
| `germany.blocked_account.fintiba_monthly_eur` | verified | https://www.fintiba.com/blocked-account-germany | "Monthly administration fee: €9.90 per month" |
| `usa.visa.f1_mrv_fee_usd` | verified | https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html | "Nonimmigrant visa application processing fee (non-refundable) for all other nonimmigrant visas (except E) ... F, J, M ... $185.00" |
| `usa.visa.sevis_i901_fee_usd` | verified | https://www.ice.gov/sevis/i901 | "The I-901 SEVIS fee is: $350 for F and M students." |
| `germany.blocked_account.coracle_setup_eur` | gap | https://help.coracle.de/ | Coracle has paused all new blocked account onboarding ("New Blocked Account Application Pause") and removed public rate tables. No live official page confirms the rate. |
| `germany.blocked_account.coracle_monthly_eur` | gap | https://help.coracle.de/ | Coracle has paused all new blocked account onboarding; no live official page confirms the fee. |
| `germany.blocked_account.buffer_eur` | gap | https://www.auswaertiges-amt.de/en/sperrkonto/388600 | German Federal Foreign Office mandates only core living expenses (€992/mo = €11,904/yr). Expatrio abolished the buffer for accounts opened from July 7, 2026. No official body mandates a €100 buffer. |
| `germany.vfs.service_fee_inr` | gap | https://visa.vfsglobal.com/ind/en/deu/ | VFS and German Missions publish the statutory €75 visa fee; VFS logistics fees vary across VACs, service types, and optional courier add-ons (e.g. ₹2,096 Schengen logistic fee). Neither publishes a static ₹2,300 national visa fee. |
| `germany.fx.eur_inr` | gap | N/A | Floating foreign exchange market estimate used for INR display approximations; not fixed or issued by an official authority. |
| `usa.living.monthly_average_usd` | gap | https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html | F-1 visa living costs are determined by each university's specific Form I-20 Cost of Attendance (COA), not set as a flat $1,200/mo by US State Dept, USCIS, or EducationUSA. |
| `usa.fx.usd_inr` | gap | N/A | Floating foreign exchange market estimate used for INR display approximations; not fixed or issued by an official authority. |
