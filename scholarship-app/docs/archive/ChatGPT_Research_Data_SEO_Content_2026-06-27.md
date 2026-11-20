# Technical Guide: Data, SEO & Content Generation Architecture
**Project Name:** IndiaScholarships (Scholarship Decision Engine)  
**Target Audience:** Senior Software Architect  
**Author:** Original System Architect  
**Date:** June 27, 2026

---

## 1. Database Architecture
The platform is designed around a fast, low-overhead, read-heavy local storage model using **SQLite**.

### Schema Overview
The database uses a single, denormalized table: `scholarships`. There are no foreign key relationships or join tables, optimizing read operations.

### Key Fields & Definitions
| Field Name | Type | Description / Intent |
|------------|------|----------------------|
| `id` | TEXT (PK) | Unique identifier (often matches Google Sheet row ID). |
| `title` | TEXT | Display name of the scholarship. |
| `slug` | TEXT (Unique) | URL slug, stripped of year suffixes (e.g., `sitaram-jindal-scholarship`). |
| `provider_type` | TEXT | Grouping field: `Government`, `Private`, or `Corporate`. |
| `state` | TEXT | Domicile state requirement (e.g., `Karnataka`, `Odisha`, `All India`). |
| `level` | TEXT | Target education levels (e.g., `UG`, `PG`, `Class 11-12`). |
| `caste` | TEXT | JSON string array of eligible castes (e.g., `["SC", "ST"]`). |
| `course_stream` | TEXT | JSON string array of eligible disciplines (e.g., `["Engineering", "Medical"]`). |
| `amount_annual` | INTEGER | Maximum annual scholarship disbursement amount in INR. |
| `amount_min` | INTEGER | Minimum annual scholarship disbursement amount in INR. |
| `income_limit` | INTEGER | Maximum annual family income allowed to qualify in INR. |
| `min_marks` | INTEGER | Minimum academic percentage required (e.g., `60`). |
| `docs_needed` | TEXT | Comma/newline separated list of mandatory documents. |
| `apply_url` | TEXT | Direct link to the external application form. |
| `deadline` | TEXT | Date string (`YYYY-MM-DD`) or status descriptor (`Open Now`, `Rolling`). |
| `step_guide` | TEXT | Markdown text detailing the registration and application steps. |
| `faq_json` | TEXT | JSON array containing exactly 3 QA pairs. |
| `verified_status`| TEXT | Audit status (e.g., `Verified`, `Legacy`). |
| `last_verified` | TEXT | ISO timestamp of the last verification review. |
| `is_popular` | INTEGER | Boolean flag (`1` or `0`) forcing display in popular list. |
| `priority_score` | INTEGER | Sorting weight (`0-100`) used to rank cards. |
| `scholarship_scope` | TEXT | Scope indicator (`domestic` default, `international` for study-abroad programs). Added July 2026 for CNT-14. |
| `country_of_study` | TEXT | Destination country for international scholarships (e.g., `United Kingdom`, `United States`). Added July 2026. |

### Architectural Rationale for Denormalization
A single-table denormalized model was selected for the following reasons:
1. **Performance:** Sub-millisecond queries on Vercel Edge. No SQL joins are performed, reducing query computation overhead.
2. **Portability:** The entire database is a single file (`scholarships.db`), easily version-controlled in Git and deployed.
3. **Synchronization:** Simplifies Google Sheets syncing. Each row in Google Sheets maps 1:1 to a database record.

### Schema Limitations & Scaling to 10,000+ Records
* **Redundancy:** Domicile states, education levels, and castes are repeated as raw text strings rather than normalization IDs, leading to potential data entry inconsistencies.
* **Storage Size:** Storing markdown guides and JSON columns in a single table increases database size, which can affect cache performance.
* **Scaling Strategy:** If scaling to tens of thousands of records:
  1. Extract content columns (`step_guide`, `benefits`) to a separate `scholarship_details` table, keeping the primary `scholarships` table slim for fast search indexing.
  2. Implement an external full-text search index (e.g., Pagefind or Meilisearch) rather than relying on SQLite `LIKE` queries.

---

## 2. Search Engine Optimization (SEO) Strategy
The system's organic traffic generation relies on a programmatic, high-density content clustering strategy.

### URL Strategy
Clean, descriptive, search-intent matched URLs:
* Individual Detail Page: `/scholarships/[slug]` (No date suffix to prevent URL drift across cycles).
* High-Intent Subpage: `/scholarships/[slug]/[subpage]` (e.g., `/scholarships/pm-yashasvi/documents-required`).
* Domicile Directory: `/scholarships-in/[state]` (e.g., `/scholarships-in/odisha`).
* Caste Directory: `/scholarships-for/[category]` (e.g., `/scholarships-for/sc-students`).
* Education level Directory: `/scholarships-level/[level]` (e.g., `/scholarships-level/graduation-ug`).
* International Scholarships Live Status Tracker Hub: `/scholarships/international` (Tracks verified deadlines, live open/closed status, and eligibility requirements for study-abroad scholarships). Added July 2026 for CNT-14.

### Metadata Generation
SEO metadata is generated programmatically in `app/scholarships/[slug]/page.tsx` based on provider type and title heuristics:
* **Government Override:** If the scholarship is government-sponsored, the title is appended with: `[Title] 2026: Apply Online, Portal Login & Status Check`.
* **Private Override:** For private foundations, the title becomes: `[Title] 2026: Application Form, Eligibility & Selection List`.
* **Brand Overrides:** Dedicated templates for high-volume searches (e.g., `e-Kalyan`, `MMVY`, `SVMCM`).

### Structured Data (JSON-LD)
Every scholarship page programmatically injects a schema markup script:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Scholarship Title]",
  "description": "[Intro SEO text]",
  "image": "https://www.indiascholarships.in/icon.png",
  "publisher": {
    "@type": "Organization",
    "name": "IndiaScholarships"
  }
}
```
*Opportunity:* Upgrade the schema type to `Course` or create custom `FaqPage` schema using `faq_json` database records to trigger search rich snippets.

### Canonical Handling
To prevent duplicate content penalties from multi-url rendering, the canonical link is strictly locked to the primary slug URL:
`https://www.indiascholarships.in/scholarships/[slug]`

### Sitemap & Robots
* **Sitemap (`app/sitemap.ts`):** Programmatically queries SQLite at build time and returns a unified array of static routes, detail pages, subpages, state directories, course paths, and category hubs.
* **Robots.txt:** Configured to allow all search spiders to crawl, mapping directly to `/sitemap.xml`.

### Pagination & Internal Linking
* **Pagination:** Currently handled client-side due to the compact database size (< 1,000 records). As records scale, server-side paginated queries (`LIMIT` and `OFFSET`) must be added to listing hubs.
* **Internal Linking:** Every detail page renders a "Related Scholarships" widget. It executes a query mapping the current scholarship's State, Level, and Caste against active records, sorting by relevance to ensure strong internal pagerank flow.

### Topical Authority Strategy
By programmatically generating subpages for each high-volume scholarship (e.g., `/eligibility`, `/documents-required`, `/last-date`), the site builds dense content hubs. Google crawls these parent-child page structures and recognizes the site as a specialized authority on educational funding.

---

## 3. Content Ingestion & AI Enrichment Pipeline

```
[Web Research / Google Sheets] 
              │
              ▼
    [import-from-sheets.js] 
              │
              ▼
  [content-quality-audit.js] ──► (Generates Quality Report & Identifies Gaps)
              │
              ▼
[enrich-all-low-ctr-gemini.js] ◄── (Runs Gemini 1.5 Flash with Google Grounding Search)
              │
              ▼
    [SQLite / Sheets Sync]
```

### Ingestion Flow
1. **Google Sheets Sync:** CSV data is downloaded from the master Google Sheet.
2. **Data Parsing:** `import-from-sheets.js` normalizes commas, parses arrays (castes, course streams), and writes rows to SQLite.
3. **Auditing:** `content-quality-audit.js` runs a frictional analysis looking for:
   * HTML tags in text fields (formatting errors).
   * Outdated year references (e.g., `2024` or `2025` text on a 2026 page).
   * Empty amount fields or missing FAQs.

### AI Enrichment & Grounding
For incomplete or low-CTR records, the pipeline invokes `enrich-all-low-ctr-gemini.js`:
* **The Model:** Gemini 1.5 Flash.
* **Google Search Grounding:** Enabled (`tools: [{ googleSearch: {} }]`). This forces the model to fetch live Google search results for the scholarship and synthesize facts.
* **Structured Output:** The model is constrained to return a strict JSON schema containing verified eligibility, selection rules, renewal policies, helpline numbers, and FAQs.
* **Syncing Back:** The verified output is written back to the SQLite database and synced to Google Sheets.

### WordPress Sync & Publishing Pipeline
Because WordPress is the production source of truth (and SQLite is the fallback), any local database updates or AI enrichments do not show live until synced to WordPress.

```
[Local SQLite DB (Enriched)]
             │
             ▼ (export-for-wp-bulk.js)
  [wp-migration-export.csv]
             │
             ▼ (Upload to WP admin via WP All Import)
  [WordPress Database (ACF)] ──► [Vercel Next.js REST fetch] ──► [Live Site]
```

1. **Export SQLite to CSV:** Run `node scholarship-app/scripts/export-for-wp-bulk.js`. This extracts SQLite records and compiles a CSV at `data/wp-migration-export.csv` with headers matching your Advanced Custom Fields (ACF) names.
2. **WordPress Import:** 
   * Log into the WordPress Dashboard.
   * Go to **All Import** -> **New Import** (or **Manage Imports** if updating).
   * Upload the generated `wp-migration-export.csv`.
   * Target the **Scholarships** custom post type.
   * Map the CSV fields (FAQ JSON, Step Guide, Helpline, etc.) to the respective ACF fields.
   * Run the import to sync all database records.
3. **Build Execution:** During the next Vercel build or when the hourly ISR cache expires, Next.js calls the WordPress REST API to fetch the updated content and rebuild the static Edge HTML pages.

---

## 4. Technical Debt & Improvement Opportunities
1. **Database Denormalization:** While fast, the flat table structure leads to data redundancy. Splitting taxonomies into relational lookup tables will prevent inconsistencies.
2. **Lack of Dynamic Schemas:** We should replace the generic `Article` JSON-LD schema on detail pages with official `FAQPage` and specialized micro-data structures to capture rich snippets in search results.
3. **Lack of Real-time Deadlines:** Currently, deadline status is calculated relative to build-time dates. Integrating a lightweight runtime date validator on the client side will prevent displaying "Apply Now" for expired schemes.
4. **Programmatic Sitemap Limits:** The current Next.js `sitemap.ts` exports all routes in a single payload. If sitemap URLs exceed 50,000, we must refactor it to output a sitemap index file referencing split sitemaps.

---

## 5. Product Manager (PM) Context: Data Curation & Traffic Growth

### Staging Sandbox & Trust Safeguard
From a product quality standpoint, we cannot expose raw AI outputs directly to our production database. Hallucinated deadlines or wrong helpline numbers would immediately destroy our trust metric. 
* **The SQLite/Google Sheets staging pipeline** serves as our content sandbox. 
* We run the grounding scripts, perform quality audits locally, let a human review the sheet, and then upload clean, vetted data to WordPress. This guarantees a **0% hallucination rate** on the live production site.

### ROI-Focused Content Updates (GSC Audit)
We do not waste resources or API tokens researching every single scholarship in the database. The `enrich-all-low-ctr-gemini.js` tool queries Google Search Console data first:
* It identifies pages that have **high impressions but low Click-Through Rates (CTR)**.
* We prioritize and enrich only these pages. By adding accurate FAQs and step-by-step guides to high-traffic terms, we maximize organic CTR lift for minimal research spend.

### SEO Authority Protection
* **Evergreen Slugs:** Keeping year suffixes out of slugs ensures we accumulate backlinks and page authority year after year, rather than starting from scratch with a new URL every cycle.
* **The Static Fallback Safeguard:** If WordPress crashes or hosted DB API limits are exceeded, Vercel falls back to the local SQLite database. This ensures Google's crawlers never encounter 500 errors, preserving our search engine index position.

