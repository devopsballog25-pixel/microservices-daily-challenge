// Test script to verify markdown code fence parsing
const fetch = require('node-fetch');

const ORCHESTRATOR_URL = 'http://localhost:3001';

// Test the markdown parsing with a real-world response format
async function testMarkdownParsing() {
  console.log('🧪 Testing markdown code fence parsing...\n');

  // Simulate what Claude API might return (with markdown code fences)
  const mockClaudeResponse = '```json\n{\n  "summary": "Test summary",\n  "techStack": "React + Node.js",\n  "architecture": "Monolith",\n  "security": "Auth0",\n  "costs": "$50/month",\n  "deployment": "Railway",\n  "phasedRoadmap": {\n    "month1": "Launch MVP",\n    "month3": "Add features",\n    "month6": "Scale"\n  },\n  "keyDisagreements": ["Test disagreement"],\n  "finalVerdict": "Viable project"\n}\n```';

  console.log('📝 Mock Claude Response (with markdown fences):');
  console.log(mockClaudeResponse.substring(0, 100) + '...\n');

  // Test the extraction logic from orchestrator
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
        const jsonStr = match[1].trim();
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          console.log('Failed to parse extracted JSON, trying next pattern');
        }
      }
    }

    try {
      return JSON.parse(text.trim());
    } catch (e) {
      return null;
    }
  }

  const parsed = extractJSON(mockClaudeResponse);

  if (parsed && parsed.summary && parsed.techStack) {
    console.log('✅ SUCCESS: Markdown code fences stripped successfully!');
    console.log('\n📊 Parsed Report:');
    console.log('  Summary:', parsed.summary);
    console.log('  Tech Stack:', parsed.techStack);
    console.log('  Architecture:', parsed.architecture);
    console.log('  All fields present:', Object.keys(parsed).length === 9);
    return true;
  } else {
    console.log('❌ FAIL: Could not extract JSON from markdown');
    return false;
  }
}

// Test variations of markdown fences
async function testVariations() {
  console.log('\n🔬 Testing various markdown fence formats...\n');

  const variations = [
    { name: 'Standard ```json\\n...\\n```', text: '```json\n{"test": true}\n```' },
    { name: 'No language ```\\n...\\n```', text: '```\n{"test": true}\n```' },
    { name: 'Compact ```json...```', text: '```json{"test": true}```' },
    { name: 'Compact ```...```', text: '```{"test": true}```' },
    { name: 'Triple quotes', text: '\'\'\'\n{"test": true}\n\'\'\'' },
    { name: 'Raw JSON', text: '{"test": true}' },
    { name: 'With spaces', text: '```json  \n  {"test": true}  \n  ```' }
  ];

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
        } catch (e) {}
      }
    }

    try {
      return JSON.parse(text.trim());
    } catch (e) {
      return null;
    }
  }

  let passed = 0;
  let failed = 0;

  for (const variation of variations) {
    const result = extractJSON(variation.text);
    if (result && result.test === true) {
      console.log(`  ✅ ${variation.name}`);
      passed++;
    } else {
      console.log(`  ❌ ${variation.name}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed}/${variations.length} passed\n`);
  return failed === 0;
}

// Run tests
async function runTests() {
  const test1 = await testMarkdownParsing();
  const test2 = await testVariations();

  if (test1 && test2) {
    console.log('🎉 All markdown parsing tests passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed\n');
    process.exit(1);
  }
}

runTests();
