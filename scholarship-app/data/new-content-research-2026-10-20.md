# New Content Research (non-scholarship) — 20 Oct 2026

**Question:** what can IndiaScholarships.in publish beyond scholarship pages?
**Method:** read the existing plans (`content-expansion-plan.md`, `content-expansion-backlog.md`, `backlog-content.md`), mined the June 2026 GSC query export (`gsc-june-2026/queries.json`, 1,000 queries), and checked current facts on the web.
**Caveat:** no Ahrefs/GKP access this session. Demand is directional, from our own GSC impressions. Verify the top picks before committing.

## What the site already has
- 25 pillar guides, about 29 how-to articles, portal guides, news posts, 6 tools, and a study-abroad section (loans, visas, calculators).
- Planned but not built (CNT-36, still in progress): India education-loan cluster, DBT/Aadhaar seeding, state certificate checklists. **These stay the best adjacent bet. This doc adds what the older plans missed.**

## Signal from our own search data
146 of the top 1,000 GSC queries contain no "scholarship" word. They fall into four buckets:

| Bucket | Examples (impressions / month-ish) | Meaning |
|---|---|---|
| **State cash-benefit schemes** | `mmvy` 87k (MP Mukhyamantri Medhavi Vidyarthi Yojana), `e kalyan` 75k (Jharkhand), `mmvy portal` 13k, `kanya utthan yojana` family ~15k combined, `krishi vidya nidhi yojana` 3k, `green passage scheme odisha` 579 | Students reach us for incentives and welfare schemes. **Correction (follow-up check): pages for these already exist and rank at positions 4-5, but click-through is very low (see below).** |
| **Scholarship exams** | `nmms` 5.3k, `nmms karnataka` 3.5k, `trti result` 1k, Maharashtra 5th/8th scholarship exam (hundreds of long-tail variants in Keyword Stats) | A separate content type: exam notice, syllabus, dates, result, merit list. |
| **College fees** | `bits pilani fees` 11k (position 1.1), `bits pilani mba fees` 2.5k, `...fees for 4 years btech` 1.8k | We already rank #1 for fee queries, so fee pages are proven demand. |
| **Provider and brand names** | `sitaram jindal foundation` 5k, `faea` 5.8k, `tata capital pankh`, `agaram foundation` | Provider hubs (partly covered by the corporate pillar). |

## Recommended new content, ranked

### 1. State education-incentive and loan schemes hub
> **Update after checking the live page data:** the scheme pages already exist (MMVY, Kanya Utthan, Krishi Vidya Nidhi, Bihar Student Credit Card, e-Kalyan). They rank around position 4-5 but get very few clicks:
>
> | Page | Impressions | CTR |
> |---|---|---|
> | MMVY (MP) | 300k | 0.64% |
> | Kanya Utthan (graduation) | 191k | 1.77% |
> | Jharkhand e-Kalyan | 114k | 0.16% |
> | Krishi Vidya Nidhi (Odisha) | 63k | 1.32% |
>
> The bigger win is rewriting titles and descriptions on these pages, plus a hub that links them. A new page type is secondary.

- **Why:** the largest untapped cluster. `mmvy` and `e kalyan` alone are about 160k impressions, and we are on page 1 to 2 only because of nearby pages.
- **Pages:** Bihar Mukhyamantri Kanya Utthan Yojana (graduation), Bihar Student Credit Card, MMVY (Madhya Pradesh), Krishi Vidya Nidhi, Medhavi Vidyarthi Yojana (MP), and similar state schemes. Add a "Cash incentives and loans by state" index.
- **Watch-out:** amounts conflict between sources. Kanya Utthan graduation shows ₹25,000 on one aggregator and ₹50,000 elsewhere. Confirm on the official Medhasoft or department page before publishing, per AGENTS.md rules.
- **Effort:** low. Reuses the existing scholarship page template.

### 2. College fee pages (programmatic)
- **Why:** `bits pilani fees` ranks 1.1 with 11k impressions. That proves we can win fee queries, and it brings a different, high-intent audience.
- **Pages:** "[College] fees 2026-27" for the top 100 to 200 colleges already in `lib/universities.ts`. Each links to that college's scholarships, the study cost calculator and the loan EMI calculator.
- **Effort:** medium. Needs a verified fee field per course, each fee sourced from the college's own page.

### 3. Scholarship exams hub (NMMS, NTSE, state scholarship exams)
- **Why:** lots of long-tail queries, almost no competition from big sites on state-specific ones. It is a natural feeder: students who pass these exams then apply on NSP.
- **Timely now:** NMMS 2026-27 registration is open this season. One source reports the NSP deadline as 30 Sep 2026 with INO verification by 15 Oct and DNO verification by 31 Oct. State dates differ (for example, Telangana's last date was 24 Aug). NTSE 2026-27 notification was not confirmed in my search.
- **Pages:** NMMS state-wise (dates, syllabus, quota), NTSE stage 1 and stage 2, Maharashtra 5th/8th scholarship exam, result and merit-list posts.
- **Effort:** medium. Needs refreshing every cycle.

### 4. Education loans in India (already in CNT-36; one fact update)
- Build the cluster as planned: how loans work, collateral vs non-collateral, CSIS, documents, scholarship vs loan.
- **Update from July 2026 official document:**
  - CSIS gives 100% interest subvention during the moratorium for family income up to ₹4.5 lakh, at NAAC or NBA accredited institutions, on loans up to ₹10 lakh.
  - PM-Vidyalaxmi adds 3% subvention for income up to ₹8 lakh on loans up to ₹10 lakh, capped at 1 lakh students a year.
  - Interest is capped at EBLR + 0.5%. A 75% credit guarantee applies to loans up to ₹7.5 lakh.
  - I did not confirm the 2026 guarantee terms or CSIS application status. Verify on pmvidyalaxmi.co.in before publishing.
- This is the highest-RPM adjacency, and it links to the existing EMI calculator.

### 5. Entrance exam and admission calendar (lighter, evergreen)
- CUET UG 2026 ran in May with registration to 4 Feb. This content area is crowded (Careers360, PW, Shiksha), so only do it as a **"scholarship angle"** page. For example: "Which entrance scores unlock scholarships" and "CUET/JEE/NEET score cutoffs for fee waivers."
- Skip standalone exam-prep pages.

### 6. Provider hubs
- One hub per top provider (Sitaram Jindal, FAEA, Tata Capital Pankh, Agaram Foundation). Check what the corporate pillar already covers before building.

## Not recommended
- Study-abroad forex and cost guides: strong incumbents, already deprioritised in the old plan.
- Generic exam-prep or coaching content: crowded, and AGENTS.md bars coaching sites as sources.
- Zero-balance bank account listicles: low trust and affiliate-heavy.

## Suggested order
1. Schemes hub (#1) and the NMMS block (#3). Both are timely and cheap, and their demand is already in our GSC data.
2. Loans cluster (#4), using the corrected facts above.
3. College fee template (#2) as a pilot with 20 colleges, then scale.

## Open items to verify
- Real search volume for the top 15 queries (Ubersuggest or GKP).
- Official amounts and deadlines for each scheme before drafting.
- Whether existing pages already catch the `mmvy` and `e kalyan` queries (check `master-page-index.csv`).
- Whether the NSP-hosted NMMS deadline (30 Sep) applies in every state.
