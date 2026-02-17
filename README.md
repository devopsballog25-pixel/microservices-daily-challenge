# Daily Microservices Challenge

> Testing Claude Code's ability to build production-ready microservices from real-world problems

## 🎯 Mission

Build complete microservices systems autonomously using Claude Code. Each challenge:
- Real-world problems from all sectors
- Budget: $10 API cost
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

### Day 03: Coming Soon! 📜

## 🎥 Series Statistics

| Metric | Day 01 | Day 02 | Improvement |
|--------|--------|--------|-------------|
| Build Cost | $8.21 | $6.00 | -27% ✅ |
| Build Time | 42 min | 12 min | -70% ✅ |
| Services | 4 | 6 | +50% |
| Grade | A- (91%) | A+ (98%) | +7% ✅ |
| Complexity | CRUD | Multi-Agent AI | Higher |

## 📧 Get Challenges Early

Join the newsletter to receive each challenge 24 hours before the video drops:
**[Newsletter Signup](#)** *(coming soon)*

## ⭐ Follow Along

Star this repository to get notifications for each new challenge!

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
├── day-03-[next-challenge]/
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

### AI & LLM Development
- Claude Code autonomous development
- AI agent design patterns
- Sequential vs parallel AI processing
- Token budget management
- JSON parsing from LLM outputs
- Production AI system debugging

## 🐛 Real Bugs Fixed (Day 02)

This series shows REAL development, including bugs:

1. **Synthesis Truncation** - max_tokens too low (4096 → 8192)
2. **JSON Parsing Failure** - Markdown code fences in AI response (6-pattern extraction)
3. **UI Display Bug** - [object Object] rendering (proper object formatting)

All fixed autonomously by Claude Code. Full documentation in `/day-02-ai-agent-swarm/SYNTHESIS-TRUNCATION-FIX.md`

## 🤝 Contributing

Want to suggest a challenge? Open an issue with:
- Industry/sector (preferably non-IT)
- Real-world problem description
- Why microservices would help

**Popular suggestions for Day 03:**
- Healthcare appointment scheduling
- Event ticketing with dynamic pricing
- Pet health tracker
- Gym class booking system
- Local services marketplace

## 📊 Cost Analysis

| Challenge | Build Cost | Production Cost | Human Alternative |
|-----------|-----------|-----------------|-------------------|
| Day 01 | $8.21 | N/A | $3k-5k dev project |
| Day 02 | $6.00 | $0.036/analysis | $5k-15k/month CTO |

**Total series cost so far:** $14.21 for 2 complete production systems

## 🎓 Learning Resources

Each day includes:
- ✅ Complete source code
- ✅ Comprehensive documentation
- ✅ Bug fix learnings (30+ pages for Day 02)
- ✅ Architecture diagrams
- ✅ Production test results
- ✅ Video walkthrough

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

## 📜 License

MIT License - Feel free to use this code for learning!

## 🔗 Connect

- **YouTube:** https://youtube.com/@devopsballog25?si=VXq8bhMVWzbFAY95
- **LinkedIn:** www.linkedin.com/in/balaji-loganathan-devops
- **GitHub:** https://github.com/devopsballog25-pixel
- **Newsletter:** [Subscribe](#) *(coming soon)*

## 📅 Upload Schedule

New challenges every week:
- **Day 01:** Restaurant Order System - ✅ Live
- **Day 02:** AI CTO Agent Swarm - ✅ Live
- **Day 03:** TBD - Coming Next Week

---

**⭐ Star this repo if you're following along!**

**💬 Suggest Day 03 ideas in the Issues tab!**
