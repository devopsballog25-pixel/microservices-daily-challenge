# AI CTO Agent Swarm - Multi-Agent Technical Strategy Advisor

A microservices system where specialized AI agents collaborate, debate, and produce comprehensive technical strategies for startup founders.

## 🎯 What This Does

Give the system your startup idea, budget, and skills. Four specialized AI agents analyze your needs:

1. **🏗️ Architect Agent** - Recommends tech stack, database, hosting
2. **🔒 Security Agent** - Reviews architecture, challenges risky choices
3. **💰 Cost Agent** - Projects costs, suggests cheaper alternatives
4. **⚙️ DevOps Agent** - Plans deployment, pushes back on over-engineering

They don't just analyze independently — they **challenge each other's recommendations**. The Security Agent might disagree with the Architect. The Cost Agent might find cheaper alternatives. The DevOps Agent might warn about over-engineering.

You watch them work in real-time, then get a synthesized technical strategy that's been stress-tested through structured disagreement.

## 🏗️ Architecture

```
┌─────────────┐
│   Web UI    │  Port 3000 - User interface with real-time updates
│  (Browser)  │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Orchestrator                                │
│  Port 3001 - Manages pipeline, SSE streaming, synthesis         │
└────┬────────────┬────────────┬────────────┬──────────────────┘
     │            │            │            │
     ↓            ↓            ↓            ↓
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│Architect│  │Security │  │  Cost   │  │ DevOps  │
│  Agent  │  │  Agent  │  │  Agent  │  │  Agent  │
│  :3002  │  │  :3003  │  │  :3004  │  │  :3005  │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
     │            │            │            │
     └────────────┴────────────┴────────────┘
                   │
                   ↓
            Claude Haiku API
        (Each agent + synthesis)
```

**Sequential Pipeline with Context Accumulation:**
```
User Input
    ↓
Architect (receives: User Input)
    ↓
Security (receives: User Input + Architect Output)
    ↓
Cost (receives: User Input + Architect + Security)
    ↓
DevOps (receives: User Input + All Previous)
    ↓
Synthesis (receives: All Outputs)
    ↓
Final Report
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Anthropic API key (get from [console.anthropic.com](https://console.anthropic.com/))
- Node.js 18+ (for local development)

### Setup

1. **Clone and navigate to project:**
   ```bash
   cd day-02-ai-agent-swarm
   ```

2. **Set your Anthropic API key:**
   ```bash
   export ANTHROPIC_API_KEY=your-api-key-here
   ```

3. **Start the system:**
   ```bash
   docker-compose up --build
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

### Testing Without API Key (Mock Mode)

To test the system without using the Anthropic API:

```bash
MOCK_MODE=true docker-compose up --build
```

In mock mode, agents return realistic pre-written responses instead of calling Claude Haiku.

## 📝 Usage

### Web UI

1. Open `http://localhost:3000`
2. Fill in the form:
   - What you're building
   - Your technical skills
   - Monthly budget
   - Expected users in 6 months
   - Team size
3. Click "Get My Technical Strategy"
4. Watch agents work in real-time
5. Review your comprehensive technical strategy

### Example Input

Try this example (from the problem statement):

```
Project: AI-powered resume builder SaaS - users paste a job description and upload their resume, AI rewrites and optimizes the resume for that specific job, outputs a polished PDF

Tech Skills: React, Node.js, basic AWS
Monthly Budget: $150
Expected Users: 1000
Team Size: Solo
```

Expected behavior:
- Architect recommends PostgreSQL → Cost Agent suggests SQLite
- Architect suggests GPT-4 → Cost Agent recommends GPT-3.5-Turbo
- Security Agent flags PII concerns
- DevOps Agent warns about over-engineering

## 🔌 API Documentation

### Orchestrator Service (Port 3001)

#### POST /analyze
Start a new analysis session.

**Request:**
```json
{
  "projectDescription": "What you're building...",
  "techSkills": "React, Node.js, AWS",
  "monthlyBudget": 150,
  "expectedUsers": 1000,
  "teamSize": "solo"
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "status": "pending"
}
```

#### GET /analyze/:sessionId/stream
Server-Sent Events (SSE) stream of agent updates.

**Events:**
- `connected` - Connection established
- `update` - Agent progress update
- `complete` - Analysis finished
- `error` - Error occurred

**Example (curl):**
```bash
curl -N http://localhost:3001/analyze/SESSION_ID/stream
```

#### GET /analyze/:sessionId/status
Polling endpoint for session status (SSE fallback).

**Response:**
```json
{
  "sessionId": "uuid",
  "status": "architect_working" | "completed" | "error"
}
```

#### GET /analyze/:sessionId/report
Get full analysis report after completion.

**Response:**
```json
{
  "sessionId": "uuid",
  "status": "completed",
  "input": { ... },
  "agents": {
    "architect": { ... },
    "security": { ... },
    "cost": { ... },
    "devops": { ... }
  },
  "finalReport": {
    "summary": "...",
    "techStack": "...",
    "architecture": "...",
    "security": "...",
    "costs": "...",
    "deployment": "...",
    "phasedRoadmap": { ... },
    "keyDisagreements": [ ... ],
    "finalVerdict": "..."
  }
}
```

### Agent Services (Ports 3002-3005)

Each agent service has the same interface:

#### POST /analyze
Analyze input and produce recommendations.

**Request:**
```json
{
  "projectDescription": "...",
  "techSkills": "...",
  "monthlyBudget": 150,
  "expectedUsers": 1000,
  "teamSize": "solo",
  "architectOutput": { ... },      // For Security, Cost, DevOps
  "securityOutput": { ... },       // For Cost, DevOps
  "costOutput": { ... }            // For DevOps
}
```

**Response:**
```json
{
  "agent": "architect" | "security" | "cost" | "devops",
  "status": "completed",
  "output": { ... }
}
```

#### GET /health
Health check endpoint.

## 🧪 Running Tests

### Automated Integration Tests

```bash
cd tests
npm install
npm test
```

Tests verify:
- All services start and respond
- Agent pipeline executes sequentially
- Each agent produces output
- Agents challenge each other's recommendations
- Final report synthesizes all outputs

### Manual Testing

```bash
# 1. Start an analysis
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectDescription": "AI resume builder",
    "techSkills": "React, Node.js",
    "monthlyBudget": 150,
    "expectedUsers": 1000,
    "teamSize": "solo"
  }'

# Response: {"sessionId": "uuid", "status": "pending"}

# 2. Stream updates (SSE)
curl -N http://localhost:3001/analyze/SESSION_ID/stream

# 3. Get final report
curl http://localhost:3001/analyze/SESSION_ID/report

# 4. Check individual agent health
curl http://localhost:3002/health  # Architect
curl http://localhost:3003/health  # Security
curl http://localhost:3004/health  # Cost
curl http://localhost:3005/health  # DevOps
```

## 🛠️ Development

### Project Structure

```
day-02-ai-agent-swarm/
├── services/
│   ├── web-ui/              # Frontend (HTML/CSS/JS)
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   ├── styles.css
│   │   │   └── app.js
│   │   ├── server.js
│   │   └── Dockerfile
│   ├── orchestrator/        # Pipeline manager
│   │   ├── server.js
│   │   └── Dockerfile
│   ├── architect-agent/     # Tech stack recommendations
│   │   ├── server.js
│   │   ├── mock-response.json
│   │   └── Dockerfile
│   ├── security-agent/      # Security analysis
│   │   ├── server.js
│   │   ├── mock-response.json
│   │   └── Dockerfile
│   ├── cost-agent/          # Cost projections
│   │   ├── server.js
│   │   ├── mock-response.json
│   │   └── Dockerfile
│   └── devops-agent/        # Deployment strategy
│       ├── server.js
│       ├── mock-response.json
│       └── Dockerfile
├── tests/
│   ├── integration.test.js
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

### Tech Stack

- **Runtime:** Node.js 18
- **Web Framework:** Express
- **Database:** SQLite (embedded, no separate container)
- **Real-time:** Server-Sent Events (SSE)
- **AI:** Anthropic Claude Haiku API
- **Containerization:** Docker + Docker Compose

### Environment Variables

```bash
ANTHROPIC_API_KEY=sk-...    # Required for real mode
MOCK_MODE=false              # Set to true for testing
```

### Local Development (Without Docker)

Each service can run independently:

```bash
# Terminal 1 - Architect Agent
cd services/architect-agent
npm install
MOCK_MODE=true npm start

# Terminal 2 - Security Agent
cd services/security-agent
npm install
MOCK_MODE=true npm start

# Terminal 3 - Cost Agent
cd services/cost-agent
npm install
MOCK_MODE=true npm start

# Terminal 4 - DevOps Agent
cd services/devops-agent
npm install
MOCK_MODE=true npm start

# Terminal 5 - Orchestrator
cd services/orchestrator
npm install
MOCK_MODE=true npm start

# Terminal 6 - Web UI
cd services/web-ui
npm install
npm start
```

## 🐛 Troubleshooting

### Issue: API Key Not Working

**Symptoms:** Agents return errors, logs show "API key not configured"

**Solution:**
```bash
# Make sure API key is exported before docker-compose
export ANTHROPIC_API_KEY=your-key
echo $ANTHROPIC_API_KEY  # Verify it's set
docker-compose up --build
```

### Issue: SSE Connection Fails

**Symptoms:** Web UI shows "Connected to agent swarm..." but no updates appear

**Solution:**
1. Check browser console for errors
2. Verify CORS headers in orchestrator
3. Try fallback polling mode (automatic)
4. Check orchestrator logs: `docker-compose logs orchestrator`

### Issue: Agents Can't Reach Each Other

**Symptoms:** Orchestrator logs show "Failed to call X agent"

**Solution:**
```bash
# Check if all containers are running
docker-compose ps

# Check network connectivity
docker-compose exec orchestrator ping architect-agent

# Restart services
docker-compose down
docker-compose up --build
```

### Issue: Port Already in Use

**Symptoms:** "Error: listen EADDRINUSE: address already in use :::3000"

**Solution:**
```bash
# Find and kill process using the port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
# ... repeat for 3002-3005 if needed

# Or change ports in docker-compose.yml
```

### Issue: SQLite Permission Errors

**Symptoms:** Orchestrator can't write to database

**Solution:**
```bash
# Create volume with proper permissions
docker-compose down -v
docker volume rm day-02-ai-agent-swarm_orchestrator-data
docker-compose up --build
```

## 💰 Cost Information

### API Usage

- **Model:** Claude Haiku (`claude-haiku-4-5-20251001`)
- **Cost per analysis:** ~$0.01-0.03
  - 4 agent calls × ~$0.002-0.005 each
  - 1 synthesis call × ~$0.005-0.010
- **Total tokens per analysis:** ~10,000-15,000 tokens

### Cost Optimization

- Use **MOCK_MODE** for development and testing
- Use Claude Haiku (NOT Sonnet) - 20x cheaper
- Set `max_tokens: 2048` per agent call
- Enable mock mode in tests to avoid API costs

## 🎯 Success Criteria

This implementation achieves all success criteria:

- [x] All 6 services start via `docker-compose up --build`
- [x] Web UI accessible at http://localhost:3000
- [x] Form submission creates session
- [x] Orchestrator routes through 4 agents sequentially
- [x] Each agent receives previous outputs (context accumulation)
- [x] Real-time activity feed shows agent progress
- [x] Activity feed shows disagreements/challenges
- [x] All agents call Anthropic API (or use mock mode)
- [x] Final synthesis combines all outputs
- [x] Final report displays in Web UI
- [x] System works in MOCK_MODE without API key
- [x] Automated tests pass
- [x] Complete documentation

## 📚 Key Design Decisions

### Why Sequential Pipeline?

Agents process in sequence (not parallel) so each agent can review and challenge previous agents. This creates the "debate dynamic" that makes recommendations stronger.

### Why Server-Sent Events (SSE)?

SSE provides real-time updates with simple browser APIs. No WebSocket complexity needed for one-way server→client communication.

### Why Claude Haiku?

Haiku is 20x cheaper than Sonnet while still producing high-quality analysis. Critical for keeping costs under $10 for the entire build.

### Why SQLite?

No separate database container needed. Perfect for this use case where we're storing session data (not high-concurrency writes).

### Why Mock Mode?

Enables testing without API costs. Essential for CI/CD and development iterations.

## 🔒 Security Notes

- API keys passed via environment variables (never committed)
- CORS enabled for Web UI access
- Input validation on all endpoints
- No sensitive data logged
- SQLite database stored in Docker volume (persisted)

## 🤝 Contributing

This is a daily challenge project, but improvements welcome:

1. Better error handling for API failures
2. Retry logic for agent calls
3. WebSocket alternative to SSE
4. Agent caching for repeat queries
5. User authentication for saved analyses

## 📄 License

MIT License - Free to use and modify

## 🙏 Acknowledgments

- Built with Claude Sonnet 4.5 (ironically, a more expensive model building a system that uses the cheaper Haiku model)
- Part of the Daily Microservices Challenge
- Inspired by multi-agent systems and structured disagreement patterns

---

**Ready to build?** Just run:

```bash
export ANTHROPIC_API_KEY=your-key
docker-compose up --build
```

Then open http://localhost:3000 and watch AI agents collaborate!
