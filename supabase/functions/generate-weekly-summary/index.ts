import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user stats from the past week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', weekAgo.toISOString());

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('created_at', weekAgo.toISOString());

    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, total_lifetime_xp, streak')
      .eq('id', userId)
      .single();

    // Calculate stats
    const focusMinutes = sessions?.reduce((sum, s) => {
      if (s.end_time) {
        const duration = new Date(s.end_time).getTime() - new Date(s.start_time).getTime();
        return sum + Math.floor(duration / 60000);
      }
      return sum;
    }, 0) || 0;

    const tasksCompleted = tasks?.length || 0;
    const moods = sessions?.map(s => s.mood).filter(Boolean) || [];
    const avgMood = moods.length > 0 ? moods[Math.floor(moods.length / 2)] : '😊';

    // Generate AI summary
    const prompt = `Generate a motivational weekly summary for a student with these stats:
    - Focus time: ${focusMinutes} minutes
    - Tasks completed: ${tasksCompleted}
    - Current streak: ${profile?.streak || 0} days
    - Most common mood: ${avgMood}
    
    Keep it short (3-4 sentences), positive, and motivating. Include specific praise for their achievements.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiResponse.json();
    const summaryText = aiData.choices[0].message.content;

    // Save summary
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    await supabase.from('weekly_summaries').insert({
      user_id: userId,
      week_start: weekStart.toISOString().split('T')[0],
      summary_text: summaryText,
      focus_minutes: focusMinutes,
      xp_gained: profile?.xp || 0,
      tasks_completed: tasksCompleted,
    });

    return new Response(JSON.stringify({ 
      summary: summaryText,
      stats: { focusMinutes, tasksCompleted, streak: profile?.streak }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
