const express = require('express');
const axios = require('axios');
const { getMockPostPackage } = require('./mockData');

const app = express();
app.use(express.json());

const USE_MOCK = process.env.USE_MOCK_DATA === 'true';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.POST_OPTIMIZER_MODEL || 'claude-haiku-4-5-20251001';

console.log(`[Post Optimizer] Starting up. Mock mode: ${USE_MOCK}`);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'post-optimizer', mock: USE_MOCK });
});

// Generate post optimization
app.post('/optimize', async (req, res) => {
  const { niche, hashtags, trendData, creativeBrief, videoMetadata } = req.body;
  const startTime = Date.now();

  console.log(`[Post Optimizer] Optimizing post for niche: "${niche}"`);

  if (!niche || !trendData || !creativeBrief) {
    return res.status(400).json({ error: 'Missing required fields: niche, trendData, creativeBrief' });
  }

  try {
    if (USE_MOCK) {
      console.log('[Post Optimizer] Using mock data — skipping Claude Haiku API call');
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockPackage = getMockPostPackage(niche, hashtags);
      mockPackage.duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`[Post Optimizer] Mock optimization complete in ${mockPackage.duration}s`);
      return res.json(mockPackage);
    }

    // Real mode: Call Claude Haiku
    console.log('[Post Optimizer] Calling Claude Haiku for post optimization...');

    const systemPrompt = `You are an expert Instagram growth strategist and copywriter. Create viral-optimized captions, hashtag strategies, and posting plans.

Caption rules:
- First line is the hook (must stop scrolling)
- Use line breaks for readability
- Include clear CTA
- Keep under 2200 characters
- Use emojis sparingly but effectively
- Write 2 distinct variants (A = curiosity hook, B = POV/experience hook)

Hashtag rules:
- 30 total: 10 niche + 10 medium + 10 broad
- Include user's original hashtags
- Provide all 30 in one formatted string

Respond ONLY with valid JSON.`;

    const userPrompt = `Niche: "${niche}"
Original hashtags: ${JSON.stringify(hashtags)}
Video theme: ${creativeBrief.concept?.theme || 'AI-generated content'}
Hook text overlay: ${creativeBrief.textOverlays?.hook || ''}
CTA text overlay: ${creativeBrief.textOverlays?.cta || ''}
Video duration: ${videoMetadata?.totalDuration || 15}s
Number of clips: ${videoMetadata?.clips || 3}

Trend insights:
- Top hooks: ${JSON.stringify(trendData.analysis?.captionPatterns?.hooks || [])}
- Top CTAs: ${JSON.stringify(trendData.analysis?.captionPatterns?.ctas || [])}
- Hashtag strategy: ${JSON.stringify(trendData.analysis?.hashtagStrategy || {})}

Generate post optimization package. Also challenge any upstream agent if improvements are possible.

Return this JSON structure:
{
  "captions": [
    {"variant": "A", "text": "", "hook": "", "cta": ""},
    {"variant": "B", "text": "", "hook": "", "cta": ""}
  ],
  "hashtags": {
    "niche": [],
    "medium": [],
    "broad": [],
    "formatted": ""
  },
  "postingStrategy": {
    "bestTimes": [],
    "firstComment": "",
    "storyStrategy": "",
    "engagementTips": []
  },
  "predictions": {
    "expectedViews": "",
    "expectedEngagement": "",
    "viralPotential": "",
    "reasoning": ""
  },
  "challenges": [
    {"challengedAgent": "", "issue": "", "fix": ""}
  ],
  "cost": {"haiku": 0.008, "total": 0.008},
  "duration": 5
}`;

    const anthropicResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: MODEL,
        max_tokens: 4096,
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
    let postPackage;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                        responseText.match(/\{[\s\S]*\}/);
      postPackage = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText);
    } catch (parseErr) {
      console.error('[Post Optimizer] Parse error:', parseErr.message);
      return res.json(getMockPostPackage(niche, hashtags));
    }

    const inputTokens = anthropicResponse.data.usage?.input_tokens || 0;
    const outputTokens = anthropicResponse.data.usage?.output_tokens || 0;
    const haikuCost = ((inputTokens * 0.00025 + outputTokens * 0.00125) / 1000);

    postPackage.cost = { haiku: haikuCost, total: haikuCost };
    postPackage.duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`[Post Optimizer] Optimization complete in ${postPackage.duration}s`);
    res.json(postPackage);

  } catch (err) {
    console.error('[Post Optimizer] Error:', err.message);
    const fallback = getMockPostPackage(niche, hashtags);
    fallback.error = err.message;
    res.json(fallback);
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`[Post Optimizer] Running on port ${PORT} (mock=${USE_MOCK})`);
});
