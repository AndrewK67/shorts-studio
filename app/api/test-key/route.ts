import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET() {
  console.log('=== API Key Diagnostic ===');
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key prefix:', apiKey ? apiKey.substring(0, 15) + '...' : 'NOT SET');
  
  // Test if we can create a client
  let clientCreated = false;
  let testError = null;
  
  try {
    const client = new Anthropic({ apiKey: apiKey || '' });
    clientCreated = true;
    
    // Try a simple API call
    console.log('Attempting test API call...');
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    });
    
    return NextResponse.json({
      status: 'SUCCESS',
      hasApiKey: true,
      keyPrefix: apiKey!.substring(0, 15) + '...',
      keyLength: apiKey!.length,
      clientCreated: true,
      apiCallSucceeded: true,
      responseText: response.content[0].type === 'text' ? response.content[0].text : ''
    });
    
  } catch (error) {
    testError = error;
    console.error('Test API call failed:', error);
    
    return NextResponse.json({
      status: 'ERROR',
      hasApiKey: !!apiKey,
      keyPrefix: apiKey ? apiKey.substring(0, 15) + '...' : 'NOT SET',
      keyLength: apiKey?.length || 0,
      clientCreated,
      apiCallSucceeded: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name
    }, { status: 500 });
  }
}