// app/api/batch-plan/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface Script {
  id: string;
  title: string;
  hook: string;
  content: string;
  tone: string;
  productionMode: string;
  readingTime?: number;
}

interface Cluster {
  id: string;
  name: string;
  description: string;
  scripts: Script[];
  outfit: string;
  location: string;
  lighting: string;
  props: string[];
  energy: number;
  estimatedTime: number;
  startTime?: string;
  endTime?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Batch plan generation request received');
    
    // Parse request body
    const body = await request.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));
    
    const { scripts } = body;

    // Validate scripts
    if (!scripts || !Array.isArray(scripts) || scripts.length === 0) {
      console.log('❌ No scripts provided in request');
      return NextResponse.json(
        { error: 'No scripts selected. Please select scripts from the scripts page.' },
        { status: 400 }
      );
    }

    console.log(`✅ Received ${scripts.length} scripts for clustering`);

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured. Please set ANTHROPIC_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    // Build the clustering prompt
    const prompt = buildClusteringPrompt(scripts);
    console.log('🤖 Calling Claude API for clustering...');

    try {
      // Call Claude API
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      console.log('✅ Claude API response received');

      // Extract the text content
      const responseText = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '';

      console.log('📝 Parsing Claude response...');

      // Parse the JSON response
      const clusters = parseClusterResponse(responseText, scripts);

      console.log(`✅ Generated ${clusters.length} clusters`);

      // Calculate total estimated time
      const totalTime = clusters.reduce((sum, cluster) => sum + cluster.estimatedTime, 0);

      return NextResponse.json({
        success: true,
        clusters,
        totalScripts: scripts.length,
        totalClusters: clusters.length,
        estimatedHours: Math.round((totalTime / 60) * 10) / 10,
      });

    } catch (aiError: any) {
      console.error('❌ Claude API error:', aiError);
      
      // If AI fails, use fallback clustering
      console.log('🔄 Using fallback clustering algorithm...');
      const clusters = fallbackClustering(scripts);
      
      return NextResponse.json({
        success: true,
        clusters,
        totalScripts: scripts.length,
        totalClusters: clusters.length,
        estimatedHours: Math.round((clusters.reduce((sum, c) => sum + c.estimatedTime, 0) / 60) * 10) / 10,
        warning: 'AI clustering unavailable. Used automatic grouping.',
      });
    }

  } catch (error: any) {
    console.error('❌ Batch plan generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate batch plan' },
      { status: 500 }
    );
  }
}

function buildClusteringPrompt(scripts: Script[]): string {
  return `You are an expert video production planner. Analyze these ${scripts.length} YouTube Shorts scripts and organize them into efficient filming clusters.

SCRIPTS TO CLUSTER:
${scripts.map((s, i) => `
${i + 1}. "${s.title}"
   Tone: ${s.tone}
   Production Mode: ${s.productionMode}
   Hook: ${s.hook}
   Length: ${s.readingTime || 60}s
`).join('\n')}

CLUSTERING RULES:
1. Group scripts by similar:
   - Tone/energy level (emotional scripts together, educational together, etc.)
   - Production requirements (AI videos together, traditional together)
   - Location/setting needs
   - Visual style

2. Each cluster should have 2-6 scripts (ideal for filming efficiency)
3. Minimize outfit/location changes between videos
4. Balance energy levels (don't put all high-energy scripts together)

OUTPUT FORMAT (JSON only, no markdown):
{
  "clusters": [
    {
      "name": "Descriptive cluster name",
      "description": "Why these scripts work together",
      "scriptIds": ["script-id-1", "script-id-2"],
      "outfit": "Suggested outfit/look",
      "location": "Suggested filming location",
      "lighting": "Lighting setup",
      "props": ["prop1", "prop2"],
      "energy": 7,
      "estimatedMinutes": 30
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations, just the JSON object.`;
}

function parseClusterResponse(responseText: string, scripts: Script[]): Cluster[] {
  try {
    // Remove markdown code blocks if present
    let cleanedText = responseText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '');
    cleanedText = cleanedText.replace(/```\n?/g, '');
    cleanedText = cleanedText.trim();

    const parsed = JSON.parse(cleanedText);
    const clustersData = parsed.clusters || [];

    // Map the clusters and assign scripts
    return clustersData.map((clusterData: any, index: number) => {
      const clusterScripts = (clusterData.scriptIds || [])
        .map((id: string) => scripts.find(s => s.id === id))
        .filter(Boolean) as Script[];

      // If no scripts matched by ID, assign some scripts
      if (clusterScripts.length === 0 && scripts.length > 0) {
        const startIdx = index * 3;
        clusterScripts.push(...scripts.slice(startIdx, startIdx + 3));
      }

      return {
        id: `cluster-${Date.now()}-${index}`,
        name: clusterData.name || `Cluster ${index + 1}`,
        description: clusterData.description || '',
        scripts: clusterScripts,
        outfit: clusterData.outfit || 'Casual, comfortable',
        location: clusterData.location || 'Indoor setup',
        lighting: clusterData.lighting || 'Natural light',
        props: Array.isArray(clusterData.props) ? clusterData.props : [],
        energy: clusterData.energy || 5,
        estimatedTime: clusterData.estimatedMinutes || clusterScripts.length * 5,
      };
    });

  } catch (parseError) {
    console.error('Failed to parse AI response, using fallback:', parseError);
    return fallbackClustering(scripts);
  }
}

function fallbackClustering(scripts: Script[]): Cluster[] {
  const clusters: Cluster[] = [];
  const scriptsPerCluster = 3;

  for (let i = 0; i < scripts.length; i += scriptsPerCluster) {
    const clusterScripts = scripts.slice(i, i + scriptsPerCluster);
    const clusterIndex = Math.floor(i / scriptsPerCluster);

    // Determine cluster characteristics based on first script
    const firstScript = clusterScripts[0];
    const isAI = firstScript.productionMode === 'fully-ai';
    
    clusters.push({
      id: `cluster-${Date.now()}-${clusterIndex}`,
      name: `${firstScript.tone.charAt(0).toUpperCase() + firstScript.tone.slice(1)} Videos (${clusterScripts.length})`,
      description: `${isAI ? 'AI-generated' : 'Traditional filming'} cluster with ${firstScript.tone} tone`,
      scripts: clusterScripts,
      outfit: isAI ? 'N/A (AI Generated)' : 'Casual, comfortable',
      location: isAI ? 'N/A (AI Generated)' : 'Indoor setup',
      lighting: isAI ? 'N/A (AI Generated)' : 'Natural light',
      props: isAI ? [] : ['Script printout'],
      energy: firstScript.tone === 'emotional' ? 4 : 6,
      estimatedTime: clusterScripts.length * 5,
    });
  }

  return clusters;
}
