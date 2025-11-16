import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// ============================================
// ANTHROPIC CLIENT SETUP
// ============================================

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('[ERROR] ANTHROPIC_API_KEY is not set in environment variables');
}

const anthropic = new Anthropic({
  apiKey: apiKey || '',
});

// ============================================
// TYPES
// ============================================

interface TopicGenerationRequest {
  projectName: string;
  month: string;
  videosNeeded: number;
  toneMix: {
    emotional: number;
    calming: number;
    storytelling: number;
    educational: number;
    humor: number;
  };
  profile: {
    niche: string;
    uniqueAngle: string;
    signatureTone: {
      primary: string;
      secondary: string;
      accent: string;
    };
    catchphrases?: string[];
    boundaries?: {
      wontCover: string[];
      privacyLimits: string[];
    };
    targetAudience?: string;
    languageVariant?: string;
    country?: string;
  };
  regional: {
    location: string;
    countryCode: string;
    hemisphere: string;
    timezone: string;
    language: string;
    holidays: Array<{
      date: string;
      name: string;
      culturalContext: string;
    }>;
  };
  customEvents?: Array<{
    date: string;
    name: string;
    type: string;
    priority: string;
  }>;
  existingTopics?: string[];
  productionMode: 'traditional' | 'ai-voice' | 'fully-ai';
}

// ============================================
// PROMPT BUILDER
// ============================================

function buildTopicGenerationPrompt(request: TopicGenerationRequest): string {
  const {
    projectName,
    month,
    videosNeeded,
    toneMix,
    profile,
    regional,
    customEvents,
    existingTopics,
    productionMode,
  } = request;

  const monthDate = new Date(month);
  const monthName = monthDate.toLocaleString('en-GB', { month: 'long' });
  const year = monthDate.getFullYear();
  
  const monthHolidays = regional.holidays.filter(h => {
    const holidayDate = new Date(h.date);
    return holidayDate.getMonth() === monthDate.getMonth() &&
           holidayDate.getFullYear() === year;
  });

  let productionContext = '';
  if (productionMode === 'traditional') {
    productionContext = 'User will film themselves. Suggest topics for authentic, personal delivery.';
  } else if (productionMode === 'ai-voice') {
    productionContext = 'User will use AI voiceover with stock footage. Topics should be visual.';
  } else {
    productionContext = 'User will create fully AI-generated videos. Topics should be visually creative.';
  }

  // Determine language variant
  const usesBritishEnglish = 
    profile.languageVariant === 'British English' ||
    (!profile.languageVariant && 
     (profile.targetAudience === 'United Kingdom' || 
      regional.language?.includes('British') ||
      regional.countryCode === 'GB'))

  const languageInstructions = usesBritishEnglish ?
    `- CRITICAL: Use ONLY British English spelling and terminology throughout ALL responses
- British spellings: colour (not color), favourite (not favorite), organised (not organized), realise (not realize), centre (not center), theatre (not theater), humour (not humor), behaviour (not behavior), practise (verb, not practice), licence (noun, not license), grey (not gray)
- British terms: "trousers" (not pants), "jumper" (not sweater), "trainers" (not sneakers), "mobile" (not cell phone), "flat" (not apartment), "lift" (not elevator), "holiday" (vacation/trip), "boot" (car trunk), "bonnet" (car hood), "queue" (not line)
- Currency: GBP (£) - use pounds, never dollars
- Cultural references should be UK-appropriate
- Holiday references: Use UK holidays (${monthHolidays.map(h => h.name).join(', ') || 'None'})` :
    `- Use American English spelling and terminology throughout
- American spellings: color, favorite, organized, realize, center, theater, humor, behavior
- American terms: "pants" (not trousers), "sweater" (not jumper), "sneakers" (not trainers), "cell phone" (not mobile), "apartment" (not flat), "elevator" (not lift), "vacation" (not holiday), "trunk/hood" (car parts), "line" (not queue)
- Currency: USD ($) - use dollars, not pounds
- Cultural references should be US-appropriate
- Holiday references: Use appropriate holidays for target audience`

  const prompt = `You are an expert YouTube Shorts content strategist for ${monthName} ${year}.

CREATOR PROFILE:
- Niche: ${profile.niche}
- Unique Angle: ${profile.uniqueAngle}
- Primary Tone: ${profile.signatureTone.primary}
- Secondary Tone: ${profile.signatureTone.secondary}
- Accent Tone: ${profile.signatureTone.accent}
- Creator Location: ${regional.location}, ${regional.countryCode}
- Target Audience: ${profile.targetAudience || regional.countryCode}

LANGUAGE & REGIONAL CONTEXT:
${languageInstructions}

PRODUCTION MODE:
${productionContext}

TONE MIX (distribute topics accordingly):
- ${toneMix.emotional}% Emotional
- ${toneMix.calming}% Calming
- ${toneMix.storytelling}% Storytelling
- ${toneMix.educational}% Educational
- ${toneMix.humor}% ${usesBritishEnglish ? 'Humour' : 'Humor'}

${monthHolidays.length > 0 ? `KEY DATES IN ${monthName.toUpperCase()}:
${monthHolidays.map(h => `- ${h.name} (${h.date}): ${h.culturalContext}`).join('\n')}` : ''}

${customEvents && customEvents.length > 0 ? `CUSTOM EVENTS:
${customEvents.map(e => `- ${e.name} (${e.date}): ${e.type}`).join('\n')}` : ''}

${existingTopics && existingTopics.length > 0 ? `AVOID THESE EXISTING TOPICS:
${existingTopics.join(', ')}` : ''}

${profile.boundaries?.wontCover && profile.boundaries.wontCover.length > 0 ? `DO NOT COVER:
${profile.boundaries.wontCover.join(', ')}` : ''}

TASK:
Generate exactly ${videosNeeded} YouTube Shorts topic ideas that:
1. Match the creator's niche and unique angle
2. Distribute according to the tone mix percentages
3. Are culturally appropriate for the target audience
4. Use the correct language variant throughout
5. Are optimised for ${productionMode} production

Return ONLY valid JSON (no markdown, no code blocks):

{
  "topics": [
    {
      "title": "clear, specific title (50-80 chars)",
      "hook": "attention-grabbing first 3 seconds",
      "coreValue": "what viewer gains",
      "emotionalDriver": "why they'll share",
      "formatType": "Story|List|Tutorial|Comparison|Challenge|etc",
      "tone": "matches one from tone mix",
      "longevity": "evergreen|seasonal|trending",
      "factCheckStatus": "verified|needs_review|opinion",
      "dateRangeStart": "YYYY-MM-DD",
      "dateRangeEnd": "YYYY-MM-DD",
      "productionNotes": "specific tips for ${productionMode} mode"
    }
  ]
}`;

  return prompt;
}

// ============================================
// STREAMING API HANDLER
// ============================================

export async function POST(request: Request) {
  console.log('🎬 [TOPICS API] Starting streaming topic generation...');
  
  try {
    const body: TopicGenerationRequest = await request.json();
    console.log('📊 [TOPICS API] Received request:', {
      projectName: body.projectName,
      month: body.month,
      videosNeeded: body.videosNeeded,
      productionMode: body.productionMode,
      targetAudience: body.profile?.targetAudience,
      languageVariant: body.profile?.languageVariant,
      country: body.regional?.countryCode,
    });

    // Validate
    if (!body.projectName || !body.month || !body.videosNeeded) {
      console.error('❌ [TOPICS API] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: projectName, month, or videosNeeded' },
        { status: 400 }
      );
    }

    if (!body.profile || !body.regional) {
      console.error('❌ [TOPICS API] Missing profile or regional data');
      return NextResponse.json(
        { error: 'Missing profile or regional data' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      console.error('❌ [TOPICS API] API key not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const prompt = buildTopicGenerationPrompt(body);
    console.log('🤖 [TOPICS API] Calling Claude API with streaming...');
    console.log('🌍 [TOPICS API] Language:', body.profile.languageVariant || body.regional.language);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial progress
          const startData = {
            type: 'progress',
            message: 'Connecting to AI...',
            timestamp: new Date().toISOString()
          };
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(startData)}\n\n`)
          );

          // Call Anthropic with streaming enabled
          const anthropicStream = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8000,
            temperature: 0.7,
            stream: true,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          });

          let fullResponse = '';
          let lastProgressUpdate = Date.now();
          let progressCount = 0;

          // Stream the response
          for await (const chunk of anthropicStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              fullResponse += text;

              // Send progress updates every 500ms
              const now = Date.now();
              if (now - lastProgressUpdate > 500) {
                progressCount++;
                const progressData = {
                  type: 'progress',
                  message: `Generating topics... (${Math.min(progressCount * 10, 90)}%)`,
                  received: fullResponse.length,
                  timestamp: new Date().toISOString()
                };
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify(progressData)}\n\n`)
                );
                lastProgressUpdate = now;
              }
            }
          }

          console.log('✅ [TOPICS API] Received complete response:', fullResponse.length, 'characters');

          // Progress: Parsing response
          const parseProgressData = {
            type: 'progress',
            message: 'Parsing AI response...',
            timestamp: new Date().toISOString()
          };
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(parseProgressData)}\n\n`)
          );

          // Parse the complete response
          let cleanText = fullResponse.trim();
          cleanText = cleanText.replace(/```json\n?/g, '');
          cleanText = cleanText.replace(/```\n?/g, '');
          cleanText = cleanText.trim();

          let parsedResponse;
          try {
            parsedResponse = JSON.parse(cleanText);
            console.log('✅ [TOPICS API] Successfully parsed:', parsedResponse.topics?.length, 'topics');
          } catch (parseError) {
            console.error('❌ [TOPICS API] JSON parse error:', parseError);
            console.error('📄 [TOPICS API] Response preview:', cleanText.substring(0, 500));
            
            const errorData = {
              type: 'error',
              error: 'Failed to parse AI response',
              details: parseError instanceof Error ? parseError.message : 'Parse error',
              hint: 'The AI returned invalid JSON. Please try again.'
            };
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(errorData)}\n\n`)
            );
            controller.close();
            return;
          }

          // Validate structure
          if (!parsedResponse.topics || !Array.isArray(parsedResponse.topics)) {
            console.error('❌ [TOPICS API] Invalid response structure');
            const errorData = {
              type: 'error',
              error: 'Invalid response structure',
              details: 'Response missing topics array',
              hint: 'The AI response was not in the expected format.'
            };
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(errorData)}\n\n`)
            );
            controller.close();
            return;
          }

          console.log(`🎉 [TOPICS API] Generated ${parsedResponse.topics.length} topics successfully`);

          // Send complete data
          const completeData = {
            type: 'complete',
            success: true,
            topics: parsedResponse.topics,
            metadata: {
              generated: new Date().toISOString(),
              count: parsedResponse.topics.length,
              month: body.month,
              projectName: body.projectName,
              regional: {
                location: body.regional.location,
                countryCode: body.regional.countryCode,
                language: body.profile.languageVariant || body.regional.language,
                targetAudience: body.profile.targetAudience
              },
              productionMode: body.productionMode
            },
          };

          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(completeData)}\n\n`)
          );
          
          console.log('✅ [TOPICS API] Stream completed successfully');
          controller.close();

        } catch (error) {
          console.error('❌ [TOPICS API] Stream error:', error);
          
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            errorType: error?.constructor?.name,
            hint: 'An error occurred while generating topics. Please try again.'
          };
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ [TOPICS API] Request error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Failed to process the request. Please check your input and try again.'
      },
      { status: 500 }
    );
  }
}