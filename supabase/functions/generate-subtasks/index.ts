import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful study assistant. Break down student tasks into 3-6 small, actionable subtasks. Return only a JSON array of subtask strings.',
          },
          {
            role: 'user',
            content: `Break down this study task into small subtasks: ${taskText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      throw new Error('Failed to generate subtasks');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON array from the response
    let subtasks: string[];
    try {
      subtasks = JSON.parse(content);
    } catch {
      // If parsing fails, split by lines as fallback
      subtasks = content.split('\n').filter((s: string) => s.trim());
    }

    return new Response(
      JSON.stringify({ subtasks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
