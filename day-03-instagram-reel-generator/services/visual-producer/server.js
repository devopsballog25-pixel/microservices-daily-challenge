const express = require('express');
const axios = require('axios');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { getMockClipConfig } = require('./mockData');

const execAsync = promisify(exec);

// Run FFmpeg with arguments as an array — bypasses /bin/sh entirely so no
// shell-level quoting or escaping is needed. Only FFmpeg's own filter parser
// sees the -vf string.
function spawnFFmpeg(args, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args);
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      if (code === 0) resolve(stderr);
      else reject(new Error(`FFmpeg failed (exit ${code}): ${stderr.slice(-800)}`));
    });
    proc.on('error', reject);
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`FFmpeg timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    proc.on('close', () => clearTimeout(timer));
  });
}

const app = express();
app.use(express.json({ limit: '50mb' }));

const USE_MOCK = process.env.USE_MOCK_DATA === 'true';
const PIAPI_KEY = process.env.PIAPI_API_KEY;
const KLING_VERSION = process.env.KLING_VERSION || '2.6';
const KLING_MODE = process.env.KLING_MODE || 'pro';
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://orchestrator:3001';
const OPENAI_KEY = process.env.OPENAI_API_KEY;

console.log(`[Visual Producer] Starting up. Mock mode: ${USE_MOCK}`);
console.log(`[Visual Producer] OpenAI TTS: ${OPENAI_KEY ? 'enabled' : 'disabled (no OPENAI_API_KEY)'}`);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'visual-producer', mock: USE_MOCK });
});

// Send progress update to orchestrator
async function sendProgress(jobId, summary) {
  try {
    await axios.post(`${ORCHESTRATOR_URL}/internal/progress/${jobId}`, {
      agentIndex: 2,
      summary
    }, { timeout: 5000 });
  } catch (err) {
    // Non-critical — orchestrator may not be available in standalone mode
    console.log(`[Visual Producer] Progress update skipped: ${err.message}`);
  }
}

// Generate a single mock clip using FFmpeg
async function generateMockClip(clipIndex, outputPath, label, duration = 5) {
  const config = getMockClipConfig(clipIndex);
  // Escape special characters in label for ffmpeg drawtext
  const safeLabel = label.replace(/[':]/g, '\\$&');
  const cmd = `ffmpeg -f lavfi -i "color=c=${config.color}:s=1080x1920:d=${duration},format=yuv420p" ` +
    `-vf "drawtext=text='${safeLabel}':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black:shadowx=3:shadowy=3" ` +
    `-c:v libx264 -preset fast -t ${duration} -y "${outputPath}"`;

  console.log(`[Visual Producer] Generating mock clip ${clipIndex + 1}: ${outputPath}`);
  await execAsync(cmd, { timeout: 60000 });
}

// Stitch clips together using FFmpeg concat
async function stitchClips(clipPaths, outputPath) {
  const filelistPath = outputPath.replace('stitched.mp4', 'filelist.txt');
  const filelistContent = clipPaths.map(p => `file '${p}'`).join('\n');
  fs.writeFileSync(filelistPath, filelistContent);

  const cmd = `ffmpeg -f concat -safe 0 -i "${filelistPath}" -c copy -y "${outputPath}"`;
  console.log(`[Visual Producer] Stitching ${clipPaths.length} clips...`);
  await execAsync(cmd, { timeout: 120000 });

  // Cleanup filelist
  fs.unlinkSync(filelistPath);
}

// Escape text for FFmpeg drawtext filter strings (single-quoted text value).
//
// Root cause of the original bug: FFmpeg's filter parser treats \ inside a
// single-quoted string as "exit the quoted context, include next char
// literally". So text='shouldn\'t' mis-parses: after the \' the parser
// leaves the quote, and ':fontcolor=...:enable=...' all gets consumed as
// part of the text value, breaking the between(t,...) expression.
//
// Fix: replace ASCII apostrophe (U+0027) with Unicode right single quotation
// mark (U+2019 '). It renders visually identical in every font, and since
// it is NOT the ASCII quote character, FFmpeg's filter parser treats it as a
// completely ordinary character inside single-quoted filter values.
function escapeForFFmpeg(text) {
  return (text || '')
    .replace(/'/g, '\u2019')          // ASCII apostrophe → curly apostrophe (safe in FFmpeg)
    .replace(/\\/g, '\\\\')           // backslash: \ → \\
    .replace(/:/g, '\\:')             // colon is the FFmpeg option separator
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/,/g, '\\,')             // comma is the FFmpeg filter-chain separator
    .replace(/\n/g, ' ')
    .replace(/[^\x00-\x7F\u2019]/g, ''); // strip emojis/non-ASCII but keep curly apostrophe
}

// Add per-clip text overlays + CTA to video
// clipOverlays: [{ text, startTime, endTime }] — one entry per clip
// Audio streams in the input are preserved (passed through unchanged).
async function addTextOverlays(inputPath, outputPath, clipOverlays, ctaText, totalDuration) {
  const ctaStart = Math.max(totalDuration - 3.5, totalDuration * 0.7);
  const filters = [];

  // Per-clip hook text — each appears during its clip's window
  for (const overlay of clipOverlays) {
    if (overlay.text && overlay.endTime > overlay.startTime) {
      const safeText = escapeForFFmpeg(overlay.text);
      filters.push(
        `drawtext=text='${safeText}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2` +
        `:enable='between(t,${overlay.startTime.toFixed(2)},${overlay.endTime.toFixed(2)})'` +
        `:shadowcolor=black:shadowx=2:shadowy=2`
      );
    }
  }

  // CTA at the end of the full video
  const safeCta = escapeForFFmpeg(ctaText || 'Follow for more');
  if (totalDuration - 0.5 > ctaStart) {
    filters.push(
      `drawtext=text='${safeCta}':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=(h-text_h)/2` +
      `:enable='between(t,${ctaStart.toFixed(2)},${(totalDuration - 0.5).toFixed(2)})'` +
      `:shadowcolor=black:shadowx=2:shadowy=2`
    );
  }

  const vfFilter = filters.join(', ');
  console.log(`[Visual Producer] Adding text overlays (${clipOverlays.length} clips + CTA)...`);

  // -map 0:v — video stream (re-encoded by drawtext)
  // -map 0:a? — audio stream if present (passed through unchanged), skip if absent
  await spawnFFmpeg([
    '-i', inputPath,
    '-vf', vfFilter,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-map', '0:v',
    '-map', '0:a?',
    '-c:a', 'copy',
    '-y', outputPath
  ], 120000);
}

// Generate AI voiceover using OpenAI TTS
async function generateVoiceover(captionText, jobId) {
  if (!OPENAI_KEY) {
    console.log('[Visual Producer] OPENAI_API_KEY not set — skipping voiceover');
    return null;
  }
  if (!captionText || captionText.trim().length === 0) return null;

  try {
    // Lazy-load OpenAI to avoid startup crash if package not installed
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: OPENAI_KEY });

    console.log('[Visual Producer] Generating AI voiceover (OpenAI TTS nova)...');
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',   // calm, clear — good for wisdom/motivation content
      input: captionText,
      speed: 0.95      // slightly slower for emotional weight
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const voiceFile = `/output/${jobId}/voice.mp3`;
    await fs.promises.writeFile(voiceFile, buffer);
    console.log(`[Visual Producer] Voiceover saved: ${voiceFile} (${(buffer.length / 1024).toFixed(0)} KB)`);
    return voiceFile;
  } catch (error) {
    console.error('[Visual Producer] Voice generation failed:', error.message);
    return null;
  }
}

// Select background music file based on niche
function getBackgroundMusic(niche) {
  const musicMap = {
    wisdom:     '/app/music/calm-piano.mp3',
    motivation: '/app/music/uplifting-ambient.mp3',
    ai:         '/app/music/electronic-chill.mp3',
    default:    '/app/music/calm-piano.mp3'
  };
  const nicheLower = (niche || '').toLowerCase();
  for (const [key, file] of Object.entries(musicMap)) {
    if (key !== 'default' && nicheLower.includes(key)) return file;
  }
  return musicMap.default;
}

// Mix AI voiceover (+ optional background music) into a silent video
// Returns the path to the video-with-audio, or the original path on failure.
async function mixAudioWithVideo(videoPath, voiceoverScript, niche, jobId, videoDuration) {
  const voiceFile = await generateVoiceover(voiceoverScript, jobId);
  if (!voiceFile) {
    console.log('[Visual Producer] No voiceover — video will be silent');
    return videoPath;
  }

  const musicFile = getBackgroundMusic(niche);
  const hasMusicFile = fs.existsSync(musicFile);
  const outputPath = `/output/${jobId}/with-audio.mp4`;

  try {
    if (hasMusicFile) {
      console.log(`[Visual Producer] Mixing voice + background music (${path.basename(musicFile)})...`);
      const fadeOutStart = Math.max(0, videoDuration - 2);
      await spawnFFmpeg([
        '-i', videoPath,
        '-i', voiceFile,
        '-i', musicFile,
        '-filter_complex',
          `[1:a]volume=1.0[voice];` +
          `[2:a]volume=0.15,afade=t=in:st=0:d=1,afade=t=out:st=${fadeOutStart}:d=2[music];` +
          `[voice][music]amix=inputs=2:duration=first:dropout_transition=2[out]`,
        '-map', '0:v:0',
        '-map', '[out]',
        '-c:v', 'copy',
        '-c:a', 'aac', '-b:a', '192k',
        '-shortest',
        '-y', outputPath
      ], 120000);
    } else {
      console.log('[Visual Producer] Adding voice track (no background music found)...');
      await spawnFFmpeg([
        '-i', videoPath,
        '-i', voiceFile,
        '-c:v', 'copy',
        '-c:a', 'aac', '-b:a', '192k',
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-shortest',
        '-y', outputPath
      ], 120000);
    }

    console.log('[Visual Producer] Audio mixed successfully');
    return outputPath;
  } catch (err) {
    console.error('[Visual Producer] Audio mixing failed (continuing without audio):', err.message);
    return videoPath;
  }
}

// Poll Kling task until completion
async function pollKlingTask(taskId, maxWaitMs = 900000) {
  const pollInterval = 5000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    const response = await axios.get(
      `https://api.piapi.ai/api/v1/task/${taskId}`,
      { headers: { 'x-api-key': PIAPI_KEY }, timeout: 30000 }
    );

    const status = response.data?.data?.status;
    console.log(`[Visual Producer] Task ${taskId} status: ${status}`);

    if (status === 'completed') {
      const works = response.data?.data?.output?.works;
      if (!works || works.length === 0) throw new Error('No output works in completed task');
      const videoUrl = works[0]?.video?.resource_without_watermark || works[0]?.video?.resource;
      if (!videoUrl) throw new Error('No video URL in completed task');
      return videoUrl;
    }

    if (status === 'failed') {
      throw new Error(`Kling task ${taskId} failed: ${JSON.stringify(response.data?.data?.error)}`);
    }
  }

  throw new Error(`Kling task ${taskId} timed out after ${maxWaitMs / 1000}s (15 minute limit reached)`);
}

// Download video from URL
async function downloadVideo(url, outputPath) {
  const response = await axios.get(url, { responseType: 'stream', timeout: 120000 });
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Main production endpoint
app.post('/produce', async (req, res) => {
  const { jobId, klingPrompts, textOverlays, quality, aspectRatio, niche } = req.body;
  const startTime = Date.now();

  console.log(`[Visual Producer] Starting production for job: ${jobId}, clips: ${klingPrompts?.length || 0}`);

  if (!jobId || !klingPrompts || klingPrompts.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: jobId, klingPrompts' });
  }

  const outputDir = `/output/${jobId}`;
  const clipsDir = `${outputDir}/clips`;

  try {
    // Ensure directories exist
    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(clipsDir, { recursive: true });

    const clipPaths = [];
    const clipResults = [];

    if (USE_MOCK) {
      // Mock mode: Generate colored gradient clips using FFmpeg
      console.log('[Visual Producer] Mock mode — generating colored gradient clips with FFmpeg');

      for (let i = 0; i < klingPrompts.length; i++) {
        const clip = klingPrompts[i];
        const clipPath = `${clipsDir}/clip${i + 1}.mp4`;
        const label = `Scene ${clip.sceneNumber} - ${clip.purpose?.toUpperCase() || 'CLIP'}`;

        await sendProgress(jobId, `${i + 1}/${klingPrompts.length} clips generated`);
        await generateMockClip(i, clipPath, label, clip.duration || 5);

        clipPaths.push(clipPath);
        clipResults.push({
          scene: clip.sceneNumber,
          hookText: clip.hookText || '',
          path: clipPath,
          duration: clip.duration || 5
        });

        await sendProgress(jobId, `${i + 1}/${klingPrompts.length} clips generated`);
        console.log(`[Visual Producer] Mock clip ${i + 1} ready: ${clipPath}`);
      }
    } else {
      // Real mode: Submit to Kling API in parallel
      console.log('[Visual Producer] Real mode — submitting to Kling AI...');

      const mode = KLING_MODE === 'pro' ? 'pro' : 'std';

      // Submit all tasks in parallel
      const taskSubmissions = klingPrompts.map(async (clip) => {
        const response = await axios.post(
          'https://api.piapi.ai/api/v1/task',
          {
            model: 'kling',
            task_type: 'video_generation',
            input: {
              prompt: clip.prompt,
              negative_prompt: 'blurry, low quality, distorted, text overlay, watermark, static, frozen',
              cfg_scale: 0.5,
              duration: clip.duration || 5,
              aspect_ratio: aspectRatio || '9:16',
              mode: mode,
              version: KLING_VERSION
            },
            config: {
              service_mode: '',
              webhook_config: { endpoint: '', secret: '' }
            }
          },
          { headers: { 'x-api-key': PIAPI_KEY, 'Content-Type': 'application/json' }, timeout: 30000 }
        );
        return { clip, taskId: response.data?.data?.task_id };
      });

      const tasks = await Promise.all(taskSubmissions);
      console.log(`[Visual Producer] Submitted ${tasks.length} Kling tasks`);

      // Poll all tasks in parallel
      let completedCount = 0;
      const videoUrls = await Promise.all(tasks.map(async ({ clip, taskId }) => {
        const videoUrl = await pollKlingTask(taskId, 900000);
        completedCount++;
        await sendProgress(jobId, `${completedCount}/${klingPrompts.length} clips generated`);
        return { clip, videoUrl };
      }));

      // Download all videos
      for (let i = 0; i < videoUrls.length; i++) {
        const { clip, videoUrl } = videoUrls[i];
        const clipPath = `${clipsDir}/clip${clip.sceneNumber}.mp4`;

        console.log(`[Visual Producer] Downloading clip ${clip.sceneNumber}...`);
        await downloadVideo(videoUrl, clipPath);

        clipPaths.push(clipPath);
        clipResults.push({
          scene: clip.sceneNumber,
          hookText: clip.hookText || '',
          path: clipPath,
          duration: clip.duration || 5
        });
      }
    }

    // Sort clips by scene number
    clipResults.sort((a, b) => a.scene - b.scene);
    const sortedPaths = clipResults.map(c => c.path);

    // Stitch clips together
    const stitchedPath = `${outputDir}/stitched.mp4`;
    await stitchClips(sortedPaths, stitchedPath);

    const totalDuration = clipResults.reduce((sum, c) => sum + c.duration, 0);

    // ---- AUDIO: voiceover + background music ----
    const voiceoverScript = textOverlays?.voiceoverScript || textOverlays?.hook || 'AI Generated Reel';
    const videoWithAudio = await mixAudioWithVideo(
      stitchedPath, voiceoverScript, niche || '', jobId, totalDuration
    );

    // ---- TEXT OVERLAYS: per-clip hookTexts ----
    // Calculate each clip's start/end time in the stitched video
    const ctaStart = Math.max(totalDuration - 3.5, totalDuration * 0.7);
    let clipOffset = 0;
    const clipOverlays = clipResults.map(c => {
      const textStart = clipOffset + 0.5;
      // Stop 0.5s before the clip ends OR just before CTA begins (whichever is first)
      const textEnd = Math.min(clipOffset + c.duration - 0.5, ctaStart - 0.1);
      clipOffset += c.duration;
      return { text: c.hookText, startTime: textStart, endTime: textEnd };
    }).filter(o => o.text && o.endTime > o.startTime);

    const reelPath = `${outputDir}/reel.mp4`;
    await addTextOverlays(
      videoWithAudio,
      reelPath,
      clipOverlays,
      textOverlays?.cta || 'Follow for more',
      totalDuration
    );

    // Cleanup intermediate files
    if (videoWithAudio !== stitchedPath) {
      try { fs.unlinkSync(videoWithAudio); } catch (e) { /* ignore */ }
    }
    try { fs.unlinkSync(stitchedPath); } catch (e) { /* ignore */ }

    // Calculate cost (Kling pricing: pro 5s = $0.33, std 5s = $0.20)
    const pricePerClip = KLING_MODE === 'pro' ? 0.33 : 0.20;
    const klingCost = USE_MOCK ? 0 : klingPrompts.length * pricePerClip;

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`[Visual Producer] Production complete in ${duration}s. Video: ${reelPath}`);

    res.json({
      jobId,
      videoPath: reelPath,
      clips: clipResults,
      totalDuration,
      resolution: '1080x1920',
      aspectRatio: '9:16',
      cost: { kling: klingCost, total: klingCost },
      duration,
      mock: USE_MOCK
    });

  } catch (err) {
    console.error(`[Visual Producer] Error for job ${jobId}:`, err.message);
    res.status(500).json({
      error: 'Video production failed',
      message: err.message,
      jobId
    });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`[Visual Producer] Running on port ${PORT} (mock=${USE_MOCK})`);
});
