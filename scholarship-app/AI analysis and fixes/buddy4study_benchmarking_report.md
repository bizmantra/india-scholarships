# Buddy4Study Benchmarking & Gap Analysis Report

This report analyzes Buddy4Study's localization subdomains, marketing channels, and user onboarding flows, and cross-references their catalog with ours to identify critical content gaps.

---

## 1. Localization Subdomains & Strategy

### Buddy4Study's Model
- **Active Subdomains:** Buddy4Study currently operates **`hindi.buddy4study.com`** as a dedicated localized hub. They do not run other regional language subdomains (e.g., Tamil, Telugu, Kannada, Bengali).
- **Structure & Layout:**
  - The Hindi site functions primarily as a **content-heavy blog** rather than an interactive application.
  - It features articles and guidelines translated into Hindi, catering to vernacular search intent (e.g., "scholarship kaise apply karein").
  - The interactive search tool and applications link back to the main English site `www.buddy4study.com`, which serves as the core transactional platform.
- **Strategic Purpose:** This structure captures long-tail Hindi search queries (which have massive search volume in India) while keeping database management and application processing centralized on a single system.

### Recommendation for Our Platform
- **Vercel/Next.js Localization:** Rather than managing separate subdomains, we should utilize **subpath routing** (e.g., `/hi/` for Hindi) in our Next.js application using standard packages like `next-intl`.
- **Hybrid Content Model:** We can start by localizing core scholarship details pages and state hubs (e.g., West Bengal, Odisha) before building out full portal translations, mirroring Buddy4Study's blog-first approach to localization.

---

## 2. WhatsApp Channel & Exit Popup Strategy

### Buddy4Study's Model
- **WhatsApp Integration:** Buddy4Study features a highly visible "Join WhatsApp Channel" Call-to-Action (CTA) in their footers and floating sidebars.
- **Content Frequency & Value:** They post daily alerts covering opening dates, upcoming deadlines, and walk-through guides.
- **Exit Popups (Exam Portal):** On `exam.buddy4study.com`, if a user attempts to leave the tab or scroll past a certain depth, an exit-intent popup appears, prompting the user to subscribe to instant exam alerts via Telegram/WhatsApp.

### Recommendation for Our Platform
- **Actionable CTAs:** Add a styled WhatsApp subscribe component or floating badge on our detail pages.
- **Exit Popup Component:** Implement a subtle, non-intrusive exit-intent dialog on `/scholarships/[slug]` pages targeting users who have spent more than 30 seconds reading but haven't clicked the application links, asking them to subscribe for alerts.

---

## 3. Registration Flow & Onboarding Funnel

### Buddy4Study's Model
- **The Entrypoint:** Standard registration is heavily driven by **Google One-Tap Signup** / "Follow Button".
- **The Onboarding Profile Wizard:**
  - Immediately after registering, users are prompted to complete a 5-step profile wizard.
  - It collects: **Current Class/Degree, Gender, State of Residency, Caste/Category, and Annual Family Income**.
- **Dynamic Matching Engine:**
  - Once the profile is complete, the dashboard shifts from a generic list to a **personalized matched list** (e.g., "12 Scholarships Matched for You").
  - This drastically reduces friction and increases user retention because students don't have to manually filter through hundreds of records.

### Recommendation for Our Platform
- **Personalized Recommendations Widget:** In the future, we can add a simple client-side "Find Matches" quiz on the homepage that stores user selections in `localStorage` and filters the scholarships list dynamically.

---

## 4. Audited Scholarship Gaps

Based on our gap analysis and web research, the following high-priority scholarships have been researched and will be added directly to our SQLite database:

### A. Amazon Future Engineer Scholarship (India)
- **Provider:** Amazon India (in partnership with Foundation for Excellence - FFE)
- **Amount:** ₹50,000 per year (for up to 4 years) + Free Laptop + Mentorship.
- **Eligibility:** 1st-year female B.E./B.Tech/Integrated M.Tech students (Computer Science/IT/related), Family Income < ₹3,00,000/year, merit rank in state/national entrance exams.
- **Type/Scope:** Corporate/Private, National (India).

### B. JSW Udaan Scholarship
- **Provider:** JSW Foundation (administered via Vidyasaarathi portal)
- **Amount:** Up to ₹50,000 per year (varies by course: B.E./B.Tech, Diploma, ITI, etc.)
- **Eligibility:** Students residing near JSW plant locations, minimum 60% in previous exam, Family Income ≤ ₹8,00,000/year.
- **Type/Scope:** Corporate/Private, Regional (near JSW locations).

### C. Generation Google Scholarship (APAC - India)
- **Provider:** Google
- **Amount:** USD 2,500 (~₹2,00,,000)
- **Eligibility:** Full-time 2nd or 3rd-year female undergraduate Computer Science/technical students, strong academic record.
- **Type/Scope:** Corporate/Private, National/APAC.
