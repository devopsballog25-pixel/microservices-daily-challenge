const express = require('express');
const axios = require('axios');
const { getMockTrendData } = require('./mockData');

const app = express();
app.use(express.json());

const USE_MOCK = process.env.USE_MOCK_DATA === 'true';
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.TREND_SCOUT_MODEL || 'claude-haiku-4-5-20251001';

console.log(`[Trend Scout] Starting up. Mock mode: ${USE_MOCK}`);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'trend-scout', mock: USE_MOCK });
});

// Analyze Instagram trends
app.post('/analyze', async (req, res) => {
  const { niche, hashtags } = req.body;
  const startTime = Date.now();

  console.log(`[Trend Scout] Analyzing trends for niche: "${niche}", hashtags: ${JSON.stringify(hashtags)}`);

  if (!niche || !hashtags || !Array.isArray(hashtags)) {
    return res.status(400).json({ error: 'Missing required fields: niche, hashtags (array)' });
  }

  try {
    if (USE_MOCK) {
      console.log('[Trend Scout] Using mock data — skipping Apify and Anthropic API calls');
      // Small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockData = getMockTrendData(niche, hashtags);
      mockData.duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`[Trend Scout] Mock analysis complete in ${mockData.duration}s`);
      return res.json(mockData);
    }

    // Real mode: Step 1 — Scrape Instagram via Apify
    console.log('[Trend Scout] Scraping Instagram via Apify...');
    let scrapedReels = [];

    try {
      const apifyResponse = await axios.post(
        `https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
        {
          hashtags: hashtags,
          resultsType: 'reels',
          resultsLimit: 20
        },
        { timeout: 300000, headers: { 'Content-Type': 'application/json' } }
      );
      scrapedReels = Array.isArray(apifyResponse.data) ? apifyResponse.data : [];
      console.log(`[Trend Scout] Scraped ${scrapedReels.length} reels from Apify`);
    } catch (apifyErr) {
      console.error('[Trend Scout] Apify scraping failed:', apifyErr.message);
      // Fall back to empty data and continue with Anthropic analysis
      scrapedReels = [];
    }

    // Prepare data summary for Anthropic
    const reelSummaries = scrapedReels.slice(0, 40).map(reel => ({
      caption: reel.caption ? reel.caption.substring(0, 200) : '',
      likes: reel.likesCount || 0,
      comments: reel.commentsCount || 0,
      views: reel.videoViewCount || 0,
      plays: reel.videoPlayCount || 0,
      hashtags: reel.hashtags ? reel.hashtags.slice(0, 10) : [],
      timestamp: reel.timestamp || '',
      creator: reel.ownerUsername || ''
    }));

    // Step 2 — Analyze with Haiku
    console.log('[Trend Scout] Analyzing trends with Claude Haiku...');
    const anthropicResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: MODEL,
        max_tokens: 4096,
        system: `You are a social media trend analyst specializing in ${niche}. Analyze Instagram reels data and identify trending patterns. Respond ONLY with valid JSON matching the exact schema provided.`,
        messages: [
          {
            role: 'user',
            content: `Analyze these ${scrapedReels.length} Instagram reels for the niche "${niche}" and hashtags ${JSON.stringify(hashtags)}.

Scraped data: ${JSON.stringify(reelSummaries)}

Return JSON with this exact structure:
{
  "topThemes": [{"theme": "", "avgViews": 0, "avgEngagement": "", "whyTrending": "", "exampleCaptions": []}],
  "visualPatterns": {"topStyles": [], "colorPalettes": [], "cameraMovements": []},
  "hashtagStrategy": {"niche": [], "medium": [], "broad": []},
  "captionPatterns": {"hooks": [], "ctas": [], "avgLength": 0},
  "topCreators": [],
  "avoidList": []
}`
          }
        ]
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

    const analysisText = anthropicResponse.data.content[0].text;
    let analysis;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/) ||
                        analysisText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : analysisText);
    } catch (parseErr) {
      console.error('[Trend Scout] Failed to parse Anthropic response:', parseErr.message);
      // Fall back to mock data
      return res.json(getMockTrendData(niche, hashtags));
    }

    const inputTokens = anthropicResponse.data.usage?.input_tokens || 0;
    const outputTokens = anthropicResponse.data.usage?.output_tokens || 0;
    const haikuCost = ((inputTokens * 0.00025 + outputTokens * 0.00125) / 1000);

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`[Trend Scout] Analysis complete in ${duration}s`);

    res.json({
      scrapedCount: scrapedReels.length,
      niche,
      hashtags,
      analysis,
      cost: { apify: 0.18, haiku: haikuCost, total: 0.18 + haikuCost },
      duration
    });

  } catch (err) {
    console.error('[Trend Scout] Error:', err.message);
    res.status(500).json({
      error: 'Trend analysis failed',
      message: err.message,
      // Fall back to mock data on error
      ...getMockTrendData(niche, hashtags)
    });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`[Trend Scout] Running on port ${PORT} (mock=${USE_MOCK})`);
});
