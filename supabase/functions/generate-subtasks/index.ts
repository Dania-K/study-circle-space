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
    const { taskText, mood, duration } = await req.json();
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
            content: `You are a study assistant. Break down the student's task into 2-5 clear, actionable subtasks that fit a ${duration} minute focus session considering their mood (${mood}). Return ONLY a numbered list of plain text subtasks, one per line. Do NOT include code blocks, JSON syntax, or any markup. Just simple, clear action items.`,
          },
          {
            role: 'user',
            content: `Student mood: ${mood}\nTask: ${taskText}\n\nBreak this down into manageable subtasks:`,
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
    
    // Clean and parse subtasks, removing code artifacts
    let subtasks: string[] = [];
    
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      subtasks = Array.isArray(parsed) ? parsed : [content];
    } catch {
      // Fallback: split by lines
      subtasks = content.split('\n');
    }
    
    // Clean each subtask
    const cleanSubtasks = subtasks
      .map((s: string) => {
        if (typeof s !== 'string') return '';
        // Remove markdown formatting, numbers, bullets
        return s
          .replace(/^\d+[\.\)]\s*/, '')
          .replace(/^[-•*]\s*/, '')
          .replace(/^```[\w]*\n?/, '')
          .replace(/\n?```$/, '')
          .trim();
      })
      .filter((s: string) => {
        // Remove empty, code-like, or junk entries
        if (!s || s.length < 3) return false;
        if (/^[\[\]{}<>\/\\,;:]+$/.test(s)) return false; // Only punctuation
        if (/^(json|javascript|typescript|code|\/\/|<!--)/i.test(s)) return false;
        if (s === '...' || s === '…') return false;
        return true;
      })
      .slice(0, 5); // Max 5 subtasks

    // If we got less than 2 valid subtasks, return fallback
    if (cleanSubtasks.length < 2) {
      return new Response(
        JSON.stringify({ 
          subtasks: [
            'Review and understand the requirements',
            'Break down into smaller steps',
            'Complete the main work',
            'Review and finalize'
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ subtasks: cleanSubtasks }),
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
