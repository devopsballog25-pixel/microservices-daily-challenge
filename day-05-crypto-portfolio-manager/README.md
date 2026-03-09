# Day 05: AI Crypto Portfolio Manager

> Built by Claude Code · Live at [balajiloganathan.net/crypto](https://balajiloganathan.net/crypto)

## 🎯 The Problem

Can an AI agent autonomously manage a paper trading portfolio — making real buy/hold/sell decisions every 15 minutes using live market data — and hit a return targets within 24 hours?

Most algorithmic trading demos are either backtests (fake historical data) or black boxes (no transparency). Day 05 built something fully live, fully transparent, and fully autonomous: every AI decision, every trade, and every reasoning step is logged and visible in real time.

---

## 🏗️ What Was Built

4 microservices, each with a distinct responsibility:

| Service | Responsibility | Exposure |
|---------|---------------|----------|
| **Market Data** | Binance WebSocket — live prices for 20+ coins, RSI/MACD/moving averages | Internal |
| **Strategy** | Claude Haiku evaluates market every 15 min — BUY/HOLD/SELL with confidence score + reasoning | Internal |
| **Executor** | Risk rules, paper trade execution, position management, circuit breaker | Internal |
| **Dashboard** | Live SPA — equity chart, AI conviction pulse, activity feed, holdings, admin panel | Public |

---

## 🌐 Live System

**→ [balajiloganathan.net/crypto](https://balajiloganathan.net/crypto)**  
**→ [balajiloganathan.net](https://balajiloganathan.net)** *(live widget on homepage)*

The system runs continuous 24-hour named experiments. Each experiment for example starts with $500, targets $525 (+5%), and ends when the target is hit, the time expires, or the circuit breaker fires.

---

## 🏛️ Architecture

```
Binance WebSocket (live prices)
         │
         ▼
┌─────────────────────┐
│   Market Data       │  RSI, MACD, Moving Averages
│   Service           │  20+ coins tracked live
└──────────┬──────────┘
           │ price signals
           ▼
┌─────────────────────┐
│   Strategy Service  │  Claude Haiku 4.5
│   (AI Brain)        │  evaluates every 15 min
│                     │  BUY / HOLD / SELL + reasoning
└──────────┬──────────┘
           │ decision
           ▼
┌─────────────────────┐
│   Executor Service  │  risk validation
│   (Accountant)      │  paper trade execution
│                     │  circuit breaker (-8% halt)
│                     │  PostgreSQL ledger
└──────────┬──────────┘
           │ portfolio state
           ▼
┌─────────────────────┐
│   Dashboard Service │  live SPA (WebSocket)
│   (The Window)      │  equity chart + benchmarks
│                     │  AI conviction pulse
│                     │  agent activity feed
│                     │  admin panel
└─────────────────────┘
         │
         ▼ HTTPS
balajiloganathan.net/crypto
(proxied via Day 04 portfolio site)
```

**Key design decisions:**
- Separate Railway project from Day 04 — clean series narrative, each day fully independent
- Inter-service communication over public HTTPS (accepted tradeoff for project isolation)
- PostgreSQL per environment — staging and production fully isolated databases
- Paper trading on real Binance prices — no simulated market conditions

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18 + Express
- **Database:** PostgreSQL (Railway managed, separate staging + production instances)
- **Market Data:** Binance WebSocket API (live prices, order book, 20+ trading pairs)
- **AI Model:** Claude Haiku 4.5 — trading decisions at ~$0.001 per evaluation
- **Real-time:** WebSocket (live price feed from market-data → dashboard → browser)
- **Cloud:** Railway (4 services, Hobby plan, separate project from Day 04)
- **Live at:** balajiloganathan.net/crypto

---

## 💰 Cost

| Item | Cost |
|------|------|
| Claude Code API (build cost) | NA |
| Railway hosting | ~$5/month (4 services) |
| Claude Haiku per experiment | ~$0.10 (96 decisions × $0.001) |
| **Total ongoing** | **~$5/month + $0.10/experiment** |

Compare to commercial algorithmic trading platforms ($50-500/month) or building a quant system from scratch ($50k-200k) — with full transparency, live data, and complete code ownership.

---

## ✨ Key Features

- **Named experiments** — each 24h run has a name (Dingo, Jaguar, etc.), mission, and scorecard
- **AI Conviction Pulse** — real-time confidence score, current signal, countdown to next evaluation, decision history bars
- **Live equity chart** — portfolio vs BTC buy-and-hold vs ETH buy-and-hold with trade markers
- **Agent activity feed** — every AI decision logged with full reasoning text, not just the outcome
- **AI Watchlist** — top opportunities the AI is tracking with entry targets, R/R ratio, and confidence
- **Circuit breaker** — halts all trading automatically if portfolio drops 8%
- **Cost tracker** — every Claude Haiku call tracked live (decisions today, total cost, cost per decision)
- **Admin panel** — start/stop experiments, set demo video URL, configure portfolio link
- **SSR summary page** — `/summary` route with server-rendered live data for AI assistants, Google, and link previews
- **Integrated into Day 04** — live widget on balajiloganathan.net homepage, full dashboard at /crypto

---

## 🐛 Real Issues Encountered

| Issue | Cause | Fix |
|-------|-------|-----|
| Production shared staging data | Railway sync copied staging Postgres; all 4 services pointed to wrong DATABASE_URL | Updated DATABASE_URL on each production service to point to separate postgres-day05-production instance |
| Sparkline Y-axis inverted | SVG Y=0 is at the top; missing `height -` inversion made an upward portfolio render as a downward curve | Added `y = height - ((value - min) / range) * height` inversion |
| Chart X-axis clipping | Fixed time domain set on first render; new data points overflowed the chart as snapshots accumulated | Recalculate X domain from actual data min/max on every render call |
| Time bar not live-updating | Progress bar calculated once on page load; not inside the polling loop | Moved time-remaining calculation inside the 30s poll cycle |
| Constant HOLD bias in AI | Prompt framed full position slots as "deployed" and cash as "reserves"; AI had no reason to act | Tuned prompt: action bias, consecutive HOLD limit, lower buy threshold (70% → 55%), cash as opportunity |
| CORS error on /cdn-cgi/rum | Cloudflare injects RUM telemetry script; credentialed cross-origin request fails with wildcard header | Cosmetic — Cloudflare infrastructure, no impact on functionality |

---

## 📊 Results

- ✅ 4 microservices deployed to Railway cloud (separate project)
- ✅ Live at balajiloganathan.net/crypto (proxied via Day 04)
- ✅ Live widget integrated into Day 04 homepage
- ✅ Staging and production fully isolated (separate databases)
- ✅ AI making real decisions every 15 minutes with full reasoning
- ✅ Circuit breaker, stop-loss, and risk rules working in production
- ✅ SSR summary page for AI/Google/link preview accessibility
- ✅ ~$0.10 per 24h experiment · ~$5/month infrastructure cost

---

## 🔗 Links

- **Live dashboard:** [balajiloganathan.net/crypto](https://balajiloganathan.net/crypto)
- **Full case study:** [balajiloganathan.net/projects/ai-crypto-portfolio-manager](https://balajiloganathan.net/projects/ai-crypto-portfolio-manager)
- **YouTube walkthrough:** [Watch on YouTube](https://youtu.be/20ZqRYti52g)
- **Series:** [Daily Microservices Challenge](https://github.com/devopsballog25-pixel/microservices-daily-challenge)

> ⚠️ **Note:** This repository contains documentation only. The full source code is maintained in a private repository as this system runs live infrastructure. This is a paper trading simulation — no real money is involved. Educational experiment only.
