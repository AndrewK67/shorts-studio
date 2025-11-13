import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { topic, userProfile, productionMode = 'ai-voice-stock' } = body

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Build the appropriate prompt based on production mode
    let systemPrompt = ''
    let scriptStructure = ''

    if (productionMode === 'traditional') {
      systemPrompt = buildTraditionalFilmingPrompt(userProfile)
      scriptStructure = `
REQUIRED STRUCTURE:
- Hook (0-3s): Opening line that stops the scroll
- Setup (3-8s): Problem or context
- Value Delivery (8-50s): Main content with [DELIVERY CUES]
- CTA (50-60s): Call to action

Use delivery cues like:
[PAUSE] - Brief pause for emphasis
[EMPHASIZE] - Stress this word/phrase
[SMILE] - Friendly expression
[SHOW: item] - Show physical object
[GESTURE] - Hand movement
[LEAN IN] - Move closer to camera`
    } else if (productionMode === 'ai-voice-stock') {
      systemPrompt = buildAIVoiceStockPrompt(userProfile)
      scriptStructure = `
REQUIRED STRUCTURE FOR AI VOICE + STOCK FOOTAGE:
- Hook (0-3s): Opening voiceover line that stops the scroll
- Setup (3-8s): Problem statement or context
- Value Delivery (8-50s): Main educational content with [STOCK FOOTAGE] cues
- CTA (50-60s): Clear call to action

Use [STOCK FOOTAGE: keyword] cues to indicate what stock video should play:
[STOCK FOOTAGE: person working on laptop]
[STOCK FOOTAGE: money counting]
[STOCK FOOTAGE: sunrise timelapse]
[STOCK FOOTAGE: happy family]

Keep narration natural for AI voice synthesis - avoid complex punctuation.`
    } else if (productionMode === 'fully-ai') {
      systemPrompt = buildFullyAIPrompt(userProfile)
      scriptStructure = `
REQUIRED STRUCTURE FOR FULLY AI GENERATED:
- Hook (0-3s): Opening voiceover line
- Setup (3-8s): Problem statement
- Value Delivery (8-50s): Main content with [AI IMAGE] prompts
- CTA (50-60s): Call to action

Use [AI IMAGE: detailed prompt] for each visual:
[AI IMAGE: modern minimalist home office with laptop, soft lighting, professional atmosphere]
[AI IMAGE: close-up of hands typing on keyboard, motion blur, productive energy]
[AI IMAGE: infographic showing 3 steps, clean design, blue and white color scheme]

Write narration optimized for AI voice. Include detailed visual prompts for image generation.`
    }

    const prompt = `${systemPrompt}

${scriptStructure}

TOPIC DETAILS:
Title: ${topic.title}
Hook: ${topic.hook}
Core Value: ${topic.coreValue || 'Provide practical value'}
Tone: ${topic.tone || 'Conversational'}
Emotional Driver: ${topic.emotionalDriver || 'Helpful'}

USER VOICE PROFILE:
${userProfile ? `
Tone: ${userProfile.signatureTone?.primary || 'Conversational'}
Style: ${userProfile.signatureTone?.secondary || 'Direct'}
Accent: ${userProfile.signatureTone?.accent || 'Friendly'}
` : 'Use a clear, engaging conversational tone'}

REQUIREMENTS:
1. Script must be 45-60 seconds when read aloud at natural pace
2. Hook must grab attention in first 3 seconds
3. Include appropriate ${productionMode === 'traditional' ? 'delivery cues [IN BRACKETS]' : productionMode === 'ai-voice-stock' ? '[STOCK FOOTAGE: keywords]' : '[AI IMAGE: detailed prompts]'}
4. End with clear, specific call to action
5. Keep language natural and conversational
6. ${productionMode !== 'traditional' ? 'Optimize narration for AI voice synthesis - avoid complex punctuation, use natural speech patterns' : 'Include physical delivery notes'}

Generate the complete script now in this exact JSON format:
{
  "hook": "3-second opening line",
  "content": "Full script with appropriate cues in [BRACKETS]",
  "readingTime": 52,
  "deliveryNotes": {
    "pacing": "Medium-fast with strategic pauses for emphasis",
    "energy": "7/10",
    "tone": "Enthusiastic and motivational with educational undertones"
  },
  "visualCues": {
    ${productionMode === 'traditional' 
      ? '"bRoll": ["Close-up on face for hook", "Show item at 20s"], "textOverlays": ["Key stat at 15s"]' 
      : productionMode === 'ai-voice-stock'
      ? '"stockFootageKeywords": ["morning routine", "productivity", "coffee"], "timing": [{"time": "0-5s", "footage": "person waking up"}, {"time": "5-15s", "footage": "coffee being made"}]'
      : '"imagePrompts": [{"time": "0-5s", "prompt": "detailed scene description"}, {"time": "5-15s", "prompt": "next scene"}], "style": "photorealistic OR illustrated OR minimal"'
    }
  },
  "factCheckNotes": {
    "claims": ["Any factual claims to verify"]
  }
}`

    console.log('🤖 Calling Claude API for script generation...')
    console.log('📋 Production Mode:', productionMode)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('📝 Raw API response:', responseText.substring(0, 200) + '...')

    // Parse the JSON response
    let scriptData
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      scriptData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError)
      console.log('Raw response:', responseText)
      return NextResponse.json({ error: 'Failed to parse script data' }, { status: 500 })
    }

    // Build the complete script object
    const script = {
      id: `script-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      topicId: topic.id,
      topicTitle: topic.title,
      productionMode,
      hook: scriptData.hook,
      content: scriptData.content,
      fullScript: scriptData.content,
      readingTime: scriptData.readingTime || 60,
      deliveryNotes: scriptData.deliveryNotes || {},
      visualCues: scriptData.visualCues || {},
      factCheckNotes: scriptData.factCheckNotes || {},
      verificationStatus: 'needs_review',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log('✅ Script generated successfully')
    console.log('🎬 Production mode:', productionMode)
    console.log('📊 Reading time:', script.readingTime, 'seconds')

    return NextResponse.json({ script })
  } catch (error: any) {
    console.error('❌ Error generating script:', error)
    return NextResponse.json(
      { error: 'Failed to generate script', details: error.message },
      { status: 500 }
    )
  }
}

function buildTraditionalFilmingPrompt(userProfile: any): string {
  return `You are an expert YouTube Shorts scriptwriter specializing in traditional on-camera filming. 
Create scripts optimized for a creator filming themselves with physical presence, gestures, and direct camera engagement.
Focus on natural delivery cues, physical actions, and camera-friendly pacing.`
}

function buildAIVoiceStockPrompt(userProfile: any): string {
  return `You are an expert YouTube Shorts scriptwriter specializing in AI voiceover + stock footage content.
Create scripts optimized for AI text-to-speech narration paired with relevant stock video footage.
Focus on:
- Natural, conversational narration that sounds good when synthesized
- Specific stock footage keywords that match the narration
- Clear visual-audio synchronization
- Avoiding complex punctuation that might confuse TTS
- Professional, documentary-style storytelling`
}

function buildFullyAIPrompt(userProfile: any): string {
  return `You are an expert YouTube Shorts scriptwriter specializing in fully AI-generated content.
Create scripts optimized for AI voiceover paired with AI-generated images (Midjourney, DALL-E, Stable Diffusion).
Focus on:
- Natural AI voiceover narration
- Highly detailed image generation prompts that create cohesive visual stories
- Scene-by-scene visual descriptions
- Consistent visual style throughout
- Professional, engaging presentation
Each image prompt should be detailed enough to generate high-quality, consistent visuals.`
}