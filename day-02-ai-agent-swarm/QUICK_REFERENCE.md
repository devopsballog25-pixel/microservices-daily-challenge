# Day 02: Quick Reference Card

## 📋 Pre-Execution Checklist

- [ ] Docker Desktop running
- [ ] Ports 3000-3005 available
- [ ] ANTHROPIC_API_KEY set (or plan to use MOCK_MODE)
- [ ] In project directory: `~/Documents/AI/Journey/microservices/microservices-daily-challenge/`
- [ ] PROBLEM.md and claude.md ready

## 🚀 Execution Steps

### 1. Setup (2 minutes)
```bash
cd ~/Documents/AI/Journey/microservices/microservices-daily-challenge
./setup.sh  # Or manually create day-02-ai-agent-swarm directory
cd day-02-ai-agent-swarm
```

### 2. Copy Files
```bash
# Copy PROBLEM.md and claude.md to current directory
cp /path/to/PROBLEM.md .
cp /path/to/claude.md .
```

### 3. Initialize Claude Code
```bash
claude init
```

### 4. Start Claude Code
```bash
# If you have API key:
export ANTHROPIC_API_KEY=your-key-here
claude run

# If testing without API key:
MOCK_MODE=true claude run
```

### 5. Monitor Progress
Watch Claude Code build all 6 services. Expected time: 50-70 minutes.

### 6. First Test (Mock Mode)
```bash
MOCK_MODE=true docker-compose up --build
```
Open http://localhost:3000 and test the form.

### 7. Real API Test
```bash
export ANTHROPIC_API_KEY=your-key-here
docker-compose restart
```
Test with resume builder example.

## 🎯 Success Indicators

✅ **After build:**
- All 6 services build without errors
- docker-compose up starts all containers
- All health endpoints return 200 OK

✅ **After testing:**
- Web UI loads and displays form
- Form submission triggers agent pipeline
- Activity feed shows real-time updates with emojis
- Agent disagreements visible
- Final report displays with all sections

✅ **Quality checks:**
- Mock mode works (no API key needed)
- Tests pass: `cd tests && npm test`
- README and RESULTS created

## 📊 Expected Metrics

**Build Time:** 50-70 minutes  
**Token Usage:** Target < 200k tokens (but Day 01 used 2.6M, so be prepared)  
**Cost:** Target < $10 (Day 01 was $8.21)  
**Services:** 6 (Web UI + Orchestrator + 4 Agents)  
**Code Lines:** ~1,200-1,500 (estimate)  
**Tests:** Should have integration tests

## 🐛 Common Issues & Fixes

### Issue: API Key Not Working
```bash
# Check if key is set in containers
docker exec day-02-ai-agent-swarm-orchestrator-1 env | grep ANTHROPIC

# If not found, check docker-compose.yml environment section
```

### Issue: SSE Not Streaming
```bash
# Test SSE endpoint directly
curl -N http://localhost:3001/analyze/test-session/stream

# Should see: Content-Type: text/event-stream
```

### Issue: Ports Already in Use
```bash
# Find what's using the port
lsof -i :3000

# Kill it or change ports in docker-compose.yml
```

### Issue: Services Crash Loop
```bash
# Check logs
docker-compose logs orchestrator
docker-compose logs architect-agent

# Common causes:
# - Missing dependencies in package.json
# - Syntax errors
# - Missing environment variables
```

## 📹 Recording Checklist

When ready to record for video:

1. **Clean start:**
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

2. **Screen setup:**
   - Browser: http://localhost:3000
   - Terminal: docker-compose logs -f

3. **Test data (use this):**
   ```
   Project: "AI-powered resume builder SaaS - users paste a job 
   description and upload their resume, AI rewrites and optimizes 
   the resume for that specific job, outputs a polished PDF"
   
   Skills: "React, Node.js, basic AWS"
   Budget: $150
   Users: 1000
   Team: Solo
   ```

4. **Capture:**
   - Form submission
   - Real-time activity feed
   - Agent disagreements
   - Final report

## 💰 Cost Tracking

**Claude Code Build:** $X.XX (track from API dashboard)  
**Testing (Mock Mode):** $0.00  
**Testing (Real API):** ~$0.15 (10 test runs)  
**Total:** Should be < $10

## ✅ Final Validation

Before declaring complete:
- [ ] All 6 services running
- [ ] Mock mode works
- [ ] Real API mode works
- [ ] Tests pass
- [ ] Documentation complete
- [ ] Video footage captured
- [ ] Cost under $10

## 📁 Files to Push to GitHub

```
day-02-ai-agent-swarm/
├── services/          # All 6 service directories
├── tests/            # Integration tests
├── docker-compose.yml
├── .env.example
├── .gitignore
├── PROBLEM.md
├── README.md
├── RESULTS.md
└── (claude.md - optional, don't need to push)
```

## 🎬 Next Steps After Completion

1. **Update GitHub:**
   ```bash
   git add day-02-ai-agent-swarm/
   git commit -m "Day 02: AI CTO Agent Swarm - Complete implementation"
   git push
   ```

2. **Edit video** (Day 02 will have different structure than Day 01)

3. **Prepare LinkedIn post** with lessons learned

4. **Plan Day 03** (series continues!)

---

**Quick Commands:**

```bash
# Start system
docker-compose up --build

# Stop system
docker-compose down

# Check logs
docker-compose logs -f

# Run tests
cd tests && npm test

# Clean everything
docker-compose down -v
```

---

**Remember:** The "wow factor" for Day 02 is watching AI agents debate each other in real-time!
