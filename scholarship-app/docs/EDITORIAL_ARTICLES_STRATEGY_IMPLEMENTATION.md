# 📰 EDITORIAL CONTENT ENGINE (/articles) - MASTER STRATEGY & IMPLEMENTATION BLUEPRINT

**Document Version:** 1.0  
**Owner:** Ram  
**Target Domain:** `https://www.indiascholarships.in/articles`  
**Last Updated:** July 2026  
**Status:** Architecture Approved  

---

## 🎯 1. Executive Summary & Vision

The **Editorial Content Engine (`/articles`)** is the E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) and Search Authority Layer for `indiascholarships.in`.

While our **Programmatic Engine** (1,800+ dynamic URLs across scholarship detail pages, state hubs, and portal guides) captures low-funnel transactional searches, the **Editorial Layer** captures top/mid-funnel informational searches (*"how to fund B.Tech"*, *"is X scholarship safe"*, *"how to fix bank seeding"*), shields the domain against Google Helpful Content Updates (HCU), and funnels high-intent organic traffic directly to our database money pages.

---

## ⚡ 2. Flat URL Architecture

To maintain maximum simplicity and avoid URL bloat, routing is **100% flat**:

*   `/articles` ➡️ **Main Index**: Clean listing, search bar, and client-side topic pill filters.
*   `/articles/[slug]` ➡️ **Direct Article Page**: Individual simple-English guides (e.g., `/articles/how-to-make-income-certificate-for-scholarships`).

---

## 🧠 3. The 5-Pillar Content Framework (100-Article Calendar)

Articles are produced across 5 distinct, high-intent pillars (20 articles per pillar = 100 articles total):

1.  **Pillar 1: State & Portal Master Guides** (*Mapped to `/scholarships-in/[state]` & `/guides/[portal]`*)
    *   Covers registration flows, SATS ID linking, and portal-specific troubleshooters for Karnataka, Odisha, MahaDBT, UP, West Bengal, Tamil Nadu, NSP, and PFMS.
2.  **Pillar 2: Category, Caste & Income Decoders** (*Mapped to `/scholarships-for/[category]` & `/scholarships-income/[tier]`*)
    *   Explains SC/ST/OBC/EWS rules, income caps (₹1L, ₹2.5L, ₹8L), female STEM grants, PwD aid, and certificate validity.
3.  **Pillar 3: Course & Degree Blueprints** (*Mapped to `/scholarships-by-course/[course]` & `/scholarships-level/[level]`*)
    *   Tailored guides for B.Tech, Diploma, MBBS, Nursing, Agriculture, Class 10/12 passouts, Law, and GATE/PhD fellowships.
4.  **Pillar 4: Corporate, CSR & High-Value Roundups** (*Mapped to `/corporate-scholarships` & DB detail slugs*)
    *   Deep-dive reviews and application tips for Tata Capital Pankh (₹100k), LIC Golden Jubilee, PM Yashasvi (₹125k), Azim Premji, Glow & Lovely, Reliance, HDFC, and Jindal.
5.  **Pillar 5: Procedural, Document & Status Troubleshooting** (*Mapped to `/eligibility-checker` & subpages*)
    *   Step-by-step solutions for NPCI Aadhaar bank seeding, Bonafide formats, double-dipping rules, CPGRAMS grievances, and gap-year affidavits.

Full 100-article slug breakdown is maintained in [content_calendar_100.md](file:///Users/roshankumar/.gemini/antigravity/brain/9b20f99f-da14-480a-aafd-df26fa6b068b/content_calendar_100.md).

---

## 🛡️ 4. Cannibalization Defense & Intake Protocol

To prevent editorial articles from cannibalizing programmatic money pages:

```
                          INTAKE COLLISION CHECK
                                     │
      Does requested title match an Entity Noun (e.g. "SSP Karnataka Login")?
                                     │
                 ┌───────────────────┴───────────────────┐
                 YES                                     NO
                 ▼                                       ▼
    STOP & WARN USER/AGENT                    APPROVE FOR DRAFTING
    Reframe to Procedural Verb Angle          (Procedural / Scenario Guide)
    ("How to register on SSP step-by-step")
```

*   **Programmatic Target**: Nouns & Direct Lookups (*"Tata Capital Pankh Scholarship 2026"*, *"SSP Karnataka Login"*).
*   **Editorial Target**: Verbs & Procedural Scenarios (*"How to apply for Tata Pankh without errors"*, *"Is Tata Pankh legitimate"*).

---

## ✍️ 5. Tier-2 / Tier-3 Simple English Writing Standard

Every article must strictly follow these readability rules:
*   **Bite-Sized Sentences**: Maximum 15 words per sentence.
*   **Short Paragraphs**: Maximum 3 lines per paragraph.
*   **Simple Vocabulary**: Use basic everyday words (*"Get money"* instead of *"Disburse financial aid"*).
*   **Key Takeaways Box**: Top of article must contain a highlighted 3-bullet summary box answering the core query immediately.
*   **Mandatory DB Interlinking**: Must link to at least 2 relevant scholarship detail pages (`/scholarships/[slug]`) using exact keyword anchor text.
*   **Interactive Element**: Include an interactive document checklist (saved in `localStorage`) or a 1-click pulse poll (`[👍 Helpful]`).

---

## 🔗 6. Related Documentation Links
- [Master Product Vision & Strategy (PRODUCT_VISION_STRATEGY_TACTICS.md)](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/scholarship-app/docs/PRODUCT_VISION_STRATEGY_TACTICS.md)
- [SEO Site Structure & URL Hierarchy (seo_site_structure.md)](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/Scholarship-Tracker-POC-antigravity/scholarship-app/docs/seo_site_structure.md)
- [Workspace Rules & Guidelines (AGENTS.md)](file:///Users/roshankumar/Desktop/Schlarship%20Tracker%20/.agents/AGENTS.md)
