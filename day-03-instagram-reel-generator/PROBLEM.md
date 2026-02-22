# Day 03: AI Instagram Reel Generator

## Problem Context

Creating Instagram Reels is a **time-intensive, multi-step process** that solo creators struggle with:
- **Trend research**: 30-60 min scrolling Instagram to find what's trending
- **Content ideation**: Deciding what angle, what hook, what visual style
- **Video creation**: Generating/filming/editing visuals (hours with traditional methods)
- **Copywriting**: Writing captions, selecting hashtags, timing posts
- **Total per reel**: 2-4 hours for a single piece of content

This system replaces that entire workflow with **4 AI agents** that collaborate to produce a ready-to-post Instagram Reel in under 3 minutes for ~$1.22.

---

## System Requirements

Build an **AI Instagram Reel Generator** with 5 microservices (1 orchestrator + 4 AI agents) and a **web UI**. The system takes a content niche as input and produces a complete posting package: AI-generated video + captions + hashtags + posting strategy.

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    BROWSER (localhost:3001)                    │
│                    Web UI (index.html)                         │
│                                                                │
│   Input form → Pipeline progress → Video player + results     │
│       │                                                        │
│       │  POST /generate                                        │
│       │  GET  /status/:id  (poll every 2s)                    │
│       │  GET  /results/:id                                     │
│       │  GET  /download/:id (serves video)                    │
│       ▼                                                        │
├──────────────────────────────────────────────────────────────┤
│                    ORCHESTRATOR (3001)                         │
│                    Express + Static Files                      │
├───────────┬──────────┬──────────┬───────────────────────────┤
│           │          │          │                              │
│   Agent 1 │  Agent 2 │  Agent 3 │  Agent 4                   │
│   Trend   │  Content │  Visual  │  Post                      │
│   Scout   │  Strat   │  Producer│  Optimizer                 │
│   :3002   │  :3003   │  :3004   │  :3005                     │
│           │          │          │                              │
│  Apify +  │  Sonnet  │  Kling + │  Haiku                     │
│  Haiku    │  4.5     │  FFmpeg  │  4.5                       │
└───────────┴──────────┴──────────┴───────────────────────────┘
```

---

## Service 1: Orchestrator (Port 3001)

**Responsibility:** Pipeline manager + web UI host. No AI logic of its own.

**Features:**
- Serves web UI (single `index.html` with inline CSS/JS) as static file
- Accepts generation requests from UI
- Calls agents sequentially, passing each agent's output to the next
- Tracks pipeline state in memory (no database)
- Provides real-time status with per-agent progress, timing, and cost
- Serves generated video files for browser playback and download
- Stores all outputs to `output/job-{id}/` directory

**Endpoints:**
- `GET /` — Serves web UI (`public/index.html`)
- `POST /generate` — Start pipeline, returns `{ jobId, status }` immediately
- `GET /status/:jobId` — Real-time pipeline progress (UI polls this every 2 seconds)
- `GET /results/:jobId` — Complete results after pipeline finishes
- `GET /download/:jobId` — Serves the final `reel.mp4` file with correct MIME type

**Pipeline Flow:**
```
POST /generate { niche, hashtags, quality, clips }
  → Returns jobId immediately
  → Background: Agent 1 → Agent 2 → Agent 3 → Agent 4
  → Each agent's output feeds into the next
  → Status endpoint updates in real-time
```

**Status Response Format (for UI consumption):**
```json
{
  "jobId": "job-uuid",
  "status": "in_progress",
  "stage": "video_production",
  "pipeline": [
    {
      "agent": "Trend Scout",
      "status": "completed",
      "duration": "43s",
      "cost": "$0.21",
      "summary": "Scraped 80 reels, found 'underwater worlds' trending +340%"
    },
    {
      "agent": "Content Strategist",
      "status": "completed",
      "duration": "4s",
      "cost": "$0.04",
      "summary": "Theme: Underwater cyberpunk city"
    },
    {
      "agent": "Visual Producer",
      "status": "in_progress",
      "duration": "62s",
      "cost": "$0.66",
      "summary": "2/3 clips generated"
    },
    {
      "agent": "Post Optimizer",
      "status": "pending",
      "duration": null,
      "cost": null,
      "summary": null
    }
  ],
  "challenges": [
    {
      "challenger": "Content Strategist",
      "challenged": "Trend Scout",
      "issue": "Pure cyberpunk oversaturated — pivoting to underwater cyberpunk"
    }
  ],
  "runningCost": "$0.91",
  "elapsed": "109s"
}
```

---

## Service 2: Trend Scout — Agent 1 (Port 3002)

**Responsibility:** Instagram researcher. Scrapes trending reels and analyzes patterns.

**LLM:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
**External API:** Apify Instagram Hashtag Scraper

**Endpoint:** `POST /analyze`

**Input:**
```json
{
  "niche": "AI art",
  "hashtags": ["aiart", "aigenerated", "aiartcommunity", "texttoimage"]
}
```

**Process:**

Step 1 — Scrape Instagram using the user's hashtags (NOT hardcoded):
```
POST https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items?token={APIFY_API_TOKEN}
Content-Type: application/json

{
  "hashtags": ["aiart", "aigenerated", "aiartcommunity", "texttoimage"],
  "resultsType": "reels",
  "resultsLimit": 20
}
```
This is a synchronous call — waits up to 5 minutes, returns dataset items directly as a JSON array.

Key fields from each returned item:
- `caption` — text analysis for hooks and patterns
- `likesCount` — engagement metric
- `commentsCount` — engagement metric
- `videoViewCount` — reach metric
- `videoPlayCount` — engagement metric
- `hashtags` — tag strategy analysis
- `timestamp` — recency scoring
- `ownerUsername` — top creator identification

Step 2 — Send scraped data to Haiku for trend analysis:
```
POST https://api.anthropic.com/v1/messages
Headers: x-api-key: {ANTHROPIC_API_KEY}, anthropic-version: 2023-06-01

{
  "model": "claude-haiku-4-5-20251001",
  "max_tokens": 4096,
  "system": "You are a social media trend analyst specializing in {niche}. Respond ONLY with valid JSON.",
  "messages": [{ "role": "user", "content": "Analyze these {count} Instagram reels..." }]
}
```

**Output:**
```json
{
  "scrapedCount": 78,
  "niche": "AI art",
  "analysis": {
    "topThemes": [
      {
        "theme": "cyberpunk cityscapes with atmospheric lighting",
        "avgViews": 67000,
        "avgEngagement": "5.2%",
        "whyTrending": "Blade Runner anime series hype",
        "exampleCaptions": ["caption1", "caption2"]
      }
    ],
    "visualPatterns": {
      "topStyles": ["cinematic lighting", "neon color grading", "hyperrealistic"],
      "colorPalettes": ["teal and purple", "neon pink and blue"],
      "cameraMovements": ["slow push forward", "orbital pan", "drone descent"]
    },
    "hashtagStrategy": {
      "niche": ["10 low-competition, high-engagement tags"],
      "medium": ["10 medium-competition tags"],
      "broad": ["10 high-volume tags"]
    },
    "captionPatterns": {
      "hooks": ["What if...", "POV:", "This was made entirely by AI"],
      "ctas": ["Would you live here?", "Save for later", "Tag someone"],
      "avgLength": 150
    },
    "topCreators": ["username1", "username2", "username3"],
    "avoidList": ["pure cyberpunk without twist", "static images with zoom", "AI disclaimer-heavy captions"]
  },
  "cost": { "apify": 0.18, "haiku": 0.008, "total": 0.188 },
  "duration": 43
}
```

---

## Service 3: Content Strategist — Agent 2 (Port 3003)

**Responsibility:** Creative director. Chooses the angle, writes video prompts, can challenge Agent 1.

**LLM:** Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) — Sonnet is used here because this is the highest-leverage decision: prompt quality directly determines video quality.

**Endpoint:** `POST /strategize`

**Input:**
```json
{
  "niche": "AI art",
  "hashtags": ["aiart", "aigenerated", "aiartcommunity", "texttoimage"],
  "trendData": { "...full Agent 1 output..." },
  "clips": 3,
  "quality": "pro"
}
```

**Process:**

Single Sonnet API call. The prompt must instruct Sonnet to:
1. Choose the best theme angle based on trends — but NOT the most obvious one
2. Explicitly challenge Agent 1 if the top theme is oversaturated
3. Create a narrative arc: Hook (stop scrolling) → Build (create wonder) → Payoff (epic reveal)
4. Write the exact number of Kling-optimized video prompts matching the user's `clips` count
5. Include text overlay suggestions (hook text + CTA text)

Kling prompt writing rules to include in the system prompt:
- Max 2500 characters per prompt
- Cinematic language works best: "tracking shot", "dolly zoom", "aerial view"
- Specify color palettes explicitly: "teal and purple palette"
- Include quality keywords: "hyperrealistic", "8k", "cinematic", "volumetric lighting"
- Describe motion explicitly: "camera slowly descends", "particles float past"
- Describe what the camera SEES, not abstract concepts
- All prompts must target 9:16 vertical video (specify vertical framing in prompts)

**Output:**
```json
{
  "concept": {
    "theme": "Underwater cyberpunk city",
    "angle": "What if Atlantis was rebuilt with neon and AI?",
    "narrativeArc": "Ocean descent (hook) → Street-level exploration (build) → Epic city reveal (payoff)",
    "whyThisTheme": "Cyberpunk trending but oversaturated. Underwater + cyberpunk is fresh crossover."
  },
  "challenge": {
    "challenged": "Trend Scout",
    "issue": "Top theme 'cyberpunk cityscapes' is oversaturated",
    "reasoning": "Combining cyberpunk with underwater creates novel angle with 0 competition"
  },
  "klingPrompts": [
    {
      "sceneNumber": 1,
      "prompt": "Slow camera descent through dark ocean water, bioluminescent particles floating past, gradually revealing the glow of a vast underwater city, teal and deep purple color palette, cinematic wide angle, volumetric god rays through water, hyperrealistic, 8k quality",
      "duration": 5,
      "purpose": "hook",
      "cameraDirection": "slow descent, wide angle",
      "colorPalette": "teal, deep purple, bioluminescent blue"
    },
    {
      "sceneNumber": 2,
      "prompt": "Camera glides through underwater cyberpunk city streets, neon holographic signs in alien script reflecting off glass domes, schools of bioluminescent fish swimming past, deep ocean blue and electric purple palette, tracking shot forward movement, cinematic depth of field, hyperrealistic detail",
      "duration": 5,
      "purpose": "build",
      "cameraDirection": "tracking shot, forward movement",
      "colorPalette": "deep ocean blue, electric purple, neon reflections"
    },
    {
      "sceneNumber": 3,
      "prompt": "Dramatic wide reveal of entire underwater megalopolis from above, thousands of glowing structures stretching to the horizon under dark ocean, massive bio-luminescent jellyfish floating between towers like living lanterns, epic scale, teal and gold accents, cinematic aerial view, breathtaking composition",
      "duration": 5,
      "purpose": "payoff",
      "cameraDirection": "crane up and pull back, epic reveal",
      "colorPalette": "teal, gold accents, deep ocean dark"
    }
  ],
  "textOverlays": {
    "hook": "What if Atlantis ran on AI? 🌊",
    "cta": "Would you live here? 👇"
  },
  "musicSuggestion": "ambient electronic with deep bass and ethereal pads",
  "cost": { "sonnet": 0.04, "total": 0.04 },
  "duration": 4
}
```

---

## Service 4: Visual Producer — Agent 3 (Port 3004)

**Responsibility:** Production studio. Generates AI video clips and stitches them into a reel. NO LLM needed.

**External API:** PiAPI (Kling AI video generation)
**Local Tool:** FFmpeg (installed in Docker image)

**Endpoint:** `POST /produce`

**Input:**
```json
{
  "jobId": "job-uuid",
  "klingPrompts": [
    { "sceneNumber": 1, "prompt": "...", "duration": 5, "purpose": "hook" },
    { "sceneNumber": 2, "prompt": "...", "duration": 5, "purpose": "build" },
    { "sceneNumber": 3, "prompt": "...", "duration": 5, "purpose": "payoff" }
  ],
  "textOverlays": {
    "hook": "What if Atlantis ran on AI? 🌊",
    "cta": "Would you live here? 👇"
  },
  "quality": "pro",
  "aspectRatio": "9:16"
}
```

**Process:**

Step 1 — Submit ALL clips to Kling in parallel:
```
POST https://api.piapi.ai/api/v1/task
Headers: x-api-key: {PIAPI_API_KEY}, Content-Type: application/json

{
  "model": "kling",
  "task_type": "video_generation",
  "input": {
    "prompt": "{scene prompt from Agent 2}",
    "negative_prompt": "blurry, low quality, distorted, text overlay, watermark, static, frozen",
    "cfg_scale": 0.5,
    "duration": 5,
    "aspect_ratio": "9:16",
    "mode": "pro",
    "version": "2.6"
  },
  "config": {
    "service_mode": "",
    "webhook_config": { "endpoint": "", "secret": "" }
  }
}
```

Response returns `task_id` for each clip.

Step 2 — Poll all tasks in parallel every 5 seconds:
```
GET https://api.piapi.ai/api/v1/task/{task_id}
Headers: x-api-key: {PIAPI_API_KEY}
```

Status progression: `pending` → `processing` → `completed` | `failed`

CRITICAL — Video URL extraction path when completed:
```javascript
const videoUrl = response.data.output.works[0].video.resource_without_watermark
  || response.data.output.works[0].video.resource;
```

Timeout: 5 minutes per clip. If exceeded, fail the job.

Step 3 — Download all clip MP4 files to `/output/{jobId}/clips/`

Step 4 — FFmpeg stitch + text overlays:
```bash
# Concatenate clips
ffmpeg -f concat -safe 0 -i filelist.txt -c copy stitched.mp4

# Add text overlays (hook text on first 3s, CTA text on last 3s)
ffmpeg -i stitched.mp4 \
  -vf "drawtext=text='{hook}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h*0.85:enable='between(t,0.5,3.5)':shadowcolor=black:shadowx=2:shadowy=2, \
       drawtext=text='{cta}':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=h*0.85:enable='between(t,{total-3.5},{total-0.5})':shadowcolor=black:shadowx=2:shadowy=2" \
  -c:v libx264 -preset fast -crf 23 reel.mp4
```

The Visual Producer must report granular status (how many clips generated) so the orchestrator can update the UI.

**Dockerfile requirement:** Must install FFmpeg:
```dockerfile
FROM node:18-slim
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
```

**Output:**
```json
{
  "jobId": "job-uuid",
  "videoPath": "/output/job-uuid/reel.mp4",
  "clips": [
    { "scene": 1, "path": "/output/job-uuid/clips/clip1.mp4", "duration": 5 },
    { "scene": 2, "path": "/output/job-uuid/clips/clip2.mp4", "duration": 5 },
    { "scene": 3, "path": "/output/job-uuid/clips/clip3.mp4", "duration": 5 }
  ],
  "totalDuration": 15,
  "resolution": "1080x1920",
  "aspectRatio": "9:16",
  "cost": { "kling": 0.99, "total": 0.99 },
  "duration": 89
}
```

**Kling Pricing (v2.5/2.6):**

| Mode | 5 seconds | 10 seconds |
|------|-----------|------------|
| std  | $0.20     | $0.40      |
| pro  | $0.33     | $0.66      |

---

## Service 5: Post Optimizer — Agent 4 (Port 3005)

**Responsibility:** Social media strategist. Writes captions, optimizes hashtags, predicts engagement, challenges upstream agents.

**LLM:** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)

**Endpoint:** `POST /optimize`

**Input:**
```json
{
  "niche": "AI art",
  "hashtags": ["aiart", "aigenerated", "aiartcommunity", "texttoimage"],
  "trendData": { "...Agent 1 output..." },
  "creativeBrief": { "...Agent 2 output..." },
  "videoMetadata": {
    "totalDuration": 15,
    "resolution": "1080x1920",
    "clips": 3,
    "textOverlays": { "hook": "...", "cta": "..." }
  }
}
```

**Process:**

Single Haiku call that receives ALL upstream context. Prompt instructs Haiku to:
1. Write 2 caption variants (A = curiosity hook, B = POV/experience hook)
2. Build 30-hashtag strategy (10 niche + 10 medium + 10 broad) using trend data
3. Create posting strategy (best times, first comment, story strategy)
4. Predict engagement based on trend data
5. Challenge any upstream agent if improvements are possible

Caption rules: first line is the hook (must stop scrolling), use line breaks, include CTA, keep under 2200 chars, use emojis sparingly.

Hashtag rules: include the user's original hashtags, 30 total sorted niche→medium→broad, provide a single formatted string for copy-paste.

**Output:**
```json
{
  "captions": [
    {
      "variant": "A",
      "text": "What if Atlantis was rebuilt with AI? 🌊\n\nEvery frame generated by artificial intelligence.\nNo cameras. No CGI.\nCost less than a dollar.\n\nCould you tell it was AI? 👇",
      "hook": "What if Atlantis was rebuilt with AI? 🌊",
      "cta": "Could you tell it was AI? 👇"
    },
    {
      "variant": "B",
      "text": "POV: You discover an AI-generated underwater city 🏙️🌊\n\n...",
      "hook": "POV: You discover...",
      "cta": "Would you live here? Comment below 👇"
    }
  ],
  "hashtags": {
    "niche": ["#aiartdaily", "#texttoimage", "#generativeart", "...7 more"],
    "medium": ["#aiart", "#aigenerated", "#aiartcommunity", "...7 more"],
    "broad": ["#art", "#digitalart", "#creative", "...7 more"],
    "formatted": "#aiartdaily #texttoimage ... (all 30 in one string)"
  },
  "postingStrategy": {
    "bestTimes": ["Tuesday 6-7 PM EST", "Thursday 6-7 PM EST", "Sunday 10-11 AM EST"],
    "firstComment": "What AI world should I create next? Drop your ideas! 🎨👇",
    "storyStrategy": "Post 3 behind-the-scenes stories...",
    "engagementTips": ["Reply to every comment in first hour", "Use question sticker in stories", "Pin best comment"]
  },
  "predictions": {
    "expectedViews": "5,000-15,000 (new account)",
    "expectedEngagement": "4-6%",
    "viralPotential": "Medium-High",
    "reasoning": "Novel concept + trending niche + question hook format"
  },
  "challenges": [
    {
      "challengedAgent": "Content Strategist",
      "issue": "Hook text was a statement, not a question",
      "fix": "Questions drive 2x more comments. Changed to question format."
    }
  ],
  "cost": { "haiku": 0.008, "total": 0.008 },
  "duration": 5
}
```

---

## Web UI

The orchestrator serves a **single `index.html` file** (inline CSS + JS, no framework, no build step) at `GET /`.

### Design Requirements
- **Dark theme** with teal accent color
- System font stack (no external fonts to load)
- Responsive but optimized for desktop (YouTube screen recording)
- All interactions via fetch() to the orchestrator's API endpoints

### Screen 1: Input Form
- **Content Niche** — text input field (e.g., "AI art")
- **Hashtags** — text input, comma-separated, pre-filled with defaults
- **Quality** — radio toggle: Standard ($0.62) vs Pro ($1.22)
- **Clips** — radio toggle: 2 clips (10s) vs 3 clips (15s)
- **Generate Reel** button
- IMPORTANT: These inputs must flow through the entire pipeline — nothing hardcoded at the backend

### Screen 2: Pipeline Progress
Appears after clicking Generate. Shows:
- Overall progress bar
- Each agent in a row: icon (⏳→🔄→✅), agent name, elapsed time, running cost
- One-line summary per completed agent (e.g., "Found: underwater worlds trending +340%")
- Agent challenges highlighted with ⚡ icon when they occur
- Running cost ticker and total elapsed time at bottom
- Polls `GET /status/{jobId}` every 2 seconds

### Screen 3: Results
Appears when pipeline completes:
- **Video player** — HTML5 `<video>` element, phone-sized proportions (~270×480px), plays the reel
- **Download button** below the video player
- **Caption Variant A** with 📋 copy button
- **Caption Variant B** with 📋 copy button
- **Hashtags** (30) with 📋 copy button
- **"Copy All for Instagram"** button — copies caption A + spacing + hashtags as one block
- **Posting strategy** — best times, first comment (with copy button)
- **Pipeline cost summary** — per-agent breakdown + total
- **Agent challenges** section — what agents disagreed about
- **Generate Another** button to return to input form

### Copy Button Implementation
Every text output (captions, hashtags, first comment) gets a clipboard copy button:
```javascript
navigator.clipboard.writeText(text).then(() => /* show "Copied!" toast */);
```

### Video Player
```html
<video controls playsinline width="270" height="480">
  <source src="/download/{jobId}" type="video/mp4">
</video>
```

---

## Mock Mode

**Every agent** must support the `USE_MOCK_DATA=true` environment variable.

When `USE_MOCK_DATA=true`:
- **Agent 1 (Trend Scout):** Skips Apify and Haiku calls. Returns pre-built realistic trend analysis data. Incorporates the user's niche and hashtags in the response via string interpolation.
- **Agent 2 (Content Strategist):** Skips Sonnet call. Returns pre-written creative brief with 3 Kling-optimized prompts. Includes a challenge against Agent 1.
- **Agent 3 (Visual Producer):** Skips Kling API entirely. Generates 3 colored gradient MP4 files using FFmpeg locally (dark blue, dark purple, dark teal — each 5s, 1080x1920 with scene text). Still runs FFmpeg concatenation + text overlay. **Produces a real, playable MP4 video file.**
- **Agent 4 (Post Optimizer):** Skips Haiku call. Returns pre-written captions, hashtags, and posting strategy. Incorporates user's niche. Includes challenges against upstream agents.

Mock mode FFmpeg commands for generating test clips:
```bash
ffmpeg -f lavfi -i "color=c=0x001a33:s=1080x1920:d=5,format=yuv420p" \
  -vf "drawtext=text='Scene 1 - Hook':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2" \
  -c:v libx264 -preset fast -t 5 clip1.mp4
```

The system ALWAYS produces a playable video, even in mock mode.

---

## Technical Requirements

### Communication
- Services communicate via REST APIs (HTTP JSON)
- Orchestrator calls agents sequentially, passing full context forward
- No database — all state in memory + file system

### Containerization
- Docker container per service
- Docker Compose for orchestration
- Shared volume for `./output` directory (orchestrator + visual producer both access it)
- Health check endpoint (`GET /health`) on every service

### Environment Variables
```env
# API Keys (passed via .env file or docker-compose environment)
PIAPI_API_KEY=          # For Agent 3 (Visual Producer)
APIFY_API_TOKEN=        # For Agent 1 (Trend Scout)
ANTHROPIC_API_KEY=      # For Agents 1, 2, 4

# Model Configuration
TREND_SCOUT_MODEL=claude-haiku-4-5-20251001
CONTENT_STRATEGIST_MODEL=claude-sonnet-4-5-20250929
POST_OPTIMIZER_MODEL=claude-haiku-4-5-20251001

# Kling Configuration
KLING_VERSION=2.6
KLING_MODE=pro

# System
USE_MOCK_DATA=true      # Set to false for real API calls
```

### Docker Compose
```yaml
services:
  orchestrator:
    build: ./services/orchestrator
    ports: ["3001:3001"]
    volumes: ["./output:/output"]
    depends_on: [trend-scout, content-strategist, visual-producer, post-optimizer]
    environment:
      - TREND_SCOUT_URL=http://trend-scout:3002
      - CONTENT_STRATEGIST_URL=http://content-strategist:3003
      - VISUAL_PRODUCER_URL=http://visual-producer:3004
      - POST_OPTIMIZER_URL=http://post-optimizer:3005

  trend-scout:
    build: ./services/trend-scout
    ports: ["3002:3002"]
    environment:
      - APIFY_API_TOKEN=${APIFY_API_TOKEN}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - TREND_SCOUT_MODEL=${TREND_SCOUT_MODEL:-claude-haiku-4-5-20251001}
      - USE_MOCK_DATA=${USE_MOCK_DATA:-true}

  content-strategist:
    build: ./services/content-strategist
    ports: ["3003:3003"]
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - CONTENT_STRATEGIST_MODEL=${CONTENT_STRATEGIST_MODEL:-claude-sonnet-4-5-20250929}
      - USE_MOCK_DATA=${USE_MOCK_DATA:-true}

  visual-producer:
    build: ./services/visual-producer
    ports: ["3004:3004"]
    volumes: ["./output:/output"]
    environment:
      - PIAPI_API_KEY=${PIAPI_API_KEY}
      - KLING_VERSION=${KLING_VERSION:-2.6}
      - KLING_MODE=${KLING_MODE:-pro}
      - USE_MOCK_DATA=${USE_MOCK_DATA:-true}

  post-optimizer:
    build: ./services/post-optimizer
    ports: ["3005:3005"]
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - POST_OPTIMIZER_MODEL=${POST_OPTIMIZER_MODEL:-claude-haiku-4-5-20251001}
      - USE_MOCK_DATA=${USE_MOCK_DATA:-true}
```

---

## Success Criteria

Your implementation will be considered successful if:

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

---

## Project Structure

```
day-03-instagram-reel-generator/
├── services/
│   ├── orchestrator/
│   │   ├── server.js
│   │   ├── public/
│   │   │   └── index.html         # Web UI (inline CSS + JS)
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── trend-scout/
│   │   ├── server.js
│   │   ├── mockData.js            # Mock responses
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
│   │   └── Dockerfile             # Must include: RUN apt-get install -y ffmpeg
│   └── post-optimizer/
│       ├── server.js
│       ├── mockData.js
│       ├── package.json
│       └── Dockerfile
├── output/                         # Generated files go here
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

## Output Directory Structure (per job)

```
output/job-{uuid}/
├── reel.mp4                    # Final stitched reel (upload this to Instagram)
├── clips/
│   ├── clip1.mp4               # Individual scene 1
│   ├── clip2.mp4               # Individual scene 2
│   └── clip3.mp4               # Individual scene 3
├── trend_data.json             # Agent 1 complete output
├── creative_brief.json         # Agent 2 complete output
├── posting_package.json        # Agent 4 complete output
└── report.json                 # Full pipeline: costs, timing, challenges
```

---

## Testing the System

### Example Flow (Mock Mode)

```bash
# 1. Start all services
docker-compose up --build

# 2. Open browser
open http://localhost:3001

# 3. In the UI:
#    Niche: "AI art"
#    Hashtags: aiart, aigenerated, aiartcommunity, texttoimage
#    Quality: Pro
#    Clips: 3
#    Click "Generate Reel"

# 4. Watch pipeline progress in UI

# 5. When complete:
#    - Play video in browser
#    - Copy caption
#    - Copy hashtags
#    - Download MP4
```

### API Testing (without UI)

```bash
# Submit generation request
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -d '{"niche":"AI art","hashtags":["aiart","aigenerated","aiartcommunity","texttoimage"],"quality":"pro","clips":3}'

# Check status
curl http://localhost:3001/status/{jobId}

# Get results
curl http://localhost:3001/results/{jobId}

# Download video
curl -o reel.mp4 http://localhost:3001/download/{jobId}
```

### Health Checks

```bash
curl http://localhost:3001/health  # Orchestrator
curl http://localhost:3002/health  # Trend Scout
curl http://localhost:3003/health  # Content Strategist
curl http://localhost:3004/health  # Visual Producer
curl http://localhost:3005/health  # Post Optimizer
```

---

## Tech Stack

- **Backend:** Node.js 18 + Express
- **Frontend:** Single HTML file with inline CSS/JS (no framework)
- **Video Generation:** PiAPI (Kling 2.6) via REST API
- **Instagram Data:** Apify Instagram Hashtag Scraper via REST API
- **LLM:** Anthropic Claude API (Haiku 4.5 + Sonnet 4.5)
- **Video Processing:** FFmpeg (installed in Docker)
- **Containerization:** Docker + Docker Compose

---

## Cost Budget

| Component | Per Reel (Pro) | Per Reel (Standard) |
|-----------|:-----------:|:-----------:|
| Apify Instagram Scraper | $0.18 | $0.18 |
| Agent 1: Haiku (trend analysis) | $0.01 | $0.01 |
| Agent 2: Sonnet (creative direction) | $0.04 | $0.04 |
| Agent 3: Kling 2.6 × 3 clips | $0.99 | $0.60 |
| Agent 4: Haiku (post optimization) | $0.01 | $0.01 |
| FFmpeg (local) | $0.00 | $0.00 |
| **TOTAL** | **$1.23** | **$0.84** |

Build budget (Claude Code session): under $10.

---

## Constraints & Preferences

### Quality Standards
- Clean, readable code with comments where needed
- Proper error handling (don't crash on API failures — show error in UI)
- Logging for debugging (agent started, agent completed, errors)
- All configuration via environment variables

### Important Notes
- Build from scratch — no boilerplate templates
- Actually RUN and TEST everything — don't just write code
- Mock mode must work first, then real APIs can be tested
- The UI must actually work — test it in a browser
- The video player must play the generated video
- Nothing hardcoded — user inputs flow through the entire pipeline
- If something doesn't work, FIX IT before moving on

---

## Bonus Features (Optional — only if time permits)

- Real-time SSE (Server-Sent Events) instead of polling for status updates
- Background music added to the reel via FFmpeg
- Crossfade transitions between clips instead of hard cuts
- Engagement prediction confidence intervals
- Multiple niche presets (dropdown: AI art, fitness, cooking, travel)

---

## Start Here

1. Read this PROBLEM.md fully
2. Build all 5 services with mock mode first
3. Build the web UI
4. Test mock mode end-to-end (all services up, UI works, video plays)
5. Wire up real API integrations (Apify, Anthropic, PiAPI)
6. Test with real APIs
7. Write integration tests
8. Document everything in README.md and RESULTS.md

**Don't stop until the system works!**

Good luck! 🚀
