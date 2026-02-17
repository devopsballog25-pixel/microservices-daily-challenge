const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3004;
const MOCK_MODE = process.env.MOCK_MODE === 'true';

app.use(cors());
app.use(express.json());

let anthropic;
if (!MOCK_MODE && process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}

const SYSTEM_PROMPT = `You are a Cost Analyst reviewing a startup's technical plan.
You have the Architect's tech stack and Security's requirements.
Your job is to:
1. Project realistic monthly infrastructure costs at their expected scale
2. Project costs at 3x their expected scale (growth scenario)
3. CHALLENGE any expensive recommendations — suggest cheaper alternatives
4. Flag hidden costs they haven't considered (data transfer, API limits, etc.)
5. Give a verdict: can their stated budget handle this plan?

Be brutally honest about costs. Founders need reality checks, not optimism.

Format as JSON:
{
  "currentScaleCosts": {
    "hosting": "$X/month",
    "database": "$X/month",
    "thirdPartyServices": [
      {"service": "...", "cost": "$X/month", "note": "..."}
    ],
    "total": "$X/month"
  },
  "growthScaleCosts": {
    "description": "At 3x users (X users)",
    "total": "$X/month",
    "breakdown": "..."
  },
  "cheaperAlternatives": [
    {"currentRecommendation": "...", "cheaperOption": "...", "savings": "...", "tradeoff": "..."}
  ],
  "hiddenCosts": [
    {"item": "...", "estimatedCost": "...", "explanation": "..."}
  ],
  "budgetVerdict": {
    "canAfford": true/false,
    "reasoning": "..."
  },
  "reasoning": "Overall cost assessment..."
}`;

app.post('/analyze', async (req, res) => {
  try {
    console.log('[Cost Agent] Received analysis request');
    const { projectDescription, techSkills, monthlyBudget, expectedUsers, teamSize, architectOutput, securityOutput } = req.body;

    if (MOCK_MODE) {
      console.log('[Cost Agent] Running in MOCK MODE');
      const mockResponse = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'mock-response.json'), 'utf8')
      );
      return res.json({
        agent: 'cost',
        status: 'completed',
        output: mockResponse
      });
    }

    if (!anthropic) {
      return res.status(500).json({
        error: 'Anthropic API key not configured',
        agent: 'cost',
        status: 'error'
      });
    }

    const context = {
      project: {
        description: projectDescription,
        techSkills,
        monthlyBudget,
        expectedUsers,
        teamSize
      },
      architectRecommendations: architectOutput,
      securityRequirements: securityOutput
    };

    console.log('[Cost Agent] Calling Claude Haiku API...');
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Analyze the costs for this technical plan:\n\n${JSON.stringify(context, null, 2)}`
      }]
    });

    const responseText = message.content[0].text;
    console.log('[Cost Agent] API call successful');

    function extractJSON(text) {
      const patterns = [
        /```json\s*\n([\s\S]*?)\n```/,
        /```json\s*([\s\S]*?)```/,
        /```\s*\n([\s\S]*?)\n```/,
        /```\s*([\s\S]*?)```/,
        /'''\s*\n([\s\S]*?)\n'''/,
        /'''\s*([\s\S]*?)'''/
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          try {
            return JSON.parse(match[1].trim());
          } catch (e) {
            console.log('[Cost Agent] Failed to parse extracted JSON, trying next pattern');
          }
        }
      }

      try {
        return JSON.parse(text.trim());
      } catch (e) {
        console.error('[Cost Agent] All JSON parsing attempts failed');
        return null;
      }
    }

    let output = extractJSON(responseText);
    if (!output) {
      output = {
        rawResponse: responseText,
        note: 'Response was not in expected JSON format'
      };
    }

    res.json({
      agent: 'cost',
      status: 'completed',
      output
    });
  } catch (error) {
    console.error('[Cost Agent] Error:', error.message);
    res.status(500).json({
      error: error.message,
      agent: 'cost',
      status: 'error'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    agent: 'cost',
    mockMode: MOCK_MODE
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Cost Agent] Service running on port ${PORT}`);
  console.log(`[Cost Agent] Mock mode: ${MOCK_MODE}`);
});
