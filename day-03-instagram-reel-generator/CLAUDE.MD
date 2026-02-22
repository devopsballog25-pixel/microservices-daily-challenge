# Instagram Reel Generator - Build & Test

## Your Mission

Build a complete AI Instagram Reel Generator from scratch based on the requirements in `PROBLEM.md`. 

Read the full requirements from PROBLEM.md first, then build, test, and validate everything until all success criteria pass.

## What You Need to Do

### 1. Read Requirements
- Read `PROBLEM.md` thoroughly
- Understand all 5 microservices (1 orchestrator + 4 agents)
- Note the success criteria (14 items)
- Review the pipeline flow and agent interactions

### 2. Build the System

Create all 5 microservices:

**Service 1: Orchestrator (Port 3001)**
- Express server that serves the web UI
- Pipeline manager (calls agents sequentially)
- Status tracking with real-time polling
- Video file serving with correct MIME types
- Static file serving for the UI

**Service 2: Trend Scout Agent (Port 3002)**
- Scrapes Instagram via Apify API
- Analyzes trends with Claude Haiku
- Returns top themes, visual patterns, hashtag strategy

**Service 3: Content Strategist Agent (Port 3003)**
- Takes trend data as input
- Uses Claude Sonnet 4.5 (highest quality)
- Generates 3 video scene prompts
- Can challenge Agent 1's recommendations

**Service 4: Visual Producer Agent (Port 3004)**
- Takes scene prompts from Agent 2
- Generates videos via PiAPI (Kling 2.6)
- Stitches clips with FFmpeg
- Outputs final `reel.mp4`

**Service 5: Post Optimizer Agent (Port 3005)**
- Takes video + trend data
- Uses Claude Haiku
- Generates 2 caption variants
- 30 hashtags (niche, medium, broad)
- Posting strategy (time, frequency)

**Web UI (served by orchestrator)**
- Single HTML file with inline CSS and JavaScript
- Form to input: niche, hashtags, quality, clips
- Real-time pipeline progress display
- Video player for the generated reel
- Download button for MP4
- Copy buttons for captions and hashtags

**Tech Stack:**
- Node.js 18 + Express
- Docker + Docker Compose
- FFmpeg (in visual-producer container)
- External APIs: Apify, Anthropic, PiAPI

### 3. Mock Mode First

CRITICAL: Build mock mode BEFORE integrating real APIs.

Each agent service must have:
- `USE_MOCK_DATA` environment variable
- `mockData.js` file with realistic sample responses
- When mock mode is true, skip API calls and return mock data immediately

This allows:
- Testing the full pipeline without API costs
- Validating the UI and orchestration logic
- Ensuring video stitching works
- Debugging without waiting for slow API calls

### 4. Test Everything

**Mock Mode Testing:**
```bash
# Start with mock mode (default in .env)
docker-compose up --build

# Open browser
open http://localhost:3001

# Test full flow:
# 1. Enter niche: "AI art"
# 2. Enter hashtags: aiart, aigenerated, aiartcommunity, texttoimage
# 3. Select quality: Pro
# 4. Select clips: 3
# 5. Click "Generate Reel"
# 6. Watch pipeline progress
# 7. Play video when complete
# 8. Test copy buttons
# 9. Test download button
```

**Health Checks:**
```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health
```

**API Testing:**
```bash
# Test generation
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -d '{"niche":"AI art","hashtags":["aiart"],"quality":"pro","clips":3}'

# Get job ID from response, then:
curl http://localhost:3001/status/{jobId}
curl http://localhost:3001/results/{jobId}
curl -o test.mp4 http://localhost:3001/download/{jobId}
```

### 5. Self-Heal & Iterate

- If services fail to start, debug and fix
- If the UI doesn't load, check static file serving
- If pipeline hangs, add timeout handling
- If video doesn't play, verify MIME types and file paths
- If FFmpeg fails, check container setup
- Keep iterating until ALL success criteria pass

### 6. Document Everything

Create comprehensive README.md with:
- Architecture diagram (ASCII art is fine)
- Setup instructions (environment variables)
- How to run the system (Docker Compose)
- How to use the UI (step-by-step)
- API documentation with examples
- How to run tests
- Cost breakdown
- Mock mode vs real API instructions

Create RESULTS.md documenting:
- What works
- What failed (if anything)
- Architectural decisions you made
- Performance observations
- Cost analysis (mock vs real)
- Challenges encountered and solutions

## Success Criteria (from PROBLEM.md)

You must achieve ALL of these:

- [ ] All 5 services start successfully via `docker-compose up --build`
- [ ] Web UI loads at `http://localhost:3001`
- [ ] Can enter a niche and hashtags in the UI and click Generate
- [ ] Pipeline progress shows in the UI with per-agent status updates
- [ ] Agent challenges appear in the pipeline progress
- [ ] Video player plays the generated reel in the browser
- [ ] Download button works to save the MP4
- [ ] Caption copy buttons work (clipboard copy)
- [ ] Results show 2 caption variants, 30 hashtags, posting strategy
- [ ] Pipeline cost breakdown is displayed per agent
- [ ] Mock mode works end-to-end without any external API calls
- [ ] All outputs saved to `output/job-{id}/` directory
- [ ] Health check endpoints respond on all 5 services
- [ ] System handles errors gracefully (shows error in UI, doesn't crash)

## Important Notes

- Build from scratch - no boilerplate templates
- Actually RUN and TEST everything - don't just write code
- Mock mode MUST work first before real API integration
- The UI must actually work - test it in a browser
- The video must play in the browser video player
- Nothing hardcoded - user inputs flow through the entire pipeline
- If something doesn't work, FIX IT before moving on
- The goal is a WORKING system, not just code

## Project Structure

Create this structure:

```
day-03-instagram-reel-generator/
├── services/
│   ├── orchestrator/
│   │   ├── server.js
│   │   ├── public/
│   │   │   └── index.html         # Web UI
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── trend-scout/
│   │   ├── server.js
│   │   ├── mockData.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── content-strategist/
│   │   ├── server.js
│   │   ├── mockData.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── visual-producer/
│   │   ├── server.js
│   │   ├── mockData.js
│   │   ├── package.json
│   │   └── Dockerfile             # Include FFmpeg!
│   └── post-optimizer/
│       ├── server.js
│       ├── mockData.js
│       ├── package.json
│       └── Dockerfile
├── output/                         # Generated files
├── tests/
│   ├── integration.test.js
│   └── package.json
├── docker-compose.yml
├── .env.example
├── README.md
├── RESULTS.md
└── PROBLEM.md
```

## Tech Stack Guidance

Use Node.js 18 + Express for all services. Lightweight and fast.

**Critical installations:**
- Orchestrator: express, cors
- All agents: express, axios
- Visual Producer: ffmpeg-static (or system ffmpeg)

**Docker notes:**
- Visual Producer needs: `RUN apt-get update && apt-get install -y ffmpeg`
- All services need: `WORKDIR /app` and proper COPY commands
- Orchestrator needs: volume mount for serving generated videos

## Environment Variables

Create .env.example with:
```
# API Keys
ANTHROPIC_API_KEY=your-key-here
APIFY_API_TOKEN=your-key-here
PIAPI_API_KEY=your-key-here

# Model Configuration
TREND_SCOUT_MODEL=claude-haiku-4-5-20251001
CONTENT_STRATEGIST_MODEL=claude-sonnet-4-5-20250929
POST_OPTIMIZER_MODEL=claude-haiku-4-5-20251001

# Video Configuration
KLING_VERSION=2.6
KLING_MODE=pro

# Testing
USE_MOCK_DATA=true
```

## Start Here

1. Read PROBLEM.md fully (you should have already done this)
2. Create the project structure
3. Build orchestrator with web UI
4. Build all 4 agent services with mock data
5. Wire up the pipeline in the orchestrator
6. Test mock mode end-to-end
7. Add real API integrations (one at a time)
8. Test with real APIs
9. Write integration tests
10. Document everything in README.md and RESULTS.md

**Don't stop until the system works!**

## Key Architectural Decisions to Make

1. **State Management:** Use in-memory job tracking (no database needed)
2. **Status Updates:** Polling every 2 seconds from UI (or SSE if you prefer)
3. **Error Handling:** Graceful failures with error messages in UI
4. **Video Storage:** Save to `output/job-{id}/` directory
5. **Mock Data:** Realistic enough to test full pipeline
6. **FFmpeg:** System-installed in Docker vs npm package

## Testing Strategy

1. Health checks first (all services up?)
2. Mock mode pipeline (end-to-end with fake data)
3. Individual agent testing (curl each agent directly)
4. UI testing (manual browser testing)
5. Real API integration (one agent at a time)
6. Full pipeline with real APIs
7. Integration tests (automated)

Good luck! 🚀

Remember: The goal is a production-ready system that WORKS, not just code that compiles.