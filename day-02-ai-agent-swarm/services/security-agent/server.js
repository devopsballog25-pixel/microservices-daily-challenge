const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;
const MOCK_MODE = process.env.MOCK_MODE === 'true';

app.use(cors());
app.use(express.json());

let anthropic;
if (!MOCK_MODE && process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}

const SYSTEM_PROMPT = `You are a Security Advisor reviewing a proposed startup architecture.
You have received the Architect's recommendations. Your job is to:
1. Identify security requirements and risks for this specific project
2. Explicitly CHALLENGE any architectural choices that create security risks
3. Separate "must-have at launch" from "nice-to-have later" security measures
4. If the Architect recommended building something that has security implications (like auth), recommend proven third-party alternatives instead

Be specific and opinionated. Don't just list generic security advice.
Reference the Architect's specific recommendations when you agree or disagree.

Format as JSON:
{
  "mustHaveAtLaunch": [
    {"requirement": "...", "reasoning": "..."}
  ],
  "canWaitUntilLater": [
    {"requirement": "...", "reasoning": "..."}
  ],
  "architectDisagreements": [
    {"architectRecommendation": "...", "myPosition": "...", "reasoning": "..."}
  ],
  "specificRisks": [
    {"risk": "...", "mitigation": "..."}
  ],
  "reasoning": "Overall security assessment..."
}`;

app.post('/analyze', async (req, res) => {
  try {
    console.log('[Security Agent] Received analysis request');
    const { projectDescription, techSkills, monthlyBudget, expectedUsers, teamSize, architectOutput } = req.body;

    if (MOCK_MODE) {
      console.log('[Security Agent] Running in MOCK MODE');
      const mockResponse = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'mock-response.json'), 'utf8')
      );
      return res.json({
        agent: 'security',
        status: 'completed',
        output: mockResponse
      });
    }

    if (!anthropic) {
      return res.status(500).json({
        error: 'Anthropic API key not configured',
        agent: 'security',
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
      architectRecommendations: architectOutput
    };

    console.log('[Security Agent] Calling Claude Haiku API...');
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Review this architecture for security concerns:\n\n${JSON.stringify(context, null, 2)}`
      }]
    });

    const responseText = message.content[0].text;
    console.log('[Security Agent] API call successful');

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
            console.log('[Security Agent] Failed to parse extracted JSON, trying next pattern');
          }
        }
      }

      try {
        return JSON.parse(text.trim());
      } catch (e) {
        console.error('[Security Agent] All JSON parsing attempts failed');
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
      agent: 'security',
      status: 'completed',
      output
    });
  } catch (error) {
    console.error('[Security Agent] Error:', error.message);
    res.status(500).json({
      error: error.message,
      agent: 'security',
      status: 'error'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    agent: 'security',
    mockMode: MOCK_MODE
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Security Agent] Service running on port ${PORT}`);
  console.log(`[Security Agent] Mock mode: ${MOCK_MODE}`);
});
