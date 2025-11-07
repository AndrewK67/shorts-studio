import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Helper function to parse the AI's JSON response
function parseAIResponse(responseText: string): any[] {
  let jsonText = responseText
  const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)
  if (jsonMatch) {
    jsonText = jsonMatch[1]
  }
  return JSON.parse(jsonText)
}

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

    const { videosNeeded } = projectConfig
    const allTopics = []
    const batchSize = 10 // Generate 10 topics at a time
    const numBatches = Math.ceil(videosNeeded / batchSize)

    for (let i = 0; i < numBatches; i++) {
      const remainingTopics = videosNeeded - allTopics.length
      const topicsToGenerate = Math.min(batchSize, remainingTopics)
      
      const prompt = `You are an expert YouTube Shorts content strategist. Generate ${topicsToGenerate} high-potential YouTube Shorts topics customized for this creator's unique context.

      CREATOR PROFILE:
      Name: ${userProfile.name}
      Channel: ${userProfile.channelName}
      Niche: ${userProfile.niche}
      Unique Angle: ${userProfile.uniqueAngle}

      VOICE & TONE:
      Primary Tone (60%): ${userProfile.primaryTone}
      Secondary Tone (25%): ${userProfile.secondaryTone}
      Accent Tone (15%): ${userProfile.accentTone}

      PROJECT DETAILS:
      Month: ${projectConfig.month}
      Total Videos Needed: ${videosNeeded}

      TONE DISTRIBUTION:
      ${Object.entries(projectConfig.toneMix)
        .map(([tone, percentage]) => `- ${tone}: ${percentage}%`)
        .join('\n')}

      OUTPUT FORMAT (JSON):
      Return a JSON array of exactly ${topicsToGenerate} topics with this structure:
      [
        {
          "title": "Topic title",
          "hook": "The 3-second opening line...",
          "coreValue": "What viewers will learn/feel",
          "emotionalDriver": "surprise|nostalgia|awe|etc",
          "formatType": "story|tutorial|list|etc",
          "tone": "emotional|calming|storytelling|educational|humor|inspirational",
          "longevity": "evergreen|seasonal|trending",
          "dateRangeStart": "2025-12-01",
          "dateRangeEnd": "2025-12-15",
          "factCheckStatus": "verified|needs_review|opinion",
          "orderIndex": 1
        }
      ]

      Generate the complete list now:`

      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000, // This is now safe, as we're only asking for 10
        temperature: 1,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : ''
      const topicsBatch = parseAIResponse(responseText)
      allTopics.push(...topicsBatch)
    }

    // Re-order topics by index
    const orderedTopics = allTopics.map((topic, index) => ({
      ...topic,
      id: `${projectConfig.month}-${index + 1}`, // Give it a stable ID
      orderIndex: index + 1,
    }))

    return NextResponse.json({
      topics: orderedTopics,
      message: `Generated ${orderedTopics.length} topics successfully`,
    })
  } catch (error) {
    console.error('Error generating topics:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate topics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}