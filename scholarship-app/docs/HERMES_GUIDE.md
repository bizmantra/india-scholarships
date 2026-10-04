# Running and Growing IndiaScholarships.in with Hermes Agent

Hermes Agent (Nous Research) is a self-hosted AI agent. It lives on a server you control, talks to you through
Telegram (or Discord, Slack, WhatsApp, email), remembers what it learned, writes reusable "skills" from experience,
and runs scheduled jobs on its own.

**What it is for this site:** your always-on operations assistant. Your site already has automation (GitHub Actions
pipelines, the Agent Center, the Telegram channel). Hermes does not replace those. It sits on top as the
"person who watches everything, does the routine research and writing, and pings you only when a decision is needed."

> Verification note: commands below come from the official Hermes README and docs
> (https://hermes-agent.nousresearch.com/docs/). Hermes changes fast, so run `hermes doctor` and check the docs
> before relying on any exact flag.

---

## 1. Where Hermes fits in your current setup

| Layer | Already exists | Hermes' role |
|---|---|---|
| Data pipeline | Weekly enrichment (GitHub Actions), scout, freshness check | Triggers, monitors, summarises results; never edits the live DB directly |
| Approvals | Agent Center `/admin/agents` inbox | Tells you what is waiting; you still approve there |
| Audience | Telegram channel `t.me/IndiaScholarships1` | Drafts alerts and digests; you approve before posting |
| SEO | Search Console exports, keyword research folders | Weekly SEO report, content briefs, title/meta suggestions |
| Content | Editorial strategy docs | First drafts of guides and explainers for your review |

Rule of thumb: **Hermes proposes, you approve, existing pipelines publish.** Accuracy is your moat (verified,
date-stamped data), so never let an agent publish scholarship facts unreviewed.

---

## 2. Setup (about 1 hour)

### 2.1 Where to run it
Hermes should run 24/7, so not on your laptop.
- **Easiest:** a one-click template on Railway or similar (paste API key, pick a model, enable Telegram).
- **Cheap and flexible:** a small VPS (2 vCPU / 4 GB RAM is plenty), about $5-12/month.
- Budget the LLM API cost separately. Start with a monthly spending cap on your provider account.

### 2.2 Install (Linux/macOS/WSL2)
```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
source ~/.bashrc
hermes setup      # wizard: provider, model, tools
hermes doctor     # health check
```
Config lives in `~/.hermes/` (main file `config.yaml`).

### 2.3 Choose a model
`hermes model` lets you switch provider any time (Anthropic, OpenAI, OpenRouter, Nous Portal, Gemini, custom).
Suggested split to control cost:
- Strong model for research, writing, SEO analysis.
- Cheaper model for routine monitoring and formatting jobs.

### 2.4 Connect Telegram (your control panel)
1. In Telegram, message @BotFather and create a **new, separate bot** for Hermes (do not reuse the channel bot).
2. Run `hermes gateway` and give it the new bot token when asked.
3. Use DM pairing so only your Telegram account can talk to it.
4. Keep Hermes' bot out of the public channel. The public channel bot stays your existing `@Indiascholarships1Bot`.

### 2.5 Safety settings (do these before anything else)
- Leave **command approval ON**. Hermes asks before running shell commands.
- Run its tools in a **Docker container** (`hermes tools` / config) so a mistake can't touch the host.
- Give it **least privilege access** (section 3).
- Use a **staging** target wherever possible. Your Agent Center already targets staging on previews.

---

## 3. Access: what to give it, what to withhold

| Give | Scope | Do NOT give |
|---|---|---|
| GitHub fine-grained token | This repo only; Actions read/write, Contents read, Pull requests write | Admin rights, push to `main` |
| Google Search Console | Read-only service account | Ownership |
| Analytics (GA4) | Viewer | Editor |
| Read-only DB access (Turso read token) | For reporting queries | Write token, `TURSO_AUTH_TOKEN` of production |
| Telegram | Draft-only (it messages YOU) | Posting rights to the public channel at first |

Never hand over: Vercel deploy hook, production Turso write token, domain registrar, payment methods.

### Urgent: secrets are committed in the repo
`docs/telegram-alerts-automation.md` and `docs/weekly-enrichment-pipeline.md` contain what look like a real
Telegram bot token and channel ID. Anything in git history should be treated as leaked.
1. In BotFather, run `/revoke` on `@Indiascholarships1Bot` to issue a new token.
2. Store the new token only in Vercel/GitHub secrets, never in docs.
3. Replace the values in those docs with placeholders.
Do this before you connect any agent that can read the repo.

---

## 4. Teach Hermes your site (memory and skills)

### 4.1 Give it context once
Tell it (in Telegram or the terminal) to remember, and point it at your docs:
- Mission: verified, date-stamped scholarship data for Indian students.
- Source rules from `AGENTS.md`: check `docs/SCHOLARSHIP_SOURCES.md` first; official pages only in `source_pages`;
  platform pages (Buddy4Study, Careers360) only as secondary; never coaching sites; never change a number from a
  secondary page alone.
- Your brand voice: simple English, mobile-first, student-friendly, no hype.
- Hard rule: "Never publish or write to production. Always propose."

### 4.2 Skills to create (Hermes writes and refines these as it works)
Create each by describing the procedure once, then let it improve the skill after each run.

1. **verify-scholarship**: given a slug, open `source_pages`, then `official_source`/`apply_url`, compare deadline,
   amount, eligibility, report differences with the source link. Output a proposal, not an edit.
2. **weekly-seo-report**: pull Search Console, list pages with high impressions and low CTR, rising queries, pages
   that dropped, and 5 concrete actions.
3. **deadline-watch**: list scholarships closing in 7/14/30 days and those past deadline still marked open.
4. **telegram-digest-draft**: draft the weekly "closing soon" and "new this week" posts in your template.
5. **content-brief**: for a keyword, produce a brief (search intent, outline, FAQs, internal links per
   `INTERNAL_LINKING_STRATEGY.md`, official sources to cite).
6. **audience-research**: summarise what students ask on Reddit/YouTube/Quora for a niche (e.g. "Bihar post-matric").
7. **site-health**: check key pages load, no broken apply links, sitemap and structured data fine.

---

## 5. The operating rhythm (cron jobs)

Schedule with Hermes' built-in scheduler (describe it in plain English in Telegram, e.g. "every Monday 8am IST,
run weekly-seo-report and message me"). Times are suggestions; confirm the timezone is set to IST.

### Daily (5 minutes of your time)
| Time | Job | Output to you |
|---|---|---|
| 08:00 | deadline-watch | "3 closing this week, 2 expired but still open" |
| 08:05 | Check Agent Center inbox + last GitHub Actions run | "12 proposals waiting; Sunday run succeeded/failed" |
| 20:00 | site-health | Only messages if something is wrong |

### Weekly
| Day | Job |
|---|---|
| Monday | weekly-seo-report, with 5 prioritised actions |
| Tuesday | verify-scholarship batch on the 10 highest-traffic pages not verified in 60+ days |
| Wednesday | audience-research on one niche, producing 3 content ideas |
| Thursday | Draft 1 article from the best brief for your review |
| Friday | telegram-digest-draft ("closing soon"); you approve, then post |
| Sunday | After the weekly enrichment run: summary of what changed, anomalies (amount change over 50%, past deadlines) |

### Monthly
- Competitive check vs Buddy4Study and others: new schemes they list that you lack (feeds the scout).
- Seasonal calendar planning (see section 7).
- Review Hermes' own costs and which skills earned their keep.

---

## 6. Growth playbooks

### 6.1 SEO (your main channel)
Your edge is long-tail queries ("post matric scholarship Bihar 2026").
1. Weekly: Hermes lists pages ranking positions 8-20 with decent impressions. These are the cheapest wins:
   better title/meta, a clearer first paragraph, FAQs, internal links.
2. Hermes drafts the changes as a PR or a document; you review; they ship.
3. Track the 4 numbers: impressions, clicks, CTR, average position, per state/category cluster.
4. Freshness is a ranking and trust signal. Show "Last verified: date" and keep it true via the verification job.

### 6.2 Content
- One state-level hub per week (all scholarships for a state), then category guides (SC/ST/OBC, girls,
  engineering, minority, income-based).
- Every article: official source links, last verified date, who can apply, documents list, step-by-step.
- Hermes drafts, you fact-check numbers against official pages. Do not skip this step.

### 6.3 Telegram (and later WhatsApp)
- Posting cadence: 1 daily "closing soon" or "new" post, 1 weekly digest.
- Hermes drafts; you approve in chat with "post". Only after 4+ weeks of clean drafts, consider letting it post
  specific, pre-approved templates itself.
- Grow it: CTA widgets on site (already built), share in student groups and college communities, ask subscribers
  to forward to friends, and put the link on top-traffic pages.
- Consider a WhatsApp Channel later (larger reach in India, free for channels).

### 6.4 Email/notification capture
Once Telegram works, add "alert me before the deadline" by email/WhatsApp. Hermes can summarise which pages have
the highest traffic but no signup, so you place CTAs where they matter.

### 6.5 Partnerships and backlinks
Hermes can build a prospect list (NGOs, college placement cells, student communities, education bloggers),
draft outreach emails in Gmail as **drafts only**, and track replies. You send.

### 6.6 Monetisation readiness (per your product vision)
Free traffic first. Hermes' job here is measurement: monthly active users, return visitors, alert signups, which
scholarships drive most intent. That data decides when freemium alerts or provider/sponsor listings make sense.

---

## 7. Seasonal calendar for scholarships in India
Scholarship traffic is very seasonal. Ask Hermes to pre-plan these a month ahead:
- **Jun-Aug:** college admissions, NSP and state portals open, fresh-year guides, "how to apply" content.
- **Sep-Nov:** peak application and deadline season; "closing soon" content; renewal reminders.
- **Dec-Mar:** deadline extensions, verification rounds, results; study-abroad scholarships.
- **Apr-May:** class 10/12 results; new academic-year eligibility updates.
Exact dates vary by state and scheme, so always verify on the official portal.

---

## 8. Guardrails (non-negotiable)

1. **Proposals only.** No direct production writes. Approvals go through the Agent Center.
2. **Every fact has a source link.** If it cannot cite an official page, it says "unverified."
3. **No number changes from secondary sources alone** (matches `AGENTS.md`).
4. **Budget cap** at the LLM provider and a monthly review of spend.
5. **Audit trail:** Hermes logs what it did in a daily summary to you.
6. **Prompt-injection caution:** web pages it reads can contain hostile instructions. Keep it read-only on
   anything it browses, and keep tools sandboxed.
7. **Secrets** live in environment variables on the Hermes host, never in prompts, docs or the repo.
8. **Student data:** if you later collect emails or phone numbers, keep them out of Hermes' reach unless needed,
   and follow India's DPDP Act requirements.

---

## 9. Rollout plan

**Week 1: Foundation**
- Rotate leaked Telegram token. Deploy Hermes, connect a private Telegram bot with pairing, set budget cap.
- Teach it context and rules (4.1). Run `verify-scholarship` on 3 scholarships manually and check the quality.

**Week 2: Reporting**
- Add deadline-watch, site-health and weekly-seo-report. Read-only access only.

**Week 3: Drafting**
- Add telegram-digest-draft and content-brief. You approve everything by hand.

**Week 4: Operations**
- Let it trigger the Agent Center runs (scout, freshness check) via GitHub Actions and summarise results.
- Review: what saved time, what was noisy, which skills to fix or remove.

**Month 2+**
- Add outreach drafting, audience research, competitor monitoring.
- Gradually widen autonomy only for low-risk, reversible tasks.

---

## 10. Metrics to watch (review monthly)

| Area | Metric |
|---|---|
| Search | Impressions, clicks, CTR, avg. position, pages indexed |
| Audience | Monthly users, returning users, mobile share |
| Telegram | Subscribers, weekly growth, post views |
| Data quality | % scholarships verified in last 60 days, expired-but-open count, user-reported errors |
| Content | Articles shipped per month, traffic per article after 60 days |
| Agent | Hours saved, proposals accepted vs rejected, monthly cost |

---

## 11. Troubleshooting
- **Hermes is silent:** `hermes doctor`, check the gateway process and bot token.
- **Too many pings:** tell it to message only on exceptions for daily jobs, with one digest per day.
- **Wrong facts:** tighten the verify skill ("official source required"), and add the correct page to
  `source_pages` in the scholarship record.
- **Costs creeping up:** move routine jobs to a cheaper model, lower frequency, cap the batch size.
- **Skill got worse:** open the skill file in `~/.hermes/` and edit or reset it.

---

## 12. Quick start prompts (paste into Telegram once connected)

1. "Remember: our site is IndiaScholarships.in. You propose, never publish. Cite an official source for every fact."
2. "Create a skill called verify-scholarship that checks a scholarship's deadline, amount and eligibility against
   its official page and reports differences."
3. "Every weekday 8am IST, list scholarships closing in the next 14 days and any past-deadline ones still shown as
   open. Message me only if there is something."
4. "Every Monday 8:30am IST, review Search Console for the last 28 days and give me the 5 highest-impact SEO actions."
5. "Draft this Friday's Telegram digest of scholarships closing soon, using our post template. Do not post it."
