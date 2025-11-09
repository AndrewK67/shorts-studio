import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('⚠️ ANTHROPIC_API_KEY is not set in environment variables')
}

interface RegionalConfigRequest {
  location: string
  country: string
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: 'Server configuration error',
          details: 'ANTHROPIC_API_KEY is not configured.'
        },
        { status: 500 }
      )
    }

    const body: RegionalConfigRequest = await request.json()
    const { location, country } = body

    if (!country) {
      return NextResponse.json(
        { error: 'Country is required' },
        { status: 400 }
      )
    }

    console.log(`🌍 Generating regional config for: ${location || country}`)

    const prompt = `You are a cultural and regional expert. Generate a comprehensive regional configuration for content creators based in: ${location ? `${location}, ${country}` : country}

Generate a detailed regional configuration including:

1. **Location Details**:
   - Country code (ISO 3166-1 alpha-3)
   - Hemisphere (Northern or Southern)
   - Timezone (IANA timezone identifier)
   - Language variant (e.g., "British English", "American English", "Canadian French")
   - Date format (DD/MM/YYYY or MM/DD/YYYY)
   - Currency code and symbol

2. **Major Holidays for Next 12 Months** (from today):
   - Include national holidays, religious observances, and major cultural celebrations
   - For each holiday provide:
     * Date (YYYY-MM-DD format)
     * Name
     * Type (national/religious/cultural)
     * Priority (critical/important/optional)
     * Brief cultural context (1 sentence)
   - Include region-specific holidays
   - Consider local traditions and observances

3. **Seasonal Themes and Cultural Moments**:
   - Season-specific themes for each quarter
   - Cultural moments unique to the region
   - Weather patterns that affect content (e.g., "Monsoon season June-September")
   - Back-to-school periods
   - Shopping seasons (sales events, cultural shopping periods)

4. **Content Creation Nuances**:
   - Spelling preferences (colour vs color, etc.)
   - Cultural sensitivities to be aware of
   - Popular local references
   - Humor styles that resonate
   - Topics that are particularly relevant

Return ONLY a valid JSON object with this structure (no markdown, no extra text):

{
  "countryCode": "GBR",
  "hemisphere": "Northern",
  "timezone": "Europe/London",
  "language": "British English",
  "dateFormat": "DD/MM/YYYY",
  "currency": {
    "code": "GBP",
    "symbol": "£"
  },
  "holidays": [
    {
      "date": "2025-12-25",
      "name": "Christmas Day",
      "type": "national",
      "priority": "critical",
      "culturalContext": "Major Christian holiday celebrated with family gatherings and gift-giving"
    }
  ],
  "seasonalThemes": [
    {
      "quarter": "Q1",
      "months": "January-March",
      "themes": ["New Year resolutions", "Winter weather", "Valentine's Day"],
      "weatherContext": "Cold, often rainy or snowy"
    }
  ],
  "culturalMoments": [
    {
      "period": "Late August",
      "name": "Bank Holiday Weekend",
      "significance": "Last summer holiday weekend, popular for travel and festivals"
    }
  ],
  "contentNuances": {
    "spellingPreferences": ["colour not color", "organise not organize"],
    "culturalSensitivities": ["Avoid American-centric assumptions"],
    "popularReferences": ["British TV shows", "Football (soccer)"],
    "humorStyle": "Self-deprecating, dry wit, wordplay",
    "relevantTopics": ["Weather", "Tea culture", "Queue etiquette"]
  }
}

Generate the complete configuration now.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more consistent, factual output
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the response
    let regionalConfig
    try {
      // Try to find JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        regionalConfig = JSON.parse(jsonMatch[0])
      } else {
        regionalConfig = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.error('Failed to parse regional config:', responseText)
      throw new Error('Could not parse AI response as JSON')
    }

    // Add metadata
    const finalConfig = {
      ...regionalConfig,
      location: location || country,
      country,
      generatedAt: new Date().toISOString(),
      isActive: true,
    }

    console.log(`✅ Successfully generated regional config for ${country}`)

    return NextResponse.json({
      success: true,
      config: finalConfig,
    })

  } catch (error) {
    console.error('❌ Error generating regional config:', error)

    let errorMessage = 'Failed to generate regional configuration'
    let errorDetails = 'Unknown error'

    if (error instanceof Error) {
      errorDetails = error.message

      if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key'
        errorDetails = 'Please check your ANTHROPIC_API_KEY environment variable'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded'
        errorDetails = 'Please wait a moment and try again'
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
