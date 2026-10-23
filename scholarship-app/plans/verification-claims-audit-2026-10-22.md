# What "verified" and "2026-27" really mean on our pages (CNT-113)

Written 2026-10-22. Status: FINDINGS AND PROPOSAL. No data or page was changed. Data: production database, read-only.

## Findings

**The old script's 2026-27 stamp is not the real problem.** `scripts/boost-6month-scholarships.js` (now retired) set `verification_year` to 2026-27 on every row. Today 478 of 555 active scholarships say 2026-27 and 77 say 2026. On the public site that field does one visible thing: it supplies the **year label** in the title and heading ("... 2026-27") and in one template line ("Updated 2026-27 Cycle"). As a label for the current cycle it is mostly right. Changing 478 rows would change 478 titles for no gain.

**The weak spot is the word "Verified".** Three separate things say "verified" and none of them means a person or an agent checked the record:

| Where | What it says | What it is based on |
|---|---|---|
| `verified_status` | "Verified" on **555 of 555** rows | Set by the old script and by every approval. No row has any other value, so it tells you nothing |
| `last_verified` | A date, 464 rows on 2026-10-12 | Set whenever **any** field is approved. Fixing one helpline stamps the whole record |
| Page copy | "Verified for 2026-27" (category pages), "Verified for 2026" (homepage), "Verified for 2026-27 Session" (income pages) | Fixed text in the page code. Not driven by data at all |

**The 12 October batch shows how it happened.** 630 approvals were made in one sitting (all at 20:xx UTC, by the owner), on 453 scholarships: 438 helpline changes, 86 apply links, 86 official-source links, 13 deadline wording, 7 documents. Each had a source citation, but most were older proposals without an evidence score. These are useful link and contact fixes, yet approving them marked each whole record "verified" and gave it a fresh `last_verified`.

**Real evidence of checking the facts students care about is small:**

| Of 555 active scholarships | Count |
|---|---|
| Have any official source page saved (`source_pages`) | 80 |
| Deadline confirmed on an official page since 7 Aug | 55 |
| Amount confirmed on an official page since 7 Aug | 1 |
| Both deadline and amount confirmed | 0 |

(A fresh run of the freshness agent adds to the deadline count over the next days: it now chases unknown and expected deadlines first.)

**Featured flag.** The same old script set `is_featured` on keyword matches: 238 rows are featured. The site only reads it as an ordering input for a short "featured" list (`ORDER BY priority_score ... LIMIT n`), so the effect is small. Low priority.

## Proposed plan (nothing applied; needs the owner's decisions)

| # | What | How | Needs |
|---|---|---|---|
| 1 | Leave `verification_year` as it is | It is a year label; most rows are for the 2026-27 cycle | none |
| 2 | Make "Verified" mean something: approving a **helpline, link or wording** change stops marking the record Verified or changing `last_verified`. Only deadline, amount, eligibility and income approvals do | Small change in the two approval code paths (`lib/command-center/inbox.ts`, `scripts/lib/agent-inbox.js`) | Decision: OK to change what approvals stamp? |
| 3 | Make the page copy honest: replace the fixed "Verified for 2026-27" text with wording that is true for every page (for example "Checked against official sources"), or drive it from real data (deadline confirmed on an official page this cycle) | A few page files (homepage, category pages, income pages) | Decision: wording, or data-driven badge |
| 4 | Reset `verified_status` for rows with no official evidence to a neutral value (for example "Not yet checked") | One-off script, same pattern as the deadline labelling | Decision (affects 475 rows); do 2 and 3 first |
| 5 | Featured flag: leave, or reset to the top ~50 by traffic | One-off | Optional |

Suggested order: 2 and 3 first (they stop new false "verified" claims and fix the copy), then decide on 4.
