import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userProfile, regional, projectConfig } = body

    if (!userProfile || !projectConfig) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Handle missing regional config - create from profile
    const regionalConfig = regional || {
      location: userProfile.location || 'London',
      countryCode: userProfile.country === 'United Kingdom' ? 'GB' : 
                   userProfile.country === 'United States' ? 'US' : 'GB',
      language: userProfile.country === 'United Kingdom' ? 'British English' : 'American English'
    }

    const prompt = `Generate ${projectConfig.videosNeeded} YouTube Shorts topic ideas for a creator in the ${userProfile.niche} niche. 

CRITICAL REGIONAL CONTEXT:
- Location: ${regionalConfig.location}
- Country: ${regionalConfig.countryCode}
- Language: ${regionalConfig.language}
- Currency: ${regionalConfig.countryCode === 'GB' ? 'GBP (£)' : regionalConfig.countryCode === 'US' ? 'USD ($)' : 'local currency'}

IMPORTANT TERMINOLOGY NOTES:
${regionalConfig.countryCode === 'GB' ? `
- When mentioning "holiday" in UK context, this means VACATION/TRIP (going away), NOT seasonal holidays like Christmas
- Use British English spelling and terminology
- Prices should be in GBP (£)
- Refer to "shops" not "stores", "flat" not "apartment", etc.
` : ''}

CREATOR PROFILE:
- Niche: ${userProfile.niche}
- Location: ${regionalConfig.location}
- Primary Tone: ${userProfile.primaryTone || 'conversational'}

TONE MIX FOR THIS BATCH:
${Object.entries(projectConfig.toneMix || {})
  .map(([tone, percentage]) => `- ${tone}: ${percentage}%`)
  .join('\n')}

Generate ${projectConfig.videosNeeded} diverse topic ideas that:
1. Match the tone distribution above
2. Are relevant to ${regionalConfig.location} and ${regionalConfig.countryCode} culture
3. Include mix of evergreen and timely content
4. Have strong hooks that stop the scroll

Return ONLY a JSON array with this exact structure (no markdown, no explanation):
[
  {
    "title": "Topic title",
    "hook": "Attention-grabbing opening question or statement",
    "coreValue": "What viewers will learn or feel",
    "emotionalDriver": "curiosity|surprise|nostalgia|inspiration|humor",
    "formatType": "story|tips|facts|question|challenge",
    "tone": "storytelling|educational|emotional|calming|humor",
    "longevity": "evergreen|seasonal|trending",
    "dateRangeStart": "2025-12-01",
    "dateRangeEnd": "2025-12-10",
    "factCheckStatus": "opinion|verified|needs_review",
    "orderIndex": 1
  }
]

CRITICAL: All content must reflect ${regionalConfig.location} context - use appropriate terminology, currency, and cultural references.`

    const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 1,
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

    const topics = JSON.parse(jsonText)

    return NextResponse.json({
      topics,
      message: `Generated ${topics.length} topics successfully`
    })

  } catch (error) {
    console.error('Error generating topics:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate topics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}