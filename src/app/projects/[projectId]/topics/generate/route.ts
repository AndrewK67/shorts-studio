// src/app/api/projects/[projectId]/topics/generate/route.ts
// Updated topic generation with regional support and deduplication

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  generateRegionalPromptContext,
  getHolidaysForMonth,
  getRegionalConfig,
} from '@/lib/regional-data';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface TopicGenerationRequest {
  month: string; // YYYY-MM format
  videosNeeded: number;
  toneMix: {
    emotional: number;
    calming: number;
    storytelling: number;
    educational: number;
    humor: number;
  };
  customEvents: Array<{
    date: string;
    name: string;
    description: string;
  }>;
  userProfile: {
    niche: string;
    uniqueAngle: string;
    signatureTone: {
      primary: string;
      secondary: string;
      accent: string;
    };
    catchphrases: string[];
    boundaries: {
      wontCover: string[];
      privacyLimits: string[];
    };
  };
  regionalSettings: {
    creatorCountry: string; // GB, US, etc
    targetCountry: string; // GB, US, etc
  };
  existingTopics?: string[]; // For deduplication
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body: TopicGenerationRequest = await request.json();
    
    // Parse month
    const [year, month] = body.month.split('-').map(Number);
    
    // Get regional context
    const regionalContext = generateRegionalPromptContext(
      body.regionalSettings.creatorCountry,
      body.regionalSettings.targetCountry,
      month,
      body.customEvents
    );
    
    // Build the comprehensive prompt
    const prompt = buildTopicGenerationPrompt(
      body,
      regionalContext,
      body.existingTopics || []
    );
    
    console.log('Generating topics with regional context:', {
      creator: body.regionalSettings.creatorCountry,
      target: body.regionalSettings.targetCountry,
      month: body.month,
    });
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    // Parse response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }
    
    // Parse topics from JSON
    const topics = parseTopicsFromResponse(content.text);
    
    // Validate and deduplicate
    const validatedTopics = validateAndDeduplicateTopics(
      topics,
      body.existingTopics || []
    );
    
    return NextResponse.json({
      success: true,
      topics: validatedTopics,
      count: validatedTopics.length,
      regionalInfo: {
        creatorCountry: body.regionalSettings.creatorCountry,
        targetCountry: body.regionalSettings.targetCountry,
        holidaysIncluded: getHolidaysForMonth(
          body.regionalSettings.targetCountry,
          year,
          month
        ).map(h => h.name),
      },
    });
  } catch (error) {
    console.error('Error generating topics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate topics',
      },
      { status: 500 }
    );
  }
}

function buildTopicGenerationPrompt(
  request: TopicGenerationRequest,
  regionalContext: string,
  existingTopics: string[]
): string {
  const { userProfile, videosNeeded, toneMix } = request;
  
  return `You are an expert YouTube Shorts content strategist helping a creator plan their monthly content.

${regionalContext}

USER PROFILE:
Niche: ${userProfile.niche}
Unique Angle: ${userProfile.uniqueAngle}
Signature Tone: ${userProfile.signatureTone.primary} (primary), ${userProfile.signatureTone.secondary} (secondary), ${userProfile.signatureTone.accent} (accent)
Catchphrases: ${userProfile.catchphrases.join(', ')}

Content Boundaries (NEVER suggest):
${userProfile.boundaries.wontCover.map(b => `- ${b}`).join('\n')}

TONE MIX FOR THIS BATCH:
${Object.entries(toneMix).map(([tone, percentage]) => `- ${tone}: ${percentage}%`).join('\n')}

VIDEOS NEEDED: ${videosNeeded}

${existingTopics.length > 0 ? `
EXISTING TOPICS (DO NOT DUPLICATE):
${existingTopics.slice(-20).join('\n')} // Show last 20 to prevent repeats

CRITICAL: Generate UNIQUE topics that are DIFFERENT from the existing ones above. 
- Use different angles
- Target different emotional triggers
- Cover different aspects of the niche
` : ''}

YOUR TASK:
Generate ${videosNeeded} YouTube Shorts topic ideas that:

1. ✅ ARE relevant to ${request.regionalSettings.targetCountry} audience
2. ✅ USE ${getRegionalConfig(request.regionalSettings.targetCountry).language} terminology
3. ✅ REFERENCE ${request.regionalSettings.targetCountry} holidays and cultural moments
4. ✅ Are UNIQUE and DIFFERENT from each other
5. ✅ Match the tone distribution specified above
6. ✅ Stay within the creator's boundaries
7. ✅ Leverage the creator's unique angle
8. ❌ DO NOT reference holidays/events not celebrated in ${request.regionalSettings.targetCountry}
9. ❌ DO NOT create duplicate or too-similar topics

For each topic provide:
- title: Compelling, scroll-stopping title
- hook: First 3 seconds hook that grabs attention
- coreValue: What value does this provide to the viewer?
- emotionalDriver: What emotion triggers engagement? (curiosity, nostalgia, surprise, relief, inspiration, validation, urgency)
- formatType: video, story, lesson, list, myth-buster, behind-scenes, day-in-life
- tone: Which tone category (emotional, calming, storytelling, educational, humor)
- longevity: evergreen, seasonal, or trending
- factCheckStatus: verified, needs_review, or opinion
- dateRangeStart: YYYY-MM-DD (when to post this)
- dateRangeEnd: YYYY-MM-DD (last good date to post)

Return ONLY valid JSON in this exact format:
{
  "topics": [
    {
      "title": "string",
      "hook": "string",
      "coreValue": "string",
      "emotionalDriver": "string",
      "formatType": "string",
      "tone": "string",
      "longevity": "string",
      "factCheckStatus": "string",
      "dateRangeStart": "YYYY-MM-DD",
      "dateRangeEnd": "YYYY-MM-DD"
    }
  ]
}

DO NOT include any text before or after the JSON. DO NOT use markdown code blocks.`;
}

function parseTopicsFromResponse(text: string): any[] {
  try {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(cleanText);
    return parsed.topics || [];
  } catch (error) {
    console.error('Failed to parse topics:', error);
    console.error('Raw text:', text);
    throw new Error('Failed to parse topics from AI response');
  }
}

function validateAndDeduplicateTopics(
  newTopics: any[],
  existingTopics: string[]
): any[] {
  const validated: any[] = [];
  const seenTitles = new Set(existingTopics.map(t => t.toLowerCase().trim()));
  
  for (const topic of newTopics) {
    // Check for required fields
    if (!topic.title || !topic.hook || !topic.coreValue) {
      console.warn('Skipping invalid topic:', topic);
      continue;
    }
    
    // Normalize title for comparison
    const normalizedTitle = topic.title.toLowerCase().trim();
    
    // Check for exact duplicates
    if (seenTitles.has(normalizedTitle)) {
      console.warn('Skipping duplicate topic:', topic.title);
      continue;
    }
    
    // Check for very similar titles (fuzzy matching)
    const isTooSimilar = Array.from(seenTitles).some(existing => {
      return calculateSimilarity(normalizedTitle, existing) > 0.8; // 80% similar = duplicate
    });
    
    if (isTooSimilar) {
      console.warn('Skipping similar topic:', topic.title);
      continue;
    }
    
    // Add to validated list
    validated.push(topic);
    seenTitles.add(normalizedTitle);
  }
  
  return validated;
}

/**
 * Calculate similarity between two strings (0-1)
 * Using Levenshtein distance ratio
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}
