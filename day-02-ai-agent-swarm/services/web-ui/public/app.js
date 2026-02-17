const ORCHESTRATOR_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'http://orchestrator:3001';

let currentSessionId = null;
let eventSource = null;

// DOM elements
const form = document.getElementById('analysis-form');
const inputSection = document.getElementById('input-section');
const activitySection = document.getElementById('activity-section');
const reportSection = document.getElementById('report-section');
const activityFeed = document.getElementById('activity-feed');
const finalReport = document.getElementById('final-report');

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    projectDescription: document.getElementById('projectDescription').value,
    techSkills: document.getElementById('techSkills').value,
    monthlyBudget: parseInt(document.getElementById('monthlyBudget').value),
    expectedUsers: parseInt(document.getElementById('expectedUsers').value),
    teamSize: document.getElementById('teamSize').value
  };

  try {
    // Disable form
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Starting analysis...';

    // Start analysis
    const response = await fetch(`${ORCHESTRATOR_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Failed to start analysis');
    }

    const { sessionId } = await response.json();
    currentSessionId = sessionId;

    // Hide form, show activity feed
    inputSection.style.display = 'none';
    activitySection.style.display = 'block';

    // Connect to SSE stream
    connectToStream(sessionId);

  } catch (error) {
    console.error('Error starting analysis:', error);
    alert('Failed to start analysis. Please try again.');
    location.reload();
  }
});

// Connect to SSE stream
function connectToStream(sessionId) {
  eventSource = new EventSource(`${ORCHESTRATOR_URL}/analyze/${sessionId}/stream`);

  eventSource.addEventListener('connected', (event) => {
    console.log('Connected to agent stream');
    addActivityItem('🔌 Connected to agent swarm...', 'working');
  });

  eventSource.addEventListener('update', (event) => {
    const data = JSON.parse(event.data);
    console.log('Agent update:', data);

    if (data.status === 'working') {
      addActivityItem(data.message, 'working');
    } else if (data.status === 'completed') {
      addActivityItem(data.message, 'completed');

      // Add disagreements if present
      if (data.output && data.output.architectDisagreements) {
        data.output.architectDisagreements.forEach(disagreement => {
          addActivityItem(
            `🔒 DISAGREES: ${disagreement.myPosition}`,
            'completed',
            true
          );
        });
      }

      if (data.output && data.output.cheaperAlternatives) {
        data.output.cheaperAlternatives.forEach(alt => {
          addActivityItem(
            `💰 CHALLENGES: ${alt.currentRecommendation} → Suggests: ${alt.cheaperOption}`,
            'completed',
            true
          );
        });
      }

      if (data.output && data.output.complexityWarnings) {
        data.output.complexityWarnings.forEach(warning => {
          addActivityItem(
            `⚙️ PUSHES BACK: ${warning.warning}`,
            'completed',
            true
          );
        });
      }
    }
  });

  eventSource.addEventListener('complete', (event) => {
    const data = JSON.parse(event.data);
    console.log('Analysis complete:', data);

    addActivityItem(data.message, 'completed');

    // Close SSE connection
    eventSource.close();

    // Display final report
    displayFinalReport(data.report);
  });

  eventSource.addEventListener('error', (event) => {
    console.error('SSE error:', event);
    addActivityItem('❌ Error occurred during analysis', 'error');
    eventSource.close();
  });

  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    // Fallback to polling if SSE fails
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log('SSE connection closed, falling back to polling');
      pollForUpdates(sessionId);
    }
  };
}

// Fallback: polling for updates
async function pollForUpdates(sessionId) {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`${ORCHESTRATOR_URL}/analyze/${sessionId}/status`);
      const { status } = await response.json();

      if (status === 'completed') {
        clearInterval(pollInterval);
        const reportResponse = await fetch(`${ORCHESTRATOR_URL}/analyze/${sessionId}/report`);
        const data = await reportResponse.json();
        displayFinalReport(data.finalReport);
      } else if (status === 'error') {
        clearInterval(pollInterval);
        addActivityItem('❌ Analysis failed', 'error');
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 2000);
}

// Add activity item to feed
function addActivityItem(message, status, isSubItem = false) {
  const item = document.createElement('div');
  item.className = `activity-item ${status}`;
  if (isSubItem) {
    item.style.marginLeft = '20px';
    item.style.fontSize = '0.9rem';
  }
  item.textContent = message;
  activityFeed.appendChild(item);

  // Auto-scroll to bottom
  activityFeed.scrollTop = activityFeed.scrollHeight;
}

// Display final report
function displayFinalReport(report) {
  reportSection.style.display = 'block';
  reportSection.scrollIntoView({ behavior: 'smooth' });

  // Helper function to extract JSON from markdown code fences
  function extractJSON(obj) {
    // If obj is a string, try to parse it directly
    if (typeof obj === 'string') {
      const text = obj;

      // Try to extract JSON from markdown code fences
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
            console.error('Failed to parse extracted JSON:', e);
          }
        }
      }

      // Try parsing after manually stripping markdown fences
      try {
        const cleanedText = text
          .replace(/^```json\s*/g, '')
          .replace(/^```\s*/g, '')
          .replace(/\s*```$/g, '')
          .replace(/^'''\s*/g, '')
          .replace(/\s*'''$/g, '')
          .trim();

        return JSON.parse(cleanedText);
      } catch (e) {
        console.error('Failed to parse string as JSON:', e);
        console.error('String was:', text.substring(0, 100));
        return null;
      }
    }

    // If report has rawResponse field, try to parse it
    if (obj && obj.rawResponse && typeof obj.rawResponse === 'string') {
      const text = obj.rawResponse;

      // Try to extract JSON from markdown code fences
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
            console.error('Failed to parse extracted JSON:', e);
          }
        }
      }

      // Try parsing the raw text directly, first strip any markdown fences manually
      try {
        // Manual fallback: strip common markdown fence characters
        const cleanedText = text
          .replace(/^```json\s*/g, '')
          .replace(/^```\s*/g, '')
          .replace(/\s*```$/g, '')
          .replace(/^'''\s*/g, '')
          .replace(/\s*'''$/g, '')
          .trim();

        return JSON.parse(cleanedText);
      } catch (e) {
        console.error('Failed to parse raw response:', e);
        console.error('Raw text was:', text.substring(0, 100));
        return null;
      }
    }

    return obj;
  }

  // Extract JSON if wrapped in markdown
  report = extractJSON(report);

  // If extraction failed, show error message
  if (!report || (!report.summary && !report.techStack && !report.rawResponse)) {
    finalReport.innerHTML = `
      <div class="report-section">
        <h3 style="color: #ef4444;">⚠️ Report Parsing Error</h3>
        <p>Unable to parse the final report. Please try again or check the logs.</p>
      </div>
    `;
    return;
  }

  let html = '<div class="report-section">';

  if (report.summary) {
    html += `<h3>📋 Executive Summary</h3><p>${report.summary}</p>`;
  }

  if (report.techStack) {
    html += `<h3>🛠️ Technology Stack</h3><p>${report.techStack}</p>`;
  }

  if (report.architecture) {
    html += `<h3>🏗️ Architecture Approach</h3><p>${report.architecture}</p>`;
  }

  if (report.security) {
    html += `<h3>🔒 Security Strategy</h3><p>${report.security}</p>`;
  }

  if (report.costs) {
    html += `<h3>💰 Cost Analysis</h3><p>${report.costs}</p>`;
  }

  if (report.deployment) {
    html += `<h3>⚙️ Deployment Strategy</h3><p>${report.deployment}</p>`;
  }

  if (report.keyDisagreements && report.keyDisagreements.length > 0) {
    html += `<h3>🤔 Key Debates & Resolutions</h3>`;
    report.keyDisagreements.forEach(disagreement => {
      // Handle both string and object formats
      if (typeof disagreement === 'string') {
        html += `<div class="disagreement">${disagreement}</div>`;
      } else if (disagreement.issue && disagreement.resolution) {
        html += `<div class="disagreement">
          <strong>Issue:</strong> ${disagreement.issue}<br>
          <strong>Resolution:</strong> ${disagreement.resolution}
        </div>`;
      } else if (disagreement.disagreement) {
        html += `<div class="disagreement">${disagreement.disagreement}</div>`;
      } else {
        // Fallback: stringify the object
        html += `<div class="disagreement">${JSON.stringify(disagreement)}</div>`;
      }
    });
  }

  if (report.phasedRoadmap) {
    html += `<h3>🗺️ Phased Roadmap</h3><div class="roadmap">`;

    if (report.phasedRoadmap.month1) {
      html += `<div class="roadmap-phase"><h4>Month 1: MVP Launch</h4><p>${report.phasedRoadmap.month1}</p></div>`;
    }

    if (report.phasedRoadmap.month3) {
      html += `<div class="roadmap-phase"><h4>Month 3: Growth Phase</h4><p>${report.phasedRoadmap.month3}</p></div>`;
    }

    if (report.phasedRoadmap.month6) {
      html += `<div class="roadmap-phase"><h4>Month 6: Scale Phase</h4><p>${report.phasedRoadmap.month6}</p></div>`;
    }

    html += `</div>`;
  }

  if (report.finalVerdict) {
    html += `<h3>✅ Final Verdict</h3><p>${report.finalVerdict}</p>`;
  }

  html += '</div>';
  finalReport.innerHTML = html;
}
