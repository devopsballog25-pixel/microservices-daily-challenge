const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;
const MOCK_MODE = process.env.MOCK_MODE === 'true';

app.use(cors());
app.use(express.json());

// Initialize Anthropic client (only if not in mock mode)
let anthropic;
if (!MOCK_MODE && process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}

const SYSTEM_PROMPT = `You are a Senior Software Architect advising a startup founder.
Analyze their project and provide specific, opinionated technical recommendations.
Don't hedge — make clear choices and explain WHY for their specific situation.
Consider their skill level, budget, expected scale, and team size.

Format your response as structured JSON with these sections:
{
  "techStack": {
    "frontend": "...",
    "backend": "...",
    "language": "..."
  },
  "database": {
    "primary": "...",
    "reasoning": "..."
  },
  "hosting": {
    "platform": "...",
    "reasoning": "..."
  },
  "architecture": {
    "pattern": "...",
    "reasoning": "..."
  },
  "thirdPartyServices": [
    {"service": "...", "purpose": "...", "reasoning": "..."}
  ],
  "reasoning": "Overall strategic reasoning for this architecture..."
}`;

app.post('/analyze', async (req, res) => {
  try {
    console.log('[Architect Agent] Received analysis request');
    const { projectDescription, techSkills, monthlyBudget, expectedUsers, teamSize } = req.body;

    if (MOCK_MODE) {
      console.log('[Architect Agent] Running in MOCK MODE');
      const mockResponse = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'mock-response.json'), 'utf8')
      );
      return res.json({
        agent: 'architect',
        status: 'completed',
        output: mockResponse
      });
    }

    if (!anthropic) {
      return res.status(500).json({
        error: 'Anthropic API key not configured',
        agent: 'architect',
        status: 'error'
      });
    }

    const userContext = {
      projectDescription,
      techSkills,
      monthlyBudget,
      expectedUsers,
      teamSize
    };

    console.log('[Architect Agent] Calling Claude Haiku API...');
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Analyze this startup project and provide architectural recommendations:\n\n${JSON.stringify(userContext, null, 2)}`
      }]
    });

    const responseText = message.content[0].text;
    console.log('[Architect Agent] API call successful');

    // Helper function to extract JSON from markdown code fences
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
            console.log('[Architect Agent] Failed to parse extracted JSON, trying next pattern');
          }
        }
      }

      try {
        return JSON.parse(text.trim());
      } catch (e) {
        console.error('[Architect Agent] All JSON parsing attempts failed');
        return null;
      }
    }

    // Try to parse JSON from the response
    let output = extractJSON(responseText);
    if (!output) {
      // Fallback: wrap raw response for debugging
      output = {
        rawResponse: responseText,
        note: 'Response was not in expected JSON format'
      };
    }

    res.json({
      agent: 'architect',
      status: 'completed',
      output
    });
  } catch (error) {
    console.error('[Architect Agent] Error:', error.message);
    res.status(500).json({
      error: error.message,
      agent: 'architect',
      status: 'error'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    agent: 'architect',
    mockMode: MOCK_MODE
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Architect Agent] Service running on port ${PORT}`);
  console.log(`[Architect Agent] Mock mode: ${MOCK_MODE}`);
});
