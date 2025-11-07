import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Validate API key exists
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('⚠️ ANTHROPIC_API_KEY is not set in environment variables')
}

// Helper function to parse AI's JSON response
function parseAIResponse(responseText: string): any[] {
  try {
    // Try to find JSON in code block first
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim())
    }
    
    // Try to find JSON array directly
    const arrayMatch = responseText.match(/\[[\s\S]*\]/)
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0])
    }
    
    // Try parsing the whole response
    return JSON.parse(responseText)
  } catch (error) {
    console.error('Failed to parse AI response:', responseText)
    throw new Error('Could not parse AI response as JSON')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          details: 'ANTHROPIC_API_KEY is not configured. Please add it to your environment variables.'
        },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { userProfile, regional, projectConfig } = body

    // Validate required fields
    if (!userProfile) {
      return NextResponse.json(
        { error: 'Missing userProfile in request' },
        { status: 400 }
      )
    }

    if (!projectConfig) {
      return NextResponse.json(
        { error: 'Missing projectConfig in request' },
        { status: 400 }
      )
    }

    const { videosNeeded } = projectConfig
    
    if (!videosNeeded || videosNeeded < 1) {
      return NextResponse.json(
        { error: 'videosNeeded must be at least 1' },
        { status: 400 }
      )
    }

    console.log(`🎬 Generating ${videosNeeded} topics for ${userProfile.channelName}`)

    const allTopics: any[] = []
    const batchSize = 10 // Generate 10 topics at a time to stay within token limits
    const numBatches = Math.ceil(videosNeeded / batchSize)

    // Generate topics in batches
    for (let i = 0; i < numBatches; i++) {
      const remainingTopics = videosNeeded - allTopics.length
      const topicsToGenerate = Math.min(batchSize, remainingTopics)
      
      console.log(`  Batch ${i + 1}/${numBatches}: Generating ${topicsToGenerate} topics...`)
      
      const prompt = `You are an expert YouTube Shorts content strategist. Generate exactly ${topicsToGenerate} high-potential YouTube Shorts topic ideas.

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

${projectConfig.toneMix ? `TONE DISTRIBUTION:
${Object.entries(projectConfig.toneMix)
  .map(([tone, percentage]) => `- ${tone}: ${percentage}%`)
  .join('\n')}` : ''}

IMPORTANT: Return ONLY a valid JSON array. Do not include any text before or after the JSON array.

Return exactly ${topicsToGenerate} topics with this structure:
[
  {
    "title": "Compelling topic title (max 100 chars)",
    "hook": "Attention-grabbing opening line that stops the scroll",
    "coreValue": "What viewers will learn or feel",
    "emotionalDriver": "surprise|nostalgia|awe|curiosity|inspiration|relief",
    "formatType": "story|tutorial|list|challenge|myth-busting|behind-scenes",
    "tone": "${userProfile.primaryTone.toLowerCase()}",
    "longevity": "evergreen|seasonal|trending",
    "dateRangeStart": "${projectConfig.month}-01",
    "dateRangeEnd": "${projectConfig.month}-31",
    "factCheckStatus": "verified|needs_review|opinion",
    "orderIndex": ${allTopics.length + 1}
  }
]

Generate exactly ${topicsToGenerate} unique, engaging topics now. Return ONLY the JSON array.`

      try {
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514', // Using the latest Sonnet model
          max_tokens: 4000,
          temperature: 0.9, // High creativity for topic generation
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
        
        if (!Array.isArray(topicsBatch)) {
          throw new Error('AI response was not an array')
        }

        allTopics.push(...topicsBatch)
        console.log(`  ✅ Batch ${i + 1} complete: ${topicsBatch.length} topics generated`)
        
      } catch (batchError) {
        console.error(`❌ Error in batch ${i + 1}:`, batchError)
        // Continue with next batch even if one fails
      }
    }

    // Validate we got some topics
    if (allTopics.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any topics. Please try again.' },
        { status: 500 }
      )
    }

    // Clean up and finalize topics
    const finalTopics = allTopics.map((topic, index) => ({
      ...topic,
      id: `topic-${projectConfig.month}-${Date.now()}-${index}`,
      orderIndex: index + 1,
      createdAt: new Date().toISOString(),
    }))

    console.log(`✅ Successfully generated ${finalTopics.length} topics`)

    return NextResponse.json({
      success: true,
      topics: finalTopics,
      message: `Generated ${finalTopics.length} topics successfully`,
      metadata: {
        requested: videosNeeded,
        generated: finalTopics.length,
        batches: numBatches,
      }
    })
    
  } catch (error) {
    console.error('❌ Error generating topics:', error)
    
    // Provide helpful error messages
    let errorMessage = 'Failed to generate topics'
    let errorDetails = 'Unknown error'
    
    if (error instanceof Error) {
      errorDetails = error.message
      
      // Provide specific guidance for common errors
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key'
        errorDetails = 'Please check your ANTHROPIC_API_KEY environment variable'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded'
        errorDetails = 'Please wait a moment and try again'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out'
        errorDetails = 'The AI took too long to respond. Try requesting fewer topics.'
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
