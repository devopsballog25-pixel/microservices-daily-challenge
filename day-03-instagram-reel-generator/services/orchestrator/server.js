const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();

// Wide-open CORS so Day 04 (or any external service) can call all endpoints
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Serve static files (Web UI)
app.use(express.static(path.join(__dirname, 'public')));

// Agent URLs from environment variables
const AGENTS = {
  trendScout: process.env.TREND_SCOUT_URL || 'http://localhost:3002',
  contentStrategist: process.env.CONTENT_STRATEGIST_URL || 'http://localhost:3003',
  visualProducer: process.env.VISUAL_PRODUCER_URL || 'http://localhost:3004',
  postOptimizer: process.env.POST_OPTIMIZER_URL || 'http://localhost:3005'
};

// In-memory job store (keyed by jobId, ordered insertion via Map for latest-job lookup)
const jobs = {};
// Ordered list of jobIds for quick latest-job retrieval
const jobOrder = [];

console.log('[Orchestrator] Starting up...');
console.log('[Orchestrator] Agent URLs:', AGENTS);

// ============================================================
// HELPER: Check agent health
// ============================================================
async function checkAgentHealth(url, name) {
  try {
    const res = await axios.get(`${url}/health`, { timeout: 3000 });
    return res.data.status === 'healthy' ? 'up' : 'degraded';
  } catch {
    return 'down';
  }
}

// ============================================================
// HELPER: Build manifest object for a completed job
// ============================================================
function buildManifest(job) {
  const postPkg = job.results?.postPackage || {};
  const videoProd = job.results || {};
  const videoPath = `/output/${job.jobId}/reel.mp4`;

  let fileSize = null;
  try { fileSize = fs.statSync(videoPath).size; } catch { /* file may not exist */ }

  // Flatten all hashtags into one array
  const hashtagsObj = postPkg.hashtags || {};
  const allHashtags = [
    ...(hashtagsObj.niche || []),
    ...(hashtagsObj.medium || []),
    ...(hashtagsObj.broad || [])
  ];

  return {
    jobId: job.jobId,
    timestamp: new Date(job.startTime).toISOString(),
    completedAt: job.completedAt || null,
    status: job.status,
    input: job.input,
    output: {
      video: {
        path: './reel.mp4',
        fullPath: videoPath,
        duration: job.results?.trendData ? null : null, // filled by visual producer
        resolution: '1080x1920',
        fileSize
      },
      captions: {
        variantA: (postPkg.captions || []).find(c => c.variant === 'A')?.text || '',
        variantB: (postPkg.captions || []).find(c => c.variant === 'B')?.text || ''
      },
      hashtags: {
        all: allHashtags,
        niche: hashtagsObj.niche || [],
        medium: hashtagsObj.medium || [],
        broad: hashtagsObj.broad || [],
        formatted: hashtagsObj.formatted || allHashtags.join(' ')
      },
      postingStrategy: postPkg.postingStrategy || {},
      predictions: postPkg.predictions || {}
    },
    pipeline: {
      agents: (job.pipeline || []).map(p => ({
        name: p.agent,
        duration: p.duration,
        cost: p.cost,
        status: p.status,
        summary: p.summary
      })),
      challenges: job.challenges || [],
      totalCost: job.runningCost,
      totalDuration: job.completedAt
        ? `${Math.round((job.completedAt - job.startTime) / 1000)}s`
        : null
    }
  };
}

// ============================================================
// HELPER: Write manifest.json to disk
// ============================================================
function writeManifest(jobId) {
  const job = jobs[jobId];
  if (!job) return;
  try {
    const manifest = buildManifest(job);
    fs.writeFileSync(`/output/${jobId}/manifest.json`, JSON.stringify(manifest, null, 2));
    console.log(`[Orchestrator] manifest.json written for ${jobId}`);
  } catch (e) {
    console.error(`[Orchestrator] Failed to write manifest for ${jobId}:`, e.message);
  }
}

// ============================================================
// ENHANCED HEALTH CHECK
// ============================================================
app.get('/health', async (req, res) => {
  // Check all agents in parallel (non-blocking, best-effort)
  const [ts, cs, vp, po] = await Promise.all([
    checkAgentHealth(AGENTS.trendScout, 'trendScout'),
    checkAgentHealth(AGENTS.contentStrategist, 'contentStrategist'),
    checkAgentHealth(AGENTS.visualProducer, 'visualProducer'),
    checkAgentHealth(AGENTS.postOptimizer, 'postOptimizer')
  ]);

  // Find the most recent completed job
  const lastCompleted = jobOrder
    .map(id => jobs[id])
    .filter(j => j && j.status === 'completed')
    .slice(-1)[0];

  const readyForDay04 = ts === 'up' && cs === 'up' && vp === 'up' && po === 'up';

  res.json({
    status: 'healthy',
    service: 'orchestrator',
    services: {
      orchestrator: 'up',
      trendScout: ts,
      contentStrategist: cs,
      visualProducer: vp,
      postOptimizer: po
    },
    lastJob: lastCompleted ? {
      jobId: lastCompleted.jobId,
      timestamp: new Date(lastCompleted.startTime).toISOString(),
      completedAt: lastCompleted.completedAt
        ? new Date(lastCompleted.completedAt).toISOString()
        : null,
      status: lastCompleted.status
    } : null,
    readyForDay04,
    activeJobs: jobOrder.filter(id => jobs[id]?.status === 'in_progress').length,
    totalJobs: jobOrder.length
  });
});

// ============================================================
// INTERNAL PROGRESS UPDATE (called by visual producer)
// ============================================================
app.post('/internal/progress/:jobId', (req, res) => {
  const job = jobs[req.params.jobId];
  if (job) {
    const { agentIndex, summary } = req.body;
    if (typeof agentIndex === 'number' && job.pipeline[agentIndex]) {
      job.pipeline[agentIndex].summary = summary;
    }
  }
  res.json({ ok: true });
});

// ============================================================
// CORE GENERATE HANDLER (shared by /generate and /api/generate)
// ============================================================
function handleGenerate(req, res) {
  const { niche, hashtags, quality, clips } = req.body;

  if (!niche) {
    return res.status(400).json({ error: 'Missing required field: niche' });
  }

  const jobId = `job-${uuidv4()}`;
  const parsedHashtags = Array.isArray(hashtags) ? hashtags :
    (typeof hashtags === 'string' ? hashtags.split(',').map(h => h.trim().replace(/^#/, '')) : []);

  jobs[jobId] = {
    jobId,
    status: 'in_progress',
    stage: 'trend_analysis',
    startTime: Date.now(),
    completedAt: null,
    input: { niche, hashtags: parsedHashtags, quality: quality || 'pro', clips: parseInt(clips) || 3 },
    pipeline: [
      { agent: 'Trend Scout', status: 'pending', duration: null, cost: null, summary: null },
      { agent: 'Content Strategist', status: 'pending', duration: null, cost: null, summary: null },
      { agent: 'Visual Producer', status: 'pending', duration: null, cost: null, summary: null },
      { agent: 'Post Optimizer', status: 'pending', duration: null, cost: null, summary: null }
    ],
    challenges: [],
    runningCost: '$0.00',
    results: null,
    error: null
  };
  jobOrder.push(jobId);

  res.json({ jobId, status: 'in_progress' });

  runPipeline(jobId).catch(err => {
    console.error(`[Orchestrator] Unhandled pipeline error for ${jobId}:`, err.message);
    if (jobs[jobId]) {
      jobs[jobId].status = 'error';
      jobs[jobId].error = err.message;
    }
  });
}

// ============================================================
// UI GENERATE ENDPOINT
// ============================================================
app.post('/generate', handleGenerate);

// ============================================================
// API ENDPOINTS FOR DAY 04 INTEGRATION
// ============================================================

// List all jobs
app.get('/api/jobs', (req, res) => {
  const list = jobOrder.map(id => {
    const j = jobs[id];
    return {
      jobId: j.jobId,
      status: j.status,
      niche: j.input?.niche,
      timestamp: new Date(j.startTime).toISOString(),
      completedAt: j.completedAt ? new Date(j.completedAt).toISOString() : null,
      runningCost: j.runningCost,
      error: j.error || null
    };
  });
  res.json(list);
});

// Latest completed job
app.get('/api/latest-job', (req, res) => {
  const latest = jobOrder
    .map(id => jobs[id])
    .filter(j => j && j.status === 'completed')
    .slice(-1)[0];

  if (!latest) {
    return res.status(404).json({ error: 'No completed jobs found' });
  }

  res.json({
    jobId: latest.jobId,
    status: latest.status,
    niche: latest.input?.niche,
    timestamp: new Date(latest.startTime).toISOString(),
    completedAt: latest.completedAt ? new Date(latest.completedAt).toISOString() : null,
    manifestPath: `/api/manifest/${latest.jobId}`,
    videoUrl: `/download/${latest.jobId}`,
    runningCost: latest.runningCost
  });
});

// Full manifest for a specific job
app.get('/api/manifest/:jobId', (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) {
    // Try to read from disk (survives restarts if written)
    const diskPath = `/output/${req.params.jobId}/manifest.json`;
    if (fs.existsSync(diskPath)) {
      try {
        return res.json(JSON.parse(fs.readFileSync(diskPath, 'utf8')));
      } catch { /* fall through */ }
    }
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(buildManifest(job));
});

// Programmatic generation (same contract as /generate but under /api/)
app.post('/api/generate', handleGenerate);

// ============================================================
// PIPELINE RUNNER
// ============================================================
async function runPipeline(jobId) {
  const job = jobs[jobId];
  const { niche, hashtags, quality, clips } = job.input;
  let totalCost = 0;

  console.log(`[Orchestrator] Pipeline started for job ${jobId}: niche="${niche}", clips=${clips}`);

  const outputDir = `/output/${jobId}`;
  try {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(`${outputDir}/clips`, { recursive: true });
  } catch (e) {
    console.error('[Orchestrator] Failed to create output directory:', e.message);
  }

  try {
    // ---- AGENT 1: Trend Scout ----
    job.pipeline[0].status = 'in_progress';
    job.stage = 'trend_analysis';
    const agent1Start = Date.now();
    console.log(`[Orchestrator] Calling Trend Scout...`);

    const trendResponse = await axios.post(`${AGENTS.trendScout}/analyze`, {
      niche, hashtags
    }, { timeout: 320000 });

    const agent1Duration = Math.round((Date.now() - agent1Start) / 1000);
    job.pipeline[0].status = 'completed';
    job.pipeline[0].duration = `${agent1Duration}s`;
    job.pipeline[0].cost = `$${(trendResponse.data.cost?.total || 0.188).toFixed(3)}`;
    job.pipeline[0].summary = `Scraped ${trendResponse.data.scrapedCount || 0} reels, found top trends for "${niche}"`;
    totalCost += trendResponse.data.cost?.total || 0.188;
    job.runningCost = `$${totalCost.toFixed(2)}`;
    console.log(`[Orchestrator] Trend Scout completed in ${agent1Duration}s`);

    try { fs.writeFileSync(`${outputDir}/trend_data.json`, JSON.stringify(trendResponse.data, null, 2)); } catch { /* ignore */ }

    // ---- AGENT 2: Content Strategist ----
    job.pipeline[1].status = 'in_progress';
    job.stage = 'content_strategy';
    const agent2Start = Date.now();
    console.log(`[Orchestrator] Calling Content Strategist...`);

    const contentResponse = await axios.post(`${AGENTS.contentStrategist}/strategize`, {
      niche, hashtags, trendData: trendResponse.data, clips, quality
    }, { timeout: 120000 });

    const agent2Duration = Math.round((Date.now() - agent2Start) / 1000);
    job.pipeline[1].status = 'completed';
    job.pipeline[1].duration = `${agent2Duration}s`;
    job.pipeline[1].cost = `$${(contentResponse.data.cost?.total || 0.04).toFixed(3)}`;
    job.pipeline[1].summary = contentResponse.data.concept?.theme
      ? `Theme: ${contentResponse.data.concept.theme}`
      : 'Creative brief generated';
    totalCost += contentResponse.data.cost?.total || 0.04;
    job.runningCost = `$${totalCost.toFixed(2)}`;

    if (contentResponse.data.challenge?.issue) {
      job.challenges.push({
        challenger: 'Content Strategist',
        challenged: contentResponse.data.challenge.challenged || 'Trend Scout',
        issue: contentResponse.data.challenge.issue
      });
    }
    console.log(`[Orchestrator] Content Strategist completed in ${agent2Duration}s`);

    try { fs.writeFileSync(`${outputDir}/creative_brief.json`, JSON.stringify(contentResponse.data, null, 2)); } catch { /* ignore */ }

    // ---- AGENT 3: Visual Producer ----
    job.pipeline[2].status = 'in_progress';
    job.pipeline[2].summary = 'Initializing video production...';
    job.stage = 'video_production';
    const agent3Start = Date.now();
    console.log(`[Orchestrator] Calling Visual Producer...`);

    const videoResponse = await axios.post(`${AGENTS.visualProducer}/produce`, {
      jobId,
      klingPrompts: contentResponse.data.klingPrompts,
      textOverlays: contentResponse.data.textOverlays,
      quality,
      aspectRatio: '9:16',
      niche
    }, { timeout: 1200000 }); // 20 min

    const agent3Duration = Math.round((Date.now() - agent3Start) / 1000);
    const numClips = videoResponse.data.clips?.length || clips;
    job.pipeline[2].status = 'completed';
    job.pipeline[2].duration = `${agent3Duration}s`;
    job.pipeline[2].cost = `$${(videoResponse.data.cost?.total || 0).toFixed(3)}`;
    job.pipeline[2].summary = `${numClips} clips generated and stitched into reel`;
    totalCost += videoResponse.data.cost?.total || 0;
    job.runningCost = `$${totalCost.toFixed(2)}`;
    console.log(`[Orchestrator] Visual Producer completed in ${agent3Duration}s`);

    // ---- AGENT 4: Post Optimizer ----
    job.pipeline[3].status = 'in_progress';
    job.stage = 'post_optimization';
    const agent4Start = Date.now();
    console.log(`[Orchestrator] Calling Post Optimizer...`);

    const postResponse = await axios.post(`${AGENTS.postOptimizer}/optimize`, {
      niche, hashtags,
      trendData: trendResponse.data,
      creativeBrief: contentResponse.data,
      videoMetadata: {
        totalDuration: videoResponse.data.totalDuration,
        resolution: videoResponse.data.resolution,
        clips: numClips,
        textOverlays: contentResponse.data.textOverlays
      }
    }, { timeout: 120000 });

    const agent4Duration = Math.round((Date.now() - agent4Start) / 1000);
    job.pipeline[3].status = 'completed';
    job.pipeline[3].duration = `${agent4Duration}s`;
    job.pipeline[3].cost = `$${(postResponse.data.cost?.total || 0.008).toFixed(3)}`;
    job.pipeline[3].summary = '2 caption variants + 30 hashtags + posting strategy ready';
    totalCost += postResponse.data.cost?.total || 0.008;
    job.runningCost = `$${totalCost.toFixed(2)}`;

    if (postResponse.data.challenges?.length > 0) {
      postResponse.data.challenges.forEach(challenge => {
        job.challenges.push({
          challenger: 'Post Optimizer',
          challenged: challenge.challengedAgent || 'Content Strategist',
          issue: challenge.issue
        });
      });
    }
    console.log(`[Orchestrator] Post Optimizer completed in ${agent4Duration}s`);

    try { fs.writeFileSync(`${outputDir}/posting_package.json`, JSON.stringify(postResponse.data, null, 2)); } catch { /* ignore */ }

    // Build and save pipeline report
    const totalElapsed = Math.round((Date.now() - job.startTime) / 1000);
    const report = {
      jobId,
      totalCost: totalCost.toFixed(2),
      totalDuration: `${totalElapsed}s`,
      pipeline: job.pipeline,
      challenges: job.challenges
    };
    try { fs.writeFileSync(`${outputDir}/report.json`, JSON.stringify(report, null, 2)); } catch { /* ignore */ }

    // Finalize job
    job.status = 'completed';
    job.stage = 'completed';
    job.completedAt = Date.now();
    job.runningCost = `$${totalCost.toFixed(2)}`;
    job.results = {
      videoPath: videoResponse.data.videoPath,
      trendData: trendResponse.data,
      creativeBrief: contentResponse.data,
      postPackage: postResponse.data,
      totalCost: totalCost.toFixed(2),
      totalDuration: `${totalElapsed}s`
    };

    // Write manifest.json for Day 04 consumption
    writeManifest(jobId);

    console.log(`[Orchestrator] Pipeline complete for ${jobId}. Total: ${totalElapsed}s, $${totalCost.toFixed(2)}`);

  } catch (err) {
    console.error(`[Orchestrator] Pipeline error for ${jobId}:`, err.message);
    job.status = 'error';
    job.error = err.response?.data?.error || err.message;
    job.pipeline.forEach(p => {
      if (p.status === 'in_progress') {
        p.status = 'failed';
        p.summary = `Error: ${err.message}`;
      }
    });
  }
}

// ============================================================
// STATUS ENDPOINT
// ============================================================
app.get('/status/:jobId', (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const elapsed = Math.round((Date.now() - job.startTime) / 1000);
  res.json({
    jobId: job.jobId,
    status: job.status,
    stage: job.stage,
    pipeline: job.pipeline,
    challenges: job.challenges,
    runningCost: job.runningCost,
    elapsed: `${elapsed}s`,
    error: job.error || null
  });
});

// ============================================================
// RESULTS ENDPOINT
// ============================================================
app.get('/results/:jobId', (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status === 'error') return res.status(500).json({ error: job.error, status: 'error' });
  if (job.status !== 'completed') return res.status(202).json({ status: job.status, message: 'Pipeline still in progress' });

  res.json(job.results);
});

// ============================================================
// DOWNLOAD VIDEO ENDPOINT
// ============================================================
app.get('/download/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = jobs[jobId];

  if (!job) return res.status(404).json({ error: 'Job not found' });

  const videoPath = `/output/${jobId}/reel.mp4`;
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Video file not found. Pipeline may not be complete.' });
  }

  const stat = fs.statSync(videoPath);
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="reel-${jobId}.mp4"`);
  res.setHeader('Accept-Ranges', 'bytes');

  fs.createReadStream(videoPath).pipe(res);
});

// ============================================================
// SERVE WEB UI (fallback)
// ============================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Orchestrator] Running on port ${PORT}`);
  console.log(`[Orchestrator] Web UI: http://localhost:${PORT}`);
});
