import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topics, profile } = body

    if (!topics || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const scripts = []

    // Generate scripts for each topic
    for (const topic of topics) {
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
${profile.country === 'United Kingdom' ? `
- "Holiday" means VACATION/TRIP (going away), NOT Christmas/seasonal holidays
- Use British spellings: colour, favourite, centre, etc.
- Use British terms: shop (not store), flat (not apartment), lorry (not truck)
- Prices in GBP with £ symbol
- Avoid Americanisms
` : ''}

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

VISUAL CUES TO INCLUDE:
- Gestures: (hand movements, expressions)
- B-roll suggestions: (what to show on screen)
- Framing: (close-up, medium shot, etc.)
- Lighting: (bright, soft, dramatic, etc.)

Return ONLY valid JSON with this structure:
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
    "gestures": ["open hands when welcoming", "pointing when making key point"],
    "bRoll": ["image 1", "image 2"],
    "framing": "medium close-up",
    "lighting": "soft and warm"
  },
  "factCheckNotes": {
    "claims": ["any factual claims to verify"],
    "requiresVerification": false
  }
}`

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : ''

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
        verificationStatus: scriptData.factCheckNotes.requiresVerification ? 'needs_review' : 'verified',
        version: 1,
        createdAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      scripts,
      message: `Generated ${scripts.length} scripts successfully`
    })

  } catch (error) {
    console.error('Error generating scripts:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate scripts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}