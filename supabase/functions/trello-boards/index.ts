import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const apiKey = Deno.env.get('TRELLO_API_KEY');
    const token = Deno.env.get('TRELLO_TOKEN');

    if (!apiKey || !token) {
      throw new Error('Trello credentials not configured');
    }

    const { action, boardId, listId } = await req.json();

    let url = '';
    
    switch (action) {
      case 'getBoards':
        url = `https://api.trello.com/1/members/me/boards?key=${apiKey}&token=${token}&fields=name,desc,url,dateLastActivity`;
        break;
      case 'getLists':
        if (!boardId) throw new Error('boardId required');
        url = `https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${token}&fields=name,pos`;
        break;
      case 'getCards':
        if (!listId) throw new Error('listId required');
        url = `https://api.trello.com/1/lists/${listId}/cards?key=${apiKey}&token=${token}&fields=name,desc,due,labels,url,dateLastActivity`;
        break;
      case 'getBoardCards':
        if (!boardId) throw new Error('boardId required');
        url = `https://api.trello.com/1/boards/${boardId}/cards?key=${apiKey}&token=${token}&fields=name,desc,due,labels,url,idList,dateLastActivity`;
        break;
      default:
        throw new Error('Invalid action');
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Trello API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
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
