# IndiaScholarships Master Information Architecture (IA) & SEO Strategy

This document details the master **Information Architecture (IA)**, **Content Cluster Strategy**, **Programmatic SEO (pSEO) Matrix**, and **Search Engine Traffic Maximization Strategy** for **India Scholarships (`indiascholarships.in`)**. It serves as the authoritative architectural blueprint for developers and AI agents.

---

## 🏗️ Master Architectural Overview (The 6-Cluster Hub-and-Spoke Pyramid)

The platform is structured into a strict **Siloed Hub-and-Spoke Pyramid** to establish maximum topical authority. All site URLs belong to **6 Core Master Clusters**, eliminating flat route fragmentation and thin content cannibalization.

```mermaid
graph TD
    %% Base Node
    Home["🏠 Homepage (/)"]

    %% Tier 1: 6 Core Master Clusters
    Home --> StateHub["🗺️ State Ecosystem (/states/:state)"]
    Home --> PortalHub["🏛️ Portal Ecosystem (/portals/:portal)"]
    Home --> QualHub["🎓 Qualification Hubs (/qualifications/:slug)"]
    Home --> EligHub["🏷️ Eligibility & Talent Hubs (/eligibility/:slug)"]
    Home --> PrivHub["🏢 Private Ecosystem (/private-scholarships/:slug)"]
    Home --> KnowledgeBase["📚 Unified Knowledge Base (/guides/:slug)"]

    %% Tier 2: Master Detail Pages
    StateHub --> MasterDetails["📜 Master Scholarship Detail Pages (/scholarships/:slug)"]
    PortalHub --> MasterDetails
    QualHub --> MasterDetails
    EligHub --> MasterDetails
    PrivHub --> MasterDetails
    KnowledgeBase --> MasterDetails

    %% Single-Page Section Anchors (Zero Subpages)
    subgraph SectionAnchors [Single-Page Master Anchor Pills (#anchor)]
        anchor1["#eligibility"]
        anchor2["#income-limit"]
        anchor3["#documents-required"]
        anchor4["#last-date"]
        anchor5["#selection-process"]
        anchor6["#apply-online"]
        anchor7["#renewal-process"]
    end

    MasterDetails -.-> SectionAnchors

    style Home fill:#4F46E5,stroke:#312E81,stroke-width:2px,color:#fff
    style MasterDetails fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
    style SectionAnchors fill:#F3F4F6,stroke:#9CA3AF,stroke-width:1px,color:#111827
```

---

## 📂 The 6 Core Master Clusters

| Master Cluster | Base Path | Cluster Purpose & Scope | Target Search Intent |
| :--- | :--- | :--- | :--- |
| **1. Regional State Ecosystem** | `/states/[state]` | Master State Hubs featuring Master Comparison Matrices, State Portal CTAs, and active schemes. | High-intent state applicants (*"Scholarships in Karnataka"*, *"UP scholarship 2026"*). |
| **2. Official Portal Ecosystem** | `/portals/[portal]` | Hand-curated procedural guides for major government portals (NSP, SSP Karnataka, MahaDBT, Digital Gujarat, MPTAAS). | Portal search traffic (*"NSP student login"*, *"SSP Karnataka status check"*). |
| **3. Qualification & Course** | `/qualifications/[slug]` | Grade & course-based clusters (School/10th, 12th Pass, Undergraduate, B.Tech, MBBS, PhD). | Students searching by education level or degree. |
| **4. Eligibility & Special Talent** | `/eligibility/[slug]` | Social Category (SC/ST/OBC/EWS/Minority), Gender (Girls, Single Girl Child), PwD, Sports, Defense. | Demographic & talent-specific scholarship discovery. |
| **5. Private & Corporate Ecosystem** | `/private-scholarships/[slug]` | Corporate CSR (Reliance, HDFC, SBI), Charitable Trusts (FFE, Sekhsaria), Private Universities, Study Abroad. | High-grant private searchers (*"Top CSR scholarships"*, *"Private engineering grants"*). |
| **6. Single-Page Master Directory** | `/scholarships/[slug]` | Single-page Master Detail Pages containing 3 mini-tables, direct answer lead blocks, and `#anchor` jump pills. | Direct brand/scheme searches (*"PM YASASVI"*, *"Reliance Foundation Scholarship"*). |

> **Note on Editorial Consolidation**: Articles, pillars, and procedural walkthroughs are unified under **`/guides/[slug]`**. Legacy routes (`/articles`, `/pillars`) are 301-redirected to `/guides/`. Legacy scholarship subpages (`/scholarships/:slug/:subpage`) are 301-redirected to section anchors (`/scholarships/:slug#:subpage`).

---

## ⚡ Programmatic SEO (pSEO) Matrix Engine

The platform dynamically combines taxonomy attributes to generate hyper-specific long-tail landing pages matching exact student query patterns:

$$\text{Pillar 1 (Qualification)} + \text{Pillar 2 (Eligibility / Category)} + \text{Pillar 3 (State)}$$

### High-Traffic pSEO Combination Examples:
* `/qualifications/btech/sc-category/maharashtra` (*"B.Tech Scholarships for SC Students in Maharashtra"*)
* `/eligibility/girl-students/postgraduate/income-below-2-5-lakhs` (*"PG Scholarships for Girl Students under 2.5 Lakhs Income"*)
* `/qualifications/10th-pass/sports-scholarships/haryana` (*"10th Pass Sports Scholarships in Haryana"*)

> **Anti-Thin Content Guardrail**: Programmatic landing pages are only generated when $\ge 2$ verified active schemes exist for the target filters. Every generated page includes a unique aggregate lead summary, comparison matrix table, and custom 3-step application checklist.

---

## 🌐 Vernacular & Phonetic Search Engine

To capture the **65%+ of Indian students** who search in native scripts or Romanized local language text (Hinglish/Tanglish/Kanglish):

### 1. Native Script Translation Pipeline (`/hi/`, `/bn/`, `/ta/`, `/te/`, `/kn/`, `/or/`)
* Native language localized routes under `app/[locale]/`.
* **Staleness Solution (`source_hash`)**: A `SHA-256` hash of concatenated scholarship attributes is stored in `scholarship_translations`. When official deadlines or amounts update in SQLite/Turso, the script automatically detects hash mismatches and re-translates *only* updated records.
* **Hreflang Compliance**: Every template emits clean `<link rel="alternate" hreflang="...">` tags for all 6 supported Indian languages.

### 2. Phonetic Romanized Intent Engine (Hinglish, Tanglish, Kanglish, Benglish)
* Captures queries typed in English script for local languages (e.g. *"UP scholarship last date kab hai"*, *"NSP scholarship apply kaise kare"*, *"documents kya lagega"*).
* Dedicated **Phonetic FAQ Accordions** embedded on Portal Guides and Master Pages with valid `FAQPage` JSON-LD schema markup.

---

## 🛡️ 100% PageRank Preservation & 301 Redirect Matrix

To ensure zero loss of existing SEO authority, backlinks, or indexed traffic during migration:

| Legacy / Current Path Pattern | New Target Cluster Path Pattern | Redirect Type | SEO Preservation Rationale |
| :--- | :--- | :--- | :--- |
| `/:locale/scholarships/:slug/:subpage*` | `/:locale/scholarships/:slug#:subpage` | 301 Permanent | Preserves master page authority; maps subpages to section anchors. |
| `/guides/nsp/:subpage*` | `/portals/national-scholarship-portal-nsp/:subpage*` | 301 Permanent | Maps National Scholarship Portal guide to dedicated `/portals/` hub. |
| `/guides/ssp-karnataka/:subpage*` | `/portals/ssp-karnataka/:subpage*` | 301 Permanent | Maps Karnataka SSP Portal guide & subpages to `/portals/`. |
| `/guides/mahadbt/:subpage*` | `/portals/mahadbt-maharashtra/:subpage*` | 301 Permanent | Maps Maharashtra MahaDBT Portal guide & subpages to `/portals/`. |
| `/scholarships-by-education/:slug*` | `/qualifications/:slug*` | 301 Permanent | Preserves education level backlinks (UG, PG, B.Tech, 10th Pass). |
| `/scholarships-by-category/:slug*` | `/eligibility/:slug*` | 301 Permanent | Preserves caste/category backlinks (SC, ST, OBC, EWS, Minority). |
| `/scholarships-for/:slug*` | `/eligibility/:slug*` | 301 Permanent | Preserves demographic backlinks (Girls, PwD, Sports, Single Girl Child). |
| `/corporate-scholarships/:slug*` | `/private-scholarships/csr-corporate/:slug*` | 301 Permanent | Preserves corporate CSR backlinks (Reliance, HDFC, SBI). |
| `/scholarships-in/:state` | `/states/:state` | 301 Permanent | Unifies state hubs under `/states/` for clean cluster hierarchy. |

---

## ⚡ Indexing & Viral Retention Pipeline

1. **Google Indexing API (`scripts/push-to-google-indexing.js`)**: Automatically pings Googlebot whenever scholarship deadlines or news announcements update in SQLite/Turso.
2. **Dynamic XML Sitemap (`app/sitemap.ts`)**: Auto-generates multi-sitemap chunks for core hubs, master scholarships, state hubs, qualifications, eligibility, and portal guides.
3. **WhatsApp / Telegram Alert Widget (`<WhatsAppAlertCTA>`)**: Sticky call-to-action on every money page and portal guide, driving direct recurring traffic during deadline extensions.
4. **Structured Data Schemas**: Every page emits JSON-LD `FinancialProduct` (or `GovernmentService`), `HowTo`, `FAQPage`, and `BreadcrumbList` schemas.
