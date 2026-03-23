# Day 07: Autonomous LinkedIn Content Agent (NOVA)

> Part of the [Daily Microservices Challenge](../README.md) — building production AI microservice systems with Claude Code

## 🎯 Research Question

Can an AI agent autonomously manage a LinkedIn content strategy — sourcing real data, generating contextually relevant posts, and publishing on schedule — without any human involvement?

**Answer: Yes.** NOVA posts 3x per week, every week, with zero human writing or scheduling.

---

## 🤖 Meet NOVA

NOVA is an autonomous AI LinkedIn agent with a name and personality. Every post ends with her signature:

> *"Hi, I'm NOVA — an autonomous AI LinkedIn Agent, part of the Microservices Challenge. I sourced this post from [data source] — then used Groq's LLaMA to write and schedule it. Zero human involvement. If this was useful, 👍 this post — it helps me learn what resonates."*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  NOVA — LinkedIn Agent                   │
│                                                         │
│  ┌─────────────┐     ┌──────────────────┐               │
│  │  Scheduler  │────▶│    Generator     │               │
│  │ Mon/Wed/Fri │     └────────┬─────────┘               │
│  └─────────────┘              │                         │
│                    ┌──────────┼──────────┐              │
│                    ▼          ▼          ▼              │
│              Crypto API  Portfolio   Groq LLaMA          │
│              (live data)    CMS      (writing)           │
│                    └──────────┬──────────┘              │
│                               ▼                         │
│                    ┌──────────────────┐                 │
│                    │  Admin Dashboard │                 │
│                    │ Review & Approve │                 │
│                    └────────┬─────────┘                 │
│                             │ approved                  │
│                    ┌────────▼─────────┐                 │
│                    │    Publisher     │                 │
│                    │  LinkedIn API    │                 │
│                    └──────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

### 4 Microservices

| Service | Responsibility |
|---------|---------------|
| **Generator** | Fetches live data, calls Groq LLaMA, enforces post rules in code |
| **Scheduler** | Manages Mon/Wed/Fri calendar, triggers generation at right times |
| **Admin** | Web dashboard for reviewing, approving, editing, cancelling posts |
| **Publisher** | LinkedIn OAuth + UGC API, publishes approved posts on schedule |

---

## 📅 Three-Tier Content Strategy

### Tier 1 — Monday 8AM EST — Weekly Crypto Recap
**Data source:** `balajiloganathan.net/crypto` — live experiment results, trade decisions, weekly AI analysis

NOVA pulls from the crypto trading dashboard's `/api/weekly-reviews` endpoint — a Claude Haiku-generated analysis of all past experiments with real numbers (win rates, returns, experiment names). Every statistic is real. No estimates. No hallucination.

### Tier 2 — Wednesday 9AM EST — Portfolio Project Spotlight
**Data source:** `balajiloganathan.net` — portfolio CMS with architecture details, key results, case studies

NOVA rotates through all projects in order (Day 1 → Day 2 → ... → Day 7), writing a problem-solution post for each. GitHub source code link, YouTube build video, and portfolio case study link are force-injected in code — not left to the LLM.

### Tier 3 — Friday 9AM EST — Builder Story
**Data source:** `balajiloganathan.net` — key findings from that week's Tier 2 project

Always paired with the Wednesday project. Wednesday shows *what was built*. Friday tells the story of *what went wrong, what surprised me, and what I learned*. First-person, specific, grounded in real technical findings.

---

## 🔧 Key Technical Decisions

### Force-inject critical content in code
LLMs ignore instructions to include links ~50% of the time. The fix: remove link instructions from the prompt entirely. After generation, inject GitHub URL, YouTube URL, portfolio URL, and the YouTube live stream URL in code using string manipulation. They appear in every post, guaranteed.

### Post rules enforced in code, not prompt
`enforcePostRules()` runs on every generated post before saving:
- Strips hashtags from body
- Deduplicates hashtags
- Caps at 5 hashtags
- Appends hashtags on a single line at the end
- Truncates body at 1,200 chars at sentence boundary

### Real data prevents hallucination
Initial Tier 1 posts invented statistics ("estimated 500 experiments ran"). Root cause: prompt said "estimate if data unavailable." Fix: switch to `/api/weekly-reviews` endpoint (which has real multi-experiment data) and add strict "use ONLY provided data — never estimate" instruction.

### Tier 3 paired with Tier 2 project
Tier 3 queries `scheduled_posts` for the current week's Tier 2 `project_id`, fetches `key_findings` and `content` from the knowledge base, and writes a builder story about the same project. Creates a natural Wednesday/Friday content pair for the same audience.

---

## 🖥️ Admin Panel

Live at: [admin-linkedin-agent-production.up.railway.app/admin](https://admin-linkedin-agent-production.up.railway.app/admin)

**Queue tab:**
- This week's posts (Tier 1/2/3) with Approve / Reject / Retry / Edit / Post Now buttons
- Upcoming Scheduled Posts section showing all approved future posts with scheduled dates
- Tier 1 card shows published timestamp and next generation date after publishing
- Generate Next Week button on Tier 1 when published

**History tab:**
- All posts with Created date, Publishes On date, status colour coding
- Cancel button on approved posts (resets to pending)
- Edit button on approved posts (saves and keeps approved)
- Regenerate button on all posts

**Status colour coding:**
- `pending` → grey
- `approved` → blue
- `published` → green
- `cancelled` → orange

---

## 🐛 Real Bugs Fixed

1. **Hallucinated crypto stats** — Prompt said "estimate if data unavailable" → Groq invented numbers. Fixed by switching to `/api/weekly-reviews` and strict "use only provided data" rule.

2. **Links dropped by LLM** — Groq consistently ignored link instructions. Fixed by removing link instructions from prompt entirely and force-injecting all links in code after generation.

3. **Content rotation reversed** — `ORDER BY kb.id ASC` ordered by DB insertion order (Day 6 was inserted first, got lowest id). Fixed with `ORDER BY day_number ASC`.

4. **`</script>` injection** — Post content containing `</script>` string closed the admin panel's script tag early, breaking all JavaScript. Fixed with double-stringify escape: `JSON.parse(${JSON.stringify(JSON.stringify(allPosts)).replace(/<\/script>/gi, '<\\/script>')})`.

5. **Unicode table broken on LinkedIn** — Box-drawing characters (`┌─┬─┐`) rendered as broken lines on mobile (LinkedIn uses proportional fonts). Replaced with emoji-labeled plain text lines.

6. **Post length not enforced** — Groq ignored word count instructions. Implemented `enforcePostRules()` code function.

7. **Tier 3 wrong project** — Independent rotation meant Tier 3 might talk about Day 4 while Tier 2 was on Day 1. Fixed by querying that week's Tier 2 post for its `project_id`.

8. **Tab switching broken** — `switchTab` unreachable from onclick due to `</script>` injection closing the script tag early (upstream cause of bug #4).

9. **FK violation on Retry** — Retry tried to delete the old post, but `post_history` had a foreign key reference blocking deletion. Fixed by using UPDATE in-place instead of DELETE + INSERT.

---

## 📊 Results

| Metric | Value |
|--------|-------|
| Posts per week | 3 (fully autonomous) |
| Human writing involvement | Zero |
| Human scheduling involvement | Zero |
| AI cost per post | ~$0.004 (Groq) |
| LinkedIn OAuth validity | 60 days |
| Post length enforcement | 1,300 chars max (code-enforced) |
| Hashtag enforcement | Max 5, end only (code-enforced) |
| Link reliability | 100% (force-injected in code) |

---

## 🔑 Environment Variables

### Generator service
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | Groq API key for LLaMA |
| `CMS_API_URL` | Portfolio CMS base URL |
| `CRYPTO_DASHBOARD_URL` | Crypto dashboard base URL |
| `YOUTUBE_LIVE_URL` | Current YouTube live stream URL (update when stream restarts) |

### Scheduler service
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GENERATOR_URL` | Internal generator service URL |
| `PUBLISHER_URL` | Internal publisher service URL |
| `CRYPTO_DASHBOARD_URL` | Crypto dashboard base URL |

### Admin service
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Admin panel password |
| `GENERATOR_URL` | Internal generator service URL |
| `SCHEDULER_URL` | Internal scheduler service URL |
| `PUBLISHER_URL` | Internal publisher service URL |

### Publisher service
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `LINKEDIN_CLIENT_ID` | LinkedIn app client ID |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn app client secret |
| `LINKEDIN_REDIRECT_URI` | OAuth callback URL |

---

## ⚠️ Maintenance Notes

- **LinkedIn OAuth token expires every 60 days** — reconnect via admin panel "Reconnect LinkedIn" button before expiry. Current token expires May 17, 2026.
- **YouTube live stream URL changes on Railway restart** — update `YOUTUBE_LIVE_URL` env var in Railway generator service after any stream restart.
- **Content angles reset** — if all 30 angles are exhausted, the system auto-resets `used = false` and starts the rotation again from Day 1.

---

## 🔗 Links

- **LinkedIn Profile:** [linkedin.com/in/balaji-loganathan-devops](https://linkedin.com/in/balaji-loganathan-devops)
- **Portfolio Case Study:** [balajiloganathan.net/projects/autonomous-linkedin-content-agent](https://balajiloganathan.net/projects/autonomous-linkedin-content-agent)
- **Series Overview:** [github.com/devopsballog25-pixel/microservices-daily-challenge](https://github.com/devopsballog25-pixel/microservices-daily-challenge)

---

*Built autonomously with Claude Code as part of the Daily Microservices Challenge*
