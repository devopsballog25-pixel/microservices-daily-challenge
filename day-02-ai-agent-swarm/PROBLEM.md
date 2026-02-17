# Day 02: AI CTO Agent Swarm — Multi-Agent Technical Strategy Advisor

## Problem Context

Solo startup founders face a critical disadvantage: **they make high-stakes technical decisions alone.**

- A fractional CTO costs **$5,000-$15,000/month** — out of reach for bootstrapped founders
- Asking a single AI gives a **generic, surface-level answer** that tries to cover everything and covers nothing deeply
- Friends and online forums give **biased, incomplete advice** based on personal preference, not the founder's specific situation
- Bad early technical decisions (wrong database, wrong hosting, ignored security) **cost months of rework** later

**The core limitation:** When one person (or one AI prompt) analyzes a problem, blind spots go unchallenged. There's no devil's advocate. No cost analyst pushing back on the architect's expensive preferences. No security expert catching what the DevOps person overlooked.

**The solution:** A system of specialized AI agents that analyze a startup's technical needs from different perspectives, **challenge each other's recommendations**, and produce a comprehensive technical strategy that's been stress-tested through structured disagreement.

This is not a single AI answering a question. This is **a team of AI agents collaborating, debating, and synthesizing** — built as a microservices system.

---

## System Requirements

Build an **AI CTO Agent Swarm** with 5 microservices: a web UI, an orchestrator, and 4 specialized AI advisor agents that work sequentially, each building on and challenging the previous agents' outputs.

### How the System Works (End-to-End Flow)

```
1. User opens Web UI in browser
2. Fills out a form describing their startup:
   - What they're building
   - Their technical skills
   - Monthly infrastructure budget
   - Expected users in 6 months
   - Solo or team
3. Hits "Get My Technical Strategy"
4. Orchestrator receives the request and routes it through 4 agents SEQUENTIALLY:

   Step 1: Architect Agent analyzes requirements
           → Recommends tech stack, database, hosting, architecture
   
   Step 2: Security Agent reviews Architect's plan
           → Identifies security requirements
           → May DISAGREE with Architect's choices
   
   Step 3: Cost Agent reviews Architect + Security recommendations  
           → Projects infrastructure costs at current and 3x scale
           → May CHALLENGE expensive recommendations
   
   Step 4: DevOps Agent reviews ALL previous agents
           → Recommends deployment, CI/CD, monitoring
           → May PUSH BACK on over-engineering

   Step 5: Orchestrator synthesizes all agent outputs
           → Resolves disagreements
           → Produces final technical strategy report

5. Web UI shows agent activity in REAL-TIME as each agent works
6. Final report displayed with all sections
```

**CRITICAL:** Each agent receives ALL previous agents' outputs. This is what creates natural disagreement — the Security Agent can say "The Architect recommended rolling your own auth, but I strongly disagree. Use Auth0 or Clerk free tier instead." The Cost Agent can say "The Architect's PostgreSQL recommendation costs $15/month. At your scale, SQLite is free and sufficient."

---

### Service 1: Web UI Service (Port 3000)
**Responsibility:** Provide the user-facing interface

**Features:**
- Single-page web application (HTML + CSS + JavaScript — no React framework needed)
- Input form with fields for startup description
- Real-time activity feed showing agent progress (using Server-Sent Events)
- Final report display with all sections
- Clean, professional design (dark theme with colored agent indicators)

**Form Fields:**
```
- Project Description (textarea): "What are you building?"
- Tech Skills (text): "Your technical skills (e.g., React, Python, AWS)"  
- Budget (number): "Monthly infrastructure budget in USD"
- Expected Users (number): "Expected users in 6 months"
- Team Size (select): "Solo" / "2-3 people" / "4-6 people"
```

**Real-Time Activity Feed:**
The UI must show a scrolling feed as agents work, displaying messages like:
```
🏗️ Architect Agent is analyzing your requirements...
🏗️ Architect Agent recommends: React + FastAPI + PostgreSQL
🔒 Security Agent is reviewing the architecture...
🔒 Security Agent DISAGREES: "Don't roll your own auth — use Clerk free tier"
💰 Cost Agent is analyzing infrastructure costs...
💰 Cost Agent WARNING: "At 1,000 users, API costs alone will be $50/month"
⚙️ DevOps Agent is planning deployment strategy...
⚙️ DevOps Agent PUSHES BACK: "Skip Kubernetes. Use Railway or Render."
🧠 Synthesizer is building your final strategy...
✅ Your Technical Strategy is ready!
```

**How to implement real-time updates:**
- **Preferred:** Server-Sent Events (SSE) — the Web UI opens an SSE connection to the Orchestrator and receives updates as each agent completes
- **Acceptable fallback:** Polling every 2 seconds to check for new agent outputs
- The key requirement is that the user WATCHES the agents work, not just waits for a final result

**Endpoints:**
- `GET /` — Serve the web application
- Static file serving for HTML/CSS/JS

---

### Service 2: Orchestrator Service (Port 3001)
**Responsibility:** Manage the agent pipeline, route requests, stream updates, and synthesize the final report

**Features:**
- Receive startup analysis requests from Web UI
- Generate unique session IDs for each request
- Route through agents SEQUENTIALLY (Architect → Security → Cost → DevOps)
- Accumulate context: each agent receives the original input PLUS all previous agent outputs
- Stream progress updates to Web UI via SSE (or provide polling endpoint)
- After all agents complete, synthesize a final report that resolves disagreements
- The synthesis step should call the Anthropic API (Claude Haiku) with ALL agent outputs and produce a cohesive final strategy

**Endpoints:**
- `POST /analyze` — Start a new analysis session (receives form data, returns session ID)
- `GET /analyze/:sessionId/stream` — SSE endpoint streaming real-time agent updates
- `GET /analyze/:sessionId/status` — Get current session status (polling fallback)
- `GET /analyze/:sessionId/report` — Get final synthesized report
- `GET /health` — Health check

**Session States:**
```
pending → architect_working → security_working → cost_working → devops_working → synthesizing → completed
```

---

### Service 3: Architect Agent Service (Port 3002)
**Responsibility:** Analyze requirements and recommend technical architecture

**Features:**
- Receive startup description and founder context
- Call Anthropic API (Claude Haiku: `claude-haiku-4-5-20251001`) to generate architectural analysis
- Return structured recommendations

**What this agent must analyze and recommend:**
- Programming language and framework choice (with reasoning tied to founder's skills)
- Database selection (with reasoning tied to data model and scale)
- Hosting/infrastructure platform recommendation
- High-level architecture approach (monolith vs microservices vs modular monolith)
- Key third-party services to use vs build

**Agent System Prompt (use this or similar when calling the Anthropic API):**
```
You are a Senior Software Architect advising a startup founder. 
Analyze their project and provide specific, opinionated technical recommendations.
Don't hedge — make clear choices and explain WHY for their specific situation.
Consider their skill level, budget, expected scale, and team size.
Format your response as structured JSON with sections: 
techStack, database, hosting, architecture, thirdPartyServices, reasoning.
```

**Endpoints:**
- `POST /analyze` — Receive context, call Claude Haiku, return architectural analysis
- `GET /health` — Health check

**Input:** Original user form data
**Output:** Structured JSON with tech stack recommendations + reasoning

---

### Service 4: Security Agent Service (Port 3003)
**Responsibility:** Review architecture for security concerns and requirements

**Features:**
- Receive user context AND Architect Agent's output
- Call Anthropic API (Claude Haiku) to perform security analysis
- **Explicitly review and potentially challenge the Architect's recommendations**
- Categorize security requirements into "must-have at launch" vs "can wait"

**What this agent must analyze:**
- Authentication/authorization approach (may disagree with Architect)
- Data protection requirements (especially if handling PII)
- Security risks specific to the proposed architecture
- Compliance considerations (GDPR, etc.)
- Priority ranking: what to secure first vs what can wait

**Agent System Prompt:**
```
You are a Security Advisor reviewing a proposed startup architecture.
You have received the Architect's recommendations. Your job is to:
1. Identify security requirements and risks for this specific project
2. Explicitly CHALLENGE any architectural choices that create security risks
3. Separate "must-have at launch" from "nice-to-have later" security measures
4. If the Architect recommended building something that has security implications 
   (like auth), recommend proven third-party alternatives instead
Be specific and opinionated. Don't just list generic security advice.
Reference the Architect's specific recommendations when you agree or disagree.
Format as JSON: mustHaveAtLaunch, canWaitUntilLater, architectDisagreements, reasoning.
```

**Endpoints:**
- `POST /analyze` — Receive context + architect output, return security analysis
- `GET /health` — Health check

**Input:** Original user form data + Architect's full output
**Output:** Structured JSON with security analysis, disagreements highlighted

---

### Service 5: Cost Agent Service (Port 3004)
**Responsibility:** Analyze infrastructure costs and challenge expensive recommendations

**Features:**
- Receive user context AND all previous agent outputs (Architect + Security)
- Call Anthropic API (Claude Haiku) to perform cost analysis
- Project costs at current expected scale AND at 3x growth
- **Identify cheaper alternatives where previous agents recommended expensive options**
- Flag potential hidden costs (API calls, data transfer, storage growth)

**What this agent must analyze:**
- Monthly infrastructure cost projection (hosting, database, cache, CDN, etc.)
- Cost per user at current scale and at 3x scale
- Third-party service costs (auth provider, email, monitoring, AI API costs if applicable)
- Revenue model viability: can the founder's pricing cover these costs?
- Cheaper alternatives to any expensive recommendations from previous agents

**Agent System Prompt:**
```
You are a Cost Analyst reviewing a startup's technical plan.
You have the Architect's tech stack and Security's requirements.
Your job is to:
1. Project realistic monthly infrastructure costs at their expected scale
2. Project costs at 3x their expected scale (growth scenario)
3. CHALLENGE any expensive recommendations — suggest cheaper alternatives
4. Flag hidden costs they haven't considered (data transfer, API limits, etc.)
5. Give a verdict: can their stated budget handle this plan?
Be brutally honest about costs. Founders need reality checks, not optimism.
Format as JSON: currentScaleCosts, growthScaleCosts, cheaperAlternatives, 
hiddenCosts, budgetVerdict, reasoning.
```

**Endpoints:**
- `POST /analyze` — Receive context + all previous outputs, return cost analysis
- `GET /health` — Health check

**Input:** Original user form data + Architect's output + Security's output
**Output:** Structured JSON with cost projections and challenges

---

### Service 6: DevOps Agent Service (Port 3005)
**Responsibility:** Recommend deployment strategy and push back on over-engineering

**Features:**
- Receive user context AND all previous agent outputs
- Call Anthropic API (Claude Haiku) to generate DevOps recommendations
- **Push back on over-engineering for the founder's current stage**
- Recommend appropriate CI/CD, monitoring, and deployment approaches

**What this agent must analyze:**
- Deployment platform recommendation (considering budget from Cost Agent)
- CI/CD pipeline approach (appropriate for team size)
- Monitoring and logging strategy (what to set up now vs later)
- Scaling strategy: what to do when they outgrow initial setup
- **Complexity check: is the Architect's architecture too complex for the team size?**

**Agent System Prompt:**
```
You are a DevOps Advisor reviewing a startup's complete technical plan.
You have all previous agents' recommendations. Your job is to:
1. Recommend a deployment strategy appropriate for their team size and budget
2. PUSH BACK on any over-engineering — if they're a solo founder, 
   they don't need Kubernetes, microservices, or complex CI/CD
3. Recommend the simplest deployment that works at their scale
4. Plan for growth: what should they migrate to at 2x, 5x, 10x current scale
5. Identify what monitoring/logging is essential vs overkill at their stage
Be pragmatic. Favor simplicity. A solo founder's biggest risk is complexity, not scale.
Format as JSON: deploymentStrategy, cicd, monitoring, scalingPlan, 
complexityWarnings, reasoning.
```

**Endpoints:**
- `POST /analyze` — Receive context + all previous outputs, return DevOps analysis
- `GET /health` — Health check

**Input:** Original user form data + all previous agents' outputs
**Output:** Structured JSON with DevOps recommendations and complexity warnings

---

## Anthropic API Integration

### CRITICAL: How to Call the Anthropic API from Agent Services

Each agent service calls the Anthropic API to generate its analysis. Here's exactly how:

**API Endpoint:** `https://api.anthropic.com/v1/messages`

**Model to use:** `claude-haiku-4-5-20251001` (fast and cheap — essential for budget)

**Example API call (Node.js):**
```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: "Your agent system prompt here...",
    messages: [
      { role: 'user', content: JSON.stringify(inputContext) }
    ]
  })
});
const data = await response.json();
const agentOutput = data.content[0].text;
```

**Example API call (Python with requests):**
```python
import requests
import os

response = requests.post(
    'https://api.anthropic.com/v1/messages',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': os.environ['ANTHROPIC_API_KEY'],
        'anthropic-version': '2023-06-01'
    },
    json={
        'model': 'claude-haiku-4-5-20251001',
        'max_tokens': 2048,
        'system': 'Your agent system prompt here...',
        'messages': [
            {'role': 'user', 'content': json.dumps(input_context)}
        ]
    }
)
agent_output = response.json()['content'][0]['text']
```

**API Key Configuration:**
- Pass the API key via environment variable `ANTHROPIC_API_KEY`
- In docker-compose.yml, pass it from the host: `ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}`
- The user must set this environment variable before running docker-compose
- **NEVER hardcode the API key**

**Cost Control:**
- Use `claude-haiku-4-5-20251001` (NOT Sonnet or Opus — too expensive)
- Set `max_tokens: 2048` per agent call (sufficient for detailed analysis)
- Total per analysis: 5 API calls (4 agents + 1 synthesis) ≈ $0.01-0.03

---

## Technical Requirements

### Data Storage
- **SQLite** for storing session data and agent outputs (simple, no separate database container needed)
- Each session stores: input form data, each agent's output, final synthesized report, timestamps

### Communication
- Services communicate via **REST APIs** (Orchestrator calls each Agent service)
- Web UI receives updates via **Server-Sent Events (SSE)** from Orchestrator
- Fallback: polling endpoint if SSE implementation is problematic
- All endpoints return JSON
- Proper HTTP status codes (200, 201, 404, 500, etc.)

### Containerization
- **Docker** containers for each service (6 containers total: UI + Orchestrator + 4 Agents)
- **Docker Compose** for orchestration
- `ANTHROPIC_API_KEY` passed as environment variable to all agent services
- Health checks for each service
- No external database containers needed (SQLite is file-based)

### Testing
- **Integration tests** demonstrating the full agent pipeline
- Test that each agent service responds correctly when called directly
- Test that the orchestrator routes through all agents sequentially
- Test that the final report contains all expected sections
- Tests should use a **mock mode** for Anthropic API calls (to avoid API costs during testing)
  - Each agent service should support a `MOCK_MODE=true` environment variable
  - In mock mode, agents return realistic pre-written responses instead of calling the API
  - This allows tests to validate the pipeline without spending money

---

## Success Criteria

Your implementation will be considered successful if:

### Infrastructure (it runs)
- [ ] All services start successfully via `docker-compose up --build`
- [ ] Web UI loads in a browser at `http://localhost:3000` and displays the input form
- [ ] User can submit a startup description through the form

### Agent Pipeline (the swarm works)
- [ ] Orchestrator routes the request through all 4 agents sequentially
- [ ] Each agent produces meaningful, context-aware output (not generic filler)
- [ ] At least one agent explicitly references and challenges a previous agent's recommendation (this is visible in the agent output)
- [ ] Web UI shows real-time agent progress as each agent works (SSE or polling updates)

### Output Quality (the result is valuable)
- [ ] Final synthesized report resolves agent disagreements into a cohesive strategy
- [ ] Final report includes ALL of: tech stack recommendation, architecture approach, cost projection, security checklist, and phased roadmap

### Robustness
- [ ] Automated tests pass (using mock mode for API calls)
- [ ] Self-healing: any errors encountered during build/test are identified and resolved without human intervention
- [ ] README includes: architecture diagram, setup instructions, API documentation, how to run tests

### Constraints  
- [ ] Completed in a single session
- [ ] Total API cost under $10

---

## Project Structure

Expected directory layout:
```
day-02-ai-cto-swarm/
├── services/
│   ├── web-ui/
│   │   ├── public/
│   │   │   ├── index.html      # Main web page
│   │   │   ├── style.css       # Styling
│   │   │   └── app.js          # Frontend JavaScript (SSE handling, form, display)
│   │   ├── server.js           # Static file server
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── orchestrator/
│   │   ├── server.js           # Pipeline management, SSE streaming, synthesis
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── architect-agent/
│   │   ├── server.js           # Architect analysis + Anthropic API call
│   │   ├── mock-response.json  # Mock response for testing
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── security-agent/
│   │   ├── server.js           # Security analysis + Anthropic API call
│   │   ├── mock-response.json  # Mock response for testing
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── cost-agent/
│   │   ├── server.js           # Cost analysis + Anthropic API call
│   │   ├── mock-response.json  # Mock response for testing
│   │   ├── package.json
│   │   └── Dockerfile
│   └── devops-agent/
│       ├── server.js           # DevOps analysis + Anthropic API call
│       ├── mock-response.json  # Mock response for testing
│       ├── package.json
│       └── Dockerfile
├── tests/
│   ├── integration.test.js     # Full pipeline test (mock mode)
│   └── package.json
├── docker-compose.yml          # Container orchestration
├── README.md                   # Complete documentation
├── RESULTS.md                  # Implementation results
└── PROBLEM.md                  # This file
```

---

## Constraints & Preferences

### Tech Stack
- **Language:** Node.js preferred (proven in Day 01), Python acceptable
- **Framework:** Express for all services (lightweight, fast to build)
- **Database:** SQLite for session storage (no separate DB container needed)
- **AI API:** Anthropic API with Claude Haiku model
- **Real-time:** Server-Sent Events (SSE) preferred, polling acceptable as fallback

### Quality Standards
- Clean, readable code with comments where needed
- Proper error handling (don't crash on invalid input or API failures)
- Logging for debugging (agent started, agent completed, errors, API call status)
- Environment variables for configuration (ports, API keys, mock mode)
- Graceful handling of Anthropic API errors (timeout, rate limit, invalid key)

### Performance
- Form submission should respond immediately with session ID
- Each agent should complete within 15 seconds
- Full pipeline (4 agents + synthesis) should complete within 90 seconds
- Web UI should update within 1 second of each agent completing

---

## Testing the System

### Example Usage Flow

**Step 1: Set your Anthropic API key**
```bash
export ANTHROPIC_API_KEY=your-api-key-here
```

**Step 2: Start the system**
```bash
docker-compose up --build
```

**Step 3: Open Web UI**
```
Open http://localhost:3000 in your browser
```

**Step 4: Submit a startup for analysis**

Fill in the form with this example:
```
Project: "AI-powered resume builder SaaS - users paste a job description and 
upload their resume, AI rewrites and optimizes the resume for that specific 
job, outputs a polished PDF"

Tech Skills: "React, Node.js, basic AWS"
Monthly Budget: $150
Expected Users (6 months): 1000
Team Size: Solo
```

**Step 5: Watch the agents work**

The activity feed should show each agent analyzing, with visible disagreements like:
- Architect recommends PostgreSQL → Cost Agent suggests SQLite is sufficient at 1,000 users
- Architect suggests building PDF generation → DevOps pushes back, recommends a third-party service
- Security Agent flags PII handling for resumes (names, addresses, work history)
- Cost Agent warns about AI API costs per resume generation

**Step 6: Review the final report**

The synthesized report should include:
- Recommended tech stack with reasoning
- Architecture approach
- Monthly cost projection
- Security checklist (must-have vs can-wait)
- Phased roadmap (Month 1, Month 3, Month 6)

### API Testing (without Web UI)

```bash
# 1. Start an analysis
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectDescription": "AI-powered resume builder SaaS - users paste a job description and upload their resume, AI rewrites and optimizes the resume for that specific job, outputs a polished PDF",
    "techSkills": "React, Node.js, basic AWS",
    "monthlyBudget": 150,
    "expectedUsers": 1000,
    "teamSize": "solo"
  }'

# Response: {"sessionId": "sess-abc123", "status": "pending"}

# 2. Stream agent updates (SSE)
curl -N http://localhost:3001/analyze/sess-abc123/stream

# 3. Check status (polling alternative)
curl http://localhost:3001/analyze/sess-abc123/status

# 4. Get final report (after completion)
curl http://localhost:3001/analyze/sess-abc123/report

# 5. Check individual agent health
curl http://localhost:3002/health  # Architect
curl http://localhost:3003/health  # Security
curl http://localhost:3004/health  # Cost
curl http://localhost:3005/health  # DevOps
```

### Running Tests (Mock Mode)

```bash
cd tests
npm install
npm test
```

Tests run with `MOCK_MODE=true` so no Anthropic API key is needed for testing.

---

## Evaluation Metrics

Your solution will be evaluated on:

1. **Completeness:** All 6 services implemented and working (UI + Orchestrator + 4 Agents)
2. **Agent Pipeline:** Agents execute sequentially with context accumulation
3. **Agent Interaction:** Visible disagreements/challenges between agents
4. **Real-Time UI:** User can watch agents work, not just wait for results
5. **Output Quality:** Final report is cohesive, actionable, and resolves disagreements
6. **Architecture:** Clean service boundaries, proper separation of concerns
7. **Code Quality:** Readable, maintainable code with proper error handling
8. **Documentation:** Clear README with setup instructions and architecture diagram
9. **Testing:** Tests validate the pipeline end-to-end using mock mode
10. **Self-Healing:** Errors during build/test are resolved autonomously

---

## Budget Constraint

- **Claude Code Token Budget:** Aim to complete under $10 total API cost
- **Inner Agent API Costs:** Use Claude Haiku to keep costs minimal (~$0.01-0.03 per full analysis run)
- **Time Budget:** Complete in single session (no multi-day work)

---

## Key Lesson from Day 01

Day 01 encountered a database initialization error — Claude Code self-healed by detecting the error, running the fix, and restarting services. This self-healing capability is expected in Day 02 as well.

**Specific things that might need self-healing in this project:**
- API key not being passed through Docker environment correctly
- SSE connection issues between UI and Orchestrator  
- Agent services failing to parse API responses
- Port conflicts between 6 services
- SQLite file permissions in Docker containers

If you encounter ANY errors, debug them systematically and fix them. Don't move on until each component works.

---

## What Makes This Different from Day 01

| Aspect | Day 01 (Restaurant Orders) | Day 02 (AI CTO Swarm) |
|--------|---------------------------|----------------------|
| Core pattern | CRUD + state machine | AI agent orchestration |
| Services | 4 | 6 |
| External APIs | None | Anthropic API (Claude Haiku) |
| User interface | API only (curl) | Web UI with real-time feed |
| Data flow | Linear pipeline | Sequential with context accumulation |
| Real-time updates | None | SSE streaming to browser |
| Testing approach | Direct API calls | Mock mode for external API |
| "Wow" factor | "It works" | "They're debating each other" |

---

Good luck! Build a system that gives every solo founder a free CTO team. 🚀
