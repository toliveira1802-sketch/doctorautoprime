import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing or invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin access
    const { data: hasAccess } = await supabaseClient.rpc('has_admin_access');
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('TRELLO_API_KEY');
    const trelloToken = Deno.env.get('TRELLO_TOKEN');

    if (!apiKey || !trelloToken) {
      throw new Error('Trello credentials not configured');
    }

    const { action, boardId, listId } = await req.json();

    let url = '';
    
    switch (action) {
      case 'getBoards':
        url = `https://api.trello.com/1/members/me/boards?key=${apiKey}&token=${trelloToken}&fields=name,desc,url,dateLastActivity`;
        break;
      case 'getLists':
        if (!boardId) throw new Error('boardId required');
        url = `https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${trelloToken}&fields=name,pos`;
        break;
      case 'getCards':
        if (!listId) throw new Error('listId required');
        url = `https://api.trello.com/1/lists/${listId}/cards?key=${apiKey}&token=${trelloToken}&fields=name,desc,due,labels,url,dateLastActivity`;
        break;
      case 'getBoardCards':
        if (!boardId) throw new Error('boardId required');
        url = `https://api.trello.com/1/boards/${boardId}/cards?key=${apiKey}&token=${trelloToken}&fields=name,desc,due,labels,url,idList,dateLastActivity`;
        break;
      default:
        throw new Error('Invalid action');
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Trello API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
