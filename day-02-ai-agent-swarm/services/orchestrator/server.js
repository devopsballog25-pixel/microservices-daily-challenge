const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const MOCK_MODE = process.env.MOCK_MODE === 'true';

app.use(cors());
app.use(express.json());

// Ensure reports directory exists
const REPORTS_DIR = path.join(__dirname, 'data', 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  console.log('[Orchestrator] Created reports directory');
}

// Helper function to save report to file
function saveReportToFile(sessionId, report) {
  try {
    const filePath = path.join(REPORTS_DIR, `${sessionId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`[Orchestrator] Saved full report to file: ${sessionId}.json`);
    return true;
  } catch (error) {
    console.error('[Orchestrator] Failed to save report to file:', error);
    return false;
  }
}

// Initialize SQLite database
const db = new sqlite3.Database('./sessions.db', (err) => {
  if (err) {
    console.error('[Orchestrator] Database connection error:', err);
  } else {
    console.log('[Orchestrator] Connected to SQLite database');
    initDatabase();
  }
});

function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      project_description TEXT,
      tech_skills TEXT,
      monthly_budget INTEGER,
      expected_users INTEGER,
      team_size TEXT,
      status TEXT,
      architect_output TEXT,
      security_output TEXT,
      cost_output TEXT,
      devops_output TEXT,
      final_report TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('[Orchestrator] Table creation error:', err);
    } else {
      console.log('[Orchestrator] Database initialized');
    }
  });
}

// Anthropic client for synthesis
let anthropic;
if (!MOCK_MODE && process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}

// SSE clients storage
const sseClients = new Map();

// Agent service URLs
const AGENT_URLS = {
  architect: process.env.ARCHITECT_URL || 'http://architect-agent:3002',
  security: process.env.SECURITY_URL || 'http://security-agent:3003',
  cost: process.env.COST_URL || 'http://cost-agent:3004',
  devops: process.env.DEVOPS_URL || 'http://devops-agent:3005'
};

// Helper: Send SSE event to all clients for a session
function sendSSE(sessionId, event, data) {
  const clients = sseClients.get(sessionId) || [];
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    try {
      client.write(message);
    } catch (err) {
      console.error('[Orchestrator] SSE send error:', err);
    }
  });
}

// Helper: Update session in database
function updateSession(sessionId, updates, callback) {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), sessionId];

  db.run(
    `UPDATE sessions SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values,
    callback
  );
}

// Helper: Call agent service
async function callAgent(agentName, payload) {
  const url = `${AGENT_URLS[agentName]}/analyze`;
  console.log(`[Orchestrator] Calling ${agentName} agent at ${url}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`${agentName} agent returned ${response.status}`);
  }

  return await response.json();
}

// Helper: Synthesize final report
async function synthesizeFinalReport(sessionData) {
  console.log('[Orchestrator] Synthesizing final report...');

  if (MOCK_MODE) {
    return {
      summary: "Based on the analysis from our AI CTO team, here's your technical strategy.",
      techStack: "React + Node.js + SQLite (upgrade to PostgreSQL at 5K users)",
      architecture: "Start with a simple monolith. Don't over-engineer.",
      security: "Use Clerk for auth, implement rate limiting, sanitize AI inputs",
      costs: "$45-75/month initially. Plan to charge $5-10/month per user by 3,000 users.",
      deployment: "Deploy on Railway with GitHub integration. Skip complex CI/CD for now.",
      phasedRoadmap: {
        month1: "Launch with GPT-3.5-Turbo, SQLite, Railway free tier. Focus on core features.",
        month3: "Add monitoring (UptimeRobot), upgrade to Railway paid tier if needed, implement usage-based pricing",
        month6: "Migrate to PostgreSQL if hitting SQLite limits, add staging environment, consider GPT-4 as premium feature"
      },
      keyDisagreements: [
        "Architect suggested PostgreSQL → Cost Agent recommended SQLite first (we agree with Cost Agent)",
        "Architect suggested GPT-4 → Cost Agent recommended GPT-3.5-Turbo (we agree with Cost Agent for MVP)",
        "Security Agent wanted comprehensive security → DevOps Agent said focus on essentials first (we recommend middle ground)"
      ],
      finalVerdict: "This is a viable project at your budget and skill level. Follow the Cost Agent's money-saving recommendations and the DevOps Agent's simplicity advice. You can scale up as you get users and revenue."
    };
  }

  if (!anthropic) {
    throw new Error('Anthropic API key not configured');
  }

  const context = {
    project: {
      description: sessionData.project_description,
      techSkills: sessionData.tech_skills,
      monthlyBudget: sessionData.monthly_budget,
      expectedUsers: sessionData.expected_users,
      teamSize: sessionData.team_size
    },
    agentAnalyses: {
      architect: JSON.parse(sessionData.architect_output || '{}'),
      security: JSON.parse(sessionData.security_output || '{}'),
      cost: JSON.parse(sessionData.cost_output || '{}'),
      devops: JSON.parse(sessionData.devops_output || '{}')
    }
  };

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8192,
    system: `You are a CTO synthesizing recommendations from 4 specialized advisors: an Architect, a Security expert, a Cost analyst, and a DevOps specialist.

Your job is to:
1. Identify where the agents agreed and disagreed
2. Resolve disagreements with practical recommendations
3. Create a cohesive, actionable technical strategy
4. Provide a phased roadmap (Month 1, Month 3, Month 6)

IMPORTANT: Keep your response under 6000 tokens. Be comprehensive but concise. Focus on key points and avoid excessive detail in examples. Prioritize actionable recommendations over lengthy explanations.

Format your response as JSON:
{
  "summary": "Executive summary...",
  "techStack": "Final tech stack recommendation...",
  "architecture": "Final architecture approach...",
  "security": "Security checklist and priorities...",
  "costs": "Cost projections and budget verdict...",
  "deployment": "Deployment and DevOps strategy...",
  "phasedRoadmap": {
    "month1": "What to build/deploy first...",
    "month3": "What to add at 3 months...",
    "month6": "What to add at 6 months..."
  },
  "keyDisagreements": [
    "Where agents disagreed and how we resolved it..."
  ],
  "finalVerdict": "Can this founder succeed with this plan?"
}`,
    messages: [{
      role: 'user',
      content: `Synthesize these agent recommendations into a final technical strategy:\n\n${JSON.stringify(context, null, 2)}`
    }]
  });

  const responseText = message.content[0].text;

  // Helper function to strip markdown code fences and parse JSON
  function extractJSON(text) {
    // Try multiple patterns for markdown code fences
    const patterns = [
      /```json\s*\n([\s\S]*?)\n```/,      // ```json\n...\n```
      /```json\s*([\s\S]*?)```/,           // ```json...```
      /```\s*\n([\s\S]*?)\n```/,           // ```\n...\n```
      /```\s*([\s\S]*?)```/,               // ```...```
      /'''\s*\n([\s\S]*?)\n'''/,           // '''\n...\n'''
      /'''\s*([\s\S]*?)'''/                // '''...'''
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const jsonStr = match[1].trim();
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          console.log('[Orchestrator] Failed to parse extracted JSON, trying next pattern');
        }
      }
    }

    // If no pattern matched, try parsing the raw text
    try {
      return JSON.parse(text.trim());
    } catch (e) {
      console.error('[Orchestrator] All JSON parsing attempts failed');
      return null;
    }
  }

  try {
    const parsed = extractJSON(responseText);
    if (parsed) {
      return parsed;
    }
    // Fallback: return raw response for debugging
    return { rawResponse: responseText };
  } catch (parseError) {
    console.error('[Orchestrator] Synthesis parsing error:', parseError.message);
    return { rawResponse: responseText };
  }
}

// POST /analyze - Start new analysis
app.post('/analyze', async (req, res) => {
  const sessionId = uuidv4();
  const { projectDescription, techSkills, monthlyBudget, expectedUsers, teamSize } = req.body;

  console.log(`[Orchestrator] New analysis session: ${sessionId}`);

  // Create session in database
  db.run(
    `INSERT INTO sessions (id, project_description, tech_skills, monthly_budget, expected_users, team_size, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [sessionId, projectDescription, techSkills, monthlyBudget, expectedUsers, teamSize, 'pending'],
    (err) => {
      if (err) {
        console.error('[Orchestrator] Session creation error:', err);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      res.json({ sessionId, status: 'pending' });

      // Start agent pipeline asynchronously
      runAgentPipeline(sessionId, { projectDescription, techSkills, monthlyBudget, expectedUsers, teamSize });
    }
  );
});

// Run the agent pipeline
async function runAgentPipeline(sessionId, input) {
  try {
    // Step 1: Architect Agent
    sendSSE(sessionId, 'update', { agent: 'architect', status: 'working', message: '🏗️ Architect Agent is analyzing your requirements...' });
    updateSession(sessionId, { status: 'architect_working' });

    const architectResult = await callAgent('architect', input);
    updateSession(sessionId, {
      status: 'architect_completed',
      architect_output: JSON.stringify(architectResult.output)
    });
    sendSSE(sessionId, 'update', {
      agent: 'architect',
      status: 'completed',
      message: '🏗️ Architect Agent completed analysis',
      output: architectResult.output
    });

    // Step 2: Security Agent
    sendSSE(sessionId, 'update', { agent: 'security', status: 'working', message: '🔒 Security Agent is reviewing the architecture...' });
    updateSession(sessionId, { status: 'security_working' });

    const securityResult = await callAgent('security', {
      ...input,
      architectOutput: architectResult.output
    });
    updateSession(sessionId, {
      status: 'security_completed',
      security_output: JSON.stringify(securityResult.output)
    });
    sendSSE(sessionId, 'update', {
      agent: 'security',
      status: 'completed',
      message: '🔒 Security Agent completed review',
      output: securityResult.output
    });

    // Step 3: Cost Agent
    sendSSE(sessionId, 'update', { agent: 'cost', status: 'working', message: '💰 Cost Agent is analyzing infrastructure costs...' });
    updateSession(sessionId, { status: 'cost_working' });

    const costResult = await callAgent('cost', {
      ...input,
      architectOutput: architectResult.output,
      securityOutput: securityResult.output
    });
    updateSession(sessionId, {
      status: 'cost_completed',
      cost_output: JSON.stringify(costResult.output)
    });
    sendSSE(sessionId, 'update', {
      agent: 'cost',
      status: 'completed',
      message: '💰 Cost Agent completed analysis',
      output: costResult.output
    });

    // Step 4: DevOps Agent
    sendSSE(sessionId, 'update', { agent: 'devops', status: 'working', message: '⚙️ DevOps Agent is planning deployment strategy...' });
    updateSession(sessionId, { status: 'devops_working' });

    const devopsResult = await callAgent('devops', {
      ...input,
      architectOutput: architectResult.output,
      securityOutput: securityResult.output,
      costOutput: costResult.output
    });
    updateSession(sessionId, {
      status: 'devops_completed',
      devops_output: JSON.stringify(devopsResult.output)
    });
    sendSSE(sessionId, 'update', {
      agent: 'devops',
      status: 'completed',
      message: '⚙️ DevOps Agent completed recommendations',
      output: devopsResult.output
    });

    // Step 5: Synthesis
    sendSSE(sessionId, 'update', { agent: 'synthesizer', status: 'working', message: '🧠 Synthesizing final technical strategy...' });
    updateSession(sessionId, { status: 'synthesizing' });

    const sessionData = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM sessions WHERE id = ?', [sessionId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const finalReport = await synthesizeFinalReport(sessionData);

    // Save full report to file for download fallback
    saveReportToFile(sessionId, {
      session: sessionId,
      input: {
        projectDescription: sessionData.project_description,
        techSkills: sessionData.tech_skills,
        monthlyBudget: sessionData.monthly_budget,
        expectedUsers: sessionData.expected_users,
        teamSize: sessionData.team_size
      },
      finalReport: finalReport,
      timestamp: new Date().toISOString()
    });

    updateSession(sessionId, {
      status: 'completed',
      final_report: JSON.stringify(finalReport)
    });

    // Include download URL in SSE response
    const reportSize = JSON.stringify(finalReport).length;
    const includeDownloadUrl = reportSize > 15000; // If > 15KB

    sendSSE(sessionId, 'complete', {
      message: '✅ Your Technical Strategy is ready!',
      report: finalReport,
      downloadUrl: includeDownloadUrl ? `/reports/${sessionId}/download` : null,
      reportSize: reportSize
    });

  } catch (error) {
    console.error(`[Orchestrator] Pipeline error for session ${sessionId}:`, error);
    updateSession(sessionId, { status: 'error' });
    sendSSE(sessionId, 'error', { message: error.message });
  }
}

// GET /analyze/:sessionId/stream - SSE endpoint
app.get('/analyze/:sessionId/stream', (req, res) => {
  const { sessionId } = req.params;

  console.log(`[Orchestrator] SSE connection opened for session ${sessionId}`);

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Add client to session's client list
  if (!sseClients.has(sessionId)) {
    sseClients.set(sessionId, []);
  }
  sseClients.get(sessionId).push(res);

  // Send initial connection confirmation
  res.write('event: connected\ndata: {"message":"Connected to agent stream"}\n\n');

  // Handle client disconnect
  req.on('close', () => {
    console.log(`[Orchestrator] SSE connection closed for session ${sessionId}`);
    const clients = sseClients.get(sessionId) || [];
    const index = clients.indexOf(res);
    if (index > -1) {
      clients.splice(index, 1);
    }
    if (clients.length === 0) {
      sseClients.delete(sessionId);
    }
  });
});

// GET /analyze/:sessionId/status - Polling fallback
app.get('/analyze/:sessionId/status', (req, res) => {
  const { sessionId } = req.params;

  db.get('SELECT status FROM sessions WHERE id = ?', [sessionId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ sessionId, status: row.status });
  });
});

// GET /analyze/:sessionId/report - Get final report
app.get('/analyze/:sessionId/report', (req, res) => {
  const { sessionId } = req.params;

  db.get('SELECT * FROM sessions WHERE id = ?', [sessionId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      sessionId: row.id,
      status: row.status,
      input: {
        projectDescription: row.project_description,
        techSkills: row.tech_skills,
        monthlyBudget: row.monthly_budget,
        expectedUsers: row.expected_users,
        teamSize: row.team_size
      },
      agents: {
        architect: row.architect_output ? JSON.parse(row.architect_output) : null,
        security: row.security_output ? JSON.parse(row.security_output) : null,
        cost: row.cost_output ? JSON.parse(row.cost_output) : null,
        devops: row.devops_output ? JSON.parse(row.devops_output) : null
      },
      finalReport: row.final_report ? JSON.parse(row.final_report) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  });
});

// GET /reports/:sessionId/download - Download full report as JSON file
app.get('/reports/:sessionId/download', (req, res) => {
  const { sessionId } = req.params;
  const filePath = path.join(REPORTS_DIR, `${sessionId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Report file not found' });
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="report-${sessionId}.json"`);
    res.send(fileContent);
  } catch (error) {
    console.error('[Orchestrator] Error reading report file:', error);
    res.status(500).json({ error: 'Failed to read report file' });
  }
});

// GET /health
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'orchestrator', mockMode: MOCK_MODE });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Orchestrator] Service running on port ${PORT}`);
  console.log(`[Orchestrator] Mock mode: ${MOCK_MODE}`);
});
