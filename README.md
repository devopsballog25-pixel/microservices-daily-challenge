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
- **Code:** [day-04-portfolio-management-system/](./day-04-portfolio-management-system/)
- **Live Site:** [balajiloganathan.net](https://balajiloganathan.net)
- **Video:** [Watch on YouTube](https://youtu.be/eGdcCznRu-Y)

**Key Innovation:** The infrastructure itself is the experiment — a self-hosted, fully owned portfolio platform that now hosts all future Daily Challenge case studies. Claude Code autonomously built and deployed 4 services to Railway cloud with Cloudflare CDN, SSL, and a working CMS — zero manual coding.

### Day 05: AI Crypto Portfolio Manager 🔴 LIVE
- **Problem:** Can an AI agent autonomously manage a trading portfolio to a +5% target within 24 hours using only real-time market data and no human intervention?
- **Solution:** 4 microservices — Market Data (Binance WebSocket), Strategy (Claude Haiku AI), Executor (risk rules + paper trades), Dashboard (live SPA)
- **Result:** All success criteria passed · Live at [balajiloganathan.net/crypto](https://balajiloganathan.net/crypto)
- **Build Cost:** ~$10 (Claude Code API)
- **AI Cost per Decision:** ~$0.001 (Claude Haiku 4.5) · ~$0.10 per 24h experiment
- **Code:** [day-05-crypto-portfolio-manager/](./day-05-crypto-portfolio-manager/)
- **Live Dashboard:** [balajiloganathan.net/crypto](https://balajiloganathan.net/crypto)
- **Video:** [Watch on YouTube](https://youtu.be/20ZqRYti52g)

**Key Innovation:** A fully transparent autonomous AI trading experiment — every decision, every trade, every reasoning step is logged and visible in real time. The AI evaluates 20+ coins every 15 minutes using live RSI/MACD signals and executes paper trades with a circuit breaker that halts trading if the portfolio drops 8%. Each named 24-hour experiment creates a narrative arc with a single mission: grow $500 to $525.

---

## 🎥 Series Statistics

| Metric | Day 01 | Day 02 | Day 03 | Day 04 | Day 05 |
|--------|--------|--------|--------|--------|--------|
| Build Cost | $8.21 | $6.00 | $1.20/reel | $10.00 | NA |
| Build Time | 42 min | 12 min | 15-20 min | 1 session | NA |
| Services | 4 | 6 | 5 | 4 | 4 |
| Grade | A- (91%) | A+ (98%) | A+ (99%) | ✅ Live | 🔴 Live |
| Success Rate | 100% | 100% | 95% | 100% | 100% |

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
- **AI Model:** Claude Haiku 4.5 (trading decisions, $0.001/call)
- **Cloud:** Railway (4 services, separate project)
- **Real-time:** WebSocket (live price feed to browser)
- **Live at:** balajiloganathan.net/crypto

---

## 📂 Repository Structure

```
microservices-daily-challenge/
├── day-01-restaurant-orders/           # Restaurant order management
│   ├── services/                        # 4 microservices
│   ├── tests/                           # Integration tests
│   ├── docker-compose.yml
│   ├── PROBLEM.md
│   ├── README.md
│   └── RESULTS.md
├── day-02-ai-agent-swarm/              # AI CTO agent swarm
│   ├── services/                        # 6 microservices
│   │   ├── web-ui/                     # React frontend
│   │   ├── orchestrator/               # Pipeline coordinator
│   │   ├── architect-agent/            # Tech stack advisor
│   │   ├── security-agent/             # Security reviewer
│   │   ├── cost-agent/                 # Cost optimizer
│   │   └── devops-agent/               # DevOps simplifier
│   ├── tests/
│   ├── docker-compose.yml
│   ├── PROBLEM.md
│   ├── README.md
│   ├── RESULTS.md
│   ├── SYNTHESIS-TRUNCATION-FIX.md
│   └── FINAL-STATUS.md
├── day-03-instagram-reel-generator/    # AI reel generation pipeline
│   ├── services/                        # 5 microservices
│   │   ├── orchestrator/               # Web UI + pipeline control
│   │   ├── trend-scout/                # Apify + Claude Haiku
│   │   ├── content-strategist/         # Claude Sonnet strategy
│   │   ├── visual-producer/            # Kling AI + FFmpeg + TTS
│   │   └── post-optimizer/             # Claude Haiku captions
│   ├── tests/
│   ├── output/
│   ├── docker-compose.yml
│   ├── PROBLEM.md
│   ├── README.md
│   └── RESULTS.md
├── day-04-portfolio-management-system/ # Live portfolio platform
│   └── README.md                       # Docs + link to live site
├── day-05-crypto-portfolio-manager/    # AI crypto trading experiment
│   └── README.md                       # Docs + link to live dashboard
└── README.md                           # This file
```

> **Note:** Day 04 and Day 05 source code is maintained in private repositories as they run live infrastructure at [balajiloganathan.net](https://balajiloganathan.net).

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

### AI & LLM Development
- Claude Code autonomous development
- AI agent design patterns
- Sequential vs parallel AI processing
- Token budget management
- JSON parsing from LLM outputs
- Production AI system debugging
- Multi-model AI orchestration (Claude, Kling, OpenAI)
- Prompt engineering for video generation
- Cost optimization in AI pipelines
- Real-time AI decision-making at $0.001/call

---

## 🐛 Real Bugs Fixed

This series shows REAL development, including bugs:

### Day 02
1. **Synthesis Truncation** — max_tokens too low (4096 → 8192)
2. **JSON Parsing Failure** — Markdown code fences in AI response (6-pattern extraction)
3. **UI Display Bug** — [object Object] rendering (proper object formatting)

### Day 03
1. **FFmpeg Apostrophe Crash** — Text overlays with apostrophes broke shell parsing (Unicode U+2019 replacement)
2. **Shell Injection Risk** — Using shell=True exposed vulnerabilities (migrated to spawn())
3. **Kling AI Timeout** — Unpredictable 5-15 min generation times (15-min polling system with backoff)
4. **Test Suite API Costs** — Each run burned $1.20 (smart job reuse + mock mode)
5. **Text Overlay Timing** — hookText appearing at wrong moments (frame-accurate FFmpeg timestamps)

### Day 04
1. **Silent fetch failures** — Node's `http` module couldn't handle Railway's HTTPS + port 8080 (switched to Node 18 native fetch())
2. **PayloadTooLargeError** — Express default 100kb body limit rejected base64 image uploads (express.json({ limit: '50mb' }))
3. **CSS not updating** — Cloudflare CDN caching old stylesheet (cache-bust with ?v=2)
4. **Missing env vars** — Admin panels returning 404/500 (set ADMIN_SECRET, ADMIN_EMAIL in Railway dashboard)

### Day 05
1. **Database isolation** — Production synced from staging shared the same PostgreSQL instance; all 4 services needed DATABASE_URL updated to point to a separate production Postgres
2. **Sparkline Y-axis inverted** — SVG coordinate space has Y=0 at the top; missing `height -` inversion made an upward portfolio appear as a downward curve
3. **Chart X-axis clipping** — Fixed time domain set on first render caused new data points to overflow the chart boundaries as snapshots accumulated
4. **Time bar not updating** — Progress bar calculated once on page load instead of inside the polling loop; moved calculation to run every 30s
5. **HOLD bias in AI strategy** — AI prompt framed cash as "reserves" and full position slots as "deployed"; tuned prompt with action bias, lower buy threshold (70% → 55%), and consecutive HOLD limit

---

## 📊 Cost Analysis

| Challenge | Build Cost | Production Cost | Human Alternative |
|-----------|-----------|-----------------|-------------------|
| Day 01 | $8.21 | N/A | $3k-5k dev project |
| Day 02 | $6.00 | $0.036/analysis | $5k-15k/month CTO |
| Day 03 | $8.00 | $1.20/reel | $25-50/reel freelancer |
| Day 04 | $10.00 | $6.25/month | $500-2k dev + $16-36/mo SaaS |
| Day 05 | NA | ~$0.10/experiment | $50k-200k quant trading system |

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

---

## 🚀 Quick Start

### Day 01 (Restaurant System)
```bash
cd day-01-restaurant-orders
docker-compose up --build

# Test the system
cd tests && npm install && npm test
```

### Day 02 (AI Agent Swarm)
```bash
cd day-02-ai-agent-swarm

# Set your Anthropic API key
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

---

## 🔗 Connect

- **Portfolio:** [balajiloganathan.net](https://balajiloganathan.net)
- **YouTube:** [youtube.com/@devopsballog25](https://youtube.com/@devopsballog25?si=VXq8bhMVWzbFAY95)
- **LinkedIn:** [linkedin.com/in/balaji-loganathan-devops](https://www.linkedin.com/in/balaji-loganathan-devops)
- **GitHub:** [github.com/devopsballog25-pixel](https://github.com/devopsballog25-pixel)
- **Instagram:** [@dailywisdom.ai](https://instagram.com/dailywisdom.ai) (Day 03 live examples)

---

**⭐ Star this repo if you're following along!**
