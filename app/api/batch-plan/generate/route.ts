import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scripts, profile, filmingHours = 8 } = body

    if (!scripts || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const scriptsInfo = scripts.map((s: any, i: number) => ({
      id: i,
      title: s.topicTitle,
      tone: s.deliveryNotes?.pacing || 'conversational',
      energy: s.deliveryNotes?.energy || 5,
      readingTime: s.readingTime || 60,
      framing: s.visualCues?.framing || 'medium shot',
      lighting: s.visualCues?.lighting || 'natural'
    }))

   const prompt = `You are a production planning expert for YouTube Shorts creators. Create an efficient filming plan for ${scripts.length} video scripts in ${filmingHours} hours.

CREATOR PROFILE:
- Name: ${profile.name}
- Niche: ${profile.niche}
- Primary Tone: ${profile.primaryTone}
- Location: ${profile.location}, ${profile.country}

REGIONAL CONTEXT:
- Use ${profile.country === 'United Kingdom' ? 'British English' : 'American English'} terminology
- Currency: ${profile.country === 'United Kingdom' ? 'GBP (£)' : 'USD ($)'}
${profile.country === 'United Kingdom' ? '- Remember: "holiday" in UK means vacation/trip, not Christmas/seasonal holidays' : ''}

SCRIPTS TO FILM (${scripts.length} total):
${JSON.stringify(scriptsInfo, null, 2)}

TASK: Create a smart filming plan that:
1. Groups scripts into 4-6 clusters based on:
   - Similar tone/energy level
   - Similar visual requirements (framing, lighting)
   - Efficiency (minimize outfit/location changes)

2. For each cluster, suggest:
   - Outfit/styling
   - Location (indoor/outdoor)
   - Props needed
   - Lighting setup
   - Estimated time to film all videos in cluster

3. Create a realistic timeline for the filming day with:
   - Setup time (15 min at start)
   - Filming time per cluster
   - Breaks (every 90 min)
   - Outfit/location change time (10-15 min between clusters)

4. Generate a pre-filming checklist

Return ONLY valid JSON with this structure:
{
  "summary": {
    "totalVideos": ${scripts.length},
    "totalClusters": 5,
    "estimatedTime": "7 hours 30 minutes",
    "breakCount": 4
  },
  "clusters": [
    {
      "id": 1,
      "name": "Cluster name (e.g., 'Emotional & Vulnerable')",
      "description": "Brief description of cluster theme",
      "videoIds": [0, 3, 7],
      "videoCount": 3,
      "estimatedTime": "45 minutes",
      "outfit": "Outfit description",
      "location": "Location description",
      "props": ["prop1", "prop2"],
      "lighting": "Lighting setup",
      "energy": "low-medium (3-5)",
      "notes": "Any special instructions"
    }
  ],
  "timeline": [
    {
      "time": "0:00-0:15",
      "activity": "Setup & Equipment Check",
      "type": "setup"
    },
    {
      "time": "0:15-1:00",
      "activity": "Cluster 1: Emotional & Vulnerable (3 videos)",
      "clusterId": 1,
      "type": "filming"
    },
    {
      "time": "1:00-1:15",
      "activity": "Break & Outfit Change",
      "type": "break"
    }
  ],
  "checklist": {
    "preFilming": [
      "Equipment charged",
      "Scripts reviewed"
    ],
    "perCluster": [
      "Check framing",
      "Test audio"
    ],
    "postFilming": [
      "Backup footage",
      "Review clips"
    ]
  }
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
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

    const batchPlan = JSON.parse(jsonText)

    return NextResponse.json({
      batchPlan,
      message: 'Batch plan generated successfully'
    })

  } catch (error) {
    console.error('Error generating batch plan:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate batch plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}