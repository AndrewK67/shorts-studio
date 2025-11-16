import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  console.log('🔥 Batch plan API called')
  
  try {
    const body = await request.json()
    console.log('📊 Request body keys:', Object.keys(body))
    
    const { scripts, profile, filmingHours = 8 } = body

    // Detailed validation with specific error messages
    if (!scripts) {
      console.error('❌ Missing scripts field')
      return NextResponse.json(
        { 
          error: 'Missing required field: scripts',
          hint: 'Scripts should be an array of script objects'
        },
        { status: 400 }
      )
    }

    if (!profile) {
      console.error('❌ Missing profile field')
      return NextResponse.json(
        { 
          error: 'Missing required field: profile',
          hint: 'Profile should contain: name, niche, primaryTone, location, country'
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(scripts)) {
      console.error('❌ Scripts is not an array')
      return NextResponse.json(
        { 
          error: 'Invalid scripts format',
          hint: 'Scripts must be an array'
        },
        { status: 400 }
      )
    }

    if (scripts.length === 0) {
      console.error('❌ Scripts array is empty')
      return NextResponse.json(
        { 
          error: 'No scripts provided',
          hint: 'Please select at least one script'
        },
        { status: 400 }
      )
    }

    console.log('✅ Validation passed')
    console.log(`📊 Processing ${scripts.length} scripts for ${profile.name}`)

    // Transform scripts for the prompt
    const scriptsInfo = scripts.map((s: any, i: number) => ({
      id: i,
      title: s.topicTitle || 'Untitled',
      tone: s.deliveryNotes?.pacing || 'conversational',
      energy: s.deliveryNotes?.energy || 5,
      readingTime: s.readingTime || 60,
      framing: s.visualCues?.framing || 'medium shot',
      lighting: s.visualCues?.lighting || 'natural'
    }))

    console.log('📝 Transformed script info:', scriptsInfo.length, 'scripts')

    const prompt = `You are a production planning expert for YouTube Shorts creators. Create an efficient filming plan for ${scripts.length} video scripts in ${filmingHours} hours.

CREATOR PROFILE:
- Name: ${profile.name}
- Niche: ${profile.niche}
- Primary Tone: ${profile.primaryTone}
- Creator Location: ${profile.location}, ${profile.country}
- Target Audience: ${profile.targetAudience || profile.country}

LANGUAGE & REGIONAL CONTEXT:
${(profile.languageVariant === 'British English' || 
  (!profile.languageVariant && (profile.targetAudience === 'United Kingdom' || profile.country === 'United Kingdom'))) ? 
`- CRITICAL: Use ONLY British English spelling and terminology throughout ALL responses
- British spellings: colour (not color), favourite (not favorite), organised (not organized), realise (not realize), centre (not center), theatre (not theater), humour (not humor), behaviour (not behavior), practise (verb, not practice), licence (noun, not license), grey (not gray)
- British terms: "trousers" (not pants), "jumper" (not sweater), "trainers" (not sneakers), "mobile" (not cell phone), "flat" (not apartment), "lift" (not elevator), "holiday" (vacation/trip), "boot" (car trunk), "bonnet" (car hood), "queue" (not line)
- Currency: GBP (£) - use pounds, never dollars
- Time: 24-hour format acceptable, or "half past" style
- Cultural references should be UK-appropriate` : 
`- Use American English spelling and terminology throughout
- American spellings: color, favorite, organized, realize, center, theater, humor, behavior
- American terms: "pants" (not trousers), "sweater" (not jumper), "sneakers" (not trainers), "cell phone" (not mobile), "apartment" (not flat), "elevator" (not lift), "vacation" (not holiday), "trunk/hood" (car parts), "line" (not queue)
- Currency: USD ($) - use dollars, not pounds
- Cultural references should be US-appropriate`}

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

    console.log('🤖 Calling Claude API...')

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

    console.log('✅ Claude API response received')

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    console.log('📄 Parsing batch plan JSON...')

    // Extract JSON from code blocks if present
    let jsonText = responseText
    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
      console.log('📋 Extracted JSON from code block')
    }

    let batchPlan
    try {
      batchPlan = JSON.parse(jsonText)
      console.log('✅ Batch plan parsed successfully')
      console.log(`📊 Batch plan created: ${batchPlan.clusters?.length || 0} clusters`)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('📄 Response text:', responseText.substring(0, 500))
      throw new Error('Failed to parse AI response as JSON')
    }

    return NextResponse.json({
      batchPlan,
      message: 'Batch plan generated successfully'
    })

  } catch (error) {
    console.error('❌ Error generating batch plan:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      { 
        error: 'Failed to generate batch plan',
        message: errorMessage,
        details: errorDetails,
        hint: 'Check that all required fields are present and your API key is valid'
      },
      { status: 500 }
    )
  }
}
