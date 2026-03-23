# Daily Microservices Challenge

> Testing Claude Code's ability to build production-ready microservices from real-world problems

## 🎯 Mission

Build complete microservices systems autonomously using Claude Code. Each challenge:
- Real-world problems from various sectors
- Budget: $10 API cost target
- Time: Single session
- Complete: Code + Tests + Docker + Documentation

## 📺 YouTube Series

Watch the full series: [YouTube Playlist](https://youtube.com/@devopsballog25?si=VXq8bhMVWzbFAY95)

---

## 🏆 Completed Challenges

### Day 01: Restaurant Order Management System ✅
- **Problem:** Restaurant inefficiencies (15-20% missed calls, kitchen coordination issues)
- **Solution:** 4 microservices (Order Intake, Queue Manager, Kitchen Display, Status Tracker)
- **Result:** 11/11 criteria passed, A- grade (91%)
- **Cost:** $8.21
- **Time:** 42 minutes
- **Code:** [day-01-restaurant-orders/](./day-01-restaurant-orders/)
- **Video:** [Watch on YouTube](https://youtu.be/jVgutAQZCUc)

### Day 02: AI CTO Agent Swarm ✅
- **Problem:** Solo founders can't afford $5k-15k/month fractional CTOs
- **Solution:** 6 microservices - 4 AI agents debate technical decisions sequentially
- **Result:** 14/14 criteria passed, A+ grade (98%)
- **Cost:** $6.00 (27% cheaper than Day 01)
- **Time:** 12 minutes (70% faster than Day 01)
- **Production:** $0.036 per analysis (3.6 cents)
- **Code:** [day-02-ai-agent-swarm/](./day-02-ai-agent-swarm/)
- **Video:** [Watch on YouTube](https://youtu.be/GXAPBrIIAeU)

**Key Innovation:** Sequential pipeline where each AI agent sees previous outputs and explicitly challenges recommendations. Real debates, not just parallel analysis.

### Day 03: AI Instagram Reel Generator ✅
- **Problem:** Content creators spend 3-5 hours per reel on research, scripting, production, and optimization
- **Solution:** 5 microservices autonomously generating complete Instagram reels from topic input
- **Result:** All success criteria passed, A+ grade (99%)
- **Cost:** $1.20 per reel (Kling $0.99 + Apify $0.18 + Claude $0.03)
- **Time:** 15-20 minutes per reel (fully automated)
- **Success Rate:** 95% (production-ready quality)
- **Code:** [day-03-instagram-reel-generator/](./day-03-instagram-reel-generator/)
- **Video:** [Watch on YouTube](https://youtu.be/0dpkdkytzaE)
- **Live Examples:** [@dailywisdom.ai](https://instagram.com/dailywisdom.ai)

**Architecture:** Trend Scout (Apify + Claude Haiku) → Content Strategist (Claude Sonnet) → Visual Producer (Kling AI + FFmpeg + OpenAI TTS) → Post Optimizer (Claude Haiku) → Complete reel with captions and hashtags

### Day 04: Portfolio Management System ✅
- **Problem:** No central place to showcase experiments — projects lived only on GitHub with no public portfolio, analytics, or audience-building tools
- **Solution:** 4 microservices — public website, CMS admin panel, analytics service, newsletter service — deployed to production with custom domain
- **Result:** All success criteria passed · Live at [balajiloganathan.net](https://balajiloganathan.net)
- **Build Cost:** $10 (Claude Code API)
- **Hosting:** $6.25/month (Railway + domain) vs $16-36/month for SaaS alternatives
- **Live Site:** [balajiloganathan.net](https://balajiloganathan.net)
- **Video:** [Watch on YouTube](https://youtu.be/eGdcCznRu-Y)

**Key Innovation:** The infrastructure itself is the experiment — a self-hosted, fully owned portfolio platform that now hosts all future Daily Challenge case studies.

### Day 05: AI Crypto Portfolio Manager 🔴 LIVE
- **Problem:** Can an AI agent autonomously manage a trading portfolio to a +5% target within 24 hours using only real-time market data and no human intervention?
- **Solution:** 4 microservices — Market Data (Binance WebSocket), Strategy (Groq LLaMA), Executor (risk rules + paper trades), Dashboard (live SPA)
- **Result:** All success criteria passed · Live at [balajiloganathan.net/crypto](https://balajiloganathan.net/crypto)
- **Build Cost:** ~$10 (Claude Code API)
- **AI Cost per Decision:** ~$0.004 (Groq llama-3.3-70b) · ~$0.10 per 24h experiment
- **Live Dashboard:** [balajiloganathan.net/crypto](https://balajiloganathan.net/crypto)
- **Live Stream:** [youtube.com/live/UPBSaYLGsFs](https://youtube.com/live/UPBSaYLGsFs)
- **Video:** [Watch on YouTube](https://youtu.be/20ZqRYti52g)

**Key Innovation:** A fully transparent autonomous AI trading experiment — every decision, every trade, every reasoning step is logged and visible in real time. The AI evaluates 20+ coins every 15 minutes using live RSI/MACD signals and executes paper trades with a circuit breaker that halts trading if the portfolio drops 8%.

### Day 06: AI Crypto Live Stream — 24/7 YouTube Streaming 🔴 LIVE
- **Problem:** The autonomous AI trading experiment from Day 05 was running 24/7 but nobody could watch it in real time without visiting the dashboard URL directly
- **Solution:** A production livestream microservice that captures the /live dashboard using headless Chromium + Xvfb virtual display, encodes it with FFmpeg, and streams 24/7 to YouTube via RTMP
- **Result:** All success criteria passed · Live at [youtube.com/live/UPBSaYLGsFs](https://youtube.com/live/UPBSaYLGsFs)
- **Build Cost:** ~$10 (Claude Code API)
- **Running Cost:** ~$10-15/month (Railway Pro — required for real-time H264 encoding)
- **Live Stream:** [youtube.com/live/UPBSaYLGsFs](https://youtube.com/live/UPBSaYLGsFs)
- **Live Dashboard:** [balajiloganathan.net/crypto](https://balajiloganathan.net/crypto)

**Key Innovation:** The first AI agent in this series that streams its own operation publicly. Headless Chromium renders the live trading dashboard into a virtual display, FFmpeg captures and encodes it at 1080p30, and streams it continuously to YouTube — all running autonomously on Railway with auto-restart on any crash.

### Day 07: Autonomous LinkedIn Content Agent (NOVA) 🔴 LIVE
- **Problem:** Building in public requires consistent LinkedIn content — but writing, scheduling and posting 3x per week competes directly with actual building time
- **Solution:** 4 microservices — Generator (Groq LLaMA + live data sources), Scheduler (Mon/Wed/Fri calendar), Admin (review + approval panel), Publisher (LinkedIn API) — deployed on Railway with zero human involvement
- **Result:** All success criteria passed · Live and posting 3x/week
- **Build Cost:** ~$10 (Claude Code API)
- **AI Cost per Post:** ~$0.004 (Groq llama-3.3-70b)
- **Case Study:** [balajiloganathan.net/projects/autonomous-linkedin-content-agent](https://balajiloganathan.net/projects/autonomous-linkedin-content-agent)
- **Video:** [Watch on YouTube](https://youtu.be/hG6A47I6ALE)

**Key Innovation:** NOVA is an autonomous AI agent with a name and personality that sources real data from two live systems — a crypto trading dashboard for weekly experiment recaps and a portfolio CMS for project spotlights — then writes, schedules and publishes LinkedIn posts with zero human writing or intervention. Every post ends with NOVA's signature explaining exactly how it was generated.

**Three-Tier Content Strategy:**
- **Tier 1 (Monday 8AM EST):** Weekly crypto experiment recap — sourced from live trading dashboard and AI weekly review
- **Tier 2 (Wednesday 9AM EST):** Portfolio project spotlight — sourced from portfolio CMS with YouTube build link, rotating through all projects
- **Tier 3 (Friday 9AM EST):** Builder story — first-person, paired with that week's Tier 2 project, sourced from key findings in the CMS

---

## 🎥 Series Statistics

| Metric | Day 01 | Day 02 | Day 03 | Day 04 | Day 05 | Day 06 | Day 07 |
|--------|--------|--------|--------|--------|--------|--------|--------|
| Build Cost | $8.21 | $6.00 | $1.20/reel | NA | NA | NA | NA |
| Build Time | 42 min | 12 min | 15-20 min | NA | NA | NA | NA |
| Services | 4 | 6 | 5 | 4 | 4 | 1 | 4 |
| Grade | A- (91%) | A+ (98%) | A+ (99%) | ✅ Live | 🔴 Live | 🔴 Live | 🔴 Live |
| Success Rate | 100% | 100% | 95% | 100% | 100% | 100% | 100% |

---

## 🛠️ Tech Stack

### Day 01 (Restaurant System)
- **Backend:** Node.js 18 + Express
- **Databases:** PostgreSQL 15, Redis 7
- **Containers:** Docker Compose
- **Testing:** Jest

### Day 02 (AI Agent Swarm)
- **Backend:** Node.js 18 + Express
- **Database:** SQLite (Orchestrator)
- **Real-time:** Server-Sent Events (SSE)
- **AI Model:** Claude Haiku (claude-haiku-4-5-20251001)
- **Containers:** Docker Compose
- **Testing:** Jest

### Day 03 (Instagram Reel Generator)
- **Backend:** Node.js 18 + Express
- **AI Models:** Claude Sonnet 4, Claude Haiku, Kling AI Pro, OpenAI TTS
- **Video Processing:** FFmpeg
- **Scraping:** Apify (Instagram hashtag scraper)
- **Containers:** Docker Compose
- **Format:** 1080×1920 (9:16), 30 FPS, Instagram-optimized

### Day 04 (Portfolio Management System)
- **Backend:** Node.js 18 + Express
- **Templating:** EJS
- **Database:** PostgreSQL (Railway managed)
- **Cloud:** Railway (4 services)
- **CDN / SSL:** Cloudflare
- **Email:** Resend API
- **Domain:** balajiloganathan.net

### Day 05 (AI Crypto Portfolio Manager)
- **Backend:** Node.js 18 + Express
- **Database:** PostgreSQL (Railway managed)
- **Market Data:** Binance WebSocket API (live prices, 20+ coins)
- **AI Model:** Groq llama-3.3-70b-versatile (trading decisions, ~$0.004/call)
- **Cloud:** Railway (4 services, separate project)
- **Real-time:** WebSocket (live price feed to browser)
- **Live at:** balajiloganathan.net/crypto

### Day 06 (AI Crypto Live Stream)
- **Runtime:** Node.js 18
- **Virtual Display:** Xvfb (X Virtual Framebuffer) 1920x1080
- **Browser:** Chromium headless (kiosk mode)
- **Video Encoding:** FFmpeg x11grab → H264 libx264 ultrafast
- **Audio:** AAC 128kbps stereo
- **Streaming:** RTMP to YouTube Live
- **Cloud:** Railway Pro (dedicated CPU for real-time encoding)
- **Resolution:** 1920x1080 @ 30fps

### Day 07 (Autonomous LinkedIn Agent — NOVA)
- **Backend:** Node.js 18 + Express (4 services)
- **Database:** PostgreSQL (Railway managed)
- **AI Model:** Groq llama-3.3-70b-versatile (content generation, ~$0.004/post)
- **Content Sources:** Crypto dashboard API + Portfolio CMS API
- **Publishing:** LinkedIn UGC API (OAuth 2.0)
- **Cloud:** Railway (4 services, separate project)
- **Admin:** Web dashboard with approve/reject/edit/cancel/post-now
- **Schedule:** Mon 8AM / Wed 9AM / Fri 9AM EST (automated)

---

## 📂 Repository Structure

```
microservices-daily-challenge/
├── day-01-restaurant-orders/
├── day-02-ai-agent-swarm/
├── day-03-instagram-reel-generator/
├── day-04-portfolio-management-system/
├── day-05-crypto-portfolio-manager/
├── day-06-crypto-live-stream/
├── day-07-linkedin-agent/
│   └── README.md
└── README.md
```

---

## 🐛 Real Bugs Fixed

### Day 07
1. **Hallucinated crypto stats** — Prompt said "estimate if data unavailable" so Groq invented numbers; fixed by switching data source to `/api/weekly-reviews` endpoint with strict "use only provided data" instruction
2. **Links dropped by LLM** — Groq consistently ignored instructions to include GitHub/YouTube/portfolio links; fixed by force-injecting all links in code after generation, not via prompt
3. **Content angle rotation reversed** — `ORDER BY kb.id ASC` ordered by DB insertion order (Day 6 was inserted first); fixed with `ORDER BY day_number ASC`
4. **Post length enforcement** — Groq ignored word count instructions; implemented `enforcePostRules()` function in code: strips hashtags, deduplicates, caps at 5, truncates body at 1,200 chars at sentence boundary
5. **`</script>` injection** — Post content containing `</script>` closed the admin panel's script tag early, breaking all JavaScript; fixed with double-stringify escape pattern
6. **Unicode table broken on LinkedIn** — Box-drawing characters (`┌─┬─┐`) rendered as broken lines on mobile; replaced with emoji-labeled plain text lines
7. **Tier 3 paired with wrong project** — Tier 3 was using independent rotation instead of pairing with that week's Tier 2 project; fixed by querying `scheduled_posts` for current week's Tier 2 `project_id`

---

## 📊 Cost Analysis

| Challenge | Build Cost | Production Cost | Human Alternative |
|-----------|-----------|-----------------|-------------------|
| Day 01 | $8.21 | N/A | $3k-5k dev project |
| Day 02 | $6.00 | $0.036/analysis | $5k-15k/month CTO |
| Day 03 | $8.00 | $1.20/reel | $25-50/reel freelancer |
| Day 04 | NA | $6.25/month | $500-2k dev + $16-36/mo SaaS |
| Day 05 | NA | ~$0.10/experiment | $50k-200k quant trading system |
| Day 06 | NA | $10-15/month | $500-2k streaming setup + $50-200/month cloud |
| Day 07 | NA | ~$0.05/month (AI) | $500-2k/month social media manager |

---

## 💡 What You'll Learn

### Technical Skills
- Autonomous AI development capabilities
- Microservices architecture patterns
- Real-world problem solving with AI
- Docker containerization
- Integration testing strategies
- Self-healing systems
- Real-time streaming (WebSockets, Server-Sent Events)
- Multi-agent AI orchestration
- Video processing with FFmpeg
- AI-powered content generation pipelines
- API orchestration across multiple AI services
- Cloud deployment with Railway + Cloudflare
- Production debugging (CDN caching, private networking, body limits)
- Live market data integration (Binance WebSocket)
- Autonomous AI trading systems with circuit breakers
- LinkedIn API OAuth 2.0 + UGC post publishing
- Autonomous content agents with personality

### AI & LLM Development
- Claude Code autonomous development
- AI agent design patterns
- Sequential vs parallel AI processing
- Token budget management
- JSON parsing from LLM outputs
- Production AI system debugging
- Multi-model AI orchestration (Claude, Kling, OpenAI, Groq)
- Prompt engineering for content generation
- Cost optimization in AI pipelines
- Real-time AI decision-making at $0.001/call
- Force-injecting critical content when LLMs ignore instructions
- Grounding LLM output in real data to prevent hallucination

---

## 🎓 Learning Resources

Each day includes:
- ✅ Complete source code (Days 01-03)
- ✅ Comprehensive documentation
- ✅ Bug fix learnings
- ✅ Architecture diagrams
- ✅ Production test results
- ✅ Video walkthrough
- ✅ Real-world performance metrics

Day 04 case study: [balajiloganathan.net/projects/portfolio-management-system](https://balajiloganathan.net/projects/portfolio-management-system)
Day 05 case study: [balajiloganathan.net/projects/ai-crypto-portfolio-manager](https://balajiloganathan.net/projects/ai-crypto-portfolio-manager)
Day 06 case study: [balajiloganathan.net/projects/ai-crypto-live-stream](https://balajiloganathan.net/projects/ai-crypto-live-stream)
Day 07 case study: [balajiloganathan.net/projects/autonomous-linkedin-content-agent](https://balajiloganathan.net/projects/autonomous-linkedin-content-agent)

---

## 🚀 Quick Start

### Day 01 (Restaurant System)
```bash
cd day-01-restaurant-orders
docker-compose up --build
cd tests && npm install && npm test
```

### Day 02 (AI Agent Swarm)
```bash
cd day-02-ai-agent-swarm
export ANTHROPIC_API_KEY=your-key-here
docker-compose up --build
open http://localhost:3000
```

### Day 03 (Instagram Reel Generator)
```bash
cd day-03-instagram-reel-generator
cp .env.example .env
# Edit .env with: ANTHROPIC_API_KEY, OPENAI_API_KEY, APIFY_API_TOKEN
docker-compose up --build
open http://localhost:3001

# Zero-cost mock mode
USE_MOCK_DATA=true docker-compose up --build
```

### Day 04 (Portfolio Platform)
The live system runs at [balajiloganathan.net](https://balajiloganathan.net). Source code is private as it runs live infrastructure. See [day-04-portfolio-management-system/README.md](./day-04-portfolio-management-system/README.md) for full documentation.

### Day 05 (AI Crypto Portfolio Manager)
The live system runs at [balajiloganathan.net/crypto](https://balajiloganathan.net/crypto). Source code is private as it runs live infrastructure. See [day-05-crypto-portfolio-manager/README.md](./day-05-crypto-portfolio-manager/README.md) for full documentation.

### Day 06 (AI Crypto Live Stream)
The live stream runs at [youtube.com/live/UPBSaYLGsFs](https://youtube.com/live/UPBSaYLGsFs). Source code is private as it runs live infrastructure. See [day-06-crypto-live-stream/README.md](./day-06-crypto-live-stream/README.md) for full documentation.

### Day 07 (Autonomous LinkedIn Agent — NOVA)
The live agent posts at [linkedin.com/in/balaji-loganathan-devops](https://linkedin.com/in/balaji-loganathan-devops). Source code is private as it runs live infrastructure. See [day-07-linkedin-agent/README.md](./day-07-linkedin-agent/README.md) for full documentation.

---

## 🔗 Connect

- **Portfolio:** [balajiloganathan.net](https://balajiloganathan.net)
- **YouTube:** [youtube.com/@devopsballog25](https://youtube.com/@devopsballog25?si=VXq8bhMVWzbFAY95)
- **LinkedIn:** [linkedin.com/in/balaji-loganathan-devops](https://www.linkedin.com/in/balaji-loganathan-devops)
- **GitHub:** [github.com/devopsballog25-pixel](https://github.com/devopsballog25-pixel)
- **Instagram:** [@dailywisdom.ai](https://instagram.com/dailywisdom.ai) (Day 03 live examples)
- **Live Crypto Dashboard:** [balajiloganathan.net/crypto](https://balajiloganathan.net/crypto)
- **Live YouTube Stream:** [youtube.com/live/UPBSaYLGsFs](https://youtube.com/live/UPBSaYLGsFs)

---

**⭐ Star this repo if you're following along!**
