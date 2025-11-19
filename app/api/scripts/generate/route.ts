import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // 1. Check Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY missing' }, { status: 500 });
    }

    // 2. Setup Gemini
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
                }
              }
            }
          }
        }
      }
    });

    const { niche, audience, contentPillars } = await req.json();

    // 3. Prompt
    const prompt = `
    Generate 5 viral YouTube Shorts topics for:
    Niche: ${niche}
    Audience: ${audience}
    Focus Areas: ${contentPillars?.join(', ') || 'General'}
    
    Output: Strict JSON object with a "topics" array.
    `;

    // 4. Generate
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();

    if (!jsonString) throw new Error("No data returned");
    
    const data = JSON.parse(jsonString);

    // 5. Return
    return NextResponse.json({ topics: data.topics }, { status: 200 });

  } catch (error: any) {
    console.error('Topic Gen Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}