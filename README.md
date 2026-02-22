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

## 🎥 Series Statistics

| Metric | Day 01 | Day 02 | Day 03 |
|--------|--------|--------|--------|
| Build Cost | $8.21 | $6.00 | $1.20/reel |
| Build Time | 42 min | 12 min | 15-20 min |
| Services | 4 | 6 | 5 |
| Grade | A- (91%) | A+ (98%) | A+ (99%) |
| Success Rate | 100% | 100% | 95% |

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

## 📂 Repository Structure
```
microservices-daily-challenge/
├── day-01-restaurant-orders/      # Restaurant order management
│   ├── services/                   # 4 microservices
│   ├── tests/                      # Integration tests
│   ├── docker-compose.yml
│   ├── PROBLEM.md                  # Original requirements
│   ├── README.md                   # Setup & API docs
│   └── RESULTS.md                  # Implementation analysis
├── day-02-ai-agent-swarm/         # AI CTO agent swarm
│   ├── services/                   # 6 microservices
│   │   ├── web-ui/                # React frontend
│   │   ├── orchestrator/          # Pipeline coordinator
│   │   ├── architect-agent/       # Tech stack advisor
│   │   ├── security-agent/        # Security reviewer
│   │   ├── cost-agent/            # Cost optimizer
│   │   └── devops-agent/          # DevOps simplifier
│   ├── tests/                      # Integration tests
│   ├── docker-compose.yml
│   ├── PROBLEM.md                  # Original requirements
│   ├── README.md                   # Setup & API docs
│   ├── RESULTS.md                  # Implementation analysis
│   ├── SYNTHESIS-TRUNCATION-FIX.md # Bug fix documentation
│   └── FINAL-STATUS.md             # Complete system status
├── day-03-instagram-reel-generator/ # AI reel generation pipeline
│   ├── services/                   # 5 microservices
│   │   ├── orchestrator/          # Web UI + pipeline control
│   │   ├── trend-scout/           # Apify + Claude Haiku
│   │   ├── content-strategist/    # Claude Sonnet strategy
│   │   ├── visual-producer/       # Kling AI + FFmpeg + TTS
│   │   └── post-optimizer/        # Claude Haiku captions
│   ├── tests/                      # Integration tests
│   ├── output/                     # Generated reels
│   ├── docker-compose.yml
│   ├── PROBLEM.md                  # Original requirements
│   ├── README.md                   # Setup & API docs
│   └── RESULTS.md                  # Implementation analysis
└── README.md                       # This file
```

## 💡 What You'll Learn

### Technical Skills
- Autonomous AI development capabilities
- Microservices architecture patterns
- Real-world problem solving with AI
- Docker containerization
- Integration testing strategies
- Self-healing systems
- Real-time streaming (Server-Sent Events)
- Multi-agent AI orchestration
- Video processing with FFmpeg
- AI-powered content generation pipelines
- API orchestration across multiple AI services

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

## 🐛 Real Bugs Fixed

This series shows REAL development, including bugs:

### Day 02
1. **Synthesis Truncation** - max_tokens too low (4096 → 8192)
2. **JSON Parsing Failure** - Markdown code fences in AI response (6-pattern extraction)
3. **UI Display Bug** - [object Object] rendering (proper object formatting)

All fixed autonomously by Claude Code. Full documentation in `/day-02-ai-agent-swarm/SYNTHESIS-TRUNCATION-FIX.md`

### Day 03
1. **FFmpeg Apostrophe Crash** - Text overlays with apostrophes broke shell parsing (Unicode U+2019 replacement)
2. **Shell Injection Risk** - Using shell=True exposed vulnerabilities (migrated to spawn())
3. **Kling AI Timeout** - Unpredictable 5-15 min generation times (15-min polling system with backoff)
4. **Test Suite API Costs** - Each run burned $1.20 (smart job reuse + mock mode)
5. **Text Overlay Timing** - hookText appearing at wrong moments (frame-accurate FFmpeg timestamps)

## 📊 Cost Analysis

| Challenge | Build Cost | Production Cost | Human Alternative |
|-----------|-----------|-----------------|-------------------|
| Day 01 | $8.21 | N/A | $3k-5k dev project |
| Day 02 | $6.00 | $0.036/analysis | $5k-15k/month CTO |
| Day 03 | $8.00 | $1.20/reel | $25-50/reel freelancer |

## 🎓 Learning Resources

Each day includes:
- ✅ Complete source code
- ✅ Comprehensive documentation
- ✅ Bug fix learnings
- ✅ Architecture diagrams
- ✅ Production test results
- ✅ Video walkthrough
- ✅ Real-world performance metrics

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

# Start all services
docker-compose up --build

# Open browser
open http://localhost:3000
```

### Day 03 (Instagram Reel Generator)
```bash
cd day-03-instagram-reel-generator

# Copy environment template
cp .env.example .env

# Edit .env with your API keys:
# - ANTHROPIC_API_KEY (required)
# - OPENAI_API_KEY (required for voiceover)
# - APIFY_API_TOKEN (required for trend scraping)

# Start all services
docker-compose up --build

# Open web UI
open http://localhost:3001

# Or use mock mode (zero API cost testing)
USE_MOCK_DATA=true docker-compose up --build
```

## 🔗 Connect

- **YouTube:** https://youtube.com/@devopsballog25?si=VXq8bhMVWzbFAY95
- **LinkedIn:** www.linkedin.com/in/balaji-loganathan-devops
- **GitHub:** https://github.com/devopsballog25-pixel
- **Instagram:** @dailywisdom.ai (Day 03 live examples)

---

**⭐ Star this repo if you're following along!**