# Day 03: AI Instagram Reel Generator

A microservices system that uses 4 AI agents to generate complete Instagram Reels — from trend research to captioned, hashtagged, ready-to-post content — in under 3 minutes for ~$1.22.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    BROWSER (localhost:3001)                    │
│                    Web UI (index.html)                         │
│                                                                │
│   Input form → Pipeline progress → Video player + results     │
│       │  POST /generate                                        │
│       │  GET  /status/:id  (poll every 2s)                    │
│       │  GET  /results/:id                                     │
│       │  GET  /download/:id (serves video)                    │
│       ▼                                                        │
├──────────────────────────────────────────────────────────────┤
│                    ORCHESTRATOR (3001)                         │
│             Express + Static Files + Pipeline Manager          │
├─────────────┬────────────┬────────────┬───────────────────────┤
│  Agent 1    │  Agent 2   │  Agent 3   │  Agent 4              │
│  Trend      │  Content   │  Visual    │  Post                 │
│  Scout      │  Strategist│  Producer  │  Optimizer            │
│  :3002      │  :3003     │  :3004     │  :3005                │
│             │            │            │                        │
│  Apify +    │  Sonnet    │  Kling AI  │  Haiku                │
│  Haiku      │  4.5       │  + FFmpeg  │  4.5                  │
└─────────────┴────────────┴────────────┴───────────────────────┘
                                ↓
                    output/job-{uuid}/
                    ├── reel.mp4           (final video)
                    ├── clips/clip{n}.mp4  (individual clips)
                    ├── trend_data.json
                    ├── creative_brief.json
                    ├── posting_package.json
                    └── report.json
```

## Services

| Service | Port | Technology | Purpose |
|---------|------|------------|---------|
| Orchestrator | 3001 | Express | Pipeline manager + Web UI host |
| Trend Scout | 3002 | Apify + Claude Haiku | Instagram trend analysis |
| Content Strategist | 3003 | Claude Sonnet 4.5 | Creative direction + video prompts |
| Visual Producer | 3004 | Kling AI + FFmpeg | Video generation + stitching |
| Post Optimizer | 3005 | Claude Haiku | Captions + hashtags + strategy |

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 18+ (for running tests locally)

### Mock Mode (no API keys needed)

```bash
# Clone and navigate to project
cd day-03-instagram-reel-generator

# Copy environment file
cp .env.example .env
# .env already has USE_MOCK_DATA=true

# Build and start all services
docker-compose up --build

# Open browser
open http://localhost:3001
```

### Real API Mode

```bash
# Edit .env with your API keys
ANTHROPIC_API_KEY=your-key-here
APIFY_API_TOKEN=your-key-here
PIAPI_API_KEY=your-key-here
USE_MOCK_DATA=false

# Restart services
docker-compose up
```

## Using the Web UI

1. **Enter niche** — e.g., "AI art", "fitness", "cooking"
2. **Enter hashtags** — comma-separated, without `#`
3. **Select quality** — Standard ($0.84) or Pro ($1.22)
4. **Select clips** — 2 clips (10s) or 3 clips (15s)
5. **Click "Generate Reel"**
6. Watch the 4-agent pipeline progress in real-time
7. When complete:
   - Play video in the browser
   - Download MP4
   - Copy captions (Variant A or B)
   - Copy 30 hashtags
   - Review posting strategy

## API Documentation

### POST /generate
Start the pipeline. Returns immediately with a job ID.

```bash
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -d '{"niche":"AI art","hashtags":["aiart","aigenerated"],"quality":"pro","clips":3}'

# Response:
{"jobId":"job-uuid","status":"in_progress"}
```

### GET /status/:jobId
Poll for pipeline progress every 2 seconds.

```bash
curl http://localhost:3001/status/job-uuid

# Response:
{
  "jobId": "job-uuid",
  "status": "in_progress|completed|error",
  "stage": "trend_analysis|content_strategy|video_production|post_optimization|completed",
  "pipeline": [
    {"agent":"Trend Scout","status":"completed","duration":"2s","cost":"$0.19","summary":"..."},
    {"agent":"Content Strategist","status":"in_progress","duration":null,"cost":null,"summary":"..."},
    {"agent":"Visual Producer","status":"pending","duration":null,"cost":null,"summary":null},
    {"agent":"Post Optimizer","status":"pending","duration":null,"cost":null,"summary":null}
  ],
  "challenges": [{"challenger":"Content Strategist","challenged":"Trend Scout","issue":"..."}],
  "runningCost": "$0.19",
  "elapsed": "5s"
}
```

### GET /results/:jobId
Get complete results after pipeline completes.

```bash
curl http://localhost:3001/results/job-uuid
```

### GET /download/:jobId
Download the generated MP4 video.

```bash
curl -o reel.mp4 http://localhost:3001/download/job-uuid
```

### Health Checks

```bash
curl http://localhost:3001/health  # Orchestrator
curl http://localhost:3002/health  # Trend Scout
curl http://localhost:3003/health  # Content Strategist
curl http://localhost:3004/health  # Visual Producer
curl http://localhost:3005/health  # Post Optimizer
```

## Running Tests

```bash
cd tests
npm install
node integration.test.js
```

Expected output: 21/21 tests passing.

## Project Structure

```
day-03-instagram-reel-generator/
├── services/
│   ├── orchestrator/
│   │   ├── server.js          # Express API + pipeline runner
│   │   ├── public/
│   │   │   └── index.html     # Web UI (inline CSS + JS)
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── trend-scout/
│   │   ├── server.js          # Apify scraping + Haiku analysis
│   │   ├── mockData.js        # Mock trend data
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── content-strategist/
│   │   ├── server.js          # Sonnet creative direction
│   │   ├── mockData.js        # Mock creative brief with Kling prompts
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── visual-producer/
│   │   ├── server.js          # Kling API + FFmpeg stitching
│   │   ├── mockData.js        # Mock clip color configs
│   │   ├── package.json
│   │   └── Dockerfile         # Includes FFmpeg installation
│   └── post-optimizer/
│       ├── server.js          # Haiku caption + hashtag generation
│       ├── mockData.js        # Mock post package
│       ├── package.json
│       └── Dockerfile
├── output/                    # Generated files (gitignored except .gitkeep)
├── tests/
│   ├── integration.test.js    # Full pipeline test suite (21 tests)
│   └── package.json
├── docker-compose.yml
├── .env.example
├── README.md
└── PROBLEM.md
```

## Mock Mode Details

In mock mode (`USE_MOCK_DATA=true`):

- **Trend Scout**: Returns pre-built realistic trend data with the user's niche/hashtags interpolated
- **Content Strategist**: Returns pre-written creative brief with 3 Kling-optimized prompts + challenge against Trend Scout
- **Visual Producer**: Generates colored gradient MP4 clips using local FFmpeg (dark blue, purple, teal), stitches them, adds text overlays — **produces a real, playable MP4**
- **Post Optimizer**: Returns pre-written captions, 30 hashtags, posting strategy + 2 challenges against upstream agents

**Total mock mode cost: $0.00** (no external API calls)
**Total mock mode time: ~12 seconds**

## Cost Breakdown (Real Mode)

| Component | Pro Mode | Standard Mode |
|-----------|----------|---------------|
| Apify Instagram Scraper | $0.18 | $0.18 |
| Agent 1: Haiku (trend analysis) | $0.01 | $0.01 |
| Agent 2: Sonnet (creative direction) | $0.04 | $0.04 |
| Agent 3: Kling 2.6 × 3 clips | $0.99 | $0.60 |
| Agent 4: Haiku (post optimization) | $0.01 | $0.01 |
| FFmpeg (local processing) | $0.00 | $0.00 |
| **Total** | **$1.23** | **$0.84** |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_MOCK_DATA` | `true` | Use mock data instead of real APIs |
| `ANTHROPIC_API_KEY` | — | Required for real AI agent calls |
| `APIFY_API_TOKEN` | — | Required for Instagram scraping |
| `PIAPI_API_KEY` | — | Required for Kling video generation |
| `TREND_SCOUT_MODEL` | `claude-haiku-4-5-20251001` | Model for trend analysis |
| `CONTENT_STRATEGIST_MODEL` | `claude-sonnet-4-5-20250929` | Model for content strategy |
| `POST_OPTIMIZER_MODEL` | `claude-haiku-4-5-20251001` | Model for post optimization |
| `KLING_VERSION` | `2.6` | Kling AI version |
| `KLING_MODE` | `pro` | Kling quality mode (pro/std) |
