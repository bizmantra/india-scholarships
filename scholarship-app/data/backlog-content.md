# IndiaScholarships Content Backlog

## Done (1)

- [x] **CNT-52**: Content audit + migration plan: unify Guides, Articles, Pillars into one Editorial type
  - **Impact**: High
  - **Type**: Content Task, Strategy
  - **Description**:
    Context / Why it matters:
    Companion content-side ticket to IS-115 (dev: routing/redirects). Before any URL/template migration happens, need a full content inventory: every live Guide (app/guides/[portal]), Article (content/articles/*), and Pillar (content/pillars/*) piece, and which unified category it maps to.

    Plan / What to do:
    Tag each piece as 'keep as Pillar', 'keep as How-To', or 'merge/retire' (duplicate coverage). Hand off final mapping to dev for the 301 redirect plan (IS-115).

    Resolution:
    Audited all 25 Pillars (no overlaps, all correctly scoped), 8 Portal Guides, and 29 Articles. Found 4 Articles are exact-duplicate coverage of an existing Portal Guide (Digital Gujarat, Karnataka SSP, MP TAAS, Talliki Vandanam AP — confirmed via frontmatter relatedPillarSlug + title match), 24 are genuinely unique How-To coverage with no Guide equivalent yet, and 1 (india-scholarships-statistics-2025-2026.md) is a stats report that doesn't fit either category and needs a separate taxonomy decision later. Handed the 4 duplicates to IS-115 for redirect; the 24 unique articles and the report are explicitly NOT touched — they need IS-113 (unified Editorial template) before any URL changes.

    Trigger:
    Taxonomy decision made in conversation with Claude — Guides and Articles confirmed to be the same content type built twice.

## In Progress (3)

- [ ] **CNT-16**: Fix leaked internal verification notes a
  - **Impact**: High
  - **Type**: bug
  - **Description**:
    Fix leaked internal verification notes appearing in public deadline fields (Karnataka)

- [ ] **CNT-18**: PM Yashasvi: add cycle-status messaging before deadline hits (traffic protection)
  - **Impact**: Critical

- [ ] **CNT-36**: Build Adjacent Verticals (Loans, DBT & Document Utilities)
  - **Impact**: High
  - **Type**: content
  - **Description**:
    Create guide clusters and tool links for Education Loans, Aadhaar-bank seeding for DBT, and state-wise caste/income certificate application checklists.

## Backlog (16)

- [ ] **CNT-54**: How-To guide: Scholarship approved but money not credited — Aadhaar seeding fix
  - **Impact**: Critical
  - **Type**: Content Task
  - **Description**:
    Context / Why it matters:
    Surfaced via audience-voice-research. The single most recurring technical pain point found across Quora and Careers360 — students see "PFMS transaction successful" or "status: released" but the money never arrives, almost always because Aadhaar was submitted on NSP but never actually seeded at the bank level (or the bank's data never synced with NPCI/PFMS). Nearly identical phrasing seen repeatedly: "PFMS says transaction is successful, but the scholarship amount has not credited yet." Closely related: "payment rejected by agency" is a status message nobody understands and is asked about constantly.

    Plan / What to do:
    Write as a How-To guide with a real checklist (check UIDAI bank-seeding status, verify NPCI mapping, confirm name/DOB match between Aadhaar and bank records) and numbered fix steps. Include a short "what your PFMS/NSP status message actually means" decoder table as a section within it — this is a genuinely underserved, high-intent search with no good existing answer anywhere. Position as a PRE-application step, not just a post-rejection fix, since seeding issues are avoidable before they cause a missed payment.

    Trigger:
    Audience research conducted with Claude — the single strongest, most repeated pain point found across all sources searched.

- [ ] **CNT-53**: How-To guide: NSP vs. State Portal — which one do I use?
  - **Impact**: High
  - **Type**: Content Task
  - **Description**:
    Context / Why it matters:
    Surfaced via audience-voice-research (Careers360 Q&A + Quora). Recurring, repeated question — students genuinely can't tell whether to apply through NSP or their state's SSP, and the real rule (NSP is usually a prerequisite for SSP; you generally can't hold two government scholarships at once) isn't intuitive. Example: "may i apply state and national schoolarship both?" asked verbatim on Careers360.

    Plan / What to do:
    Write as a How-To guide under the unified /guides Editorial template (IS-113). Should cross-link from every state Pillar guide (25 of them) since this question applies universally regardless of which state a student is in. Keep it blunt and decision-tree shaped: "is your scheme run by a central ministry or your state government" as the first fork.

    Trigger:
    Audience research conducted with Claude, sourced from real Careers360/Quora questions.

- [ ] **CNT-55**: Trust page: How to spot a fake scholarship (and why we only list verified, no-fee ones)
  - **Impact**: High
  - **Type**: Content Task, Strategy
  - **Description**:
    Context / Why it matters:
    Surfaced via audience-voice-research. Genuine, unresolved disagreement found in the wild — students citing conflicting Quora answers about whether exams like AIEESE/AISEE/AIYSEE are real or fee-scraping scams targeting IIT/NIT aspirants. One student described paying a Rs. 5,000 "counselling fee" before discovering conflicting reports the exam might be fake. This is a real trust gap the site is positioned to fill, given its no-fee, verified-scholarship stance is already a core trust signal (see the Detail page's verification line, shipped under IS-111).

    Plan / What to do:
    Write as a flagship trust/positioning page, not a throwaway article — should be prominently linked from the Detail page's verification line and from the site's About/trust messaging, not just buried in Editorial. Cover real red flags (application fees, guaranteed-award claims, requests for bank/card details) and explicitly explain how IndiaScholarships verifies listings, turning a trust question into a conversion asset.

    Trigger:
    Audience research conducted with Claude, sourced from real Careers360/Quora disagreement threads.

- [ ] **CNT-49**: Backing article: Sports & Athlete scholarships in India
  - **Impact**: Medium
  - **Type**: Content Task
  - **Description**:
    Context / Why it matters:
    Found during category-hub audit with Claude. /scholarships-for/sports is a real, working hub with 14 active scholarships, but it's thin as a standalone listing page and currently has zero editorial support. Same pattern Buddy4Study uses for their sparse category hubs — pair a short live list with real editorial context.

    Plan / What to do:
    Write a short guide-style article covering how sports-quota/athlete scholarships work in India, eligibility basis (state/national level certificates, etc.), and link it from the /scholarships-for/sports hub once that hub is exposed in nav (see IS-109).

- [ ] **CNT-50**: Backing article: Scholarships for students with disabilities (PWD)
  - **Impact**: Medium
  - **Type**: Content Task
  - **Description**:
    Context / Why it matters:
    Found during category-hub audit with Claude. Only 5 active scholarships reference disability eligibility, and the underlying caste data is messy (see IS-108). Once cleaned up, this will be a genuinely thin hub (5 results) that needs editorial context to not read as empty/low-value.

    Plan / What to do:
    Write an article explaining UDID card requirements, how PWD eligibility is verified across state/national schemes, and common application pitfalls. Link from the cleaned-up /scholarships-for/pwd hub. Depends on IS-108 (data cleanup) landing first so the hub itself resolves correctly.

- [ ] **CNT-51**: Taxonomy note: Merit/Means/Talent-based hubs need new data before content work
  - **Impact**: Low
  - **Type**: Content Task, Strategy
  - **Description**:
    Context / Why it matters:
    Found during Buddy4Study competitive taxonomy comparison with Claude. They expose Merit-based, Means-based, and Talent-based scholarship hubs; we have no equivalent because the DB has no clean 'selection basis' categorical field (only free-text `selection` field on scholarships).

    Plan / What to do:
    Not an article task yet — flagging so it isn't lost. Before any Merit/Means/Talent editorial or hub work starts, a dev/data ticket is needed first to define and backfill a clean selection-basis taxonomy field. Revisit once that exists.

- [ ] **CNT-33**: Optimize Low-CTR Page 2 Keywords (Position 5-15)
  - **Impact**: High
  - **Type**: seo
  - **Description**:
    Audit Google Search Console for high-impression keywords on page 2. Optimize dynamic year metadata ${year}, enrich DB detail fields, and implement structured FAQ schema to capture rich snippets and boost CTR.

- [ ] **CNT-34**: Ingest High-Volume Missing Scholarships
  - **Impact**: High
  - **Type**: content
  - **Description**:
    Cross-reference keyword research CSVs against the database. Use Gemini grounding scripts to research and ingest high-volume missing targets (like Post Matriculation Scholarship, Jnanabhumi) into scholarships.db.

- [ ] **CNT-35**: Establish Owned Channels (WhatsApp & Telegram)
  - **Impact**: High
  - **Type**: feature
  - **Description**:
    Implement WhatsApp Channel invitation banners in details layout and footers. Set up automated Sunday cron jobs or triggers using post-new-to-telegram.js to broadcast verified scholarships.

- [ ] **CNT-19**: Phase 1 — Template-generated scholarship listicle/hub pages (programmatic)
  - **Impact**: High
  - **Type**: content
  - **Description**:
    Build once, generate across inventory using existing schema fields. Validated demand pattern (per GSC keyword research: "[Name] + last date + year").
    Pages: (1) [Scholarship Name] last date to apply 2026 — deadline field, ~266 pages, P0; (2) Scholarships under ₹1L/₹2.5L/₹5L/₹8L income — income field, ~4 hubs x states, P0; (3) Top scholarships for [Category] in [State] — category+state fields, P0; (4) Scholarships for girls/women in [state/course] — gender field, P1; (5) Scholarships for [Course/Stream] students — course field, P1; (6) Renewable scholarships hub — renewal field, P1; (7) Scholarship deadlines calendar (monthly), wraps existing /scholarships/deadlines, P1.
    Full outlines for items 1 & 2 in reference doc.
    Reference: data/content-expansion-backlog.md and data/content-expansion-plan.md

- [ ] **CNT-20**: Phase 2 — Hand-written scholarship-core articles
  - **Impact**: Medium
  - **Type**: content
  - **Description**:
    Central government scholarships list (NSP-linked) 2026 [High demand, improves conversion on existing high-impression/low-conversion NSP traffic]; Scholarships that don't require entrance exam or merit; Highest-paying scholarships in India (₹50K+); Government vs private scholarships — which is easier to get; How scholarship selection actually works (merit vs need-based); Scholarships for differently-abled students.
    Reference: data/content-expansion-backlog.md and data/content-expansion-plan.md

- [ ] **CNT-21**: Phase 3a — Education loan explainer articles (leadgen priority)
  - **Impact**: High
  - **Type**: content
  - **Description**:
    Highest leadgen priority — direct tie-in to EMI calculator and Phase 4 loan/B2B roadmap. Articles: How education loans work in India; Collateral vs non-collateral education loans explained; What is CSIS interest subsidy and who qualifies; Education loan documents checklist; Scholarship vs education loan — which to apply for first; Can I get a scholarship and a loan together.
    Full outline for "Scholarship vs education loan" in reference doc.
    Reference: data/content-expansion-backlog.md and data/content-expansion-plan.md

- [ ] **CNT-22**: Phase 3b — DBT / student banking articles (leadgen priority)
  - **Impact**: High
  - **Type**: content
  - **Description**:
    Articles: Why scholarship money isn't credited — common DBT issues; How to link Aadhaar to your bank account for scholarships; Best zero-balance student bank accounts (bank referral potential).
    Full outline for "Why scholarship money isn't credited" in reference doc.
    Reference: data/content-expansion-backlog.md and data/content-expansion-plan.md

- [ ] **CNT-23**: Phase 3c — Document/process utility content (state-wise templates)
  - **Impact**: Medium
  - **Type**: content
  - **Description**:
    Scales across full state inventory with minimal marginal effort once templated. Articles: Income certificate application process (state-wise); Caste certificate application process (state-wise); Common reasons scholarship applications get rejected.
    Reference: data/content-expansion-backlog.md and data/content-expansion-plan.md

- [ ] **CNT-24**: Phase 3d — Lifecycle/retention content
  - **Impact**: Medium
  - **Type**: content
  - **Description**:
    Underserved because most competitor sites are discovery-only, not lifecycle-aware. Articles: What to do if your scholarship is delayed; Scholarship renewal — how it works, what can go wrong; Income certificate expiry and renewal.
    Reference: data/content-expansion-backlog.md and data/content-expansion-plan.md

- [ ] **CNT-25**: Phase 3e — Lower-priority fill-in content
  - **Impact**: Low
  - **Type**: content
  - **Description**:
    Hostel vs PG cost comparison (complements Study Cost Calculator, housing-platform referral potential); Best courses under ₹X fees for [category] students. Study abroad forex/cost guides flagged as deprioritized — DA70-90 incumbents (Buddy4Study, LeapScholar) dominate this space per prior scoping (see CNT-14).
    Reference: data/content-expansion-backlog.md and data/content-expansion-plan.md

## Done (22)

- [x] **CNT-2**: University scholarship Hubs

- [x] **CNT-3**: Research & add top 5 UP State Scholarships
  - **Description**:
    Context / Why it matters:
    Uttar Pradesh state scholarships (like Pre-Matric, Post-Matric, and Dashmesh-Uttar) have massive search volumes in GSC, but our database currently has thin coverage.
    
    Plan / What to do:
    Research and enrich the top 5 UP State Scholarships with complete 29-field details and structured FAQs. Sync to WordPress.

- [x] **CNT-17**: State hub QA: leaked verification notes + expired deadlines on Karnataka page (likely site-wide pattern)
  - **Impact**: Critical

- [x] **CNT-4**: Delhi University (DU) Hub & Scholarship Research
  - **Description**:
    Research official DU internal fee waivers, college-specific awards, and build the DU scholarship hub landing page.

- [x] **CNT-5**: Category B University Hubs & Research (JNU, BHU, AMU, JMI, UoH)
  - **Description**:
    Research official internal schemes and build scholarship hubs for JNU, BHU, AMU, JMI, and Hyderabad University (UoH).

- [x] **CNT-6**: Category C & D University Hubs & Research (Anna Uni, VTU, SPPU, AKTU, Ashoka, VIT, MAHE)
  - **Description**:
    Research official internal schemes and build scholarship hubs for state technical universities (Anna University, VTU, SPPU, AKTU) and private universities (Ashoka, VIT, Manipal).

- [x] **CNT-15**: Fix "31 Dec 2099" placeholder date leaking into public deadline field (Odisha)
  - **Impact**: High

- [x] **CNT-7**: BHU & AMU Hubs & Research
  - **Description**:
    Research official internal schemes and build scholarship hubs for Banaras Hindu University (BHU) and Aligarh Muslim University (AMU).

- [x] **CNT-8**: JNU & Jamia Millia Islamia (JMI) Hubs & Research
  - **Description**:
    Research official internal schemes and build scholarship hubs for Jawaharlal Nehru University (JNU) and Jamia Millia Islamia (JMI).

- [x] **CNT-9**: University of Hyderabad (UoH) Hub & Research
  - **Description**:
    Research official internal schemes and build scholarship hub for University of Hyderabad (UoH).

- [x] **CNT-10**: Anna University & VTU Hubs & Research
  - **Description**:
    Research official internal schemes and build scholarship hubs for Anna University (TN) and Visvesvaraya Technological University (VTU, Karnataka).

- [x] **CNT-11**: SPPU (Pune) & AKTU (UP) Hubs & Research
  - **Description**:
    Research official internal schemes and build scholarship hubs for Savitribai Phule Pune University (SPPU) and Dr. A.P.J. Abdul Kalam Technical University (AKTU, UP).

- [x] **CNT-12**: Ashoka, VIT & Manipal (MAHE) Hubs & Research
  - **Description**:
    Research official internal schemes and build scholarship hubs for Ashoka University, Vellore Institute of Technology (VIT), and Manipal Academy of Higher Education (MAHE).

- [x] **CNT-13**: Enrich High-Value Private/Corporate Scholarships (Tata Pankh, Aditya Birla, FAEA, Reliance)
  - **Description**:
    Perform deep research, consolidate FAEA entries, update amounts/docs/FAQs, and sync to live WordPress site.

- [x] **CNT-14**: Research & scope International High-Value Scholarships (study-abroad content track)
  - **Description**:
    GOAL: Explore a new content track — international/study-abroad scholarships for Indian students — as a Phase 2 expansion beyond the 251 domestic scholarships. Use Antigravity to continue research + population once scoped.
    
    CANDIDATE LIST (from initial research):
    - Fulbright-Nehru (USA) — $35-45K/yr, fully funded
    - Chevening (UK) — £50K+, ~8-10% acceptance for Indians
    - DAAD (Germany) — €992-1200/mo, free public-uni tuition
    - Erasmus Mundus (EU) — ~€1000-1400/mo, no central portal (fragmented by consortium)
    - Commonwealth Master's (UK) — fully funded, <1% acceptance
    - Inlaks Shivdasani — up to $100K, excludes most engineering/CS
    - JN Tata Endowment — loan up to ₹20L, repayable 7 yrs
    - Rhodes / Gates Cambridge (UK) — fully funded, very low volume
    - MEXT (Japan) — fully funded, less saturated content space
    
    KEY FINDINGS / CAUTIONS FROM SCOPING DISCUSSION:
    1. RPM logic check: RPM is driven by visitor geography at click time, not topic — writing about study-abroad scholarships does NOT automatically raise RPM since readers are still browsing from India. Real RPM lever is content adjacency to high-CPC verticals (education loans, forex cards, IELTS/GRE prep, visa/consultancy services) — build these as connective content around scholarship pages, not instead of them.
    2. Competitive reality: Buddy4Study, LeapScholar, upGrad, GyanDhan, Leverage Edu already dominate SERPs for every major international scholarship name (Chevening, Fulbright-Nehru, DAAD, etc.) with much larger DA/backlink profiles. Standalone "[Scholarship] eligibility" pages are a weak differentiation play here — our 29-field/verified-decision-engine moat doesn't transfer topical authority from domestic to this new lane (Google evaluates by topical cluster, not domain-wide).
    3. Keyword reality: no meaningful search volume exists for a generic "international scholarship tracker" query. Real demand pattern is per-scholarship: "[Scholarship Name] + last date to apply / eligibility / 2026-27" — same modifier pattern already proven on our domestic deadline tracker (live: http://indiascholarships.in/scholarships/deadlines) and used site-wide by Buddy4Study.
    4. Where a genuine opening exists: a live, verified "which international scholarships are open right now" status page — nobody maintains this well for the international set (smaller competitor DesiUtils does something similar). This plays directly to our verification-first positioning and reuses the same deadline-tracker pattern we just shipped domestically.
    5. Natural bridge asset already in DB: Odisha's Videsh Siksha Bruti (up to ₹25L for SC/ST students going abroad) — cross-link candidate between domestic and international content once this track exists.
    
    SCHEMA NOTE: international scholarships need their own lighter data structure vs. the 29-field domestic template — currency conversion, cycle-based (not fixed annual) deadlines, no income/caste eligibility fields, consortium-level fragmentation (e.g. Erasmus Mundus has no single portal).
    
    NEXT STEPS: scope with Antigravity — pilot with a small subset (5-8 scholarships) styled as a status tracker + individual pages only where a genuinely differentiated angle exists (e.g. MEXT, Erasmus Mundus fragmentation), rather than competing head-on on saturated terms like Chevening/Fulbright.

- [x] **CNT-26**: Research and add J&K state scholarships (ST, OBC/EBC/DNT, SC, and Ladli Beti)
  - **Impact**: High
  - **Type**: content
  - **Description**:
    Research and add the following J&K schemes following the standard workflow:
    - Umbrella Scheme for ST Students
    - Pre-Matric & Post-Matric for OBC/EBC/DNT (under PM-YASASVI)
    - Pre-Matric & Post-Matric for SC Students
    - Ladli Beti Scheme (J&K social security maturity fund)

- [x] **CNT-27**: Research and add Himachal Pradesh state scholarships (Mukhya Mantri Protsahan, Pre-Matric SC/ST)
  - **Impact**: Medium
  - **Type**: content
  - **Description**:
    Research and add the following HP schemes following the standard workflow:
    - Mukhya Mantri Protsahan Yojana (HP)
    - Pre-Matric Scholarship for SC/ST Students (Class 9-10) (HP)

- [x] **CNT-28**: Research and add National/Central Government fellowships (NFOBC, Top Class ST, National Overseas OBC/EBC/DNT)
  - **Impact**: High
  - **Type**: content
  - **Description**:
    Research and add the following central schemes following the standard workflow:
    - National Fellowship for OBC Students (NFOBC)
    - Top Class Education Scheme for ST Students
    - National Overseas Scholarship for OBC/EBC/DNT Students

- [x] **CNT-29**: Research and add Corporate/Private scholarships (Generation Google, Amazon Future Engineer, JSW Udaan)
  - **Impact**: High
  - **Type**: content
  - **Description**:
    Research and add the following corporate schemes following the standard workflow:
    - Generation Google Scholarship (APAC-India)
    - Amazon Future Engineer Scholarship (India)
    - JSW Udaan Scholarship
    Note: Vedanta and P&G Shiksha have been reviewed and excluded/noted as restricted.

- [x] **CNT-30**: Research and scope International study-abroad scholarships (DAAD Germany, GKS Korea, Australia Awards, Swiss Govt, Clarendon, GREAT)
  - **Impact**: Medium
  - **Type**: content
  - **Description**:
    Research and scope the following international study-abroad scholarships as a pilot track:
    - DAAD Scholarships (Germany)
    - Global Korea Scholarship (GKS)
    - Australia Awards Scholarships
    - Swiss Government Excellence Scholarship
    - Clarendon Scholarship (Oxford, UK)
    - GREAT Scholarships (UK)

- [x] **CNT-31**: Prevent SEO cannibalization across PM-YASASVI program variations via cross-linking
  - **Impact**: High
  - **Type**: seo
  - **Description**:
    Implement a Hub-and-Spoke cross-linking callout structure on the main PM-YASASVI page, Top Class Education page, and J&K UT page to guide users and clarify contextual relationships for search engine crawlers.

- [x] **CNT-32**: Research and add Amazon Future Engineer Scholarship (India) 2026 & Generation Google Scholarship (APAC) 2026
  - **Impact**: High
  - **Type**: content
  - **Description**:
    Added Amazon Future Engineer Scholarship (India) 2026 and Generation Google Scholarship (APAC) 2026 to the SQLite database and synced to WordPress API to enrich corporate scholarship gaps.

- [x] **CNT-33**: Research and add LIC HFL Vidyadhan & Rolls-Royce Wings4Her, and enrich TATA AIA Paras details
  - **Impact**: High
  - **Type**: content
  - **Description**:
    Added LIC HFL Vidyadhan (linked to ScholarsBox) and Rolls-Royce Wings4Her (linked to Buddy4Study portal) to the database, and enriched TATA AIA Paras with updated professional streams and specific apply URLs. Synced all to WordPress REST API and verified Next.js static builds.

## Parked (0)

*No tasks in this section.*

