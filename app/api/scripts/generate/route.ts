import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Validate API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('⚠️ ANTHROPIC_API_KEY is not set in environment variables')
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          details: 'ANTHROPIC_API_KEY is not configured'
        },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { userProfile, topic, projectConfig } = body

    // Validate required fields
    if (!userProfile) {
      return NextResponse.json(
        { error: 'Missing userProfile in request' },
        { status: 400 }
      )
    }

    if (!topic) {
      return NextResponse.json(
        { error: 'Missing topic in request' },
        { status: 400 }
      )
    }

    console.log(`📝 Generating script for: "${topic.title}"`)

    // Build the prompt
    const prompt = `You are an expert YouTube Shorts scriptwriter. Write a compelling 45-60 second script for this topic.

CREATOR PROFILE:
Name: ${userProfile.name || 'Creator'}
Channel: ${userProfile.channelName || 'Channel'}
Niche: ${userProfile.niche || 'General'}
Voice: ${userProfile.primaryTone || 'Conversational'} (primary), ${userProfile.secondaryTone || 'Engaging'} (secondary)

TOPIC:
Title: ${topic.title}
Hook: ${topic.hook}
Core Value: ${topic.coreValue || 'Provide value to viewers'}
Tone: ${topic.tone || userProfile.primaryTone || 'Conversational'}
Format: ${topic.formatType || 'Educational'}

SCRIPT STRUCTURE:
Write a script with these sections:

**HOOK (0-3 seconds):**
- Start with the provided hook or something similar
- Must grab attention immediately
- Set up what's coming

**SETUP (3-10 seconds):**
- Quickly explain the problem or context
- Create curiosity
- Keep it brief

**VALUE (10-50 seconds):**
- Deliver the main content
- Be specific and actionable
- Use short, punchy sentences
- Include natural pauses

**CTA (50-60 seconds):**
- Strong call to action
- Encourage engagement
- End with impact

IMPORTANT:
- Keep it conversational and authentic to the creator's voice
- Use contractions and natural speech patterns
- Include delivery notes in [brackets] like [PAUSE], [EMPHASIZE], [SMILE]
- Suggest visual cues like [SHOW: example], [POINT], [NOD]
- Aim for 45-60 seconds when read aloud at natural pace
- Make it feel authentic, not robotic

Return ONLY valid JSON with this structure:
{
  "id": "script-${Date.now()}",
  "topicId": "${topic.id}",
  "content": "Full script text with delivery notes",
  "hook": "The opening line",
  "readingTime": 52,
  "deliveryNotes": {
    "energy": "6/10",
    "pacing": "Medium with strategic pauses",
    "tone": "Conversational and engaging"
  },
  "visualCues": [
    "Close-up on face for hook",
    "Show example at 15s",
    "B-roll during key points"
  ],
  "verificationStatus": "needs_review",
  "version": 1,
  "createdAt": "${new Date().toISOString()}"
}

Generate the script now. Return ONLY the JSON, no additional text.`

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    
    // Parse JSON from response
    let script
    try {
      // Remove markdown code blocks if present
      let jsonText = responseText
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim()
      }
      
      script = JSON.parse(jsonText)
      console.log(`✅ Script generated successfully for: "${topic.title}"`)
    } catch (parseError) {
      console.error('Failed to parse script JSON:', responseText)
      throw new Error('Failed to parse AI response as JSON')
    }

    return NextResponse.json({
      success: true,
      script,
      message: 'Script generated successfully'
    })

  } catch (error) {
    console.error('❌ Error generating script:', error)
    
    let errorMessage = 'Failed to generate script'
    let errorDetails = 'Unknown error'
    
    if (error instanceof Error) {
      errorDetails = error.message
      
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out'
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    )
  }
}
