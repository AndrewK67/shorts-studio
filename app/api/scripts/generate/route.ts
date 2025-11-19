import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Allow streaming/longer execution if possible, though Vercel Hobby is capped at 10s
export const runtime = 'nodejs'; 
export const maxDuration = 60; // This attempts to extend time on Pro, ignored on Hobby

export async function POST(req: Request) {
  try {
    // --- 1. KEY CHECK ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Error: GEMINI_API_KEY is missing in Vercel Environment Variables");
      return NextResponse.json(
        { error: 'Server Config Error: API Key missing.' }, 
        { status: 500 }
      );
    }

    // --- 2. SETUP GOOGLE AI (Stable SDK) ---
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // USE A REAL MODEL NAME: 'gemini-1.5-flash' is the current fast standard.
    // 'gemini-2.5-flash' likely does not exist and causes the crash.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      generationConfig: {
        responseMimeType: "application/json",
        // We define the schema to ensure strict JSON output
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            script_content: { type: SchemaType.STRING },
            script_duration_seconds: { type: SchemaType.NUMBER },
            metadata: {
              type: SchemaType.OBJECT,
              properties: {
                visual_notes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                call_to_action: { type: SchemaType.STRING }
              }
            }
          }
        }
      }
    });

    const { topicTitle, topicHook, productionMode, userProfile } = await req.json();

    // --- 3. VALIDATION ---
    if (!topicTitle || !userProfile) {
      return NextResponse.json({ error: 'Missing Data' }, { status: 400 });
    }

    // --- 4. PROMPT ENGINEERING ---
    const systemPrompt = `
    You are a viral YouTube Shorts script writer.
    Role: Write a 60-second script for niche: "${userProfile.niche}".
    Audience: ${userProfile.targetAudience}.
    Style: ${userProfile.signatureTone.primary} with ${userProfile.signatureTone.accent} accents.
    Constraint: Output strict JSON.
    `;

    const userPrompt = `
    Topic: "${topicTitle}"
    Hook: "${topicHook}"
    Context: ${productionMode === 'fully-ai' ? 'For AI generation' : 'For human performance'}.
    `;

    // --- 5. EXECUTE API ---
    // Note: System instructions are passed here in the new stable SDK logic if supported, 
    // or we append them to the prompt. 1.5-Flash supports systemInstruction via config, 
    // but appending is safer for avoiding 400 errors on older models.
    const result = await model.generateContent([systemPrompt, userPrompt]);
    const response = await result.response;
    const jsonString = response.text();

    if (!jsonString) {
      throw new Error("Empty response from Gemini");
    }

    // --- 6. PARSE & RETURN ---
    const scriptJson = JSON.parse(jsonString);

    return NextResponse.json({
        topic_id: '', 
        title: topicTitle,
        script_content: scriptJson.script_content,
        tone: userProfile.signatureTone.primary,
        ...scriptJson 
    }, { status: 200 });

  } catch (error: any) {
    // This logs the ACTUAL error to your Vercel Logs so you can see it
    console.error('❌ GENERATION FAILED:', error);
    return NextResponse.json(
      { error: error.message || 'Script generation failed.' }, 
      { status: 500 }
    );
  }
}