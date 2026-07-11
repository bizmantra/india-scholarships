# Telegram Alerts Automation Handbook

This document records the design rationale, implementation steps, and operational workflow of the automated Telegram channel alerts system on IndiaScholarships.in.

---

## 1. Why We Did It (The Opportunity)
Based on competitor benchmarking of Buddy4Study, we discovered that they maintain active, high-volume WhatsApp/Telegram broadcast channels.
* **Student Behavior**: In India, mobile-first users (students and parents) frequently check direct chat channels (WhatsApp/Telegram) for time-critical alerts rather than checking emails.
* **Low Cost & High Security**: While WhatsApp Business APIs are marketing-heavy and charge per message (approximately ₹0.75 per broadcast), Telegram provides an officially supported, 100% free Bot API.
* **UX Strategy**: Placing native, high-visibility CTA widgets on the homepage and details pages allows us to convert organic traffic into recurring subscribers at zero ongoing platform costs.

---

## 2. What We Did (The Deliverables)
We created a fully automated, bot-driven broadcast pipeline for new scholarship alerts:
1. **Telegram Channel**: Set up the official public channel at `t.me/IndiaScholarships1`.
2. **Telegram Bot**: Created `@Indiascholarships1Bot` via BotFather and promoted it to Channel Administrator with posting permissions.
3. **Broadcaster Utility**: Created a Node.js script to query scholarships from the local SQLite database, format them into clean markdown, and push them to the channel.
4. **Visual CTAs**:
   * **Homepage Alert Banner**: Integrated an inline blue-to-indigo card above the FAQ list on the homepage.
   * **Sidebar Details Widget**: Added a glassmorphic notice box under the Share Buttons on every details page sidebar.
   * **Footer Link**: Added a quick "Telegram Channel ⚡" reference link to the Resources column.

---

## 3. How We Did It (Technical Reference)

### A. Environment Configuration (`.env.local`)
The script extracts credentials securely from local environment variables:
```env
# Telegram Bot Integration
TELEGRAM_BOT_TOKEN="8985546274:AAHyqJqGSaFZ8M9fUf8DFuqE8jrAuonzBQo"
TELEGRAM_CHANNEL_ID="-1003701678321"
```

### B. Broadcaster Script (`scripts/post-to-telegram.js`)
The utility queries the database and submits a formatted payload using the standard Telegram Bot API:
```bash
node scripts/post-to-telegram.js --slug [scholarship-slug]
```

#### Message Template Format:
> 🔔 **New Scholarship Alert!**
> 
> 🎓 **[Scholarship Title]**
> 
> 🏢 **Provider:** [Provider Name]
> 💰 **Benefit:** [₹Amount/year]
> 📅 **Last Date to Apply:** [Deadline Date]
> 
> 🔗 **Read Eligibility & Apply Here:**
> [Page URL](https://www.indiascholarships.in/scholarships/[slug])

---

## 4. How to Operate & Expand
Whenever you add or enrich high-value scholarships in your database, run the following command to broadcast them immediately to your followers:
```bash
node scripts/post-to-telegram.js --slug <slug-of-scholarship>
```

In the future, this can be integrated into your weekly ingestion workflow (`.github/workflows/weekly-enrichment.yml`) or your WordPress sync script (`scripts/sync-wordpress-api.js`) to trigger automatic broadcasts for newly synchronized entries.
