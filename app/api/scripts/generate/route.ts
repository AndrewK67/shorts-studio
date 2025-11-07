import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // 1. RECEIVE THE PRODUCTION MODE
    const { topics, profile, productionMode } = body

    if (!topics || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const scripts = []

    // Generate scripts for each topic
    for (const topic of topics) {
      // 2. DYNAMICALLY BUILD THE VISUAL CUES PROMPT
      let visualCuesPrompt = ''

      if (productionMode === 'ai-video') {
        visualCuesPrompt = `
VISUAL CUES (✨ AI Video Mode):
Generate a list of AI video prompts to match the script.
The output MUST be in this JSON format:
"visualCues": {
  "aiPrompts": [
    {
      "section": "hook",
      "duration": "0-3s",
      "prompt": "An extremely close-up shot of a single tea leaf unfurling in hot water, hyper-realistic",
      "style": "cinematic, dramatic lighting, 8k"
    },
    {
      "section": "setup",
      "duration": "3-10s",
      "prompt": "a fast-paced montage of people looking sleepy at their desks, then drinking coffee, then looking jittery",
      "style": "fast cuts, energetic, motion blur"
    },
    //... add more for value and cta
  ],
  "textOverlays": ["Key text to show on screen"],
  "musicMood": "calm, lo-fi, or energetic"
}
`
      } else if (productionMode === 'ai-voice') {
        visualCuesPrompt = `
VISUAL CUES (🤖 AI Voice Mode):
Generate visual ideas for stock footage.
The output MUST be in this JSON format:
"visualCues": {
  "stockFootageKeywords": ["tea", "cozy home", "library", "autumn leaves"],
  "sceneDescriptions": [
    "Close-up of steam rising from a mug",
    "A person reading a book by a window"
  ],
  "textOverlays": ["Why You're Drinking Tea Wrong", "The 5-second hack"],
  "musicMood": "calm, lo-fi, thoughtful"
}
`
      } else {
        // This is your original "Traditional" prompt
        visualCuesPrompt = `
VISUAL CUES (🎥 Traditional Mode):
- Gestures: (hand movements, expressions)
- B-roll suggestions: (what to show on screen)
- Framing: (close-up, medium shot, etc.)
- Lighting: (bright, soft, dramatic, etc.)

The output MUST be in this JSON format:
"visualCues": {
  "gestures": ["open hands when welcoming", "pointing when making key point"],
  "bRoll": ["image 1", "image 2"],
  "framing": "medium close-up",
  "lighting": "soft and warm"
}
`
      }

      // 3. ASSEMBLE THE FINAL PROMPT
      const prompt = `You are an expert YouTube Shorts scriptwriter. Write a compelling 45-60 second script for this topic.

CREATOR PROFILE:
- Name: ${profile.name}
- Channel: ${profile.channelName}
- Niche: ${profile.niche}
- Primary Tone: ${profile.primaryTone}
- Secondary Tone: ${profile.secondaryTone}
- Accent Tone: ${profile.accentTone}

CRITICAL REGIONAL CONTEXT:
- Location: ${profile.location}, ${profile.country}
- Language Variant: ${profile.country === 'United Kingdom' ? 'British English' : 'American English'}
- Currency: ${profile.country === 'United Kingdom' ? 'GBP (£)' : profile.country === 'United States' ? 'USD ($)' : 'local currency'}

IMPORTANT TERMINOLOGY (for UK creators):
${
  profile.country === 'United Kingdom'
    ? `
- "Holiday" means VACATION/TRIP (going away), NOT Christmas/seasonal holidays
- Use British spellings: colour, favourite, centre, etc.
- Use British terms: shop (not store), flat (not apartment), lorry (not truck)
- Prices in GBP with £ symbol
- Avoid Americanisms
`
    : ''
}

TOPIC DETAILS:
- Title: ${topic.title}
- Hook: ${topic.hook}
- Core Value: ${topic.coreValue}
- Tone: ${topic.tone}

SCRIPT STRUCTURE (45-60 seconds):
1. HOOK (0-3 seconds): Attention-grabbing opening
2. SETUP (3-10 seconds): Problem or context
3. VALUE (10-50 seconds): Main content/story/tips
4. CTA (50-60 seconds): Call to action

DELIVERY NOTES TO INCLUDE:
- Pacing: (e.g., "slow and deliberate" or "energetic")
- Energy level: (1-10 scale)
- Key pauses: (where to pause for effect)
- Emphasis: (words to emphasize)

${visualCuesPrompt}

Return ONLY valid JSON with this structure (no markdown, no explanation):
{
  "hook": "First 3 seconds opening line",
  "setup": "Problem or context setup",
  "value": "Main content with [PAUSE] markers and *emphasis*",
  "cta": "Call to action",
  "fullScript": "Complete script formatted with sections",
  "readingTime": 52,
  "deliveryNotes": {
    "pacing": "conversational and warm",
    "energy": 6,
    "pauses": ["after hook", "before CTA"],
    "emphasis": ["key phrase 1", "key phrase 2"]
  },
  "visualCues": {
    // The dynamic visual cues JSON will go here
  },
  "factCheckNotes": {
    "claims": ["any factual claims to verify"],
    "requiresVerification": false
  }
}`

      const message = await anthropic.messages.create({
        // 4. FIX THE MODEL NAME
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : ''

      let jsonText = responseText
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1]
      }

      const scriptData = JSON.parse(jsonText)

      scripts.push({
        topicId: topic.id,
        topicTitle: topic.title,
        ...scriptData,
        // 5. This is a new field to store what mode was used
        productionMode: productionMode || 'traditional',
        verificationStatus: scriptData.factCheckNotes.requiresVerification
          ? 'needs_review'
          : 'verified',
        version: 1,
        createdAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      scripts,
      message: `Generated ${scripts.length} scripts successfully`,
    })
  } catch (error) {
    console.error('Error generating scripts:', error)

    return NextResponse.json(
      {
        error: 'Failed to generate scripts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}