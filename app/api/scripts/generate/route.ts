import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { env } from 'process';

// This tells Vercel to use the Node.js runtime, which Anthropic SDK needs
export const runtime = 'nodejs';

// Initialize the Anthropic client using the environment variable
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { 
      topicTitle, 
      topicHook, 
      productionMode, 
      userProfile 
    } = await req.json();

    // --- CRITICAL DATA VALIDATION ---
    if (!env.ANTHROPIC_API_KEY) {
      // Return a 401/500 if the key is missing (this is the most likely cause)
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set on the server.' }, { status: 500 });
    }
    if (!topicTitle || !userProfile || !productionMode) {
      console.error("Missing required fields in script generation request:", { topicTitle, productionMode, userProfile: !!userProfile });
      return NextResponse.json({ error: 'Missing required data for API generation.' }, { status: 400 });
    }

    // --- 1. Construct the System Prompt (AI Persona & Rules) ---
    const systemPrompt = `You are a viral YouTube Shorts script writer specializing in the niche: "${userProfile.niche}". Your content must be 50-60 seconds long.
    
    Target Audience: ${userProfile.targetAudience} (${userProfile.languageVariant}).
    Channel Angle: ${userProfile.uniqueAngle}.
    Production Style: ${productionMode === 'fully-ai' ? 'Generate a high-level script for an AI video tool' : 'Write a detailed, performable script.'}

    Rules:
    1. Hook: Start with the Hook provided, or an immediate, punchy variation.
    2. Tone: Maintain a primary tone of "${userProfile.signatureTone.primary}" with accents of "${userProfile.signatureTone.accent}".
    3. Constraints: DO NOT mention the following topics: ${userProfile.wontCover.join(', ')}.
    4. Output Format: Your entire response MUST be a single JSON object that conforms exactly to the JSON Schema provided below. Do not include any pre-amble, comments, or explanations outside the JSON block.

    JSON Schema:
    {
      "script_content": "The full, continuous script text (50-60 seconds)",
      "script_duration_seconds": 55,
      "metadata": {
        "visual_notes": ["Brief notes for B-roll or AI visuals"],
        "call_to_action": "A brief, soft CTA"
      }
    }`;

    // --- 2. Construct the User Message (Specific Task) ---
    const userMessage = `Write the full viral script for the topic: "${topicTitle}". 
    The hook must be: "${topicHook}".`;

    // --- 3. Call the Anthropic API ---
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620", 
      max_tokens: 4000, 
      system: systemPrompt,
      messages: [
        { role: "user", content: userMessage }
      ],
    });

    // --- SAFELY EXTRACT TEXT FROM CONTENT BLOCK ---
    const textBlock = response.content?.find(block => block.type === 'text');
    const jsonString = textBlock ? textBlock.text : null;

    if (!jsonString) {
      return NextResponse.json({ error: 'AI failed to generate content or returned an empty response.' }, { status: 500 });
    }

    // The AI returns a JSON string; parse it and return the final structure.
    const scriptJson = JSON.parse(jsonString);

    // Ensure the required fields are present in the final output
    if (!scriptJson.script_content) {
        return NextResponse.json({ error: 'AI output missing script_content field.' }, { status: 500 });
    }
    
    // Return the successful structured response
    return NextResponse.json({
        topic_id: '', 
        title: topicTitle,
        script_content: scriptJson.script_content,
        tone: userProfile.signatureTone.primary,
        ...scriptJson 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Script Generation Route Error:', error);
    // RETURN THE SPECIFIC ERROR MESSAGE FROM THE SDK
    return NextResponse.json({ error: `Anthropic Error: ${error.message || 'Unknown API failure'}` }, { status: 500 });
  }
}# Temporary line to force deployment
