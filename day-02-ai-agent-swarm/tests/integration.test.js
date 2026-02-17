const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const TIMEOUT = 120000; // 2 minutes

// Test data
const testInput = {
  projectDescription: 'AI-powered resume builder SaaS - users paste a job description and upload their resume, AI rewrites and optimizes the resume for that specific job, outputs a polished PDF',
  techSkills: 'React, Node.js, basic AWS',
  monthlyBudget: 150,
  expectedUsers: 1000,
  teamSize: 'solo'
};

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function assert(condition, message) {
  if (!condition) {
    log(`✗ FAIL: ${message}`, 'red');
    throw new Error(message);
  }
  log(`✓ PASS: ${message}`, 'green');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Health checks
async function testHealthChecks() {
  log('\n=== Test 1: Health Checks ===', 'blue');

  const services = [
    { name: 'Orchestrator', port: 3001 },
    { name: 'Architect Agent', port: 3002 },
    { name: 'Security Agent', port: 3003 },
    { name: 'Cost Agent', port: 3004 },
    { name: 'DevOps Agent', port: 3005 }
  ];

  for (const service of services) {
    const response = await fetch(`http://localhost:${service.port}/health`);
    const data = await response.json();
    assert(response.ok, `${service.name} health check returns 200`);
    assert(data.status === 'healthy', `${service.name} reports healthy status`);
    log(`  ${service.name}: ${data.mockMode ? 'MOCK MODE' : 'LIVE MODE'}`, 'yellow');
  }
}

// Test 2: Start analysis
async function testStartAnalysis() {
  log('\n=== Test 2: Start Analysis ===', 'blue');

  const response = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testInput)
  });

  assert(response.ok, 'Analysis request returns 200');

  const data = await response.json();
  assert(data.sessionId, 'Response includes session ID');
  assert(data.status === 'pending', 'Initial status is pending');

  log(`  Session ID: ${data.sessionId}`, 'yellow');
  return data.sessionId;
}

// Test 3: Wait for completion
async function testWaitForCompletion(sessionId) {
  log('\n=== Test 3: Wait for Agent Pipeline ===', 'blue');

  const startTime = Date.now();
  let attempts = 0;
  const maxAttempts = 60; // 2 minutes with 2-second intervals

  while (attempts < maxAttempts) {
    attempts++;
    await sleep(2000);

    const response = await fetch(`${BASE_URL}/analyze/${sessionId}/status`);
    const data = await response.json();

    log(`  Attempt ${attempts}: Status = ${data.status}`, 'yellow');

    if (data.status === 'completed') {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      log(`  ✓ Pipeline completed in ${elapsed} seconds`, 'green');
      return true;
    }

    if (data.status === 'error') {
      assert(false, 'Pipeline completed without errors');
    }
  }

  assert(false, 'Pipeline completed within timeout');
}

// Test 4: Verify final report
async function testFinalReport(sessionId) {
  log('\n=== Test 4: Verify Final Report ===', 'blue');

  const response = await fetch(`${BASE_URL}/analyze/${sessionId}/report`);
  assert(response.ok, 'Report endpoint returns 200');

  const data = await response.json();
  assert(data.sessionId === sessionId, 'Report matches session ID');
  assert(data.status === 'completed', 'Report status is completed');

  // Verify input was stored
  assert(data.input.projectDescription === testInput.projectDescription, 'Input data stored correctly');

  // Verify all agents produced output
  assert(data.agents.architect, 'Architect agent produced output');
  assert(data.agents.security, 'Security agent produced output');
  assert(data.agents.cost, 'Cost agent produced output');
  assert(data.agents.devops, 'DevOps agent produced output');

  log('  Agent outputs:', 'yellow');
  log(`    Architect: ${Object.keys(data.agents.architect).length} fields`, 'yellow');
  log(`    Security: ${Object.keys(data.agents.security).length} fields`, 'yellow');
  log(`    Cost: ${Object.keys(data.agents.cost).length} fields`, 'yellow');
  log(`    DevOps: ${Object.keys(data.agents.devops).length} fields`, 'yellow');

  // Verify final report
  assert(data.finalReport, 'Final report exists');
  assert(data.finalReport.summary, 'Final report includes summary');
  assert(data.finalReport.techStack, 'Final report includes tech stack');
  assert(data.finalReport.phasedRoadmap, 'Final report includes phased roadmap');

  log('\n  Final Report Sections:', 'yellow');
  Object.keys(data.finalReport).forEach(key => {
    log(`    - ${key}`, 'yellow');
  });

  return data;
}

// Test 5: Verify agent disagreements
async function testAgentDisagreements(reportData) {
  log('\n=== Test 5: Verify Agent Disagreements ===', 'blue');

  const { agents } = reportData;

  // Check for disagreements in agent outputs
  let foundDisagreements = false;

  if (agents.security.architectDisagreements && agents.security.architectDisagreements.length > 0) {
    foundDisagreements = true;
    log(`  ✓ Security agent challenged Architect (${agents.security.architectDisagreements.length} disagreements)`, 'green');
  }

  if (agents.cost.cheaperAlternatives && agents.cost.cheaperAlternatives.length > 0) {
    foundDisagreements = true;
    log(`  ✓ Cost agent suggested cheaper alternatives (${agents.cost.cheaperAlternatives.length} alternatives)`, 'green');
  }

  if (agents.devops.complexityWarnings && agents.devops.complexityWarnings.length > 0) {
    foundDisagreements = true;
    log(`  ✓ DevOps agent warned about complexity (${agents.devops.complexityWarnings.length} warnings)`, 'green');
  }

  assert(foundDisagreements, 'At least one agent challenged another agent\'s recommendations');
}

// Test 6: Individual agent endpoints
async function testIndividualAgents() {
  log('\n=== Test 6: Individual Agent Endpoints ===', 'blue');

  // Test Architect Agent
  const architectResponse = await fetch('http://localhost:3002/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testInput)
  });
  assert(architectResponse.ok, 'Architect agent responds to direct call');
  const architectData = await architectResponse.json();
  assert(architectData.agent === 'architect', 'Architect identifies itself correctly');
  assert(architectData.output, 'Architect produces output');

  // Test Security Agent (with architect context)
  const securityResponse = await fetch('http://localhost:3003/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...testInput, architectOutput: architectData.output })
  });
  assert(securityResponse.ok, 'Security agent responds to direct call');
  const securityData = await securityResponse.json();
  assert(securityData.agent === 'security', 'Security agent identifies itself correctly');

  log('  All agents respond correctly to direct API calls', 'green');
}

// Main test runner
async function runAllTests() {
  log('\n' + '='.repeat(60), 'blue');
  log('  AI CTO AGENT SWARM - INTEGRATION TESTS', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  let sessionId;
  let reportData;

  try {
    await testHealthChecks();
    sessionId = await testStartAnalysis();
    await testWaitForCompletion(sessionId);
    reportData = await testFinalReport(sessionId);
    await testAgentDisagreements(reportData);
    await testIndividualAgents();

    log('\n' + '='.repeat(60), 'green');
    log('  ✓ ALL TESTS PASSED', 'green');
    log('='.repeat(60) + '\n', 'green');

    process.exit(0);
  } catch (error) {
    log('\n' + '='.repeat(60), 'red');
    log('  ✗ TESTS FAILED', 'red');
    log('='.repeat(60), 'red');
    log(`\nError: ${error.message}\n`, 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests();
