# Day 08: DropResearch — AI-Powered Shopify Niche Research Tool

Part of the [Daily Microservices Challenge](../README.md) series — building production AI microservice systems publicly.

## The Problem

Beginners fail at the first step of starting a Shopify dropshipping store: choosing a niche. They either pick something too competitive, too saturated, or something with no real supplier availability. No accessible tool combines live competition data, supplier availability, and AI reasoning into a single guided flow a non-technical person can actually follow.

## What Was Built

A 5-microservice AI research platform that walks a user through 4 validated steps — from discovering an underserved niche to receiving a complete sourcing brief with product categories, viral content angles, pricing strategy, and what to avoid. Delivers a downloadable Word document (.docx) at the end.

## Architecture

```
Browser ──→ frontend (Express + Supabase Google OAuth)
               │
               ├──→ niche-analyser (Groq orchestrator)
               │        ├── /suggest-niches  (3-round engine)
               │        ├── /validate-niche  (sub-niches)
               │        ├── /analyse-markets (5 markets)
               │        ├── /analyse-niche   (Step 2 lab)
               │        └── /sourcing-brief  (Groq-only)
               │                   │
               │                   └──→ scrapling-service
               │                        FastAPI + StealthyFetcher
               │                        Google, AliExpress,
               │                        Amazon, pytrends
               │
               ├──→ product-research (CJ Dropshipping API v2)
               │        └── Round 2b background pre-filter
               │
               └──→ results-engine (Groq scoring)

Auth:    Supabase Google OAuth
State:   Preserved across OAuth redirect via localStorage
Export:  POST /api/export-report → .docx via npm docx
Deploy:  Docker Compose (local)
```

## The 4-Step Pipeline

**Step 0 — Niche Discovery (no login required)**
A 3-round validated engine generates 20 niche candidates across 10 rotating category themes (marine hobbies, fiber arts, miniatures, outdoor survival, science hobbies, collecting, fermentation, garden, music, visual arts). Each candidate is validated with real Shopify store counts via StealthyFetcher Google searches, cross-referenced against CJ Dropshipping API availability, then ranked by Groq on opportunity score. Niches with over 20,000 Shopify stores are hard-rejected. A banned list prevents Groq from suggesting overused niches like candle making, soap making, and macrame. Returns 10 niche cards with competition labels, store counts, margin ranges, and buyer demand signals.

Clicking a niche card triggers a login gate if the user is not authenticated — full niche selection state is preserved in localStorage across the Google OAuth redirect.

**Step 1 — Market Validation (requires login)**
Five target markets validated in parallel (US, CA, UK, AU, NZ) using StealthyFetcher Google searches. Each market returns an opportunity score, demand count, and local competitor store count. Groq ranks results and recommends the optimal 2-3 markets with reasoning.

**Step 2 — Research Lab (requires login)**
Five data sources fire in parallel — Google Trends (pytrends), Shopify store count, AliExpress listing count, Amazon review signals, and competitor price data. Results are cached by compound niche + sub-niche key for 7 days. Groq synthesises everything into evergreen score, competition level, margin range, seasonal risk, and a proceed/avoid verdict.

**Step 3 — Sourcing Brief (requires login)**
A single Groq call generates a complete sourcing brief in approximately 15 seconds. Contains: winning angle, price strategy with supplier cost and sell price targets, 6-8 product categories each with a viral TikTok/Instagram hook, cost/sell/profit ranges, supplier search term, and difficulty rating. Three Google search links per category (AliExpress, CJ Dropshipping, DHgate). What to Avoid section with reasons. Supplier tips and competition insight.

**Export — Download Report**
After Step 3, users download a fully formatted Word document containing the complete research session — niche overview, market recommendations, research analysis, full sourcing brief, all product categories, avoid list, and disclaimer.

## Services

| Service | Port | Stack | Responsibility |
|---------|------|-------|----------------|
| frontend | 3004 | Express + HTML/CSS/JS | UI, auth, proxying, .docx export |
| niche-analyser | 3001 | Node.js + Groq | All AI orchestration, Steps 0-3 |
| scrapling-service | 3005 | Python FastAPI + Scrapling | Live web data (Google, AliExpress, Amazon, pytrends) |
| product-research | 3002 | Node.js + CJ API v2 | CJ Dropshipping product availability |
| results-engine | 3003 | Node.js + Groq | Scoring (kept, not used in main flow) |

## Quick Start

```bash
cd day-08-dropship-research
cp .env.example .env
# Fill in all required env vars (see below)
docker-compose up --build
open http://localhost:3004
```

## Environment Variables

```env
# Groq
GROQ_API_KEY=

# Supabase (Google OAuth + session storage)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# CJ Dropshipping API v2
CJ_API_KEY=
CJ_ACCESS_TOKEN=
CJ_OPEN_ID=

# Ports (set automatically by docker-compose)
PORT=8080
```

## Key Technical Decisions

**Scrapling StealthyFetcher for Google scraping** — Uses a modified Firefox browser with fingerprint spoofing to bypass bot detection. Works correctly in local Docker environments. Fails on Railway and other cloud providers because Google immediately blocks datacenter IPs. Decision was made to keep the tool local rather than deploy a degraded experience. Residential proxies are the production solution if cloud deployment is needed.

**Groq-only Step 3** — The original Step 3 used a multi-source product discovery loop combining the CJ API and Scrapling. Output was too generic. Replaced with a single Groq call producing a structured sourcing brief. Better output, faster, simpler. The lesson: when automation produces commodity results, redesign the output strategy.

**Rotating category system** — 10 rotating niche category themes prevent repetitive Groq output more reliably than prompt variation alone. Combined with a banned niches list, outputs are genuinely diverse across sessions.

## Bugs Fixed

1. **Generic niche output** — Groq returned the same overused niches regardless of prompt variation; fixed with rotating category system and explicit banned niches list
2. **Step 3 commodity results** — Product discovery loop surfaced generic items in speciality niche searches; redesigned as Groq-only sourcing brief
3. **CJ API silent rate limiting** — Parallel CJ calls returned empty arrays with no error; fixed with sequential processing and 1100ms delays
4. **State lost across OAuth redirect** — Niche selection lost after Google login; fixed with localStorage save-before/restore-after in onAuthStateChange handler
5. **Scrapling blocked on Railway** — Datacenter IPs blocked by Google; decision made to keep local

## Results

- 5 microservices confirmed working locally
- 4-step research pipeline validated end-to-end with real data
- Sourcing brief generated in ~15 seconds with 6-8 product categories
- Full .docx report export working
- Google OAuth login gate with full state preservation

## Links

- **Case Study:** [balajiloganathan.net/projects/dropresearch](https://balajiloganathan.net/projects/dropresearch)
- **Video:** [Watch on YouTube](https://youtu.be/OAJLr3HbKgU)
- **Series:** [Daily Microservices Challenge](../README.md)
