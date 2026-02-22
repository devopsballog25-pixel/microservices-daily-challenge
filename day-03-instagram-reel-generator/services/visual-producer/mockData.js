// Mock data for Visual Producer Agent
// Used when USE_MOCK_DATA=true
// In mock mode, we actually generate real MP4 files using FFmpeg with colored gradients

const MOCK_COLORS = ['0x001a33', '0x1a0033', '0x001a1a'];
const MOCK_CLIP_LABELS = ['Scene 1 - Hook', 'Scene 2 - Build', 'Scene 3 - Payoff'];

function getMockClipConfig(clipIndex) {
  return {
    color: MOCK_COLORS[clipIndex % MOCK_COLORS.length],
    label: MOCK_CLIP_LABELS[clipIndex % MOCK_CLIP_LABELS.length]
  };
}

module.exports = { getMockClipConfig };
