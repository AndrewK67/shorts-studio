import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai'; 

// This tells Vercel to use the Node.js runtime
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // --- 1. KEY CHECK AND CLIENT INITIALIZATION ---
    // This is the essential check to prevent the 500 crash
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set on the server.' }, { status: 500 });
    }
    
    // Initialize the Google GenAI client
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const { 
      topicTitle, 
      topicHook, 
      productionMode, 
      userProfile 
    } = await req.json();

    if (!topicTitle || !userProfile || !productionMode) {
      return NextResponse.json({ error: 'Missing required data for API generation.' }, { status: 400 });
    }

    // --- 2. Construct the System Prompt ---
    const systemInstruction = `You are a viral YouTube Shorts script writer specializing in the niche: "${userProfile.niche}". Your content must be 50-60 seconds long. Your output MUST be a single JSON object.

    Target Audience: ${userProfile.targetAudience} (${userProfile.languageVariant}).
    Channel Angle: ${userProfile.uniqueAngle}.
    Production Style: ${productionMode === 'fully-ai' ? 'Generate a high-level script for an AI video tool' : 'Write a detailed, performable script.'}

    Constraints: DO NOT mention the following topics: ${userProfile.wontCover.join(', ')}.
    
    Output Format: Your entire response MUST be a single JSON object that conforms exactly to this schema. Do not include any pre-amble, comments, or explanations.
    
    JSON Schema:
    {
      "script_content": "The full, continuous script text (50-60 seconds)",
      "script_duration_seconds": 55,
      "metadata": {
        "visual_notes": ["Brief notes for B-roll or AI visuals"],
        "call_to_action": "A brief, soft CTA"
      }
    }`;

    // --- 3. Construct the User Message ---
    const userMessage = `Write the full viral script for the topic: "${topicTitle}". 
    The hook must be: "${topicHook}".
    Tone: Primary: "${userProfile.signatureTone.primary}", Accent: "${userProfile.signatureTone.accent}".`;
    
    // --- 4. Call the Google Gen AI API ---
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessage,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json', // Force JSON output
          temperature: 0.8,
        },
    });

    // --- FINAL FIX: Using optional chaining (?) to prevent TypeScript build failure ---
    const jsonString = response.text?.trim();

    if (!jsonString) {
      return NextResponse.json({ error: 'AI failed to generate content or returned an empty response.' }, { status: 500 });
    }

    // --- 5. Parse and Return ---
    const scriptJson = JSON.parse(jsonString);

    if (!scriptJson.script_content) {
        return NextResponse.json({ error: 'AI output missing script_content field.' }, { status: 500 });
    }
    
    return NextResponse.json({
        topic_id: '', 
        title: topicTitle,
        script_content: scriptJson.script_content,
        tone: userProfile.signatureTone.primary,
        ...scriptJson 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Script Generation Route Error:', error);
    return NextResponse.json({ error: `Server Error: ${error.message || 'Unknown API failure'}` }, { status: 500 });
  }
}