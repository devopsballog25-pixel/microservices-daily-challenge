// Mock data for Trend Scout Agent
// Used when USE_MOCK_DATA=true

function getMockTrendData(niche, hashtags) {
  return {
    scrapedCount: 78,
    niche: niche,
    hashtags: hashtags,
    analysis: {
      topThemes: [
        {
          theme: `cyberpunk cityscapes with atmospheric lighting for ${niche}`,
          avgViews: 67000,
          avgEngagement: '5.2%',
          whyTrending: 'Blade Runner anime series hype combined with AI art aesthetics',
          exampleCaptions: [
            'What if the future looked like this? 🌆',
            'AI created this entire city from scratch 🤖'
          ]
        },
        {
          theme: `underwater fantasy worlds with bioluminescence for ${niche}`,
          avgViews: 52000,
          avgEngagement: '6.8%',
          whyTrending: 'Novel crossover genre with low competition and high shareability',
          exampleCaptions: [
            'The ocean hides more than we know 🌊',
            'POV: You just discovered Atlantis 🏙️'
          ]
        },
        {
          theme: `ancient civilizations reimagined with modern technology`,
          avgViews: 43000,
          avgEngagement: '4.5%',
          whyTrending: 'Historical fantasy trend on TikTok crossing over to Instagram',
          exampleCaptions: [
            'What ancient Rome would look like today 🏛️',
            'History but make it futuristic ⚡'
          ]
        }
      ],
      visualPatterns: {
        topStyles: ['cinematic lighting', 'neon color grading', 'hyperrealistic', 'photorealistic rendering'],
        colorPalettes: ['teal and purple', 'neon pink and blue', 'gold and deep blue', 'amber and noir'],
        cameraMovements: ['slow push forward', 'orbital pan', 'drone descent', 'tracking shot', 'dolly zoom']
      },
      hashtagStrategy: {
        niche: hashtags.slice(0, 3).concat(['#aiartdaily', '#texttoimage', '#generativeart', '#aiimages', '#artificialintelligence', '#neuralart', '#deeplearningart']).slice(0, 10),
        medium: ['#aiart', '#aigenerated', '#aiartcommunity', '#digitalartist', '#conceptart', '#scifiart', '#fantasyart', '#futurism', '#digitalpainting', '#artoftheday'],
        broad: ['#art', '#digitalart', '#creative', '#artwork', '#artist', '#illustration', '#design', '#creativity', '#beautiful', '#inspiration']
      },
      captionPatterns: {
        hooks: ['What if...', 'POV:', 'This was made entirely by AI', 'No cameras were used', 'The future is here'],
        ctas: ['Would you live here?', 'Save for later', 'Tag someone who needs to see this', 'Drop a 🔥 if you\'re amazed'],
        avgLength: 150
      },
      topCreators: ['ai_art_wizard', 'neural_dreams', 'pixel_prophet', 'synthwave_artist', 'digital_oracle'],
      avoidList: [
        'pure cyberpunk without twist - oversaturated',
        'static images with slow zoom - low engagement',
        'AI disclaimer-heavy captions - reduces shares',
        'text-heavy overlays - distracts from visuals'
      ]
    },
    cost: { apify: 0.18, haiku: 0.008, total: 0.188 },
    duration: 43,
    mock: true
  };
}

module.exports = { getMockTrendData };
