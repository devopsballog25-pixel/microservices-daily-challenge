// Mock data for Content Strategist Agent
// Used when USE_MOCK_DATA=true

function getMockContentBrief(niche, hashtags, clips) {
  const numClips = parseInt(clips) || 3;

  const allPrompts = [
    {
      sceneNumber: 1,
      prompt: `Slow camera descent through dark ocean water, bioluminescent particles floating past, gradually revealing the glow of a vast underwater city, teal and deep purple color palette, cinematic wide angle, volumetric god rays filtering through water from above, hyperrealistic underwater atmosphere, schools of glowing fish swimming past, 9:16 vertical framing, 8k quality, photorealistic rendering, dramatic depth and scale`,
      hookText: 'What if Atlantis rebuilt itself with AI?',
      duration: 5,
      purpose: 'hook',
      cameraDirection: 'slow descent, wide angle establishing shot',
      colorPalette: 'teal, deep purple, bioluminescent blue'
    },
    {
      sceneNumber: 2,
      prompt: `Camera glides through underwater cyberpunk city streets at eye level, neon holographic signs in alien script reflecting off glass domes and chrome surfaces, schools of bioluminescent fish swimming past like living traffic, deep ocean blue and electric purple palette, tracking shot with smooth forward movement, cinematic depth of field with foreground elements, hyperrealistic detail on every surface, 9:16 vertical format, volumetric underwater haze`,
      hookText: 'Neon streets under a million tons of water',
      duration: 5,
      purpose: 'build',
      cameraDirection: 'tracking shot, forward movement at street level',
      colorPalette: 'deep ocean blue, electric purple, neon reflections'
    },
    {
      sceneNumber: 3,
      prompt: `Dramatic wide reveal of entire underwater megalopolis from far above, thousands of glowing towers and structures stretching to the horizon under vast dark ocean, massive bioluminescent jellyfish floating between towers like living lanterns, epic architectural scale that dwarfs everything, teal and gold accent colors, cinematic aerial perspective pulling back to reveal the full impossible city, breathtaking composition with foreground coral details, 9:16 vertical mastershot, photorealistic 8k`,
      hookText: 'A city that was never supposed to exist',
      duration: 5,
      purpose: 'payoff',
      cameraDirection: 'crane up and pull back to epic aerial reveal',
      colorPalette: 'teal, gold accents, deep ocean darkness'
    }
  ];

  return {
    concept: {
      theme: 'Underwater cyberpunk city — Atlantis rebuilt with AI',
      angle: 'What if Atlantis was rebuilt with neon, holograms, and AI architecture?',
      narrativeArc: 'Ocean descent (hook) → Street-level exploration (build) → Epic city reveal (payoff)',
      whyThisTheme: `Cyberpunk is trending but oversaturated. Underwater + cyberpunk creates a fresh crossover with minimal competition. Perfect for ${niche} content that surprises the algorithm.`
    },
    challenge: {
      challenged: 'Trend Scout',
      issue: 'Top theme "cyberpunk cityscapes" is oversaturated with 10,000+ posts per day',
      reasoning: 'Combining cyberpunk with underwater creates a novel angle with < 50 posts per day — exponentially better chances of going viral'
    },
    klingPrompts: allPrompts.slice(0, numClips),
    textOverlays: {
      hook: 'What if Atlantis ran on AI?',
      cta: 'Would you live here?',
      voiceoverScript: 'What if Atlantis never sank — it just went deeper? Imagine a civilization rebuilt by AI, thriving beneath the ocean, where neon lights replace the sun and algorithms design every structure. This is the city that should not exist. Would you live here?'
    },
    musicSuggestion: 'Ambient electronic with deep bass undertones and ethereal synth pads — creates underwater atmosphere',
    cost: { sonnet: 0.04, total: 0.04 },
    duration: 4,
    mock: true
  };
}

module.exports = { getMockContentBrief };
