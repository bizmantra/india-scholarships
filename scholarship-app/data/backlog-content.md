# IndiaScholarships Content Backlog

## In Progress (2)

- [ ] **CNT-17**: State hub QA: leaked verification notes + expired deadlines on Karnataka page (likely site-wide pattern)
  - **Impact**: Critical

- [ ] **CNT-18**: PM Yashasvi: add cycle-status messaging before deadline hits (traffic protection)
  - **Impact**: Critical

## Backlog (0)

*No tasks in this section.*

## Done (15)

- [x] **CNT-2**: University scholarship Hubs

- [x] **CNT-3**: Research & add top 5 UP State Scholarships
  - **Description**:
    Context / Why it matters:
    Uttar Pradesh state scholarships (like Pre-Matric, Post-Matric, and Dashmesh-Uttar) have massive search volumes in GSC, but our database currently has thin coverage.
    
    Plan / What to do:
    Research and enrich the top 5 UP State Scholarships with complete 29-field details and structured FAQs. Sync to WordPress.

- [x] **CNT-4**: Delhi University (DU) Hub & Scholarship Research
  - **Description**:
    Research official DU internal fee waivers, college-specific awards, and build the DU scholarship hub landing page.

- [x] **CNT-5**: Category B University Hubs & Research (JNU, BHU, AMU, JMI, UoH)
  - **Description**:
    Research official internal schemes and build scholarship hubs for JNU, BHU, AMU, JMI, and Hyderabad University (UoH).

- [x] **CNT-6**: Category C & D University Hubs & Research (Anna Uni, VTU, SPPU, AKTU, Ashoka, VIT, MAHE)
  - **Description**:
    Research official internal schemes and build scholarship hubs for state technical universities (Anna University, VTU, SPPU, AKTU) and private universities (Ashoka, VIT, Manipal).

- [x] **CNT-16**: Fix leaked internal verification notes appearing in public deadline fields (Karnataka)
  - **Impact**: High

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

## Parked (0)

*No tasks in this section.*

