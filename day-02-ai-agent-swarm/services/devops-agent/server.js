const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3005;
const MOCK_MODE = process.env.MOCK_MODE === 'true';

app.use(cors());
app.use(express.json());

let anthropic;
if (!MOCK_MODE && process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}

const SYSTEM_PROMPT = `You are a DevOps Advisor reviewing a startup's complete technical plan.
You have all previous agents' recommendations. Your job is to:
1. Recommend a deployment strategy appropriate for their team size and budget
2. PUSH BACK on any over-engineering — if they're a solo founder, they don't need Kubernetes, microservices, or complex CI/CD
3. Recommend the simplest deployment that works at their scale
4. Plan for growth: what should they migrate to at 2x, 5x, 10x current scale
5. Identify what monitoring/logging is essential vs overkill at their stage

Be pragmatic. Favor simplicity. A solo founder's biggest risk is complexity, not scale.

Format as JSON:
{
  "deploymentStrategy": {
    "platform": "...",
    "approach": "...",
    "reasoning": "..."
  },
  "cicd": {
    "recommendation": "...",
    "reasoning": "..."
  },
  "monitoring": {
    "essential": ["..."],
    "overkill": ["..."],
    "reasoning": "..."
  },
  "scalingPlan": {
    "current": "Good for X users",
    "at2x": "What to do at 2x scale",
    "at5x": "What to do at 5x scale",
    "at10x": "What to do at 10x scale"
  },
  "complexityWarnings": [
    {"warning": "...", "recommendation": "..."}
  ],
  "reasoning": "Overall DevOps assessment..."
}`;

app.post('/analyze', async (req, res) => {
  try {
    console.log('[DevOps Agent] Received analysis request');
    const { projectDescription, techSkills, monthlyBudget, expectedUsers, teamSize, architectOutput, securityOutput, costOutput } = req.body;

    if (MOCK_MODE) {
      console.log('[DevOps Agent] Running in MOCK MODE');
      const mockResponse = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'mock-response.json'), 'utf8')
      );
      return res.json({
        agent: 'devops',
        status: 'completed',
        output: mockResponse
      });
    }

    if (!anthropic) {
      return res.status(500).json({
        error: 'Anthropic API key not configured',
        agent: 'devops',
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
      securityRequirements: securityOutput,
      costAnalysis: costOutput
    };

    console.log('[DevOps Agent] Calling Claude Haiku API...');
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Review this complete technical plan and provide DevOps recommendations:\n\n${JSON.stringify(context, null, 2)}`
      }]
    });

    const responseText = message.content[0].text;
    console.log('[DevOps Agent] API call successful');

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
            console.log('[DevOps Agent] Failed to parse extracted JSON, trying next pattern');
          }
        }
      }

      try {
        return JSON.parse(text.trim());
      } catch (e) {
        console.error('[DevOps Agent] All JSON parsing attempts failed');
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
      agent: 'devops',
      status: 'completed',
      output
    });
  } catch (error) {
    console.error('[DevOps Agent] Error:', error.message);
    res.status(500).json({
      error: error.message,
      agent: 'devops',
      status: 'error'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    agent: 'devops',
    mockMode: MOCK_MODE
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[DevOps Agent] Service running on port ${PORT}`);
  console.log(`[DevOps Agent] Mock mode: ${MOCK_MODE}`);
});
