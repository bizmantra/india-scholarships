# IndiaScholarships Dev Backlog

## In Progress (2)

- [ ] **IS-50**: Integrate Google Keyword Planner API for keyword research
  - **Impact**: Low
  - **Description**:
    Set up Google Ads API connection and integrate Google Keyword Planner for automated or script-based keyword research on scholarships. Includes obtaining a Manager Account, developer token, client ID, client secret, and generating a refresh token to perform queries.

- [ ] **IS-63**: BUG: Site search live issues
  - **Impact**: High
  - **Type**: Bug
  - **Description**:
    Setting journal_mode = WAL pragma on SQLite failed with SQLITE_CANTOPEN in the production environment (Vercel) due to Vercel's read-only serverless filesystem, returning 500 error for /api/search.

## Backlog (50)

- [ ] **IS-122**: Header: restructure for orientation — mega-menu still doesn't expose all real categories, feels cluttered
  - **Impact**: High
  - **Type**: Design, Feature
  - **Description**:
    Context / Why it matters:
    User feedback: "header continues to have cluttered navigation without orientation." Confirmed gap — even after this session's additions, the mega-menu mixes hub links, curated collections (Trending/Deadlines/New Arrivals), and provider-type links in a flat 3-column layout with no visual hierarchy signaling which items are peer categories vs. one-off collections. It also still doesn't expose every real category (Income limit hubs missing from Popular Segments column, for example).

    Plan / What to do:
    Full redesign pass on the mega-menu structure, not just adding missing links. Needs a clear grouping principle (e.g. "Browse by facet" vs "Curated views" vs "Learn") so a user can tell at a glance what kind of thing each link is, per the taxonomy work already done in IS-116/117. Should resolve alongside IS-124 (trending/deadlines nav consolidation) since they're the same underlying problem — collections presented as peers of categories.

    Trigger:
    User feedback with mobile-menu screenshot, this session.

- [ ] **IS-123**: Footer: still incomplete — needs the full persistent taxonomy block (supersedes/absorbs IS-117)
  - **Impact**: High
  - **Type**: Design, Feature
  - **Description**:
    Context / Why it matters:
    User feedback: "both header and footer dont expose all categories." This session only added 4 links to the existing "Browse" list (Course, Study Abroad, Sports, PWD) — the bigger IS-117 redesign (full 3-column Buddy4Study-style taxonomy block, visible on every page) was never done. Confirmed still missing from footer entirely: Income hubs.

    Plan / What to do:
    Same as IS-117 — build the full persistent taxonomy footer block. Treat this ticket as the up-to-date version of that work; close IS-117 as duplicate once this is picked up.

    Trigger:
    User feedback, this session — confirms IS-117 is still the right call and now has direct user confirmation, not just competitive research.

- [ ] **IS-124**: Nav: present Trending/Deadlines/Recently-Added as views within Browse, not peer top-level items
  - **Impact**: Medium
  - **Type**: Design, Feature
  - **Description**:
    Context / Why it matters:
    User asked whether /scholarships, /scholarships/trending, and /scholarships/deadlines should be collapsed. Checked first: they are NOT duplicates — each has distinct, real SEO metadata targeting different search intent ("trending scholarships" vs "scholarship deadlines 2026" vs generic), and /scholarships/deadlines is a substantial 450-line feature page (countdown timers, filters), not a thin wrapper. Merging the URLs would destroy real ranking pages — same mistake class as the Article duplicates, but the opposite conclusion.

    Plan / What to do:
    The problem is navigational presentation, not routing. Currently the mobile "Quick Actions Grid" and desktop mega-menu present Trending/Deadlines/New Arrivals/All Schemes as 4 equal-weight, disconnected buttons. Restructure so these read as sort/filter views of one "Browse Scholarships" destination, not as separate peer destinations. Keep all URLs unchanged — this is a presentation-only fix.

    Trigger:
    User feedback, this session — direct question about collapsing these routes.

- [ ] **IS-125**: Homepage: doesn't lead users into underrepresented categories or Editorial/News content
  - **Impact**: High
  - **Type**: Design, Feature
  - **Description**:
    Context / Why it matters:
    User feedback: "Homepage needs to lead people into unrepresented pages and categories as well as editorial and news content." Current homepage has a "Category Gateway" section (By State Domicile, By Social Category grids) but it's unclear whether it covers Course/Income/Sports/PWD/Study Abroad, or surfaces Editorial (Pillars/Guides) or News at all — needs an audit against what's actually there versus what's missing, then a fix.

    Plan / What to do:
    Audit HomeClient.tsx against the full real taxonomy (State, Category, Education Level, Income, Course, University, Provider type, Study Abroad, Sports, PWD) and against Editorial/News — list what's exposed vs. missing, then add dedicated sections for whatever's absent, prioritizing categories with real scholarship counts that currently have zero homepage presence.

    Trigger:
    User feedback, this session.

- [ ] **IS-116**: Cross-link scholarships across hub types (State/Category/Level/Income) for findability
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Context / Why it matters:
    Core outcome of the taxonomy/findability discussion with Claude. Confirmed via DB counts and a Buddy4Study comparison that a faceted model (State, Category, Level, Income, Provider-type, Course, University as independent, co-equal facets) is correct for this dataset — NOT a single 'primary' hierarchy (47% of scholarships are 'All India' with no state, and SC/ST/OBC/General are near-universal so they don't discriminate well as a tree). The gap isn't the number of hubs, it's that a scholarship belonging to multiple facets simultaneously (e.g. a Karnataka + SC/ST + UG scholarship) currently only surfaces sibling links for whichever ONE hub the visiting page happens to be on — there's no cross-awareness between facet types.

    Plan / What to do:
    Extend the Detail page's related-scholarships module (already redesigned per IS-111) to pull siblings from ALL of the current scholarship's facets, not just one — e.g. 'Other scholarships in Karnataka' + 'Other SC/ST scholarships' + 'Other Undergraduate scholarships', each as its own short plain-list group. Mirrors getRelatedScholarships() in lib/db.ts but needs to surface multiple facet groups instead of one blended ranked list.

    Trigger:
    Taxonomy/findability discussion with Claude — confirmed this matters more than picking a 'primary' category.

- [ ] **IS-117**: Add persistent site-wide taxonomy block (footer, all pages) — Buddy4Study-style
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Context / Why it matters:
    Found via direct comparison with Buddy4Study (1,706+ scholarships vs. our 476). Their entire findability strategy for hub pages isn't breadcrumbs or hierarchy — it's one taxonomy block (State-wise / Class-based / Type-based, 8 links each = 24 total) repeated in the footer on every single page, site-wide. We currently bury most of this one click deep in the mega-menu, and it doesn't appear at all on Detail, Editorial, or News pages.

    Plan / What to do:
    Add a persistent 3-column taxonomy block to Footer.tsx (or a new shared component rendered on every page type): State hubs, Category/Type hubs, Education-level hubs, mirroring the coverage audit done in conversation (we already match or exceed Buddy4Study on State/Category/Government/Course — this just needs to be visible everywhere, not just the mega-menu). Include the currently-orphaned Course and International hubs (IS-106, IS-107) once those land.

    Trigger:
    Buddy4Study competitive comparison in conversation with Claude.

- [ ] **IS-118**: Make breadcrumbs referrer-aware instead of a fixed fake hierarchy
  - **Impact**: Medium
  - **Type**: Feature
  - **Description**:
    Context / Why it matters:
    Discussed with Claude: since a scholarship genuinely has multiple valid parents (its state, its category, its level, its income bracket — all independent, none more 'true' than another), a single fixed breadcrumb pretends one facet is canonical when it isn't. Confirmed breadcrumbs matter on both desktop and mobile (mobile especially for Google's BreadcrumbList rich-snippet rendering in mobile search results), so this isn't about removing them — it's about which parent they show.

    Plan / What to do:
    Have the breadcrumb default to whichever facet the visitor actually arrived through (read from referrer/query param when available — e.g. arriving from a state hub shows State in the breadcrumb, arriving from a category hub shows Category), falling back to a sensible default (state if present, else category) when no referrer signal exists. Keep BreadcrumbList JSON-LD schema present on every page regardless of visual display.

    Trigger:
    Taxonomy/findability discussion with Claude.

- [ ] **IS-119**: Prune or merge near-zero-value hub pages (thin facet combinations)
  - **Impact**: Medium
  - **Type**: Analysis, Feature
  - **Description**:
    Context / Why it matters:
    Found via DB count audit in conversation. Several hub combinations have 0-2 active scholarships (e.g. PWD category pre-cleanup, several single-scholarship states/UTs like Lakshadweep, Nagaland, Puducherry). Buddy4Study handles this by backfilling thin facet pages with a generic 'Featured Scholarships' carousel rather than showing a near-empty page — worth adopting the same pattern rather than either hiding these pages or leaving them looking broken.

    Plan / What to do:
    Audit all generated hub pages for scholarship count. For any hub under ~3 results, either (a) blend in a 'More scholarships you may be eligible for' fallback module (same general-listing pattern Buddy4Study uses), or (b) redirect/merge into a parent hub with a pre-applied filter instead of a standalone thin page. Decide threshold and fallback design.

    Trigger:
    DB count audit + Buddy4Study comparison in conversation with Claude.

- [ ] **IS-120**: BUG (pre-existing): /guides/nsp redirects to a dead slug and 404s
  - **Impact**: High
  - **Type**: Bug
  - **Description**:
    Context / Why it matters:
    Found while verifying IS-115's Pillar-to-/guides routing change (unrelated to that change — this bug already existed in next.config.ts before today). The redirect `/guides/nsp/:subpage*` -> `/guides/national-scholarship-portal-nsp/:subpage*` uses a `:subpage*` wildcard (zero-or-more), so it also matches the bare /guides/nsp URL with no subpage — but the destination slug 'national-scholarship-portal-nsp' doesn't exist anywhere in portalsData.ts. The real NSP portal's id is 'nsp' with aliases ['national-scholarship-portal', 'scholarships-gov-in'] — no '-nsp' suffix variant. Result: /guides/nsp currently 404s in production.

    Plan / What to do:
    Fix the redirect destination to point at a real slug (likely just remove this redirect entirely, since 'nsp' is already the canonical id and doesn't need rewriting to a longer alias) — or if the intent was legacy-URL support, correct the destination to 'national-scholarship-portal' instead of 'national-scholarship-portal-nsp'.

    Trigger:
    Found during IS-115 verification. Live bug, affects a page for the site's flagship central portal.

- [ ] **IS-110**: Clean up messy multi-value `level` field
  - **Impact**: Low
  - **Type**: Bug
  - **Description**:
    Context / Why it matters:
    Found during category count audit with Claude. The `level` column frequently stores multi-value strings in one row (e.g. 'Undergraduate, Postgraduate, Diploma, ITI'), which undermines the cleanliness of the Education Level hub pages (/scholarships-level/[level]) and makes accurate per-level counts impossible without fragile LIKE-pattern matching (see getLevelSearchPatterns in lib/db.ts).

    Plan / What to do:
    Either split into a proper join table (scholarship_id, level) or keep as an array field like `caste`/`course_stream` and parse consistently. Re-run getEducationLevelCounts() after cleanup to confirm accurate counts.

    Trigger:
    Data cleanup, part of taxonomy work.

- [ ] **IS-95**: Manual CMS Expansion: Visual Create New Scholarship & Scraping Interface
  - **Impact**: Medium
  - **Type**: Feature
  - **Description**:
    Context / Why it matters:
    Allows the admin to add completely custom scholarships manually from scratch or paste arbitrary URLs to scrape, scrape-clean, and directly edit content outside of automated SEO/Ubersuggest gap reports.
    
    Plan / What to do:
    1. Add a 'Create New Scholarship' button on the Content Manager interface that triggers the edit modal with a blank form schema.
    2. Create a generic scraper integration/dashboard tool to crawl and pre-fill details from custom inputs.
    3. Implement corresponding POST backend API routes in Next.js content handlers.

- [ ] **IS-4**: Email capture on eligibility checker results screen
  - **Impact**: High
  - **Description**:
    Context / Why it matters:
    At 100K+ monthly visitors, 0.5% conversion = 500 segmented subscribers/month. Future monetisation foundation.
    
    Plan / What to do:
    After checker returns eligible scholarships, show inline email field: 'Get notified when applications open for your matched scholarships.' POST to /api/subscribe. Pre-populate hidden fields with state, caste, level, income from checker inputs.
    
    Trigger:
    NOW tasks complete

- [ ] **IS-13**: Add GitHub secrets — PERPLEXITY_API_KEY + VERCEL_DEPLOY_HOOK
  - **Impact**: Medium
  - **Description**:
    Context / Why it matters:
    The GitHub Actions cron is built but inactive without secrets. Every content update is currently a 5-step manual process. This one admin task makes the pipeline run automatically every Sunday.
    
    Plan / What to do:
    Go to GitHub repo → Settings → Secrets → Actions. Add PERPLEXITY_API_KEY (or GEMINI_API_KEY) and VERCEL_DEPLOY_HOOK (Vercel → Project Settings → Git → Deploy Hooks → create 'Weekly Enrichment'). This activates the Sunday cron already built and committed.

- [ ] **IS-14**: Education loan affiliate — HDFC Credila or Avanse
  - **Impact**: High
  - **Description**:
    Context / Why it matters:
    High-intent placement — students who need more than scholarship covers are warm leads for education loans.
    
    Plan / What to do:
    Partner with HDFC Credila or Avanse (pay ₹2,000–5,000 per qualified lead). Place native widget on /scholarships-by-course/engineering and /medical pages. Trigger: student matches scholarship covering only partial tuition.
    
    Trigger:
    After 80K clicks/month · Month 3

- [ ] **IS-16**: WhatsApp alert subscription (MSG91/Twilio)
  - **Impact**: High
  - **Description**:
    Context / Why it matters:
    Priya and Rajesh Uncle live on WhatsApp not email. Higher open rates. But API approval takes time — do email first.
    
    Plan / What to do:
    Integrate MSG91 (better for India) WhatsApp Business API. Capture verified phone numbers alongside email. Send deadline alerts: 'The PM Yashasvi deadline closes in 48 hours. Apply here.' Needs WhatsApp Business API approval first.
    
    Trigger:
    After email capture proven · Month 2

- [ ] **IS-18**: Question: When does the eligibility checker email capture go live?
  - **Impact**: High
  - **Description**:
    Context / Why it matters:
    At current traffic, 0.5% conversion = 500 segmented subscribers/month. This is the future monetisation foundation and should come before WhatsApp.

- [ ] **IS-20**: Feature: Lead Gen Email Capture
  - **Impact**: Critical
  - **Description**:
    WhatsApp has higher open rates for Priya/Rajesh Uncle personas but needs Business API approval (weeks). Email is immediate. Decision: email first, then WhatsApp in Month 2.
    
    Context / Why it matters:
    WhatsApp has higher open rates for Priya/Rajesh Uncle personas but needs Business API approval (weeks). Email is immediate. Decision: email first, then WhatsApp in Month 2.

- [ ] **IS-22**: Grow Organic Traffic
  - **Impact**: High
  - **Description**:
    Priority 1 — Grow Organic Traffic (Highest ROI) ⭐⭐⭐⭐⭐
    Objective: Expand what is already working.
    Actions
    • 
    Research and publish 10–15 new scholarships every week.
    
    • 
    Prioritize newly announced scholarships.
    
    • 
    Publish scholarships with low competition and high demand.
    
    • 
    Maintain a Scholarship Opportunity Tracker.
    
    Success Metric
    • 
    10–15 new scholarship pages/week.
    
    
    Context / Why it matters:
    Essential for the site 
    
    Plan / What to do:
    Grow organic traffic
    
    Trigger:
    ChatGPT

- [ ] **IS-24**: Competitor tracker 
  - **Impact**: High
  - **Description**:
    Every month I'll tell you"Competitor X just added 14 new scholarships."
    or"Buddy4Study has created a calculator."
    or"Careers360 added scholarship filters."
    This helps us stay ahead rather than react.
    
    Trigger:
    chatgpt

- [ ] **IS-25**: Scholarship Micro tools
  - **Impact**: High
  - **Description**:
    I want IndiaScholarships.in to become a decision engine.
    Imagine tools like:
    • 
    🎯 Scholarship Eligibility Checker
    
    • 
    💰 Scholarship Amount Calculator
    
    • 
    📅 Deadline Calendar
    
    • 
    📊 Scholarship Success Probability
    
    • 
    🧾 Document Readiness Checklist
    
    • 
    🔔 Deadline Alerts
    
    • 
    📍 State Scholarship Finder
    
    • 
    🎓 College Scholarship Finder
    
    • 
    🏛 Government Scheme Finder
    
    • 
    🤖 AI Scholarship Recommender
    
    Trigger:
    chatgpt

- [ ] **IS-27**: Expand top pages
  - **Impact**: Critical
  - **Description**:
    Your GSC already told us what Google likes.
    Start with:
    • 
    PM YASASVI
    
    • 
    Sitaram Jindal
    
    • 
    Any page with 500+ clicks/month
    
    For each one create supporting pages like:
    • 
    Eligibility
    
    • 
    Apply Online
    
    • 
    Documents Required
    
    • 
    Last Date
    
    • 
    Renewal
    
    • 
    Login
    
    • 
    Status Check
    
    • 
    FAQs
    
    Think of these as intent pages, not duplicate content.
    
    
    Trigger:
    chatgpt

- [ ] **IS-28**: Improve ranking positions from 8-20
  - **Impact**: High
  - **Description**:
    his is probably your fastest SEO win.
    Every month I'll identify pages like:Position 11Position 14Position 18
    Often these need:
    • 
    Better introduction
    
    • 
    Updated eligibility
    
    • 
    FAQs
    
    • 
    Internal links
    
    • 
    Better title
    
    Moving from #12 to #5 can bring far more traffic than publishing a new page.
    
    Trigger:
    chatgpt

- [ ] **IS-30**: Monthly GSC and analytics review 

- [ ] **IS-31**: Create multiple agents 
  - **Impact**: Critical
  - **Description**:
    I think we can make this much more powerful by evolving it into an AI Operating Manual rather than just a backlog. For example:
    • Role: Scholarship Research Agent
    
        ◦ 
    Find newly announced scholarships.
    
        ◦ 
    Verify eligibility, deadlines, official sources.
    
        ◦ 
    Flag duplicates.
    
    • Role: SEO Agent
    
        ◦ 
    Analyze GSC.
    
        ◦ 
    Find pages ranking #8–20.
    
        ◦ 
    Suggest title/H1/FAQ improvements.
    
    • Role: Content QA Agent
    
        ◦ 
    Ensure every scholarship page has required sections.
    
        ◦ 
    Check for outdated dates.
    
        ◦ 
    Validate internal links.
    
    • Role: Product Agent
    
        ◦ 
    Recommend new tools and features.
    
        ◦ 
    Identify UX improvements.
    
    • Role: Competitor Intelligence Agent
    
        ◦ 
    Track new scholarships, content, and features added by competitors.
    
    This would allow Antigravity to run with much more autonomy while giving you actionable outputs instead of generic suggestions. I think that kind of operating manual will become one of the most valuable assets for this project, and we can keep refining it as your platform grows. 
    
    Trigger:
    chatgpt

- [ ] **IS-34**: Optimize Similar Opportunities relevance algorithm
  - **Impact**: Medium
  - **Type**: Analysis, Content Task
  - **Description**:
    Context / Why it matters:
    The similar opportunities recommendation grid at the bottom of scholarship detail templates is currently using a very basic fallback chain. Optimizing this increases user session depth and GSC click-throughs.
    
    Plan / What to do:
    Update the query logic in Next.js to match and sort similar opportunities prioritizing:
    1. Same State (e.g. WB student sees WB scholarships)
    2. Same Stream (e.g. Engineering student sees engineering)
    3. Same Education Level.

- [ ] **IS-35**: Integrate Google Indexing API into sync pipeline
  - **Impact**: Medium
  - **Description**:
    Context / Why it matters:
    Newly added or updated scholarships take weeks to be naturally crawled by Google. Google Indexing API allows requesting instant indexing for GovernmentService and JobPosting schema pages, which speeds up search presence (often indexed in <24 hours).
    
    Plan / What to do:
    Add Google Indexing API integration into scripts/sync-wordpress-api.js to send crawl/refresh requests automatically whenever a page is synced.

- [ ] **IS-36**: CTR Improvement: title/meta rewrites across 129 opportunity pages (~85K upside clicks/mo)
  - **Impact**: Critical
  - **Type**: Analysis

- [ ] **IS-46**: State hubs: fix misleading 'Max Amount' stat — add Typical Range or relabel
  - **Impact**: Medium
  - **Type**: Bug
  - **Description**:
    Found in IS-37 QA. The 'Max Amount' stat card on state hubs (e.g. Karnataka shows '₹30,00,000') is misleading — this is a rare PG/overseas scholarship, not representative of the typical ₹3,000–₹60,000 range. Options: (1) Add a 'Typical Range' stat computed from percentile (P25–P75) of amount_annual, (2) Label the max amount as 'Highest Available' more explicitly, (3) Replace with median amount. Prevents users feeling baited by an outlier figure.

- [ ] **IS-47**: DB cleanup: resolve 7 Karnataka deadline fields with leaked research notes to clean ISO dates
  - **Impact**: Medium
  - **Type**: Bug
  - **Description**:
    Found in IS-37 QA. 7 rows in the scholarships DB have raw editorial research notes stored in the deadline field (e.g. 'September 30, 2025 (tentative - some sources indicate November 30, 2025). VERIFY on official NSP...'). IDs: 23, 24, 27, 28, 29, 30, 31 (all Karnataka). IS-37 fixes the display layer, but the underlying DB values should be resolved to clean ISO dates or 'Not specified' via the enrichment pipeline. Run targeted enrichment on these 7 rows against NSP/SSP portals.

- [ ] **IS-51**: Run Google Keyword Planner script for target scholarship keywords
  - **Impact**: Medium
  - **Type**: Analysis
  - **Description**:
    Develop and run a Python script using the google-ads SDK to query search volumes, competition rates, and bid estimates directly from Google Keyword Planner for key scholarship queries. Save results to CSV files.

- [ ] **IS-57**: Content Gap Audit (Prioritized Missing & Partial Targets)
  - **Impact**: Medium
  - **Type**: Analysis
  - **Description**:
    Consolidates the completed Content Gap Audit (IS-54). Evaluated 2,548 keywords against the 298 active database scholarships, creating a prioritized list of missing targets (like maha dbt and regional UP query hubs) and optimization opportunities (like FAEA, ACC Vidyasaarathi, and Tata Pankh).
    
    Reference:
    - Gap Report: scholarship-app/data/content-gap-report.md

- [ ] **IS-59**: Keyword research analysis
  - **Impact**: High
  - **Type**: Analysis
  - **Description**:
    Analyse keywords from Google keyword planner and Ubersuggest and come up with a plan to execute them

- [ ] **IS-60**: Dynamic Homepage / Scholarship Pulse
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Transform the homepage into a live dashboard. Sections: New Scholarships Today, Closing Soon, Trending Scholarships, Recently Updated, Scholarship of the Day, Scholarships by Month, Recently Expired, Government/Private/International feeds, and a chronological Scholarship Pulse activity feed. Design using simple SQLite queries so the homepage feels alive and encourages repeat visits. This should become the foundation for future personalization, email digests, and notification features.

- [ ] **IS-71**: Implement Tool: Scholarship Finder Wizard
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Create a multi-step guided Scholarship Finder Wizard with progress indicators, smooth transitions, and high-converting results recommendations.

- [ ] **IS-73**: Implement Tool: Scholarship Compare Tool
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Create a robust Scholarship Compare Tool offering a side-by-side eligibility and benefit matrix for selected opportunities.

- [ ] **IS-75**: Integrate Tools into Scholarship Detail Pages (Deep Links)
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    GOAL: Drive tool usage and reduce friction on scholarship detail pages by surfacing relevant tools contextually — at the exact moment a student is reading eligibility criteria, income limits, or academic cutoffs.
    
    CONTEXT: Right now tools (/tools) and scholarship detail pages (/scholarships/[slug]) are completely siloed. A student reading about a scholarship has to navigate away to use a calculator, which kills momentum.
    
    APPROACH (Phase 1 — Deep Links, ship fast):
    Add contextual tool CTAs directly on the detail page at relevant sections:
    • Near 'Eligibility Criteria' → Scholarship Eligibility Checker CTA: 'Check if you qualify →'
    • Near 'Income Limit' field → Family Income Calculator CTA: 'Verify your household income →'
    • Near 'Minimum Marks / CGPA' field → CGPA to Percentage Converter CTA: 'Convert your CGPA →'
    • Near 'Benefits / Amount' section → Scholarship Amount Calculator CTA: 'Estimate your benefit →'
    • Bottom of page → 'Explore similar tools' strip (passive, links to /tools)
    
    IMPLEMENTATION NOTES:
    • Start with deep links only (buttons/cards that open the standalone tool page). No inline widgets yet.
    • Links can be pre-parameterised if the tool supports URL params (e.g. pre-select category/level based on the scholarship record).
    • Use conditional rendering: only show a tool CTA if the relevant DB field is populated (e.g. only show Income Calculator CTA if income_limit field is non-null).
    • Target file: app/scholarships/[slug]/page.tsx and relevant subpage components.
    
    PHASE 2 (future, separate ticket): Embed inline mini-widgets on the detail page so students never leave the page.
    
    SUCCESS METRIC: Track clicks on tool CTAs from detail pages. Goal is >5% CTR from detail page to tool.

- [ ] **IS-76**: Lead Capture via Scholarship Tools
  - **Impact**: High
  - **Type**: Feature, Strategy
  - **Description**:
    GOAL: Capture student contact details at the highest-intent moment on the site — immediately after they complete a tool and see their results (e.g. Eligibility Checker shows 5 matching scholarships).
    
    CONTEXT: Parked as of July 2026 until two decisions are made:
    1. What do we offer the student in exchange for their contact? (the 'exchange value')
    2. What infrastructure will send the follow-up? (email service, WhatsApp API, etc.)
    
    OPTIONS TO DECIDE BETWEEN (for discussion when picking this up):
    Option A — 'Email me my results': Zero-friction. Student enters email to receive their eligibility results or tool output. Requires: transactional email service (e.g. Resend, Mailchimp, SendGrid). Easiest to ship.
    Option B — 'Get notified when applications open': Student opts in to deadline alerts for matched scholarships. Higher intent, higher value to student. Requires: email service + scheduled job to send alerts when scholarship status changes.
    Option C — WhatsApp opt-in: 'Get alerts on WhatsApp'. Higher conversion rate in India. Requires: WhatsApp Business API setup (via Twilio, Interakt, or WATI). More complex setup.
    
    WHERE TO INSERT THE FORM:
    • End of Eligibility Checker results (highest intent — student just saw their matches)
    • End of CGPA Converter results (after seeing their converted % + matched scholarships)
    • End of Family Income Calculator results (after seeing income band + matched schemes)
    • Scholarship detail page 'Alert me when this opens' CTA
    
    PRE-REQUISITES BEFORE BUILDING:
    • Decide on Option A / B / C above
    • Set up chosen email/WhatsApp service and obtain API keys
    • Decide on data storage: where leads are stored (a simple DB table, Airtable, Google Sheets, CRM)
    • Define the first follow-up sequence (what does the student receive after opt-in?)
    
    NOTE: Do NOT add a generic popup or modal. The opt-in must feel like a natural next step after the tool gives them value.

- [ ] **IS-77**: Scholarship Tools Expansion — Phase 2 (Document Checklist, Merit Checker, Stipend vs Loan)
  - **Impact**: Medium
  - **Type**: Feature
  - **Description**:
    Phase 2 expansion of the IndiaScholarships tool suite. Three tools identified for future consideration:
    
    1. DOCUMENT CHECKLIST GENERATOR
    Student enters their profile (category, scholarship type, education level) and gets a personalised list of documents they need to apply. High utility — most students lose applications due to missing paperwork. Data already exists in our DB via the documents_required field. Low effort, no external dependencies. Suggested slug: /tools/document-checklist-generator
    
    2. MERIT / RANK CUTOFF CHECKER
    Student enters their board/competitive exam rank or percentage and sees which merit-based scholarships they qualify for (e.g. Central Sector Scholarship, Inspire, state merit schemes). Good SEO angle — targets queries like 'JEE rank scholarship eligibility' and 'NEET score scholarship'. Medium effort — requires mapping rank/score thresholds to scholarship eligibility in the DB. Suggested slug: /tools/merit-rank-cutoff-checker
    
    3. STIPEND VS LOAN CALCULATOR
    Side-by-side comparison tool: 'Should I take this scholarship stipend or an education loan?' Shows the long-term financial difference including interest cost, repayment burden, and net benefit of the scholarship over time. Useful for higher education students choosing between scholarship + partial loan vs full loan. Medium effort. Suggested slug: /tools/stipend-vs-loan-calculator
    
    All three should follow the existing tool template (problem statement, calculator, scenario examples, FAQ + JSON-LD schema) and be added to the Tools Hub with Coming Soon cards until implemented.

- [ ] **IS-78**: Implement Telegram Bot API broadcast integration
  - **Impact**: Critical
  - **Type**: Feature
  - **Description**:
    Connect a Telegram Bot using TELEGRAM_BOT_TOKEN and broadcast new scholarship additions or status activations to a public channel (e.g., @IndiaScholarships) inside the sync script (scripts/sync-wordpress-api.js).

- [ ] **IS-79**: Feature-Whatsapp alerts
  - **Impact**: Critical
  - **Type**: Feature
  - **Description**:
    Send alerts via Whatsapp. For traffic and distribution

- [ ] **IS-80**: Feature: Twitter Distribution
  - **Impact**: Medium
  - **Type**: Feature
  - **Description**:
    Distribute (auto-update Twitter) for traffic, distribution and branding 

- [ ] **IS-81**: Feature: Monetization strategies
  - **Impact**: Critical
  - **Type**: Feature
  - **Description**:
    How do we go beyond adsense?

- [ ] **IS-82**: Feature: Lead Capture in scholarship detail pages 
  - **Type**: Feature

- [ ] **IS-83**: Feature: Auto refresh scholarships
  - **Type**: Feature
  - **Description**:
    How do we enable automatic verification (for internal use) and how do we keep the page fresh. Can users subscirbe to alerts and changes on this page?

- [ ] **IS-85**: Scheduled Tasks Setup: Link Checker, Database Backup, & Indexing API Pinger
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Set up prioritized scheduled tasks using either GitHub Actions or Antigravity's local scheduler:
    1. Auto-verify external application links (via scripts/check_404s.js) to prevent SEO/UX errors.
    2. Local/remote automated database backups to secure data/scholarships.db.
    3. Integrate Google Indexing API to ping Google as soon as scholarship details change.

- [ ] **IS-86**: Add Telegram Alert Channel banner/card components to the Next.js frontend
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Add Telegram Alert Channel banner/card components to the Next.js frontend. Placements: 1. Homepage sticky banner/header. 2. Scholarship detail pages (near the Deadline/Apply sections). 3. Scholarship tools results screen (e.g., Eligibility Checker and Income Calculator output).

- [ ] **IS-89**: Localization Investigation & Multi-language Next-intl Setup
  - **Impact**: Medium
  - **Type**: Feature
  - **Description**:
    Investigate and implement multi-language support (specifically Hindi /hi/ or subdomains) using next-intl in the Next.js frontend, based on Buddy4Study's localization findings.

- [ ] **IS-90**: Implement WhatsApp Alert Channel Integration
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Add a highly visible WhatsApp Channel subscription component or floating badge in the site footer and sidebar layouts to capture user leads.

- [ ] **IS-91**: Implement Exit-Intent Alert Popup
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Build an exit-intent alert popup component that triggers for users attempting to leave/scroll past a certain point, prompting them to subscribe to WhatsApp/Telegram alerts.

- [ ] **IS-92**: User Onboarding & Dynamic Recommendations Flow
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Build a multi-step profile wizard on registration (collecting class, state, caste, gender, income) and implement a dynamic client-side filtering system to recommend matched scholarships.

## Done (43)

- [x] **IS-115**: Consolidate Guides + Articles + Pillars into one /guides Editorial namespace (routing/redirects)
  - **Impact**: Critical
  - **Type**: Strategy, Feature
  - **Description**:
    Context / Why it matters:
    User decision: absorb ALL of Guides, Articles, and Pillars into one /guides URL namespace — "am not a software dev, I want everything absorbed into one /guides." Classification (Pillar vs How-To vs News) becomes a taxonomy/metadata concern, not a URL concern, relevant given a possible headless WordPress migration.

    Resolution:
    Phase 1: 4 duplicate Articles redirect to their matching Portal Guide. Phase 1b: all 25 Pillars now render under /guides/[slug] via delegation from app/guides/[portal]/page.tsx, with a single parameterized redirect (/pillars/:slug -> /guides/:slug) covering all of them. Phase 2: the remaining 24 unique Articles now also render under /guides/[slug] via the same delegation pattern (portal -> Pillar -> Article, in order, before notFound()). Added a generic redirect '/articles/:slug' -> '/guides/:slug', placed after the 4 explicit overrides so those still win. Also fixed the Article page's internal cross-links and breadcrumb to point directly at /guides instead of /articles, removing an unnecessary redirect hop on-site.

    Verified locally throughout: direct /guides/[slug] URLs render correctly for Pillars, Articles, and Portal Guides; old /pillars/[slug] and /articles/[slug] URLs redirect correctly; the 4 explicit article overrides still take priority over the generic rule; breadcrumbs read "Guides" not "Articles"/"Pillars"; zero regressions on Portal Guides throughout. npx tsc --noEmit clean at every step, zero console errors.

    Ticket fully closed. Every Pillar, Portal Guide, and Article now lives under one /guides URL namespace.

    Phase 3 (index-page collapse): user found /pillars index still live and linked from the homepage, then directed "the index pages of /pillar /articles need to be collapsed into /guides." Rewrote app/guides/page.tsx to merge all three index pages (Pillar sections by classification, Portal Guides grid, new How-To Guides grid of Articles minus the 4 already-redirected duplicates) into one. Deleted app/pillars/page.tsx and app/articles/page.tsx. Added index-level redirects '/pillars' -> '/guides' and '/articles' -> '/guides'. Updated Header.tsx, Footer.tsx, HomeClient.tsx internal links and nav labels to point at /guides instead of /pillars or /articles, and de-indigo'd the homepage Guides section to match the site's single google-blue accent.

    Verified locally: npx tsc --noEmit clean, zero console errors. /guides renders all three sections correctly (confirmed Pillar sections, "State & Central Portal Guides", "How-To Guides"). /pillars and /articles bare index URLs confirmed live-redirecting to /guides. Individual /guides/[slug] delegation spot-checked unaffected. Noted the pre-existing unrelated IS-120 bug (/guides/nsp 404) again in passing — not touched here.

    Not yet committed/pushed — pending explicit user go-ahead.

    Trigger:
    Taxonomy decision made in conversation, executed same session.

- [x] **IS-126**: BUG: International scholarships leaking into Trending/Deadlines/Recently Added
  - **Impact**: High
  - **Type**: Bug
  - **Description**:
    Context / Why it matters:
    User noticed /scholarships/trending and /scholarships/deadlines showing Study Abroad scholarships (ESMT Berlin MBA, University of Calgary, ADB-Japan, DAAD, Hubert Humphrey Fellowship) mixed in with domestic ones, undifferentiated. Root cause: two separate, parallel implementations exist. getTrendingScholarships()/getClosingSoonScholarships() in lib/db.ts (used by the homepage carousels) had no scholarship_scope filter. Separately, and more impactfully, ScholarshipsList.tsx (the shared component actually powering the live /scholarships/trending and /scholarships/deadlines PAGES via getAllScholarships() + client-side filter/sort) also had zero scope awareness — confirmed several International scholarships share the same top priority_score (95/90) as the best domestic ones, so they were winning the sort and appearing as the featured highlight.

    Resolution:
    Added a scope exclusion to both: the two lib/db.ts query functions (SQL-level "AND (LOWER(scholarship_scope) IS NOT 'international')"), and ScholarshipsList.tsx's client-side filter (excludes any row with scholarship_scope='international' unconditionally, since this shared component has no International tab/mode at all — that content type only lives at /scholarships/international with its own dedicated hub and query functions).

    Verified locally: /scholarships/trending dropped from 372 to 269 results with ESMT Berlin/Calgary/ADB-Japan/DAAD all gone from the top of the list; /scholarships/deadlines confirmed clean (3 results, all domestic). npx tsc --noEmit clean. Zero console errors.

    Trigger:
    User feedback, this session — flagged as a real, confusing UX issue, not a hypothetical.

- [x] **IS-121**: BUG: Mobile menu missing Course/Income/Study Abroad/Sports/PWD links (desktop-only fix)
  - **Impact**: High
  - **Type**: Bug
  - **Description**:
    Context / Why it matters:
    User screenshot showed the mobile "Popular Segments" chip row (Girls, SC/ST, OBC/Minority, General/EWS, By University only) missing everything added to the desktop mega-menu earlier this session (Course, Income, Study Abroad, Sports, PWD) — because Header.tsx's mobile menu is a separate hardcoded JSX block from the desktop mega-menu, and only desktop was updated. 82% of traffic is mobile, so this gap mattered more than the desktop one did.

    Resolution:
    Added 5 missing chips (By Course, By Income, Study Abroad, Sports, PWD) to the mobile "Popular Segments" section in Header.tsx. Verified locally: all 5 links confirmed present in the rendered mobile DOM, zero console errors.

- [x] **IS-111**: Implement simplified Detail page template (content-first redesign)
  - **Impact**: Critical
  - **Type**: Design, Feature
  - **Description**:
    Context / Why it matters:
    Site's most-visited page (PM Yashasvi). Current template was visually noisy — gradient hero, repeated sidebar CTA, colored blockquotes, 3-column sticky layout.

    Resolution:
    Discovered ScholarshipDetailTemplate.tsx was dead code — the real live page is app/scholarships/[slug]/page.tsx (1249 lines). Rewrote it in full: preserved 100% of SEO logic (all per-slug title overrides, metadata, hreflang, OG tags), all data fetching, all 3 JSON-LD schemas, and the FormattedText parser exactly as-is. Replaced only the visual layer: removed the dark gradient hero, repeated sidebar CTA card, colored 'Direct Answer' blockquotes, and the 3-column sticky-sidebar layout. New structure: plain eyebrow+title, 3-fact strip, real ShareButtons as the only above-fold action (no fake Follow/Alerts buttons — honest choice, since IS-76 lead-capture isn't built yet), a dedicated 'Ready to apply?' section with the real outbound link placed contextually near How-to-Apply, plain spec-list eligibility, numbered steps, single-column Discover More (moved out of the sidebar), and every related-content section as plain lists.

    Verified locally on PM Yasasvi: every field confirmed present with zero loss (sibling variants, best-fit pillar, benefits, special conditions, eligibility, selection, renewal, all 7 apply steps, documents, deadline, quick facts, all 3 FAQs, helpline, discover-more, disclaimer, 5 related news, 2 related guides, 3 similar scholarships). Zero console errors. Confirmed no regression on a scholarship with fewer optional fields. npx tsc --noEmit clean.

    Trigger:
    Design agreed in conversation, mock reviewed and iterated; user requested building 111, 112, and 114 together.

- [x] **IS-112**: Implement simplified Listing page template
  - **Impact**: High
  - **Type**: Design, Feature
  - **Description**:
    Context / Why it matters:
    Listing/hub pages needed a browsing rhythm distinct from Detail's reading rhythm — dense scannable rows instead of card chrome.

    Resolution:
    Rather than editing each of the 8+ separate hub page types individually, restyled the actually-shared components they all render through: ScholarshipCard.tsx (list view, the default viewMode site-wide) and its container in ScholarshipsList.tsx. Removed the provider avatar circle, 'Verified' checkmark badge, colored status pills, and CTA button — replaced with one dense plain row: title+provider+eligibility hints left, amount right-aligned, deadline right-aligned with color reserved only for genuine urgency.

    Verified locally: propagated automatically and correctly to every hub type reusing these shared components — confirmed on a Category hub (SC, 239 results), a Course hub (Engineering), and a State hub (Karnataka, via its own StateScholarshipsClient wrapper) — all three show the new plain-row style with zero console errors and zero regression in surrounding hub-specific chrome. Grid view (secondary, user-toggled) left untouched.

    Trigger:
    Design agreed in conversation, mock reviewed.

- [x] **IS-114**: Implement simplified News page template
  - **Impact**: Medium
  - **Type**: Design, Feature
  - **Description**:
    Context / Why it matters:
    Lightest variant of the Editorial template family — News stays a separate content type by design, but should render consistently with the rest of the site.

    Resolution:
    Added newsToEditorial() adapter to lib/editorial.ts (added 'news' to the EditorialContent kind union). Rewrote app/news/[slug]/page.tsx to use EditorialTemplate — removed the colored takeaways box, colored pillar/hub-link callouts, and dark 'Featured Scholarships' card block in favor of the same plain-list system used everywhere else. Kept the feedback widget (thumbs up/down, no backend yet) as a small page-level extra. Tweaked EditorialTemplate's hub-links heading to read 'Related Hubs' for non-Pillar kinds.

    Verified locally: a real news article renders correctly — News tag, takeaways, Related Hubs (dynamically resolved), body content, Featured Scholarships (2 real records), 'More on This Topic' (resolved parent Pillar link), and the feedback widget, all present with zero console errors. News stays intentionally separate in navigation and taxonomy — only the rendering component unified.

    Trigger:
    Design agreed in conversation, mock reviewed and iterated.

- [x] **IS-113**: Implement unified Editorial page template (Pillars/Articles/Guides)
  - **Impact**: High
  - **Type**: Design, Feature
  - **Description**:
    Context / Why it matters:
    One shared template family so Pillars, Articles, and Portal Guides stop being three different systems with three different conventions — a content-type tag, TOC for long pieces, contextual links embedded in prose, and a consistent related-content pattern.

    Plan / What to do:
    Build one shared Editorial template component and migrate Pillar, Article, and Guide pages onto it.

    Resolution:
    Built lib/editorial.ts — a unified EditorialContent TypeScript schema, a genuine superset of Pillar/Article/PortalGuide (every field mapped, none lost). Two schema fields added during the pass, both following a "resolve at the page level, render generically" convention: featuredScholarships (pre-resolved DB-fetched scholarship list) and relatedGuides (pre-resolved {title, href, meta} objects, not raw slugs). Built app/components/EditorialTemplate.tsx — one generic renderer with fully conditional blocks (tag, key facts, takeaways, hub links, official-portal link, TOC, checklist, grouped numbered steps, schemes, featured scholarships, FAQ accordion, helpline, related guides) that only render when the matching schema field is present.

    Migrated all three systems: (1) Pillars restyled in place (app/pillars/[slug]/page.tsx + PillarBody.tsx) — de-indigo'd to the site's one google-blue accent, including the markdown-to-HTML renderer in lib/pillars.ts that was hardcoding indigo into rendered links/code/blockquotes. (2) All 8 Portal Guides migrated via portalGuideToEditorial() adapter — removed ~380 lines of dead legacy JSX from app/guides/[portal]/page.tsx, HowTo + FAQ JSON-LD schema preserved. (3) Articles migrated via articleToEditorial() adapter — app/articles/[slug]/page.tsx rewritten from 288 to ~145 lines, the two genuinely one-off special cases (stats-report banner image, UP Status Decoder widget) kept as small page-level extras around the shared template rather than forced into the generic schema.

    Verified locally across all three: Pillars (Karnataka, SC/ST) render correctly, zero indigo remaining; 7 of 8 Portal Guides render correctly with zero console errors (NSP separately blocked by pre-existing IS-120 bug, unrelated); Articles — a plain guide (Bihar PMS), the stats-report special case, the UP-decoder special case, and a rich article with resolved "Featured Scholarships" data (SC/ST Freeship Card, matching frontmatter exactly) all confirmed working, zero console errors, zero regression anywhere.

    app/components/InteractiveArticleBody.tsx is now dead code (zero remaining imports) — left in place rather than deleted, safe to remove in a follow-up cleanup pass.

    Trigger:
    Design agreed in conversation, mock reviewed and iterated; user explicitly requested finishing all three migrations (Guides, Articles, Pillars) in one session to move on to content work.

- [x] **IS-108**: Clean up `caste` field for disability/PWD scholarships
  - **Impact**: Medium
  - **Type**: Bug, Content Task
  - **Description**:
    Context / Why it matters:
    Found during category-hub verification with Claude. 5 active scholarships reference disability eligibility, but the raw `caste` values were long descriptive sentences instead of a clean tag like 'Sports' already had. This produced ugly one-off URLs instead of one canonical /scholarships-for/pwd hub.

    Plan / What to do:
    Normalize these 5 records to include a clean 'PWD' tag in the caste array, matching getCanonicalSlugForCategory conventions.

    Resolution:
    Normalized the caste field for all 5 active disability-related records to a clean ['PWD'] tag (one record kept its real other categories too: General/OBC/SC/ST/Minority/PWD, since it's genuinely open to all categories with a UDID requirement). Added a 'pwd' branch to getCanonicalSlugForCategory() in lib/utils.ts, checked first since legacy disability strings often contain SC/ST/OBC as substrings. Added a clean CATEGORY_NAME_MAP entry. Verified locally: /scholarships-for/pwd now renders 5 real scholarships with a clean title/breadcrumb; confirmed no regression on /scholarships-for/obc. Follow-up completed same session: added 'Persons with Disabilities' to the Header mega-menu (Popular Segments column) and Footer, same pattern as IS-109. Verified visually via real mouse hover on the mega-menu trigger — confirmed rendered correctly alongside Sports, Girls, SC/ST, Minority, and General/EWS.

    Trigger:
    Data cleanup, part of taxonomy work.

- [x] **IS-106**: Build index page + add nav entry for /scholarships-by-course
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Context / Why it matters:
    Found during route audit with Claude. 10 real course hub pages exist (Engineering, Medical, Commerce, Science, Arts, Nursing, Pharmacy, Agriculture, Law, Management) but there was no app/scholarships-by-course/page.tsx index, and the whole route tree was absent from both Header.tsx and Footer.tsx.

    Plan / What to do:
    Build an index page listing all 10 courses with live counts, and add it to the Header mega-menu + Footer.

    Resolution:
    Added getCourseScholarshipCounts() to lib/db.ts (real per-course counts: Engineering 98, Science 81, Medical 42, Management 38, Arts 36, Commerce 29, Law 27, Pharmacy 12, Nursing 8, Agriculture 6). Built app/scholarships-by-course/page.tsx mirroring the existing scholarships-by-university index template exactly — that page already linked to /scholarships-by-course expecting it to exist. Added 'By Course' to the Header mega-menu and Footer. Verified locally: index renders all 10 courses with correct live counts.

    Trigger:
    Part of taxonomy/findability work.

- [x] **IS-107**: Add /scholarships/international to primary nav
  - **Impact**: Medium
  - **Type**: Feature
  - **Description**:
    Context / Why it matters:
    Found during route audit with Claude. The international/study-abroad hub was linked from several content pages but had zero presence in Header.tsx or Footer.tsx.

    Plan / What to do:
    Add a link to /scholarships/international in the Header mega-menu and Footer.

    Resolution:
    Added 'Study Abroad' link to the Header mega-menu (Eligibility Hubs column) and Footer. No page changes needed — the hub already worked, it just had zero primary-nav presence. Verified locally.

    Trigger:
    Part of taxonomy/findability work.

- [x] **IS-109**: Expose /scholarships-for/sports in primary nav
  - **Impact**: Medium
  - **Type**: Feature
  - **Description**:
    Context / Why it matters:
    Found during category verification with Claude. Real data exists — 14 active scholarships tagged 'Sports' in the caste field — but 'Sports' was missing from the Header mega-menu's hardcoded category list.

    Plan / What to do:
    Add 'Scholarships for Sports/Athletes' to the Header mega-menu's Popular Segments column and Footer.

    Resolution:
    Added 'Sports & Athletes' link to the Header mega-menu (Popular Segments column) and Footer. No page changes needed — confirmed the existing category-hub resolution logic already generates a working 'sports' slug from the raw caste data since 'Sports' already exists as a clean, single-word caste value. Verified locally: page renders correctly, no 0-result or redirect.

    Trigger:
    Part of taxonomy/findability work.

- [x] **IS-105**: Redirect duplicate route: /eligibility-checker vs /tools/scholarship-eligibility-checker
  - **Impact**: Medium
  - **Type**: Bug
  - **Description**:
    Context / Why it matters:
    Found during route audit with Claude. Confirmed by diff: app/eligibility-checker/page.tsx imports the exact same EligibilityClient component as app/tools/scholarship-eligibility-checker/page.tsx. Two live URLs serving identical content — duplicate content for search engines and split link equity for no reason.

    Plan / What to do:
    Pick the canonical URL and 301 redirect the other to it.

    Resolution:
    Audited every internal link site-wide (Footer, ToolsClient, HomeClient, detail pages, calculators, about, guides) — all of them already pointed to /eligibility-checker; zero internal links pointed to /tools/scholarship-eligibility-checker at all, and an existing legacy redirect (/tools/eligibility-checker -> /eligibility-checker) further confirmed that was the established canonical. Removed app/tools/scholarship-eligibility-checker/page.tsx (kept EligibilityClient.tsx, which the canonical page imports and still needs). Added a 301 redirect in next.config.ts. Verified locally: both legacy paths now resolve to the canonical page.

    Trigger:
    Quick fix, any dev session.

- [x] **IS-104**: BUG: /scholarships-for/girls (and gender-based category pages) querying wrong DB field
  - **Impact**: Critical
  - **Type**: Bug
  - **Description**:
    Context / Why it matters:
    Found during IA/taxonomy review with Claude. The category hub page (app/scholarships-for/[category]/page.tsx) filters the `caste` column via getScholarshipsByCategory(), but no `caste` values contain the word 'girls' (confirmed: 0 rows). Gender-targeted scholarships are actually tagged in the separate `gender` column, which has 28 'Female' + 11 'Girls' + several variants = ~44 real active records. This means the live, already-linked-in-header-mega-menu 'Scholarships for Girls' page was very likely showing 0 or near-0 results.

    Plan / What to do:
    Update the category resolution logic (or add a dedicated path) so 'girls'/'women' slugs also match the `gender` column, not only `caste`. Verify against live DB counts after the fix.

    Resolution:
    Added getScholarshipsByGender() to lib/db.ts (matches 'female'/'girl' substrings against the `gender` column, OR'd across keywords since 'Female' and 'Girls' are different strings). Added a GENDER_CATEGORIES branch to app/scholarships-for/[category]/page.tsx (generateStaticParams, generateMetadata, and the page component) mirroring the existing STUDY_ABROAD_LEVELS pattern. Verified locally: /scholarships-for/girls now renders 49 real active scholarships (Kotak Kanya, Maharashtra Girls Merit, Kanya Saksharta Protsahan Yojana, etc.) instead of silently redirecting to /scholarships-by-category. Confirmed no regression on /scholarships-for/sc.

    Trigger:
    Priority fix — affected a page already promoted in primary nav.

- [x] **IS-1**: Fix Verified for 2026 hardcode → dynamic year (line 342)
  - **Impact**: Medium
  - **Description**:
    Context / Why it matters:
    Minor bug flagged during Claude Code validation. Will show wrong in January 2027 if not fixed. 5-minute fix.
    
    Plan / What to do:
    In app/scholarships/[slug]/page.tsx line 342, change 'Verified for 2026' to 'Verified for ${year}'. The year variable is already defined at line 147.
    
    Trigger:
    Quick fix, any dev session

- [x] **IS-2**: Submit updated sitemap.xml in Google Search Console
  - **Impact**: Critical
  - **Description**:
    Context / Why it matters:
    700 subpages are live but Google won't discover them efficiently without sitemap submission. Every day without this is indexing delay.
    
    Plan / What to do:
    GSC → Sitemaps → submit https://www.indiascholarships.in/sitemap.xml. This triggers efficient crawl of the 700 new subpages generated in the Antigravity sprint.

- [x] **IS-3**: Run Gemini enrichment on 5 broken pages
  - **Impact**: Critical
  - **Description**:
    Context / Why it matters:
    Combined 669K impressions at under 0.5% CTR. These pages are ranking but failing to convert. Content is clearly thin or stale.
    
    Plan / What to do:
    Run: node scripts/enrich-all-low-ctr-gemini.js --limit 5. Target pages: Jharkhand e-Kalyan (0.16% CTR), SVMCM WB (0.13%), MMVY MP (0.64%), Azim Premji (0.34%), e-Grantz Kerala (0.55%). Human-review Google Sheets output before WP sync.

- [x] **IS-7**: Karnataka data reconciliation (14 missing scholarships)
  - **Impact**: Medium
  - **Description**:
    Context / Why it matters:
    Karnataka has 12,470 impressions of state-level demand but partial coverage.
    
    Plan / What to do:
    14 Karnataka scholarships were researched but are not in the main CSV/database. Reconcile Karnataka_high_level_research.md data into main Google Sheet. Note: Karnataka has 12-department structure, more complex than Odisha.
    
    Trigger:
    After NOW + NEXT complete

- [x] **IS-9**: Run enrichment batch on 127 expired deadline records
  - **Impact**: Critical
  - **Description**:
    Context / Why it matters:
    127 of 214 scholarships show 'Applications Closed'. Deadline validator works correctly — the data is stale. Fixing this protects brand trust.
    
    Plan / What to do:
    Run node scripts/enrich-all-low-ctr-gemini.js --limit 30 four times across the week. Check content-quality-report.md after each run to track progress. Human review before WP sync each time.
    
    Trigger:
    After Week 1 broken pages done

- [x] **IS-12**: West Bengal deep coverage (Nabanna, SVMCM, Aikyashree)
  - **Impact**: Medium
  - **Description**:
    Context / Why it matters:
    WB has 6,034 impressions currently but demand is growing. Nabanna + SVMCM are both high-search scholarships.
    
    Plan / What to do:
    Research all WB state scholarships using the Odisha methodology. Build full 29-field records for Nabanna, SVMCM, Aikyashree, Ektashree, Oasis. Treat WB as the second state vertical after Odisha.
    
    Trigger:
    After Odisha model proven at scale

- [x] **IS-19**: Question: Which state gets deep coverage after Odisha?
  - **Impact**: High
  - **Description**:
    West Bengal (Nabanna + SVMCM demand) vs MP (MMVY dominant) vs Punjab (third highest impressions at 12,871). Use Odisha methodology.
    
    Context / Why it matters:
    West Bengal (Nabanna + SVMCM demand) vs MP (MMVY dominant) vs Punjab (third highest impressions at 12,871). Use Odisha methodology.

- [x] **IS-33**: Build public-facing Deadline Tracker page
  - **Impact**: High
  - **Type**: Feature, Strategy
  - **Description**:
    Context / Why it matters:
    High search volume for upcoming scholarship deadlines. Provides students with a single, consolidated timeline of closing dates.
    
    Plan / What to do:
    Create a new route /scholarships/deadlines. Fetch active scholarships sorted chronologically by deadline. Render a clean table/timeline showing scholarship titles, closing dates, days remaining counters, and quick filter options.

- [x] **IS-43**: State hub: merge duplicate SSP Karnataka entries into one canonical card
  - **Impact**: Low
  - **Type**: Content Task, Feature
  - **Description**:
    Found in IS-37 QA. 'SSP Pre-Matric & Post-Matric Scholarship (Karnataka)' (id: ssp-pre-matric-post-matric-scholarship-karnataka, enriched, deadline 2026-01-15) and 'Pre-Matric & Post-Matric Scholarships (SSP)' (id: pre-matric-post-matric-scholarships-ssp, thin entry, deadline 'Not specified') appear to be the same underlying scheme listed twice. Merge into one canonical entry and redirect the duplicate slug. DB editorial decision required before code change.

- [x] **IS-44**: State hubs: add SC/ST/OBC/Minority/General/PWD category filter chips
  - **Impact**: Medium
  - **Type**: Content Task, Feature
  - **Description**:
    Found in IS-37 QA. State hub pages (e.g. /scholarships-in/karnataka) show a flat list of 26 cards with no way to filter by SC/ST/OBC/Minority/General/PWD. 82% of traffic is mobile. Add category filter chips above the scholarship list so users can drill down without scrolling the full list. Affects all state hub pages.

- [x] **IS-45**: State hubs: sort cards by deadline urgency (soonest open first, expired last)
  - **Impact**: Medium
  - **Type**: Content Task, Feature
  - **Description**:
    Found in IS-37 QA. State hub card order is arbitrary. Sort cards by: (1) deadline urgency — soonest non-expired first, (2) expired/no-deadline pushed to bottom. Secondary: highest amount_annual. This helps mobile users identify the most time-sensitive opportunities immediately. Also applies to the main /scholarships listing. Consider making sort user-selectable (deadline / amount / newest).

- [x] **IS-48**: Site Search Feature
  - **Impact**: Critical
  - **Type**: Feature
  - **Description**:
    Need to implement a dynamic search for the website. Currently doesnt have any search capability. What are the best ways to deploy a search so information is quick and accurate to find 

- [x] **IS-52**: Analyze and expand keyword research for broad term 'scholarships' (India)
  - **Impact**: High
  - **Type**: Analysis
  - **Description**:
    Conduct keyword research for the broad term 'scholarships' in the Indian market. Analyze user-provided Google Keyword Planner export data, combine it with programmatic/web search volume research, cluster by search intent, and identify high-value/low-competition keyword opportunities to expand content targeting.

- [x] **IS-53**: Keyword Research & Intent Clustering (Ubersuggest + Google Ads Planner)
  - **Impact**: High
  - **Type**: Analysis
  - **Description**:
    Completed keyword research using Google Keyword Planner and Ubersuggest. Consolidates raw exports (ubersuggest_UP,_NSP_6Jul2026.csv and Keyword Stats) and compiled the clustered analysis report highlighting high-intent opportunities for private and state scholarships.
    
    Reference Files:
    1. Ubersuggest Raw Data: scholarship-app/Keyword research/ubersuggest_UP,_NSP_6Jul2026.csv
    2. Google Ads Raw Data: scholarship-app/Keyword research/Keyword Stats 2026-07-06 at 23_19_35.csv
    3. Compiled Analysis Report: scholarship-app/scripts/analyze_keywords.py -> keyword_analysis_report.md

- [x] **IS-54**: Perform Content Gap Audit & Prioritization based on Keyword Report
  - **Impact**: Medium
  - **Type**: Analysis
  - **Description**:
    Perform a content gap analysis between the existing SQLite database (scholarship.db) and the high-volume search terms retrieved in the keyword research report. Map out missing opportunities (e.g. Tata Pankh, Aditya Birla, FAEA) and create a prioritized queue of entry additions.
    
    Reference:
    - Analysis Report: scholarship-app/Keyword research/keyword_analysis_report.md
    - Active DB: scholarship-app/scholarship.db

- [x] **IS-55**: Content Feature: State sub-pages
  - **Impact**: High
  - **Type**: Content Task, Feature
  - **Description**:
    Optimize Next.js route structures and titles for state hub subpages (e.g. /apply-online, /last-date, /eligibility) to capture localized high-intent search volumes (like UP Scholarship, Aikyashree WB, SSP Karnataka). Focus on dynamically resolving year titles and expanding sitemap inclusion.
    
    Reference:
    - Hub Routes: scholarship-app/app/scholarships/[slug]/page.tsx
    - State Hub Config: scholarship-app/lib/db.ts -> getAllStates()

- [x] **IS-56**: Research & Enrich High-Value Private/Corporate Scholarships
  - **Impact**: High
  - **Type**: Content Task
  - **Description**:
    Perform deep research and enrich database entries for top-tier private and corporate scholarships (e.g. Tata Pankh, Aditya Birla, FAEA, Reliance) using the standard 5-step checklist (research, data entry, quality audit, WP export, WP API sync). Ensure FAQ arrays and tags are correctly populated.
    
    Reference:
    - Checklist Workflow: Workspace Rules (AGENTS.md)
    - Export Script: scholarship-app/scripts/export-for-wp-bulk.js
    - Sync Script: scholarship-app/scripts/sync-wordpress-api.js

- [x] **IS-64**: Scholarship Tools
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Creation of multiple scholarship related tools to increase traffic, virality and enagement. this came from chatGPT https://chatgpt.com/share/6a4d480f-a15c-83ee-b767-4fb8c2517109

- [x] **IS-65**: Implement Phase 1: 8 Scholarship Micro-Tools and Hub Page
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Develop and deploy the central /tools directory along with 8 calculators and utilities to drive organic traffic and user engagement.

- [x] **IS-66**: Implement Tool: Family Income Eligibility Calculator
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Create a comprehensive Family Income Eligibility Calculator to filter scholarships based on household income caps. Includes problem explanation, practical example, and interactive sliders.

- [x] **IS-67**: Implement Tool: Scholarship Amount Calculator
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Create a robust Scholarship Amount Calculator to estimate payout tiers based on education levels, streams, and categories. Includes detailed case study examples and clear financial mapping.

- [x] **IS-68**: Implement Tool: Study Cost Calculator
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Create an interactive Study Cost & Gap Calculator to help students plan expenses (tuition, living costs, books) and visualize funding coverage ratios. Includes case examples and problem breakdowns.

- [x] **IS-69**: Implement Tool: Education Loan EMI Calculator
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Create a comprehensive Education Loan EMI Calculator with moratorium grace period simulation, interest accumulation breakdown, and debt-offsetting recommendations. Includes problem context and examples.

- [x] **IS-70**: Redesign and Integrate Existing Scholarship Eligibility Checker
  - **Impact**: High
  - **Type**: Design, Feature
  - **Description**:
    Create a redesigned, highly intuitive Scholarship Eligibility Checker with comprehensive criteria checks and custom matches.

- [x] **IS-72**: Implement Tool: CGPA to Percentage Converter
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Create a clean and comprehensive CGPA to Percentage Converter with standard CBSE, AICTE, and university conversion factors and eligibility mappings.

- [x] **IS-74**: Optimize and Redesign Tool Hub Page (/tools)
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Redesign and optimize the central /tools landing page to serve as a high-value entry directory. Includes real-time database stats, optimized visual categorization, and search.

- [x] **IS-84**: BUG: Vercel Serverless Runtime SQLite Failures
  - **Impact**: Critical
  - **Type**: Bug
  - **Description**:
    Context / Why it matters:
    SQLite file-based database queries using native C++ compilation bindings (better-sqlite3) crash at request time inside Vercel's ephemeral, read-only serverless Lambda runtime, triggering a 500 server exception screen.
    
    Actions Taken:
    1. Converted the homepage, deadlines, recently added, and trending pages to static routes (SSG) to build during compile-time and serve from CDN edge.
    2. Migrated SQLite database backend to Turso (SQLite over HTTP) to enable safe request-time serverless database connections.
    
    Next Actions to be Taken:
    1. Configure branch-based Vercel Preview Deployments to review runtime changes before merging to main.

- [x] **IS-88**: Buddy4Study Competitor Benchmarking Analysis
  - **Impact**: High
  - **Type**: Task
  - **Description**:
    Performed competitor benchmarking of Buddy4Study covering subdomains, localization strategy, marketing channels, and onboarding registration funnel. Compiled findings in buddy4study_benchmarking_report.md.

- [x] **IS-93**: Automate Telegram Channel Broadcasts via Bot API
  - **Impact**: High
  - **Type**: Feature
  - **Description**:
    Create a Node.js automation script (scripts/post-to-telegram.js) that uses the official Telegram Bot API to broadcast scholarship alerts to the Telegram channel. For complete setup design and workflow guide, see docs/telegram-alerts-automation.md.

- [x] **IS-94**: BUG: AdSense compatibility warnings and data-nscript attribute conflicts
  - **Impact**: Critical
  - **Type**: Bug
  - **Description**:
    Context / Why it matters:
    Compatibility conflict between Next.js Script wrapper component and Google AdSense library caused data-nscript validation warnings in the console, contributing to AdSense revenue drops and rendering inconsistencies. Additionally, verified domain nameservers are pointed back to Vercel (bypassing Ezoic proxying).
    
    Actions Taken:
    1. Replaced all Next.js Script wrapper components in app/layout.tsx with standard HTML async script tags to completely eliminate the data-nscript attribute.
    2. Fixed a TypeScript compile error on LanguageDetector.tsx to enable successful Vercel builds.
    3. Verified the changes are live on production and verified console errors are gone.

## Parked (13)

- [ ] **IS-5**: Printable document checklist on /documents-required subpages
  - **Impact**: Medium
  - **Description**:
    Context / Why it matters:
    Serves the Rajesh Uncle persona — parent, limited tech comfort, wants physical verification before sending child to apply.
    
    Plan / What to do:
    Add 'Download Printable Checklist' button on every /documents-required subpage. window.print() + print-optimised CSS class, or simple PDF of docs_needed array. High-contrast, clean layout.
    
    Trigger:
    Helpline subpage done first

- [ ] **IS-6**: Add /helpline-contact as 8th subpage type
  - **Impact**: High
  - **Description**:
    Context / Why it matters:
    Queries like 'how to contact e-Kalyan' and 'Sitaram Jindal helpline number' are uncompetitive. Zero manual effort — data already in database.
    
    Plan / What to do:
    Claude Code prompt: In app/scholarships/[slug]/[subpage]/page.tsx, add 'helpline-contact' as the 8th subpage key. Render the helpline field with contact details, official email, and link. Add to sitemap.ts. ~165 scholarships have helpline data populated.

- [ ] **IS-8**: BITSAT page — reframe as Scholarships for BITSAT Qualifiers
  - **Impact**: Medium
  - **Description**:
    Context / Why it matters:
    240K impressions at 0.59% CTR — content mismatch. Even 2% CTR = +3,400 clicks/month.
    
    Plan / What to do:
    BITSAT is an entrance exam not a scholarship. Reframe page title and intro as 'Scholarships for BITSAT Qualifiers / BITS Pilani Students'. Add actual scholarship schemes available to BITS students. Update slug if needed.
    
    Trigger:
    Review after enrichment batch

- [ ] **IS-10**: Sitemap splitting into sub-sitemaps
  - **Impact**: Low
  - **Description**:
    Context / Why it matters:
    Next.js limit is 50,000 URLs per sitemap. Currently well under. Set reminder at 40,000.
    
    Plan / What to do:
    Refactor app/sitemap.ts to export a sitemap index file referencing split sitemaps: /sitemap-states.xml, /sitemap-subpages-1.xml, /sitemap-subpages-2.xml. Currently at ~1,800 URLs — not needed yet.
    
    Trigger:
    Only when total URLs approach 40,000

- [ ] **IS-11**: Rewrite Odisha + West Bengal hub page content in WordPress
  - **Impact**: High
  - **Description**:
    Context / Why it matters:
    Odisha hub has 207K impressions at 0.71% CTR. Title overrides deployed — now the content needs to match what students expect to find.
    
    Plan / What to do:
    Odisha hub: update intro paragraph to list top 4 schemes by name with amounts. WB hub: feature Nabanna, SVMCM, Aikyashree with eligibility summaries. Add quick eligibility filter links pre-set for each state.
    
    Trigger:
    Title overrides already deployed in code

- [ ] **IS-15**: Apply to Ezoic for premium ad monetisation
  - **Impact**: High
  - **Description**:
    Context / Why it matters:
    At current traffic, ₹8,000–15,000/month potential. Better than plain AdSense — dynamic ad density optimisation protects mobile performance. ads.txt already exists in codebase.
    
    Plan / What to do:
    Go to ezoic.com and apply. No traffic minimum. Takes 15 minutes. Configure with strict Core Web Vitals protection — don't let ad scripts slow mobile load times.

- [ ] **IS-17**: B2B school counselor dashboard
  - **Impact**: High
  - **Description**:
    Context / Why it matters:
    Mrs. Sharma persona — power user managing hundreds of students. High-value B2B segment.
    
    Plan / What to do:
    Allow school counselors to upload student Excel sheet and export PDF eligibility matrix. Charge premium subscription. Need email list of 500+ school counselors first to validate demand before building.
    
    Trigger:
    Month 4-5 · needs email list of counselors first

- [ ] **IS-21**: Operating Model for Notion
  - **Impact**: Medium
  - **Description**:
    I think we can make it significantly more useful by turning it into a true operating system rather than a collection of notes.
    Instead of one page, I'd create sections like:
    • 📋 Master Backlog (prioritized tasks)
    
    • 🎯 Current Sprint (this week's work)
    
    • 🔍 Scholarship Intelligence (new scholarships to research)
    
    • 📈 SEO Opportunities (GSC-driven quick wins)
    
    • 👀 Competitor Watch (what others published this week)
    
    • 🤖 AI Agents (living instructions for each Antigravity agent)
    
    • 💡 Product Ideas (features, calculators, UX improvements)
    
    • 📊 Monthly Reviews (traffic, rankings, completed work)
    
    This would become the central operating hub for the project, with clear separation between strategy, execution, and ongoing research. I think it would make Antigravity much more effective because each agent would have a well-defined area of responsibility rather than a single long document.
    
    Context / Why it matters:
    Helps cover everything to do with the site 
    
    Plan / What to do:
    Create operating model (Notion) instead of just backlog etc
    
    Trigger:
    ChatGPT

- [ ] **IS-61**: Scholarship News tracker 
  - **Impact**: High
  - **Type**: Strategy
  - **Description**:
    Whenever a scholarship
    • 
    opens
    
    • 
    closes
    
    • 
    extends deadline
    
    • 
    changes eligibility
    
    • 
    increases amount
    
    we update the page immediately.
    
    Trigger:
    Chatgpt

- [ ] **IS-49**: Scholarship Deadline & Results Pages (SEO)
  - **Impact**: Medium
  - **Type**: Feature
  - **Description**:
    Narrowed from original "Scholarship News Feature" concept. Not a newsroom/browsing product — pure SEO play: auto-generate lightweight, individually-indexable pages/sections for scholarship deadline extensions and result publications on top-N high-traffic scholarships, sourced from existing DB field changes. Gated by Phase 0 search-volume validation before any build. Full PRD: IS-49_Scholarship_Event_Pages_PRD.docx. Parked until Phase 0 validation is prioritized.

- [ ] **IS-58**: Research & scope International High-Value Scholarships (study-abroad content track)
  - **Impact**: Medium
  - **Type**: Content Task
  - **Description**:
    Moved to ✍️ Content Backlog — this is research/content-population work, not dev. See: Research & scope International High-Value Scholarships (study-abroad content track) (https://app.notion.com/p/Research-scope-International-High-Value-Scholarships-study-abroad-content-track-3962e0a03f1e8193bc7cf5ef80df1cb5?pvs=21)

- [ ] **IS-62**: AI / Conversational Search
  - **Impact**: Medium
  - **Type**: Feature
  - **Description**:
    Future feature request to be assesed. IS-48 already implemented a site search on 7th Jul 2026

- [ ] **IS-87**: Option 2 — Personalized Telegram Bot Alerts
  - **Impact**: Medium
  - **Type**: Feature
  - **Description**:
    User-specific subscriptions based on State/Level/Category matching. Store chat IDs in SQLite and run matching queries.

