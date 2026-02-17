# Quick Start Guide - AI CTO Agent Swarm

Get your AI CTO team running in 60 seconds!

## Option 1: Test Without API Key (Recommended First)

```bash
# Start in mock mode (no API key needed)
MOCK_MODE=true docker-compose up --build

# Open your browser
open http://localhost:3000

# Fill in the form with any startup idea
# Watch the agents work in real-time!
```

## Option 2: Use Real Claude Haiku AI

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-your-key-here

# Start the system
docker-compose up --build

# Open your browser
open http://localhost:3000

# Submit a real analysis (costs ~$0.01)
```

## Try This Example

Use this example input to see all agents debate:

**Project Description:**
```
AI-powered resume builder SaaS - users paste a job description and
upload their resume, AI rewrites and optimizes the resume for that
specific job, outputs a polished PDF
```

**Tech Skills:** `React, Node.js, basic AWS`
**Monthly Budget:** `150`
**Expected Users:** `1000`
**Team Size:** `Solo`

## What to Watch For

You'll see:
- 🏗️ **Architect** recommends PostgreSQL + React + Railway
- 🔒 **Security** challenges: "Use Clerk for auth, don't build your own"
- 💰 **Cost** suggests: "Use SQLite instead of PostgreSQL to save $15/month"
- ⚙️ **DevOps** warns: "Skip Kubernetes, you're solo — use Railway"

Then a final synthesis resolves the debates into a cohesive strategy!

## Running Tests

```bash
cd tests
npm install
npm test
```

All tests pass in under 3 seconds (mock mode).

## Stopping the System

```bash
docker-compose down
```

## Troubleshooting

**Problem:** Services won't start
**Solution:** `docker-compose down -v && docker-compose up --build`

**Problem:** Port already in use
**Solution:** `lsof -ti:3000 | xargs kill -9` (repeat for 3001-3005)

**Problem:** Can't see updates in browser
**Solution:** Check browser console, refresh page, try different browser

## Next Steps

- Read [README.md](README.md) for full documentation
- Read [RESULTS.md](RESULTS.md) for implementation details
- Read [PROBLEM.md](PROBLEM.md) for the original challenge

---

**Enjoy your AI CTO team! 🚀**
