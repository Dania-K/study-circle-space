import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Remove current spotlight
    await supabase
      .from('community_posts')
      .update({ is_spotlight: false })
      .eq('is_spotlight', true);

    // Get a random post from the last 30 days to make the new QOTD
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: posts, error: fetchError } = await supabase
      .from('community_posts')
      .select('id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    if (fetchError) throw fetchError;

    if (posts && posts.length > 0) {
      // Pick a random post from the results
      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      
      // Set it as the new spotlight
      const { error: updateError } = await supabase
        .from('community_posts')
        .update({ is_spotlight: true })
        .eq('id', randomPost.id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, message: 'QOTD rotated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: 'No posts found to rotate' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error rotating QOTD:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
