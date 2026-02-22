const express = require('express');
const axios = require('axios');
const { getMockContentBrief } = require('./mockData');

const app = express();
app.use(express.json());

const USE_MOCK = process.env.USE_MOCK_DATA === 'true';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CONTENT_STRATEGIST_MODEL || 'claude-sonnet-4-5-20250929';

console.log(`[Content Strategist] Starting up. Mock mode: ${USE_MOCK}`);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'content-strategist', mock: USE_MOCK });
});

// Generate content strategy
app.post('/strategize', async (req, res) => {
  const { niche, hashtags, trendData, clips, quality } = req.body;
  const startTime = Date.now();

  console.log(`[Content Strategist] Creating strategy for niche: "${niche}", clips: ${clips}`);

  if (!niche || !trendData) {
    return res.status(400).json({ error: 'Missing required fields: niche, trendData' });
  }

  try {
    if (USE_MOCK) {
      console.log('[Content Strategist] Using mock data — skipping Claude Sonnet API call');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockBrief = getMockContentBrief(niche, hashtags, clips);
      mockBrief.duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`[Content Strategist] Mock strategy complete in ${mockBrief.duration}s`);
      return res.json(mockBrief);
    }

    // Real mode: Call Claude Sonnet
    console.log('[Content Strategist] Calling Claude Sonnet for creative strategy...');
    const numClips = parseInt(clips) || 3;

    const systemPrompt = `You are an elite Instagram content strategist and creative director. Your job is to analyze trend data and create viral-optimized video concepts.

KLING VIDEO PROMPT RULES (critical for quality):
- Max 2500 characters per prompt
- Use cinematic language: "tracking shot", "dolly zoom", "aerial view", "crane up"
- Specify color palettes explicitly: "teal and purple palette"
- Include quality keywords: "hyperrealistic", "8k", "cinematic", "volumetric lighting"
- Describe motion explicitly: "camera slowly descends", "particles float past"
- Describe what the camera SEES, not abstract concepts
- All prompts must target 9:16 vertical video (specify vertical framing)
- Create a narrative arc: Hook (stop scrolling) → Build (create wonder) → Payoff (epic reveal)

HOOK TEXT RULES (for per-clip video overlays):
- Each clip must have a hookText: 40-60 characters maximum
- Must be a complete sentence or punchy phrase — never cut off mid-word
- Captures the emotional essence of that specific clip
- Easy to read in 3-5 seconds on screen
- No emojis (they may not render in video overlays)

VOICEOVER SCRIPT RULES:
- Write a natural narration script matching the full video duration
- 40-80 words total (reads in 15-20 seconds at 0.95x speed)
- Conversational, emotionally engaging tone
- Flows naturally from clip to clip
- No hashtags or special characters

Respond ONLY with valid JSON matching the exact schema.`;

    const userPrompt = `Niche: "${niche}"
Hashtags: ${JSON.stringify(hashtags)}
Quality: ${quality}
Number of clips needed: ${numClips}

Trend Analysis:
${JSON.stringify(trendData.analysis, null, 2)}

Create a ${numClips}-clip video strategy. IMPORTANT: Challenge Agent 1 (Trend Scout) if the top theme is oversaturated — pivot to a fresher angle.

For EACH clip, include a hookText (40-60 chars, no emojis, complete phrase for that scene).
For textOverlays, include a voiceoverScript (40-80 words, natural narration for the full video).
For textOverlays.hook and cta: keep these short (under 50 chars, no emojis).

Return JSON with this exact structure:
{
  "concept": {
    "theme": "",
    "angle": "",
    "narrativeArc": "",
    "whyThisTheme": ""
  },
  "challenge": {
    "challenged": "Trend Scout",
    "issue": "",
    "reasoning": ""
  },
  "klingPrompts": [
    {
      "sceneNumber": 1,
      "prompt": "",
      "hookText": "",
      "duration": 5,
      "purpose": "hook|build|payoff",
      "cameraDirection": "",
      "colorPalette": ""
    }
  ],
  "textOverlays": {
    "hook": "",
    "cta": "",
    "voiceoverScript": ""
  },
  "musicSuggestion": "",
  "cost": {"sonnet": 0.04, "total": 0.04},
  "duration": 4
}

Generate exactly ${numClips} prompts in the klingPrompts array.`;

    const anthropicResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: MODEL,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      },
      {
        headers: {
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const responseText = anthropicResponse.data.content[0].text;
    let brief;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                        responseText.match(/\{[\s\S]*\}/);
      brief = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText);
    } catch (parseErr) {
      console.error('[Content Strategist] Parse error:', parseErr.message);
      return res.json(getMockContentBrief(niche, hashtags, clips));
    }

    const inputTokens = anthropicResponse.data.usage?.input_tokens || 0;
    const outputTokens = anthropicResponse.data.usage?.output_tokens || 0;
    const sonnetCost = ((inputTokens * 0.003 + outputTokens * 0.015) / 1000);

    brief.cost = { sonnet: sonnetCost, total: sonnetCost };
    brief.duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`[Content Strategist] Strategy complete in ${brief.duration}s`);
    res.json(brief);

  } catch (err) {
    console.error('[Content Strategist] Error:', err.message);
    // Return mock data as fallback
    const fallback = getMockContentBrief(niche, hashtags, clips);
    fallback.error = err.message;
    res.json(fallback);
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`[Content Strategist] Running on port ${PORT} (mock=${USE_MOCK})`);
});
