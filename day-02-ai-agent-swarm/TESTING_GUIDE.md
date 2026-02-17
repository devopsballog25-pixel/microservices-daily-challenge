# Day 02: Testing & Validation Guide

## Overview

This guide helps you validate that the AI CTO Agent Swarm is working correctly after Claude Code builds it.

---

## Phase 1: Environment Verification (Before Starting)

### Check 1: Docker Running
```bash
docker info
```
**Expected:** Docker info displays without errors

### Check 2: Ports Available
```bash
# Check all required ports are free
lsof -i :3000  # Should be empty
lsof -i :3001  # Should be empty
lsof -i :3002  # Should be empty
lsof -i :3003  # Should be empty
lsof -i :3004  # Should be empty
lsof -i :3005  # Should be empty
```

### Check 3: API Key Set (for real mode)
```bash
echo $ANTHROPIC_API_KEY
```
**Expected:** Your API key displays (or skip if using mock mode)

---

## Phase 2: Build and Startup (5-10 minutes)

### Test 1: Build Without Errors
```bash
docker-compose build
```
**Success Criteria:**
- ✅ All 6 services build successfully
- ✅ No errors in build output
- ❌ If build fails: Check Dockerfiles, package.json files

### Test 2: Start All Services
```bash
docker-compose up
```
**Success Criteria:**
- ✅ All 6 containers start
- ✅ See "Server running on port..." for each service
- ✅ No crash loops
- ❌ If services restart: Check logs with `docker-compose logs [service-name]`

### Test 3: Health Checks
```bash
# Check all services are healthy
curl http://localhost:3000  # Web UI (should return HTML)
curl http://localhost:3001/health  # Orchestrator
curl http://localhost:3002/health  # Architect
curl http://localhost:3003/health  # Security
curl http://localhost:3004/health  # Cost
curl http://localhost:3005/health  # DevOps
```
**Success Criteria:**
- ✅ All endpoints respond with 200 OK
- ✅ Health endpoints return `{"status":"healthy"}`

---

## Phase 3: Mock Mode Testing (10-15 minutes)

Test the system without API key first.

### Test 4: Start in Mock Mode
```bash
MOCK_MODE=true docker-compose up --build
```

### Test 5: Web UI Loads
1. Open browser: http://localhost:3000
2. **Success Criteria:**
   - ✅ Page loads
   - ✅ Form displays with all fields
   - ✅ No console errors (check browser DevTools)

### Test 6: Submit Form (Mock Mode)
Fill in the form with test data:
```
Project Description: "Test project"
Tech Skills: "JavaScript"
Monthly Budget: 100
Expected Users: 1000
Team Size: Solo
```
Click "Get My Technical Strategy"

**Success Criteria:**
- ✅ Form submits successfully
- ✅ Activity feed appears
- ✅ Real-time updates show each agent working
- ✅ Agent messages display with emojis (🏗️ 🔒 💰 ⚙️)
- ✅ Disagreements/challenges visible in activity feed
- ✅ Final report displays after ~10-30 seconds
- ✅ Report contains all sections

**Example Expected Activity Feed:**
```
🏗️ Architect Agent is analyzing your requirements...
🏗️ Architect Agent recommends: Node.js + PostgreSQL + AWS
🔒 Security Agent is reviewing the architecture...
🔒 Security Agent DISAGREES: "Use Auth0 instead of building auth"
💰 Cost Agent is analyzing infrastructure costs...
💰 Cost Agent WARNING: "PostgreSQL costs $15/month, SQLite is free"
⚙️ DevOps Agent is planning deployment strategy...
⚙️ DevOps Agent PUSHES BACK: "Skip Kubernetes, use Render"
🧠 Synthesizer is building your final strategy...
✅ Your Technical Strategy is ready!
```

### Test 7: API Testing (Mock Mode)
```bash
# Start analysis
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectDescription": "AI-powered resume builder",
    "techSkills": "React, Node.js",
    "monthlyBudget": 150,
    "expectedUsers": 1000,
    "teamSize": "solo"
  }'

# Save the sessionId from response

# Stream updates (SSE)
curl -N http://localhost:3001/analyze/[sessionId]/stream

# Check status
curl http://localhost:3001/analyze/[sessionId]/status

# Get final report
curl http://localhost:3001/analyze/[sessionId]/report
```

**Success Criteria:**
- ✅ POST returns session ID
- ✅ Stream endpoint returns SSE events
- ✅ Status shows progression through states
- ✅ Final report is complete JSON

---

## Phase 4: Real API Testing (5-10 minutes)

Only run this if you have an Anthropic API key.

### Test 8: Real API Mode
```bash
# Set API key
export ANTHROPIC_API_KEY=your-key-here

# Start without mock mode
docker-compose up --build
```

### Test 9: Full Pipeline with Real API
Use the example from PROBLEM.md:
```
Project Description: "AI-powered resume builder SaaS - users paste a job 
description and upload their resume, AI rewrites and optimizes the resume 
for that specific job, outputs a polished PDF"

Tech Skills: "React, Node.js, basic AWS"
Monthly Budget: $150
Expected Users: 1000
Team Size: Solo
```

**Success Criteria:**
- ✅ All 4 agents make real API calls to Claude Haiku
- ✅ Responses are contextual and relevant (not generic)
- ✅ Security Agent identifies resume PII handling
- ✅ Cost Agent projects costs for AI API + PDF generation
- ✅ DevOps Agent recommends deployment platform
- ✅ Visible disagreements between agents
- ✅ Final synthesis resolves conflicts
- ✅ Complete in < 90 seconds

### Test 10: Verify Agent Disagreements
Check that agents actually challenge each other:

**Look for in activity feed:**
- Security Agent disagreeing with Architect's auth choice
- Cost Agent warning about expensive infrastructure
- DevOps Agent pushing back on complex deployment

**Example disagreements:**
```
Architect: "Build your own authentication"
Security: "Don't build auth - use Clerk or Auth0"

Architect: "Use PostgreSQL on AWS RDS"
Cost: "At 1,000 users, SQLite is sufficient and free"

Architect: "Deploy with Kubernetes"
DevOps: "Kubernetes is overkill - use Railway or Render"
```

---

## Phase 5: Automated Testing (5 minutes)

### Test 11: Run Test Suite
```bash
cd tests
npm install
npm test
```

**Success Criteria:**
- ✅ All tests pass
- ✅ Tests validate full pipeline
- ✅ Tests run in mock mode (no API key needed)
- ✅ No timeout errors

**Expected test coverage:**
- Session creation
- Agent pipeline execution
- Context accumulation
- Final report generation
- SSE streaming

---

## Phase 6: Edge Cases & Error Handling

### Test 12: Invalid Input Handling
```bash
# Empty project description
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectDescription": "",
    "techSkills": "React",
    "monthlyBudget": 100,
    "expectedUsers": 1000,
    "teamSize": "solo"
  }'
```
**Success Criteria:**
- ✅ Returns 400 Bad Request
- ✅ Provides helpful error message

### Test 13: Invalid Session ID
```bash
curl http://localhost:3001/analyze/invalid-session-id/status
```
**Success Criteria:**
- ✅ Returns 404 Not Found
- ✅ Doesn't crash service

### Test 14: API Key Missing (if not in mock mode)
```bash
# Unset API key
unset ANTHROPIC_API_KEY

# Try to start
docker-compose up
```
**Success Criteria:**
- ✅ Services start (don't crash immediately)
- ✅ When user submits form, see graceful error
- ✅ Error message suggests using MOCK_MODE=true

### Test 15: Service Failure Simulation
```bash
# Stop one agent service
docker stop day-02-ai-agent-swarm-architect-agent-1

# Try to submit analysis
# (via Web UI or API)
```
**Success Criteria:**
- ✅ Orchestrator detects failure
- ✅ Returns helpful error message
- ✅ Doesn't hang indefinitely

---

## Phase 7: Performance Validation

### Test 16: Response Times (Mock Mode)
```bash
time curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectDescription": "test",
    "techSkills": "test",
    "monthlyBudget": 100,
    "expectedUsers": 1000,
    "teamSize": "solo"
  }'
```
**Success Criteria:**
- ✅ Session created in < 1 second
- ✅ Full pipeline completes in < 30 seconds (mock mode)
- ✅ Full pipeline completes in < 90 seconds (real API mode)

### Test 17: Concurrent Requests
```bash
# Submit 3 analyses simultaneously
for i in {1..3}; do
  curl -X POST http://localhost:3001/analyze \
    -H "Content-Type: application/json" \
    -d "{
      \"projectDescription\": \"test $i\",
      \"techSkills\": \"test\",
      \"monthlyBudget\": 100,
      \"expectedUsers\": 1000,
      \"teamSize\": \"solo\"
    }" &
done
wait
```
**Success Criteria:**
- ✅ All 3 sessions created
- ✅ All 3 complete successfully
- ✅ No sessions interfere with each other

---

## Phase 8: Documentation Validation

### Test 18: README Completeness
Check that README.md includes:
- ✅ Architecture diagram (ASCII art or markdown)
- ✅ Service descriptions
- ✅ Setup instructions
- ✅ How to run (mock mode + real mode)
- ✅ API documentation
- ✅ Testing instructions
- ✅ Troubleshooting guide

### Test 19: RESULTS.md Completeness
Check that RESULTS.md includes:
- ✅ What works (detailed list)
- ✅ What failed (if anything) and how it was fixed
- ✅ Architectural decisions
- ✅ Agent disagreement examples
- ✅ Performance metrics
- ✅ Token usage and cost

---

## Success Criteria Summary

### Must Pass (All Required):
- [ ] ✅ All 6 services build and start
- [ ] ✅ Web UI loads and displays form
- [ ] ✅ Form submission creates session
- [ ] ✅ All 4 agents execute sequentially
- [ ] ✅ Real-time activity feed shows agent progress
- [ ] ✅ Agent disagreements visible in activity feed
- [ ] ✅ Final report displays with all sections
- [ ] ✅ System works in mock mode (no API key)
- [ ] ✅ Automated tests pass
- [ ] ✅ Documentation complete (README + RESULTS)

### Should Pass (Quality Indicators):
- [ ] ✅ Real API mode works with Claude Haiku
- [ ] ✅ Agent responses are contextual (not generic)
- [ ] ✅ Error handling is graceful
- [ ] ✅ Performance meets targets (< 90 sec full pipeline)
- [ ] ✅ Concurrent requests handled correctly

---

## Troubleshooting Common Issues

### Issue 1: Services Won't Start
```bash
# Check Docker logs
docker-compose logs

# Check specific service
docker-compose logs orchestrator
```
**Common causes:**
- Port conflicts
- Missing environment variables
- Syntax errors in code

### Issue 2: SSE Connection Fails
```bash
# Test SSE endpoint directly
curl -N http://localhost:3001/analyze/test-session/stream
```
**Common causes:**
- Missing Content-Type header
- CORS issues
- Orchestrator not sending events

### Issue 3: Agents Don't Call API
**Common causes:**
- API key not passed to containers
- Wrong model name
- MOCK_MODE accidentally enabled

### Issue 4: No Agent Disagreements
**Common causes:**
- Agents not receiving previous outputs
- System prompts too generic
- Not enough context passed

---

## Recording for Video

When running the final test for recording:

1. **Start with clean slate:**
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

2. **Open browser side-by-side with terminal**

3. **Use the resume builder example** (it generates good disagreements)

4. **Capture:**
   - Form submission
   - Real-time activity feed
   - Agent disagreements appearing
   - Final report display

5. **Terminal recording:** Show docker-compose logs with agent activity

---

## Cost Tracking

### Mock Mode: $0
No API calls made

### Real API Mode (per analysis):
- Architect Agent: ~$0.003
- Security Agent: ~$0.003
- Cost Agent: ~$0.003
- DevOps Agent: ~$0.003
- Synthesis: ~$0.003
**Total per analysis: ~$0.015**

**Testing budget:**
- 10 test runs: ~$0.15
- Should easily stay under $10 total

---

## Final Validation Checklist

Before declaring Day 02 complete:

- [ ] Ran all 19 tests above
- [ ] All critical tests pass
- [ ] Recorded demo video footage
- [ ] README.md is comprehensive
- [ ] RESULTS.md documents everything
- [ ] Committed code to Git (optional)
- [ ] Ready to push to GitHub

---

**Once all tests pass, Day 02 is COMPLETE!** 🎉
