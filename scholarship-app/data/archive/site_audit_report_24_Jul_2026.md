# India Scholarships Portal - Architecture & Audit Report

## 1. Content Inventory & Sources
The codebase comprises a database-driven directory coupled with local markdown editorial and news contents.

*   **Database (SQLite: `scholarships.db`)**: **466 verified scholarships**
    *   *Path*: `/Users/roshankumar/Desktop/Schlarship Tracker /Scholarship-Tracker-POC-antigravity/scholarship-app/data/scholarships.db`
    *   *Routes*: Programmatic dynamic routing under `/scholarships/[slug]`
*   **Editorial Articles**: **23 articles** (MDX/Markdown)
    *   *Path*: `/Users/roshankumar/Desktop/Schlarship Tracker /Scholarship-Tracker-POC-antigravity/scholarship-app/content/articles/`
    *   *Routes*: Static file-based routing mapped under `/articles/[slug]`
*   **News Pieces**: **15 articles** (MDX/Markdown)
    *   *Path*: `/Users/roshankumar/Desktop/Schlarship Tracker /Scholarship-Tracker-POC-antigravity/scholarship-app/content/news/`
    *   *Routes*: Static file-based routing mapped under `/news/[slug]`
*   **Crawlable Dynamic Pages**: **3,841 total URLs** (including 7 subpages per scholarship, state hubs, caste/category directories, and portal guides).

---

## 2. Current IA & URL Structure
The URL structure is structured into a dynamic directory layout and flat folders.

```
/
├── scholarships/
│   ├── [slug] (Main Detail Page)
│   ├── [slug]/eligibility
│   ├── [slug]/income-limit
│   ├── [slug]/documents-required
│   ├── [slug]/last-date
│   ├── [slug]/selection-process
│   ├── [slug]/apply-online
│   └── [slug]/renewal-process
├── scholarships-in/
│   ├── [state-slug] (State Hub Directory)
│   └── [state-slug]/[subpage] (E.g. /eligibility, etc. Compiled if State has >= 3 scholarships)
├── scholarships-for/
│   ├── [category-slug] (E.g. ST, SC, General, OBC, Sports)
│   └── [education-level]/in/[country] (Study Abroad cross-combinations)
├── scholarships-level/
│   └── [level-slug] (E.g. graduation-ug, phd-research)
├── scholarships-income/
│   └── [income-slug]
├── scholarships-by-course/
│   └── [course-slug]
├── scholarships-by-university/
│   └── [university-slug]
├── guides/
│   ├── [portal-slug] (E.g. national-scholarship-portal-nsp, ssp-karnataka)
│   └── [portal-slug]/[subpage] (E.g. status-check, student-login, documents-list)
├── articles/
│   └── [article-slug] (Flat structure)
└── news/
    └── [news-slug] (Flat structure)
```

> [!NOTE]
> Internal linking is programmatic on directory indexes but ad hoc within articles. Articles are mapped manually via JSON configs to relative scholarships.

---

## 3. Navigation & Taxonomy
Taxonomies are parsed from the SQLite database structure and surfaced to the UI via dropdown menus and filtering chips:

1.  **State Directory**: Map of Indian States. Dynamic hub generated only for states containing at least 3 active scholarships.
2.  **Caste / Category**: Surfaced dynamically (ST, SC, OBC, General, EWS, Minority, Sports, Disability).
3.  **Education Level**: Canonical options mapped to:
    *   `class-1-10`
    *   `class-11-12`
    *   `diploma-polytechnic`
    *   `iti-courses`
    *   `graduation-ug`
    *   `post-graduation-pg`
    *   `phd-research`
4.  **Provider Type**: Mapped to `Government`, `Private`, `Corporate`, `Trust`, or `University`.
5.  **Scope**: `Domestic` vs `International` (Study Abroad).

*Navigation Surfaces*: The desktop main header dropdown lists categories, states, and educational levels, alongside curated tabs: "Trending", "Closing Soon" (deadlines), and "Newly Verified".

---

## 4. Search Console & Landing Page Traffic
Organic impressions and clicks are concentrated heavily on high-intent scholarship brand searches.

### Top 10 High-Traffic Landing Pages (GA4/GSC 90-Day Trends)
1.  `/scholarships/pm-yashasvi-scholarship` (Highest overall volume)
2.  `/scholarships/sitaram-jindal-foundation-scholarship`
3.  `/eligibility-checker` (Interactive Tool)
4.  `/scholarships/tata-capital-pankh-scholarship`
5.  `/scholarships/hdfc-bank-parivartan-ecss-scholarship`
6.  `/guides`
7.  `/state-scholarships`
8.  `/scholarships/atul-maheshwari-scholarship`
9.  `/scholarships-in/karnataka`
10. `/scholarships/gujarat-post-matric-scholarship-for-obc`

### cannibalization Audit Findings
*   **e-kalyan** / **ekalyan**: Single clear owner `/scholarships/jharkhand-e-kalyan-post-matric-scholarship` (92% to 100% of queries).
*   **digital gujarat scholarship**: Severe split. Clicks and impressions are fragmented across `/scholarships/digital-gujarat-post-matric-scholarship-for-sc-students` (52% share) and other state hubs.
*   **oasis scholarship**: Split across SC/ST/OBC specific oasis listings. Primary page `/scholarships/oasis-post-matric-scholarship-for-obc-students-west-bengal` only claims 54% query share.
*   **aikyashree**: Split between `/scholarships/aikyashree-scholarship-west-bengal-minority` (42% share) and `/apply-online` subpages.

---

## 5. Monetization Setup
*   **Google AdSense Client**: `ca-pub-3403005071423697`
*   **Placement Templates**:
    1.  **Global Banner**: Initialized dynamically on all pages.
    2.  **Detail Subpages**: Inline card placement (responsive fluid unit) standard on dynamic path `app/[locale]/scholarships/[slug]/[subpage]/page.tsx` when a client ID is configured.
    3.  **Sticky Footer**: Configured for high-RPM viewability on mobile pages.
*   **Affiliate & Lead-Gen Setup**: None. outbound portal buttons link directly to verified official registration portals (e.g. scholarship.gov.in, ssp.karnataka.gov.in) with outbound rel tags.

---

## 6. Technical Constraints & Redirect Rules
A massive registry of 301/308 redirects is maintained in `next.config.ts` to manage URL changes and handle legacy routes:

*   **Subpage Redirect Preservation**: If a scholarship slug changes (e.g. `legacy-foundation-for-excellence-scholarship` to `foundation-for-excellence-ffe-scholarship`), the subpages are redirected recursively using wildcard matches:
    `/scholarships/from-slug/:subpage*` $\to$ `/scholarships/to-slug/:subpage*`
*   **State Aggregation Filters**: Low-scholarship states are automatically caught and redirected using Next.js routing patterns to safeguard against thin content pages indexing.
