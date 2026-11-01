# IndiaScholarships — Notion Brain: How It Works & Why

**Purpose of this document:** Paste this into Antigravity, ChatGPT, or any other tool so it understands the system before touching it. It's also the plain-language record of *why* things are built this way, for Roshan (product owner / commander in chief).

Built fresh 2026-07-06. Updated to reflect full database integrations.

---

## 1. The one-line version

One Notion workspace. Every piece of information has exactly one home, based on what *kind* of thing it is (an idea, a decision, a per-scholarship record, a log of what happened, a live number) — not based on which tool or person created it.

## 2. Why it's built this way (for Roshan)

The old system failed for three specific, findable reasons — this rebuild fixes each one directly:

1. **Duplication.** The old Document Hub had 6 real documents copied 5 times each — 30 pages for 6 pieces of content. Fix: one page per topic, and this guide names where new things go.
2. **A promise with nothing behind it.** Fix: this document *is* the central hub now, linked from the Command Center.
3. **The same story told 4 times.** Fix: one Atlas page holds vision, architecture, PM view, and decisions together — merging what were four hubs into one.

The deeper principle: **machine-generated data (live page counts, GSC/GA4 numbers) never lives in a place a human has to manually update**, because manually-maintained numbers go stale within a week. Anything that changes automatically lives in Looker Studio (for metrics) or is pushed by Antigravity directly to the Live Pages Registry or Change Log — never a hand-typed page.

---

## 3. The map — one home per kind of thing

All of these sit under **🏠 IndiaScholarships — Command Center** in Notion.

| Place | What lives here | Who writes to it | Who reads it |
|---|---|---|---|
| 🗺 **Atlas** | Vision, personas, business model, architecture, engineering invariants, PM conversion drivers, and KPI targets. | Roshan, Claude (with confirmation for edits) | Everyone — this is the context doc |
| ⚡ **Backlog** | Ideas and proposed actions — from Claude, ChatGPT, Roshan's own brainstorming, or GSC opportunity-mining. Status: Proposed → Now → Next → Later → Done. Max 5 in "Now" at once. | Claude, ChatGPT, or Roshan (manual paste) | Roshan triages daily/weekly |
| 📜 **Decision Log (ADRs)** (Database) | **Structured Database:** Tracks permanent, strategic architecture and product decisions (ADR-001, ADR-002, etc.). Mapped with: `ADR ID`, `Decision Name`, `Status` (Accepted/Proposed), `Area` (SEO/Architecture), and `Context`. | Humans only (Roshan, Claude, ChatGPT) | Humans (to understand codebase constraints before coding) |
| 📜 **Change & Activity Log** (Page) | **Chronological Activity Log:** A running machine log of what was actually completed — git commits, dates, and script deployments. **Keep separate from Decision Log to avoid clutter.** | Antigravity (automated after every run) | Roshan, for the "what's already done" view |
| 🔬 **Content Pipeline** | One row per scholarship, from first lead to live page: Researching → Drafted → Synced to WP → Archive/Hold. Includes Intake Source. | Antigravity (research + enrichment), Roshan | Antigravity, Roshan |
| 🌐 **Live Pages Registry** (Database) | **Structured Database:** Every real URL live on the site (Static, State Hub, Scholarship, Subpage) mapped with GSC clicks & impressions. | Antigravity (auto-synced from sitemap and GSC logs) | Everyone, for opportunity mining |
| 📊 **Metrics Narrative** | Weekly "what moved and why" — the story, not the numbers. | Roshan, Claude | Roshan |
| 📖 **Reference Archive** | Flat storage for raw research docs. | Whoever creates them | Rarely visited directly |

---

## 4. How each tool actually touches this

**Claude** — connected live via Notion's MCP integration. Reads and writes directly. Default behavior: writes actionable outputs (ideas → Backlog, decisions → Atlas/ADRs) at the end of a session without asking each time.

**ChatGPT** — same live access *if* Notion's official MCP connector is turned on in settings. Otherwise, ChatGPT gives Roshan text to paste manually. Tag `Source: ChatGPT` in the Backlog to distinguish.

**Antigravity (The IDE Agent)** — fully integrated via integration token (`NOTION_API_KEY` in `.env.local` and GitHub Action secrets). 
*   Reads `⚡ Backlog` tasks marked `🔴 Now` to execute them.
*   Enriches and researches new entries in the `🔬 Content Pipeline` database.
*   Regenerates the complete `🌐 Live Pages Registry` and GSC clicks/impressions database on its weekly cron run.
*   Appends Git commit activity logs to the `📜 Change & Activity Log` page after every run.

---

## 5. Rules of the road

- **One database per kind of thing.** Before creating a new database, check this map.
- **Never mix Decision Log (Why) and Change Log (What).** Keep strategic architectural decisions clean and isolated from frequent git commit noise.
- **Tag Source on every Backlog item.** It's the only way to tell where an idea came from (Claude, ChatGPT, Roshan, GSC).
- **Respect the 5-item WIP limit on "Now."**
