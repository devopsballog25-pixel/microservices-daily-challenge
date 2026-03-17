# Day 06: AI Crypto Live Stream — 24/7 YouTube Streaming

## Problem Statement

The autonomous AI trading experiment from Day 05 was running 24/7 on Railway, 
making autonomous trading decisions every 15 minutes — but nobody could watch 
it in real time without visiting the dashboard URL directly.

How do you make an autonomous AI agent's decision-making process publicly 
visible and watchable 24/7 without any human operating a streaming setup?

## Solution

A production livestream microservice that:

1. Launches a headless Chromium browser rendering the /live dashboard
2. Creates a virtual display using Xvfb (X Virtual Framebuffer)
3. Captures the display in real time using FFmpeg x11grab
4. Encodes to H264 video + AAC audio
5. Streams continuously to YouTube via RTMP
6. Auto-restarts if any component crashes
7. Loops background music for 24 hours

## Architecture
```
Railway Container (livestream service)
│
├── Xvfb :99 (Virtual Display 1920x1080)
│     └── Chromium (kiosk mode)
│           └── https://crypto-dashboard-production-a22f.up.railway.app/live
│
├── FFmpeg
│     ├── Input 1: x11grab from :99.0+0,0 (video)
│     ├── Input 2: background.mp3 loop (audio)
│     └── Output: rtmp://x.rtmp.youtube.com/live2/[key]
│           ├── Video: H264 ultrafast stillimage 6800kbps 1080p30
│           └── Audio: AAC 128kbps stereo
│
└── Auto-restart on crash (browser.js + stream.js)
```

## Tech Stack

- **Runtime:** Node.js 18
- **Virtual Display:** Xvfb 1920x1080x24
- **Browser:** Chromium headless (kiosk mode, no sandbox)
- **Video Encoding:** FFmpeg x11grab → libx264 ultrafast + stillimage tune
- **Audio:** AAC 128kbps + YouTube Audio Library CC music (committed to repo)
- **Streaming Protocol:** RTMP
- **Cloud:** Railway Pro
- **Container:** Docker (node:20-slim base)

## Key Technical Decisions

### Why ultrafast + stillimage?
The dashboard is a mostly static dark UI — text, charts, numbers. H264's
`stillimage` tune optimizes specifically for low-motion content, dramatically
reducing CPU usage while maintaining quality. `ultrafast` preset minimizes
encoding latency to keep FFmpeg at speed=1.0x.

### Why commit the music file to the repo?
External music downloads are unreliable in Docker builds — URLs break,
network timeouts occur, and files may be incomplete. Committing a YouTube
Audio Library CC track directly ensures consistent builds every time.

### Why CBR with filler?
Static content naturally compresses to ~2800kbps even when targeting 6800kbps.
YouTube warns about low bitrate. `nal-hrd=cbr:force-cfr=1:filler=1` pads the
stream with filler NAL units to maintain constant bitrate to YouTube servers.

### Why Railway Pro?
Real-time H264 encoding at 1080p30 requires consistent CPU. Railway's hobby
tier has variable CPU allocation that causes frame drops. Pro tier provides
dedicated resources needed for speed=1.0x encoding.

## Service Files
```
services/livestream/
├── Dockerfile                    — Build image with all dependencies + music
├── start.sh                      — Starts Xvfb → browser.js → stream.js
├── browser.js                    — Launches Chromium, auto-restarts on exit
├── stream.js                     — FFmpeg encoding + RTMP streaming
├── package.json                  — puppeteer-core dependency
├── .env.example                  — Required environment variables
└── music/
    └── background_source.mp3     — YouTube Audio Library CC track
```

## Environment Variables
```
YOUTUBE_STREAM_KEY=your-stream-key
YOUTUBE_RTMP_URL=rtmp://x.rtmp.youtube.com/live2
LIVE_URL=https://crypto-dashboard-production-a22f.up.railway.app/live
```

## Deployment

Service is deployed on Railway as part of the crypto-portfolio-manager project.
Auto-deploys from main branch on push.

Railway build time: ~3-4 minutes (FFmpeg processing music file at build time)

## Live Stream

🔴 **Watch live:** https://youtube.com/live/KtYI7Q8Sx_E?feature=share

📊 **Dashboard:** https://balajiloganathan.net/crypto/live

## What You See on Stream

- AI Portfolio equity curve vs BTC and ETH buy-and-hold benchmarks
- Live BUY/SELL/HOLD decisions with AI reasoning (every 15 minutes)
- Current holdings with entry prices and P&L
- Agent activity feed with full decision reasoning
- Next evaluation countdown timer
- Bottom ticker with live crypto prices

## Bugs Fixed

1. `-draw_mouse 0` not supported in FFmpeg 5.1.8 — removed
2. External music download unreliable — switched to committed repo file
3. `veryfast` preset too slow for Railway — switched to `ultrafast` + `stillimage`
4. Bitrate below YouTube recommendation — added CBR filler padding
5. Thread queue blocking — added `-thread_queue_size 512` to inputs
6. Activity feed showing oldest first — removed `.reverse()` from renderFeed()

## Performance Metrics

- Resolution: 1920x1080 (1080p)
- Frame rate: 30fps
- Video bitrate: 6800kbps (CBR padded)
- Audio bitrate: 128kbps AAC stereo
- Encoding speed: ~1.0x real time
- Stream uptime: 24/7 autonomous
- Auto-restart: Yes (both browser and FFmpeg)

## Cost

- Build cost: ~$10 (Claude Code API)
- Monthly running cost: ~$10-15 (Railway Pro)
- YouTube streaming: Free

## Links

- **Live Stream:** https://youtube.com/live/KtYI7Q8Sx_E?feature=share
- **Live Dashboard:** https://balajiloganathan.net/crypto/live
- **Portfolio Site:** https://balajiloganathan.net
- **YouTube Channel:** https://youtube.com/@devopsballog25

---

*Built autonomously with Claude Code · Part of the Daily Microservices Challenge*