# AI CTO Agent Swarm - Build & Test

## Your Mission

Build a complete **AI CTO Agent Swarm** system from scratch based on the requirements in `PROBLEM.md`.

Read the full requirements from PROBLEM.md first, then build, test, and validate everything until all success criteria pass.

This is Day 02 of the Daily Microservices Challenge. Day 01 was successful (restaurant order system, $8.21, 42 minutes, 11/11 criteria passed). This challenge escalates complexity significantly.

---

## What You Need to Do

### 1. Read Requirements
- Read `PROBLEM.md` thoroughly
- Understand all 6 services (Web UI + Orchestrator + 4 Agent Services)
- Note the sequential agent pipeline architecture
- Understand the "challenge/debate" dynamic between agents

### 2. Build the System

Create all 6 services:

**Service 1: Web UI Service (Port 3000)**
- Single-page web application (HTML + CSS + JavaScript)
- Form for startup description input
- **Real-time activity feed** showing agent progress
- Server-Sent Events (SSE) connection to Orchestrator
- Final report display

**Service 2: Orchestrator Service (Port 3001)**
- Routes requests through 4 agents sequentially
- Manages session state and context accumulation
- Streams real-time updates via SSE
- Calls Claude Haiku for final synthesis
- SQLite for session storage

**Service 3: Architect Agent Service (Port 3002)**
- Analyzes startup requirements
- Calls Anthropic API (Claude Haiku)
- Returns structured tech stack recommendations

**Service 4: Security Agent Service (Port 3003)**
- Reviews Architect's recommendations
- Identifies security risks
- **May challenge/disagree with Architect**
- Calls Anthropic API (Claude Haiku)

**Service 5: Cost Agent Service (Port 3004)**
- Reviews Architect + Security recommendations
- Projects infrastructure costs
- **May challenge expensive recommendations**
- Calls Anthropic API (Claude Haiku)

**Service 6: DevOps Agent Service (Port 3005)**
- Reviews all previous agents
- Recommends deployment strategy
- **May push back on over-engineering**
- Calls Anthropic API (Claude Haiku)

**Important Architecture Notes:**
- Each agent receives ALL previous agents' outputs (context accumulation)
- The "challenge dynamic" happens naturally when agents see each other's work
- Use Claude Haiku (`claude-haiku-4-5-20251001`) for all agent API calls
- Orchestrator synthesis also uses Claude Haiku

### 3. Implement Critical Features

**A. Real-Time Updates (Server-Sent Events)**
- Web UI opens SSE connection to `/analyze/:sessionId/stream`
- Orchestrator pushes updates as each agent completes
- UI displays updates in real-time activity feed
- Include emoji indicators for each agent (🏗️ 🔒 💰 ⚙️)

**B. Sequential Pipeline with Context**
```
User Input
    ↓
Architect Agent (receives: User Input)
    ↓
Security Agent (receives: User Input + Architect Output)
    ↓
Cost Agent (receives: User Input + Architect + Security)
    ↓
DevOps Agent (receives: User Input + All Previous)
    ↓
Synthesis (receives: All Agent Outputs)
    ↓
Final Report
```

**C. Mock Mode for Testing**
- Support `MOCK_MODE=true` environment variable
- When in mock mode, agents return hardcoded responses instead of calling Anthropic API
- Include `mock-response.json` files in each agent service
- This allows testing without API key

### 4. Use Proper Tech Stack

**Required:**
- Node.js 18 + Express
- SQLite for session storage (no separate DB container)
- Server-Sent Events (SSE) for real-time updates
- Anthropic API (Claude Haiku)
- Docker + Docker Compose

**Web UI:**
- Plain HTML + CSS + JavaScript (no React/framework needed)
- Dark theme recommended
- EventSource API for SSE connection

### 5. Test Everything

**Step 1: Start the system**
```bash
docker-compose up --build
```

**Step 2: Test with mock mode first (no API key needed)**
```bash
MOCK_MODE=true docker-compose up --build
```

**Step 3: Open Web UI and test full flow**
```
http://localhost:3000
```

**Step 4: Test example from PROBLEM.md**
Use the AI resume builder example:
- Project: AI-powered resume builder SaaS
- Skills: React, Node.js, basic AWS
- Budget: $150
- Users: 1000
- Team: Solo

**Step 5: Verify agent pipeline**
- All 4 agents execute sequentially
- Each agent receives previous outputs
- Activity feed shows real-time updates
- Disagreements/challenges are visible
- Final report is synthesized

**Step 6: Test API endpoints directly**
```bash
# Start analysis
curl -X POST http://localhost:3001/analyze -H "Content-Type: application/json" -d '{"projectDescription":"test","techSkills":"test","monthlyBudget":100,"expectedUsers":1000,"teamSize":"solo"}'

# Stream updates (SSE)
curl -N http://localhost:3001/analyze/[sessionId]/stream

# Get final report
curl http://localhost:3001/analyze/[sessionId]/report
```

**Step 7: Run automated tests**
```bash
cd tests
npm install
npm test
```

### 6. Self-Heal & Iterate

**Expected Issues & How to Handle:**

**Issue 1: API Key Not Passed to Containers**
- Check docker-compose.yml environment variables
- Verify key is passed to Orchestrator and all Agent services
- Test with `docker exec` to verify env vars inside containers

**Issue 2: SSE Connection Fails**
- Check CORS headers on Orchestrator
- Verify `Content-Type: text/event-stream` header
- Test SSE endpoint with curl first

**Issue 3: Agents Can't Reach Each Other**
- Verify Docker network configuration
- Check service names in docker-compose
- Test with `docker-compose logs [service-name]`

**Issue 4: SQLite Permission Errors**
- Ensure proper volume mounting
- Check file permissions in container
- May need to create directory first

**General Debugging Approach:**
1. Check Docker logs: `docker-compose logs [service]`
2. Verify service health: `curl http://localhost:[port]/health`
3. Test individual components before integration
4. Use mock mode to isolate Anthropic API issues

**Keep iterating until:**
- ✅ All 6 services start successfully
- ✅ Web UI loads and displays form
- ✅ Form submission creates session
- ✅ All 4 agents execute sequentially
- ✅ Real-time updates appear in UI
- ✅ Final report is synthesized and displayed
- ✅ Tests pass in mock mode

### 7. Document Everything

**Create comprehensive README.md with:**
- Architecture diagram showing all 6 services
- Setup instructions (Docker + environment variables)
- How to run in mock mode vs real mode
- Web UI usage instructions
- API documentation with examples
- How to run tests
- Troubleshooting guide

**Create RESULTS.md documenting:**
- What works (list all features)
- What failed (if anything) and how you fixed it
- Architectural decisions you made
- Interesting observations (e.g., disagreements between agents)
- Performance metrics (how long did pipeline take?)
- Token usage and cost

---

## Success Criteria

You must achieve ALL of these:

1. [ ] All 6 services start via `docker-compose up --build`
2. [ ] Web UI accessible at http://localhost:3000
3. [ ] Can submit form and receive session ID
4. [ ] Orchestrator routes request through 4 agents sequentially
5. [ ] Each agent receives previous agents' outputs (context accumulation)
6. [ ] Real-time activity feed shows agent progress
7. [ ] Activity feed shows disagreements/challenges between agents
8. [ ] All 4 agent services successfully call Anthropic API (or use mock mode)
9. [ ] Final synthesis combines all agent outputs
10. [ ] Final report displays in Web UI with all sections
11. [ ] System works in MOCK_MODE without API key
12. [ ] Automated tests pass
13. [ ] Complete documentation (README + RESULTS)
14. [ ] Completed in single session

---

## Important Notes

**Budget Awareness:**
- Use Claude Haiku (NOT Sonnet) for agent API calls - it's 20x cheaper
- Each full analysis should cost ~$0.01-0.03
- Total Claude Code build should stay under $10

**Mock Mode is Critical:**
- Tests must run without API key
- Makes testing faster and cheaper
- Include realistic mock responses

**Real-Time Updates are Essential:**
- Users must WATCH agents work
- Not just "loading spinner → final result"
- This is the "wow factor" of the system

**Agent Disagreements Must Be Visible:**
- Security Agent should challenge Architect's choices
- Cost Agent should warn about expensive options
- DevOps Agent should push back on over-engineering
- These disagreements should appear in activity feed
- Final synthesis should resolve them

**Context Accumulation is Key:**
- Each agent gets richer context than previous
- DevOps Agent sees ALL previous work
- This creates natural disagreement opportunities

---

## Project Structure

Create this structure:
```
day-02-ai-agent-swarm/
├── services/
│   ├── web-ui/
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   ├── styles.css
│   │   │   └── app.js
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── orchestrator/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── architect-agent/
│   │   ├── server.js
│   │   ├── mock-response.json
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── security-agent/
│   │   ├── server.js
│   │   ├── mock-response.json
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── cost-agent/
│   │   ├── server.js
│   │   ├── mock-response.json
│   │   ├── package.json
│   │   └── Dockerfile
│   └── devops-agent/
│       ├── server.js
│       ├── mock-response.json
│       ├── package.json
│       └── Dockerfile
├── tests/
│   ├── integration.test.js
│   └── package.json
├── docker-compose.yml
├── .env.example
├── README.md
├── RESULTS.md
└── PROBLEM.md
```

---

## Tech Stack Guidance

**Use Node.js 18 throughout** - proven in Day 01

**For Web UI:**
- Express for serving static files
- Plain HTML/CSS/JS (no React needed)
- EventSource API for SSE
- Fetch API for form submission

**For Orchestrator:**
- Express
- SQLite3 package for session storage
- SSE middleware for streaming
- Anthropic SDK for synthesis API call

**For Agent Services:**
- Express
- Anthropic SDK (@anthropic-ai/sdk)
- Environment variable for mock mode
- JSON file for mock responses

**For Testing:**
- Jest
- Axios (for HTTP requests)
- Mock mode enabled by default in tests

---

## Example API Calls to Anthropic

**Agent Service Example:**
```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const message = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: systemPrompt + '\n\n' + JSON.stringify(inputContext)
  }]
});

const response = message.content[0].text;
```

**Remember:** Use Claude Haiku, NOT Sonnet!

---

## Start Here

1. ✅ Read PROBLEM.md completely
2. ✅ Understand the sequential pipeline architecture
3. ✅ Plan your service structure
4. ✅ Create docker-compose.yml with all 6 services
5. ✅ Build services one by one (start with Web UI, then Orchestrator)
6. ✅ Implement agent services (start with Architect)
7. ✅ Implement SSE streaming
8. ✅ Test the full pipeline
9. ✅ Add mock mode support
10. ✅ Write tests
11. ✅ Debug and fix any issues
12. ✅ Document everything

**Don't stop until the system works end-to-end!**

**Key Success Indicator:** When you submit the form, you should see agents working in real-time with visible disagreements, and get a comprehensive final report.

Good luck! Build something that shows AI agents collaborating and debating! 🚀
