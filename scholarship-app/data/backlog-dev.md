# IndiaScholarships Dev Backlog

## In Progress (4)

## In Progress (3)

- [ ] **IS-50**: Integrate Google Keyword Planner API for keyword research
  - **Impact**: Low
  - **Description**:
    Set up Google Ads API connection and integrate Google Keyword Planner for automated or script-based keyword research on scholarships. Includes obtaining a Manager Account, developer token, client ID, client secret, and generating a refresh token to perform queries.

- [ ] **IS-63**: BUG: Site search live issues
  - **Impact**: High
  - **Type**: Bug
  - **Description**:
    Setting journal_mode = WAL pragma on SQLite failed with SQLITE_CANTOPEN in the production environment (Vercel) due to Vercel's read-only serverless filesystem, returning 500 error for /api/search.

- [ ] **IS-84**: BUG: Vercel Serverless Runtime SQLite Failures
  - **Impact**: Critical
  - **Type**: Bug
  - **Description**:
    Context / Why it matters:
    SQLite file-based database queries using native C++ compilation bindings (better-sqlite3) crash at request time inside Vercel's ephemeral, read-only serverless Lambda runtime, triggering a 500 server exception screen.
    
    Actions Taken:
    Converted the homepage, deadlines, recently added, and trending pages to static routes (SSG) to build during compile-time and serve from CDN edge.
    
    Next Actions to be Taken:
    1. Configure branch-based Vercel Preview Deployments to review runtime changes before merging to main.
    2. Migrate SQLite database backend to Turso (SQLite over HTTP) to enable safe request-time serverless database connections.

## Backlog (35)

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

## Done (26)

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

## Parked (13)

- [ ] **IS-15**: Apply to Ezoic for premium ad monetisation
  - **Impact**: High
  - **Description**:
    Go to ezoic.com and apply. No traffic minimum. Takes 15 minutes. Configure with strict Core Web Vitals protection — don't let ad scripts slow mobile load times.
    * **Current Status:** JavaScript and Ads.txt integration were rolled back on Jul 10, 2026, as Ezoic rejected the application.

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

