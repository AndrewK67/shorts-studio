import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // 1. Validate API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing from server environment.' }, { status: 500 });
    }

    // 2. Initialize Gemini (Stable SDK)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            topics: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  hook: { type: SchemaType.STRING },
                  category: { type: SchemaType.STRING }
                },
                required: ["title", "hook", "category"]
              }
            }
          }
        }
      }
    });

    // 3. Get User Input
    const { niche, audience, contentPillars } = await req.json();

    if (!niche || !audience) {
      return NextResponse.json({ error: 'Niche and Audience are required' }, { status: 400 });
    }

    // 4. Construct Prompt
    const prompt = `
      Act as a viral YouTube Strategist.
      Generate 5 engaging YouTube Shorts topic ideas.
      
      Context:
      - Niche: ${niche}
      - Target Audience: ${audience}
      - Content Pillars: ${contentPillars?.length ? contentPillars.join(', ') : 'General trending topics'}
      
      Output Requirement:
      Return ONLY a raw JSON object containing a "topics" array. 
      Each topic must have a catchy "title", a curiosity-inducing "hook", and a "category".
    `;

    // 5. Generate
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();

    if (!jsonString) {
      throw new Error("AI returned empty response");
    }

    const data = JSON.parse(jsonString);

    // 6. Return Success
    return NextResponse.json({ topics: data.topics }, { status: 200 });

  } catch (error: any) {
    console.error('Topic Generation Failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate topics' }, { status: 500 });
  }
}