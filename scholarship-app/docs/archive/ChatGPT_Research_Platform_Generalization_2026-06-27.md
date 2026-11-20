# Architectural Proposal: Reusable Directory & Information Platform
**Project Name:** Directory Engine (Modular Info Platform Platform Play)  
**Target Audience:** Senior Software Architect  
**Author:** Original System Architect  
**Date:** June 27, 2026

---

## 1. Current State vs. Future Vision
The current codebase is specialized as a scholarship engine. To transform it into a **reusable information platform** capable of powering directories for Colleges, Universities, Jobs, Travel, Financial Products, and Healthcare directories, we must transition from a vertical application to a horizontal directory engine.

### Analysis of Reusable vs. Coupled Code
* **Generic and Reusable Parts:**
  * **Static rendering pipeline:** The SSG `generateStaticParams()` structure and Vercel edge deployment.
  * **Database layer framework:** Local SQLite file access, connection pooling, and WAL mode.
  * **Ingestion core:** Downloading Google Sheets CSVs and mapping rows.
  * **SEO patterns:** Sitemap compilers, sitemap index routines, canonical headers, and programmatic routing ideas.
* **Tightly Coupled Parts:**
  * **The database table:** Flat `scholarships` table with hard-coded fields (`caste`, `income_limit`, `min_marks`).
  * **Custom utility mapping:** Caste and education level parsing algorithms (`lib/utils.ts`).
  * **Enrichment prompts:** Hardcoded Gemini schemas and prompt strings in scripts.
  * **UI Components:** Detail pages displaying fields specific to scholarships (e.g. stipend, application mode).

---

## 2. Redesign Decisions: What to Change & What to Keep
* **Keep Unchanged:**
  * **SQLite-in-Repo Approach:** Local SQLite database file per site. This remains the absolute best strategy for performance, cost, and developer experience.
  * **Google Sheets CMS:** Extremely fast content curation mechanism for non-technical writers.
  * **Verification Badge:** Date-stamped authority (e.g., "Last Verified") applies to all directories (Jobs, Schemes, Finance).
* **Redesign Today:**
  * **Database Schema:** Generalize database structure to support polymorphic entities.
  * **Component Template:** Move away from hardcoded fields to a block-based visual layout engine.
  * **AI Prompting Pipeline:** Abstract prompts and schemas into a registry catalog.

---

## 3. Dynamic Data Model Redesign
To scale to millions of pages across different directories, we will implement a polymorphic, relational schema in SQLite using JSON columns.

```
┌──────────────────┐       ┌──────────────────┐
│     tenants      │       │     entities     │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │ ───┐   │ id (PK)          │
│ domain           │    │   │ tenant_id (FK)   │
│ name             │    └───│ slug             │
│ directory_type   │        │ title            │
│ config (JSON)    │        │ status           │
│                  │        │ verified_at      │
│                  │        │ attributes (JSON)│
└──────────────────┘        └──────────────────┘
```

```sql
-- Represents each directory site (e.g., indiascholarships.in, indiacolleges.in)
CREATE TABLE tenants (
    id TEXT PRIMARY KEY,
    domain TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    directory_type TEXT NOT NULL, -- 'scholarships', 'colleges', 'jobs', etc.
    config TEXT -- JSON configuration (theme colors, primary navigation, logo)
);

-- Polymorphic table representing any entity in the directory
CREATE TABLE entities (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    verified_at TEXT NOT NULL,
    attributes TEXT, -- JSON payload containing directory-specific values
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE UNIQUE INDEX idx_tenant_slug ON entities(tenant_id, slug);
```

### How this scales to millions of pages
Instead of creating a new database table for each vertical, dynamic fields (e.g. tuition fees for colleges, salaries for jobs, interest rates for financial products) are stored inside the `attributes` JSON text field. SQLite's JSON1 extension allows us to index and filter on these keys (e.g., `json_extract(attributes, '$.salary_range')`) with high efficiency.

---

## 4. Polymorphic Component Architecture
The frontend detail page must render blocks dynamically based on the directory type config.

```tsx
// app/components/PolymorphicTemplate.tsx
import { DetailBlock, KeyMetricsBlock, GuideBlock, FAQBlock } from './blocks';

const BLOCK_REGISTRY: Record<string, React.ComponentType<any>> = {
  metrics: KeyMetricsBlock,
  guide: GuideBlock,
  faq: FAQBlock,
  text: DetailBlock
};

export default function PolymorphicTemplate({ entity, layout }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {layout.map((blockConfig, idx) => {
        const Block = BLOCK_REGISTRY[blockConfig.type];
        if (!Block) return null;
        return (
          <Block 
            key={idx} 
            data={entity.attributes[blockConfig.key]} 
            config={blockConfig.props}
          />
        );
      })}
    </div>
  );
}
```

---

## 5. Schema & Prompt Registry for AI Workflows
Rather than hardcoding prompt strings, we define a schema configuration catalog for each directory type:

```json
// config/directories/colleges.json
{
  "directory_type": "colleges",
  "system_prompt": "Research official details for [title] college in India. Find tuition fees, courses, ranking, and admission dates.",
  "json_schema": {
    "type": "OBJECT",
    "properties": {
      "tuition_fees_annual": { "type": "INTEGER" },
      "courses_offered": { "type": "ARRAY", "items": { "type": "STRING" } },
      "nirf_ranking": { "type": "INTEGER" },
      "admission_status": { "type": "STRING" }
    },
    "required": ["tuition_fees_annual", "courses_offered"]
  }
}
```

The AI enrichment script reads this JSON dynamically at runtime, constructs the prompt, sends the request to Gemini with Google Grounding enabled, and writes the output directly to the polymorphic `entities.attributes` table.

---

## 6. Directory Ingestion & Publishing Pipeline
To spin up a completely new directory, a developer follows this process:

1. **Add config:** Create a configuration file (e.g. `/config/directories/jobs.json`).
2. **Setup Sheet:** Create a Google Sheet matching the schema definition.
3. **Execute Ingest:** Run `npm run ingest -- --directory jobs --sheet [SHEET_ID]`. The script compiles records, runs quality audits, updates the SQLite file, and writes sitemap entries.
4. **Deploy:** Vercel catches the new commit, builds static pages using the polymorphic template, and hosts the new directory at `jobs.indiagovschemes.in`.

---

## 7. Long-Term Maintenance Architecture
To manage millions of pages across multiple subdomains with a team of only 1-2 engineers, the platform relies on automated AI loop workflows:

```
┌────────────────────────────────────────────────────────┐
│               Automated GitHub Action                  │
├────────────────────────────────────────────────────────┤
│ 1. Runs GSC script to identify low-traffic pages       │
│ 2. Triggers Audit Script (Finds date/data gaps)        │
│ 3. Fires Gemini Grounding Tool to enrich database      │
│ 4. Commits updated SQLite database directly to Git    │
│ 5. Triggers Vercel rebuild & Edge Deployment           │
└────────────────────────────────────────────────────────┘
```

* **No Server Infrastructure:** The entire network runs on serverless Edge caches and pre-rendered pages, keeping monthly hosting costs below $50.
* **Auto-healing Content:** The AI automatically researches and updates deadlines, dates, and links weekly. If an official link breaks, the sitemap is recompiled, and outdated pages are dynamically marked as closed.
* **Declarative Extensions:** Adding new directories does not require writing code. Adding schema files, Google Sheets, and layout blocks allows the system to auto-generate websites programmatically.

---

## 8. Product Manager (PM) Context: Multi-Tenant Platform Expansion

### TAM Expansion & Infinite Operational Leverage
By transforming the vertical scholarship database into a horizontal directory engine, we expand the business's Total Addressable Market (TAM) at zero marginal cost. 
* **Leveraging Core Assets:** The exact same filtering logic, SEO templates, and deployment scripts are reused across Colleges, Jobs, and Financial Products.
* **Infinite Leverage Model:** Rather than hiring individual content and engineering teams for each vertical, a team of just 1-2 people can operate 10+ directories. The AI acts as the primary researcher and validator, while the human acts strictly as a moderator and editor. This keeps margins close to 90%.

### Niche Monetization & Traffic Seasonality Hedging
* **Traffic Seasonality Hedging:** Scholarships are highly seasonal (peak traffic occurs between June and October). Adding evergreen verticals like travel guides, healthcare directories, and courses ensures stable year-round traffic and ad impressions.
* **Higher CPM Niches:** While scholarships have moderate ad value, directories for financial products (credit cards, loans), colleges, and healthcare rank among the highest CPM search niches in Google AdSense.

### The Recommendation Flywheel
A unified database schema (`entities` + dynamic attributes) allows us to build cross-directory loops. A user who finds a scholarship for engineering can be programmatically recommended matched colleges, relevant ITI courses, and graduate job listings across our sister domains. This creates a powerful cross-domain user referral network.

