# Batch C3: sa_facts sources (corrected 2026-10-29)

Only facts confirmed on the live official page are proposed. Everything else is a gap. Pages were fetched on 2026-10-29.

| Fact key | Verdict | Official source | What the live page says |
|---|---|---|---|
| `usa.visa.sevis_i901_fee_usd` | verified | https://www.ice.gov/sevis/i901 | Fee table row: "I-901 SEVIS Fee F or M visa applicants (full payment)", amount "$350" |
| `germany.blocked_account.annual_eur` | gap | https://www.auswaertiges-amt.de/en/sperrkonto/388600 | Page gives no euro amount; says the amount depends on the stay and points to the mission. The earlier quote ("For the year 2024/2025 ... 992 euros") was not on the live page and is for an old year. The stored value needs owner review. |
| `germany.blocked_account.monthly_withdrawal_eur` | gap | same as above | same as above |
| `germany.aps.fee_inr` | gap | https://aps-india.de/ | Page states no fee amount; says to check the APS payment step. |
| `germany.visa.national_fee_eur` | gap | https://www.auswaertiges-amt.de/en/visa-and-service/visa-faqs/03-visa-fees-node | Page returned 404 on 2026-10-29. Find the current fee page. |
| `usa.visa.f1_mrv_fee_usd` | gap | https://travel.state.gov | Page returned 403 to the fetch tool. Confirm in a browser before proposing. |
| `germany.blocked_account.expatrio_*` (4 facts) | gap | n/a | Commercial providers, not official. Dropped. Cite only as labelled market examples. |
| `germany.blocked_account.coracle_*`, `buffer_eur`, `vfs.service_fee_inr`, `fx.*`, `usa.living.monthly_average_usd` | gap | see earlier notes | unchanged from the first submission |

Counts: 1 verified, the rest are gaps. Both blocked-account values are stored as 992 with no source. Treat them as possibly out of date until an owner checks the current amount.
